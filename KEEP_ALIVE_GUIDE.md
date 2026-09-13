# Supabase Keep-Alive Guide

Prevent your Supabase free-tier project from being auto-paused after 1-2 weeks of inactivity.

## Quick Start

### 1. Install Python dependency
```bash
pip install supabase
```

### 2. Set environment variables

**Windows (Command Prompt):**
```cmd
set VITE_SUPABASE_URL=your-supabase-url
set VITE_SUPABASE_ANON_KEY=your-anon-key
python keep-alive.py
```

**Windows (PowerShell):**
```powershell
$env:VITE_SUPABASE_URL="your-supabase-url"
$env:VITE_SUPABASE_ANON_KEY="your-anon-key"
python keep-alive.py
```

**Mac/Linux:**
```bash
export VITE_SUPABASE_URL=your-supabase-url
export VITE_SUPABASE_ANON_KEY=your-anon-key
python keep-alive.py
```

### 3. Get your Supabase credentials

1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon public key → `VITE_SUPABASE_ANON_KEY`

## How to Run Regularly

### Option 1: Windows Task Scheduler (Automated)

1. Open **Task Scheduler**
2. Create Basic Task
3. Name: "Supabase Keep-Alive"
4. Trigger: Daily at 12:00 PM (or your preferred time)
5. Action: Start a program
   - Program: `python`
   - Arguments: `C:\path\to\keep-alive.py`
   - Start in: `C:\path\to\repo\`
   - (Optional) Check "Hidden" so it runs in background

### Option 2: Free Online Cron Service (Easiest)

Use **cron-job.org** (free, no signup required):

1. Visit https://cron-job.org/en/
2. Click "Create cron job"
3. URL: Set up a simple HTTP endpoint that runs the script
4. Schedule: Every 3 days at noon

**Alternative services:**
- **UptimeRobot** (https://uptimerobot.com/) - Free uptime monitoring + pinging
- **cron-job.org** (https://cron-job.org/en/) - Free cron job scheduler

### Option 3: Manual (Simplest)

Just run it manually whenever you remember:
```bash
python keep-alive.py
```

Or save as a batch file (Windows):
```batch
@echo off
set VITE_SUPABASE_URL=your-url
set VITE_SUPABASE_ANON_KEY=your-key
python keep-alive.py
pause
```

## What It Does

- Queries the `profile` table in your Supabase database
- Keeps the project "active" to prevent auto-pause
- Logs success/failure with timestamp
- Takes less than 1 second

## Test It

```bash
# Set your credentials
export VITE_SUPABASE_URL=your-url
export VITE_SUPABASE_ANON_KEY=your-key

# Run the script
python keep-alive.py

# Should see:
# ✅ Supabase keep-alive successful!
#    Time: 2026-09-13T12:34:56.789123
#    Response: 1 row(s) from profile table
```

## If It Fails

**Error: "Supabase credentials not found"**
- Make sure you set the environment variables correctly
- Double-check the spelling: `VITE_SUPABASE_URL` (not `SUPABASE_URL`)

**Error: "No module named 'supabase'"**
```bash
pip install supabase
```

**Error: "Connection refused"**
- Check your internet connection
- Verify the Supabase project is running (check dashboard)

## Recommended Schedule

- **Every 3 days** - Safe buffer before 2-week threshold
- **Once a week** - Very safe, minimal pinging
- **Daily** - Maximum protection, slightly more traffic

---

**Pro Tip:** If your Supabase does pause anyway, it only takes one click on the Supabase dashboard to resume it (~30 seconds). So this is just preventative!

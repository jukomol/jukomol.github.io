#!/usr/bin/env python3
"""
Supabase Keep-Alive Script
Pings your Supabase database to prevent auto-pause on free tier.

Installation:
    pip install supabase requests

Usage:
    python keep-alive.py

Or schedule it to run periodically:
    - Windows Task Scheduler
    - cron-job.org (free online scheduler)
    - UptimeRobot (free uptime monitoring)
"""

import os
import sys
from datetime import datetime
from supabase import create_client

def keep_alive():
    """Ping the Supabase database to keep it active."""

    # Get Supabase credentials from environment variables
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    supabase_key = os.getenv('VITE_SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("❌ Error: Supabase credentials not found")
        print("   Set environment variables:")
        print("   - VITE_SUPABASE_URL")
        print("   - VITE_SUPABASE_ANON_KEY")
        sys.exit(1)

    try:
        # Initialize Supabase client
        supabase = create_client(supabase_url, supabase_key)

        # Query the lightweight 'profile' table to ping the database
        response = supabase.table('profile').select('*').limit(1).execute()

        timestamp = datetime.now().isoformat()
        rows_count = len(response.data) if response.data else 0

        print(f"✅ Supabase keep-alive successful!")
        print(f"   Time: {timestamp}")
        print(f"   Response: {rows_count} row(s) from profile table")
        return True

    except Exception as e:
        print(f"❌ Keep-alive failed: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    keep_alive()

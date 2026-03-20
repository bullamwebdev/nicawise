#!/bin/bash
# NicaWise Keep-Alive Script
# Auto-restarts tunnel and logs URL

LOG="/home/myuser/.openclaw-instance2/workspace-instance2/nicawise-site/tunnel.log"
PM2="/usr/local/bin/pm2 2>/dev/null || ~/.nvm/versions/node/v24.13.1/bin/pm2"

# Check if nicawise process is running
if ! pm2 list 2>/dev/null | grep -q "nicawise.*online"; then
    echo "$(date): Restarting nicawise server..." >> "$LOG"
    pm2 restart nicawise
fi

# Check if tunnel is running
if ! pm2 list 2>/dev/null | grep -q "nicawise-tunnel.*online"; then
    echo "$(date): Restarting tunnel..." >> "$LOG"
    pm2 restart nicawise-tunnel
    # Wait for new URL
    sleep 5
    # Get new URL
    URL=$(pm2 logs nicawise-tunnel --lines 20 --nostream 2>&1 | grep -o 'https://[^ ]*trycloudflare.com' | tail -1)
    echo "$(date): New URL: $URL" >> "$LOG"
fi

# Save current URL
pm2 logs nicawise-tunnel --lines 20 --nostream 2>&1 | grep -o 'https://[^ ]*trycloudflare.com' | tail -1 > /home/myuser/.openclaw-instance2/workspace-instance2/nicawise-site/current-url.txt

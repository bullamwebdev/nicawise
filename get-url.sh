#!/bin/bash
# Get current NicaWise URL
cat /home/myuser/.openclaw-instance2/workspace-instance2/nicawise-site/current-url.txt 2>/dev/null || \
pm2 logs nicawise-tunnel --lines 20 --nostream 2>&1 | grep -o 'https://[^ ]*trycloudflare.com' | tail -1

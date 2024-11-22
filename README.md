# pi-status-monitor

# Cron setup

In a terminal open the crontab editor
```bash
crontab -e
```

Then add this line:
```
0,30 * * * * cd /path/to/this/folder && node .
```

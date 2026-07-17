@echo off
title Sakura Frontend :5173
cd /d "%~dp0"
echo Starting Sakura frontend on port 5173 ...
echo Keep this window open.
npm run dev -- --host 127.0.0.1 --port 5173
pause

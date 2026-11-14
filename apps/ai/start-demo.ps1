$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Join-Path $PSScriptRoot 'ai-service')
& (Join-Path $PSScriptRoot '.venv\Scripts\python.exe') -m uvicorn main:app --host 127.0.0.1 --port 8000

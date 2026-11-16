@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Buscando as visitas na Cloudflare...
node ferramentas\painel-trafego.js --abrir
if errorlevel 1 (
  echo.
  echo Nao deu para atualizar o painel. Leia a mensagem acima.
  pause
)

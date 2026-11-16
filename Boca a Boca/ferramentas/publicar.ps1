# Publica o Boca a Boca (site de vendas + loja de exemplo + páginas das lojas) no Cloudflare Pages, projeto "bocaaboca".
# Usa a mesma conta Cloudflare da Vorkeza (Wrangler já logado nesta máquina). Só rode quando decidir ir ao ar.
# ATENÇÃO: depois que uma plaquinha for impressa, o endereço /l/<slug>/ não pode mudar (o QR aponta para ele).
$ErrorActionPreference = 'Stop'
$raiz = Split-Path $PSScriptRoot -Parent
Set-Location $raiz
node ferramentas/montar.mjs
if ($LASTEXITCODE -ne 0) { throw 'Falha ao montar a pasta publicar.' }
try { npx --yes wrangler@3.114.0 pages project create bocaaboca --production-branch main 2>$null } catch {}
npx --yes wrangler@3.114.0 pages deploy publicar --project-name bocaaboca --branch main --commit-dirty=true

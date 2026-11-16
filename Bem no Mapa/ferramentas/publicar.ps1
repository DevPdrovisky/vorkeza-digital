# Publica o site do Bem no Mapa (site de vendas + raio-x de exemplo + raio-x de clientes) no Cloudflare Pages, projeto "bemnomapa".
# Usa a mesma conta Cloudflare da Vorkeza (Wrangler já logado nesta máquina). Só rode quando decidir ir ao ar.
# Se trocar o nome da marca, troque também o nome do projeto aqui e a URL em ../grupo/grupo.json.
$ErrorActionPreference = 'Stop'
$raiz = Split-Path $PSScriptRoot -Parent
Set-Location $raiz
node ferramentas/montar.mjs
if ($LASTEXITCODE -ne 0) { throw 'Falha ao montar a pasta publicar.' }
try { npx --yes wrangler@3.114.0 pages project create bemnomapa --production-branch main 2>$null } catch {}
npx --yes wrangler@3.114.0 pages deploy publicar --project-name bemnomapa --branch main --commit-dirty=true

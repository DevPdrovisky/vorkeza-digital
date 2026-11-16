# Publica o site da Vitrine Motor (site de vendas + demo + prévias) no Cloudflare Pages, projeto "vitrinemotor".
# Usa a mesma conta Cloudflare da Vorkeza (Wrangler já logado nesta máquina).
# Só rode quando decidir ir ao ar.
$ErrorActionPreference = 'Stop'
$raiz = Split-Path $PSScriptRoot -Parent
Set-Location $raiz
node ferramentas/montar.mjs
if ($LASTEXITCODE -ne 0) { throw 'Falha ao montar a pasta publicar.' }
# Cria o projeto na primeira vez (se já existir, o erro é ignorado).
try { npx --yes wrangler@3.114.0 pages project create vitrinemotor --production-branch main 2>$null } catch {}
npx --yes wrangler@3.114.0 pages deploy publicar --project-name vitrinemotor --branch main --commit-dirty=true

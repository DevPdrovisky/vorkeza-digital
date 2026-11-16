# Publica o site de um cliente da Vorkeza no projeto Cloudflare Pages próprio dele: vz-<slug>.
# Uso: .\ferramentas\publicar-cliente.ps1 nome-do-cliente
param([Parameter(Mandatory = $true)][string]$slug)
$ErrorActionPreference = 'Stop'
$raiz = Split-Path $PSScriptRoot -Parent
$pasta = Join-Path $raiz "clientes-vorkeza/$slug"
$site = Join-Path $pasta 'site'
if (-not (Test-Path (Join-Path $site 'index.html'))) { throw "Não achei clientes-vorkeza/$slug/site/index.html." }
$cliente = Get-Content (Join-Path $pasta 'cliente.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$robots = ''
if ($cliente.modo -ne 'oficial') { $robots = "`n  X-Robots-Tag: noindex, nofollow" }
@"
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY$robots
"@ | Set-Content -Path (Join-Path $site '_headers') -Encoding utf8
$projeto = "vz-$slug"
try { npx --yes wrangler@3.114.0 pages project create $projeto --production-branch main 2>$null } catch {}
npx --yes wrangler@3.114.0 pages deploy $site --project-name $projeto --branch main --commit-dirty=true
Write-Host "Publicado em https://$projeto.pages.dev ($($cliente.modo))"

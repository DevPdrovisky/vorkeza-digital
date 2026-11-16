# Publica o site OFICIAL de uma revenda no projeto Cloudflare Pages próprio dela: vm-<slug>.
# Uso: .\ferramentas\publicar-cliente.ps1 nome-da-revenda
param([Parameter(Mandatory = $true)][string]$slug)
$ErrorActionPreference = 'Stop'
$raiz = Split-Path $PSScriptRoot -Parent
$loja = Get-Content (Join-Path $raiz "3-Produto/clientes/$slug/loja.json") -Raw -Encoding UTF8 | ConvertFrom-Json
if ($loja.modo -ne 'oficial') { throw "loja.json de $slug está com modo '$($loja.modo)'. Mude para 'oficial' antes de publicar." }
Set-Location (Join-Path $raiz '3-Produto')
node gerar.mjs $slug
if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar o site.' }
$saida = Join-Path $raiz "3-Produto/saida/$slug"
@"
/*
  Content-Security-Policy: default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY

/artes/*
  X-Robots-Tag: noindex, nofollow
"@ | Set-Content -Path (Join-Path $saida '_headers') -Encoding utf8
$projeto = "vm-$slug"
try { npx --yes wrangler@3.114.0 pages project create $projeto --production-branch main 2>$null } catch {}
npx --yes wrangler@3.114.0 pages deploy $saida --project-name $projeto --branch main --commit-dirty=true
Write-Host "Publicado em https://$projeto.pages.dev - adicione o domínio do cliente em Custom domains."

# Publica o site da Vorkeza no Cloudflare Pages (projeto "vorkeza").
# Copia os arquivos do site para a pasta publicar-netlify e envia para o Cloudflare.
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$dst = Join-Path $root 'publicar-netlify'
if (Test-Path $dst) { Remove-Item -Recurse -Force $dst -Confirm:$false }
New-Item -ItemType Directory $dst | Out-Null
Copy-Item (Join-Path $root 'index.html'), (Join-Path $root 'styles.css'), (Join-Path $root 'app.js'), (Join-Path $root 'config.js'), (Join-Path $root 'robots.txt'), (Join-Path $root 'sitemap.xml') $dst
Copy-Item (Join-Path $root 'assets') $dst -Recurse
Copy-Item (Join-Path $root 'demo-painel') $dst -Recurse
# Grupo Vorkeza: selo, botão de troca e a seção "Nossas marcas" (lê grupo/grupo.json)
Copy-Item (Join-Path $root 'grupo') $dst -Recurse
Remove-Item (Join-Path $dst 'grupo\grupo-node.mjs') -Confirm:$false -ErrorAction SilentlyContinue
# O dominio faz o navegador guardar CSS e JS por 4 horas; o carimbo faz cada publicacao chegar na hora.
$v = Get-Date -Format 'yyyyMMddHHmmss'
$html = Join-Path $dst 'index.html'
$utf8 = New-Object System.Text.UTF8Encoding $false
$t = [IO.File]::ReadAllText($html, $utf8)
foreach ($f in 'styles.css', 'config.js', 'app.js') { $t = $t.Replace(('"{0}"' -f $f), ('"{0}?v={1}"' -f $f, $v)) }
[IO.File]::WriteAllText($html, $t, $utf8)
Set-Location $root
npx --yes wrangler@3.114.0 pages deploy publicar-netlify --project-name vorkeza --branch main --commit-dirty=true

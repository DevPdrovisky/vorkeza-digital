# Salva o token da Cloudflare (somente leitura) para o "views pro pai".
# O token fica só neste PC, em %USERPROFILE%\.vorkeza\cloudflare-token.txt
Write-Host ""
Write-Host "Cole o token da Cloudflare e aperte Enter." -ForegroundColor Magenta
Write-Host "(Ao colar, aparecem só asteriscos. Para colar aqui use o botao direito do mouse ou Ctrl+V.)"
$seguro = Read-Host "Token" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($seguro)
$token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr).Trim()
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
if (-not $token) { Write-Host "Nada foi colado. Rode de novo." -ForegroundColor Red; return }
if ($token -match '\s' -or $token.Length -lt 30 -or $token.Length -gt 80) {
  Write-Host "Isso nao parece um token da Cloudflare (o token e um codigo unico de uns 40 letras e numeros, sem espacos)." -ForegroundColor Red
  Write-Host "Copie so o codigo que a Cloudflare mostra depois de 'Create Token' e rode de novo." -ForegroundColor Red
  return
}

try {
  $r = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/user/tokens/verify" -Headers @{ Authorization = "Bearer $token" }
  if ($r.result.status -ne "active") { Write-Host "A Cloudflare diz que o token nao esta ativo ($($r.result.status))." -ForegroundColor Red; return }
} catch {
  Write-Host "A Cloudflare recusou esse token. Confira se copiou ele inteiro e rode de novo." -ForegroundColor Red; return
}

$pasta = Join-Path $env:USERPROFILE ".vorkeza"
New-Item -ItemType Directory -Force $pasta | Out-Null
Set-Content -Path (Join-Path $pasta "cloudflare-token.txt") -Value $token -Encoding ascii -NoNewline
Write-Host ""
Write-Host "Token salvo e conferido com a Cloudflare. Pode voltar para o chat." -ForegroundColor Green

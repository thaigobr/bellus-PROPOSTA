# Bellus · sincroniza o ÍNDICE (@thiago.bellus) do site com o Instagram real.
# Roda diário via Agendador de Tarefas ("Bellus IG Sync").
# Descobre os posts pelo endpoint público do Instagram; em caso de bloqueio (429),
# sai em silêncio e mantém o feed atual (o site nunca quebra).
# Token do cPanel: %USERPROFILE%\.bellus-cpanel-token (fora do repositório git).

$ErrorActionPreference = "Stop"
$Log = Join-Path $env:LOCALAPPDATA "bellus-ig-sync.log"
function W($m) { ("{0} {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $m) | Out-File -Append -Encoding utf8 $Log }

try {
  $UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
  $tokenFile = Join-Path $env:USERPROFILE ".bellus-cpanel-token"
  if (-not (Test-Path $tokenFile)) { W "sem token cpanel, abortando"; exit 0 }
  $TOKEN = (Get-Content $tokenFile -Raw).Trim()
  $CP = "https://belluseventos.com.br:2083"
  $RESOLVE = "belluseventos.com.br:2083:162.241.2.228"

  # 1) descoberta dos posts (endpoint público; falha => mantém como está)
  $api = "https://www.instagram.com/api/v1/users/web_profile_info/?username=thiago.bellus"
  $raw = & curl.exe -s --max-time 30 -A $UA -H "x-ig-app-id: 936619743392459" -H "Accept: application/json" $api
  $j = $null
  try { $j = $raw | ConvertFrom-Json } catch {}
  if (-not $j -or -not $j.data.user) { W "descoberta bloqueada (provavel 429), mantendo feed atual"; exit 0 }
  $edges = @($j.data.user.edge_owner_to_timeline_media.edges)
  if ($edges.Count -lt 6) { W ("descoberta retornou so {0} posts, mantendo" -f $edges.Count); exit 0 }

  # avatar do perfil: atualiza sempre que a descoberta funcionar (mesmo sem post novo)
  $tmp = Join-Path $env:TEMP "bellus-ig"; New-Item -ItemType Directory -Force $tmp | Out-Null
  $pic = $j.data.user.profile_pic_url_hd
  if (-not $pic) { $pic = $j.data.user.profile_pic_url }
  if ($pic) {
    $av = Join-Path $tmp "avatar.jpg"
    & curl.exe -sL --max-time 30 -A $UA $pic -o $av
    $b = [IO.File]::ReadAllBytes($av)
    if ($b.Length -gt 1000 -and $b[0] -eq 0xFF -and $b[1] -eq 0xD8) {
      & curl.exe -s --resolve $RESOLVE -H ("Authorization: cpanel bellus38:" + $TOKEN) ("$CP/execute/Fileman/upload_files") -F "dir=public_html/thiagobellus/ig" -F "overwrite=1" -F ("file-1=@" + $av) | Out-Null
      W "avatar atualizado"
    }
  }

  $novos = @()
  foreach ($e in $edges[0..([Math]::Min(11, $edges.Count - 1))]) {
    $n = $e.node
    $tipo = "p"; if ($n.is_video) { $tipo = "reel" }
    $alt = "Publicação de @thiago.bellus"
    if ($n.edge_media_to_caption.edges.Count -gt 0) {
      $c = $n.edge_media_to_caption.edges[0].node.text
      if ($c) { $alt = ($c -replace "[\r\n]+", " ").Substring(0, [Math]::Min(70, $c.Length)) }
    }
    $novos += [pscustomobject]@{ tipo = $tipo; code = $n.shortcode; alt = $alt }
  }

  # 2) feed atual do site: nada mudou => sai
  $atual = $null
  try { $atual = (& curl.exe -s --max-time 20 "https://www.belluseventos.com.br/thiagobellus/ig/feed.json") | ConvertFrom-Json } catch {}
  $codesNovos = ($novos | Select-Object -First 9 | ForEach-Object { $_.code }) -join ","
  $codesAtuais = ""
  if ($atual) { $codesAtuais = ($atual.posts | Select-Object -First 9 | ForEach-Object { $_.code }) -join "," }
  if ($codesNovos -eq $codesAtuais) { W "sem posts novos"; exit 0 }

  # 3) baixa thumbs que faltam (endpoint /p/<code>/media; 404 => descarta o post)
  $tmp = Join-Path $env:TEMP "bellus-ig"; New-Item -ItemType Directory -Force $tmp | Out-Null
  $ok = @()
  foreach ($p in $novos) {
    if ($ok.Count -ge 9) { break }
    $f = Join-Path $tmp ($p.code + ".jpg")
    & curl.exe -sL --max-time 30 -A $UA ("https://www.instagram.com/p/{0}/media/?size=l" -f $p.code) -o $f
    $bytes = [IO.File]::ReadAllBytes($f)
    if ($bytes.Length -gt 1000 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8) { $ok += $p }
    else { W ("thumb indisponivel p/ {0}, pulando" -f $p.code); Remove-Item $f -Force -Confirm:$false }
    Start-Sleep -Seconds 1
  }
  if ($ok.Count -lt 6) { W ("so {0} thumbs ok, mantendo feed atual" -f $ok.Count); exit 0 }

  # 4) novo feed.json
  $feed = [pscustomobject]@{
    atualizado = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
    fonte      = "instagram.com/thiago.bellus"
    posts      = $ok
  }
  $feedPath = Join-Path $tmp "feed.json"
  $feed | ConvertTo-Json -Depth 4 | Out-File -Encoding utf8 $feedPath

  # 5) sobe pro cPanel (imagens novas + feed.json por último)
  foreach ($p in $ok) {
    $f = Join-Path $tmp ($p.code + ".jpg")
    & curl.exe -s --resolve $RESOLVE -H ("Authorization: cpanel bellus38:" + $TOKEN) ("$CP/execute/Fileman/upload_files") -F "dir=public_html/thiagobellus/ig" -F "overwrite=1" -F ("file-1=@" + $f) | Out-Null
  }
  & curl.exe -s --resolve $RESOLVE -H ("Authorization: cpanel bellus38:" + $TOKEN) ("$CP/execute/Fileman/upload_files") -F "dir=public_html/thiagobellus/ig" -F "overwrite=1" -F ("file-1=@" + $feedPath) | Out-Null
  W ("FEED ATUALIZADO: {0} posts ({1})" -f $ok.Count, $codesNovos)
} catch {
  W ("erro: " + $_.Exception.Message)
  exit 0
}

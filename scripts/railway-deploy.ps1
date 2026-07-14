<#
.SYNOPSIS
  Railway CLI ile ortam dogrulama, degisken gonderme, saglik kontrolu ve seed.

.KULLANIM
  1) npm i -g @railway/cli
  2) railway login
  3) Railway arayuzunde proje + Postgres + app servisi olusturun; uygulamaya DATABASE_URL referansi verin.
  4) railway link   (proje kokunde)
  5) Copy-Item .env.railway.example .env.railway  -> degerleri doldurun
  6) powershell -ExecutionPolicy Bypass -File ./scripts/railway-deploy.ps1 -Action PushEnv [-Service app-ad]

  Saglik: powershell -ExecutionPolicy Bypass -File ./scripts/railway-deploy.ps1 -Action Health -BaseUrl https://xxx.up.railway.app
  Seed:   powershell -ExecutionPolicy Bypass -File ./scripts/railway-deploy.ps1 -Action Seed [-Service app-ad]
#>
param(
  [Parameter(Position = 0)]
  [ValidateSet('Check', 'PushEnv', 'Health', 'Seed')]
  [string] $Action = 'Check',

  [string] $EnvFile = '.env.railway',
  [string] $Service = '',
  [string] $BaseUrl = '',
  [switch] $SkipDeploys
)

$ErrorActionPreference = 'Stop'

function Invoke-RailwayQuiet {
  param([string[]] $RailwayArgs)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $null = & railway @RailwayArgs 2>&1
    return $LASTEXITCODE
  }
  finally {
    $ErrorActionPreference = $prev
  }
}

function Test-RailwayAuth {
  $code = Invoke-RailwayQuiet @('whoami')
  if ($code -ne 0) {
    Write-Error 'Railway oturumu yok. Once: railway login'
  }
}

function Get-RailwayVariablePairs {
  $railArgs = @('variables', '-k')
  if ($Service) { $railArgs += @('-s', $Service) }
  $raw = & railway @railArgs 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Error "railway variables basarisiz: $raw"
  }
  $map = @{}
  foreach ($line in $raw) {
    if ($line -match '^\s*([^=]+)=(.*)$') {
      $map[$Matches[1].Trim()] = $Matches[2]
    }
  }
  return $map
}

function Read-DotEnvFile {
  param([string] $Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    Write-Error "Dosya bulunamadi: $Path - Ornek: Copy-Item .env.railway.example .env.railway"
  }
  $pairs = [ordered]@{}
  Get-Content -LiteralPath $Path -Encoding UTF8 | ForEach-Object {
    $t = $_.Trim()
    if (-not $t -or $t.StartsWith('#')) { return }
    $eq = $t.IndexOf('=')
    if ($eq -lt 1) { return }
    $k = $t.Substring(0, $eq).Trim()
    $v = $t.Substring($eq + 1).Trim()
    $dq = [char]0x22
    if (($v.StartsWith($dq) -and $v.EndsWith($dq)) -or ($v.StartsWith([char]0x27) -and $v.EndsWith([char]0x27))) {
      $v = $v.Substring(1, $v.Length - 2)
    }
    $pairs[$k] = $v
  }
  return $pairs
}

switch ($Action) {
  'Check' {
    Test-RailwayAuth
    if (-not (Test-Path -LiteralPath '.railway')) {
      Write-Warning '.railway yok - once: railway link'
    }
    $vars = Get-RailwayVariablePairs
    $required = @('DATABASE_URL', 'JWT_SECRET', 'NEXT_PUBLIC_APP_URL')
    foreach ($r in $required) {
      if (-not $vars.ContainsKey($r) -or [string]::IsNullOrWhiteSpace($vars[$r])) {
        Write-Error "Eksik degisken: $r"
      }
    }
    if ($vars['DATABASE_URL'] -notmatch '^postgresql://') {
      Write-Error "DATABASE_URL postgresql:// ile baslamali (lib/env-validation)."
    }
    if ($vars['JWT_SECRET'].Length -lt 32) {
      Write-Error 'JWT_SECRET en az 32 karakter olmali.'
    }
    try {
      $null = [uri]::new($vars['NEXT_PUBLIC_APP_URL'])
    }
    catch {
      Write-Error 'NEXT_PUBLIC_APP_URL gecerli bir URL degil.'
    }
    Write-Host 'Railway degisken kontrolu: OK' -ForegroundColor Green
    break
  }

  'PushEnv' {
    Test-RailwayAuth
    $data = Read-DotEnvFile $EnvFile
    foreach ($key in $data.Keys) {
      $val = [string] $data[$key]
      if ([string]::IsNullOrWhiteSpace($val)) { continue }
      $pair = "$key=$val"
      $railArgs = @('variables')
      if ($Service) { $railArgs += @('-s', $Service) }
      $railArgs += @('--set', $pair)
      if ($SkipDeploys) { $railArgs += '--skip-deploys' }
      $code = Invoke-RailwayQuiet $railArgs
      if ($code -ne 0) {
        Write-Error "Degisken ayarlanamadi: $key"
      }
      Write-Host "Set: $key" -ForegroundColor Cyan
    }
    Write-Host 'PushEnv tamam.' -ForegroundColor Green
    break
  }

  'Health' {
    if ([string]::IsNullOrWhiteSpace($BaseUrl)) {
      Write-Error 'Health icin -BaseUrl zorunlu (ornek: https://xxx.up.railway.app)'
    }
    $u = $BaseUrl.TrimEnd('/') + '/api/health'
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 30
    if ($r.StatusCode -ne 200) {
      Write-Error "Beklenmeyen HTTP: $($r.StatusCode)"
    }
    Write-Host $r.Content
    Write-Host 'Health: OK' -ForegroundColor Green
    break
  }

  'Seed' {
    Test-RailwayAuth
    $railArgs = @('run')
    if ($Service) { $railArgs += @('-s', $Service) }
    $railArgs += @('npm', 'run', 'db:seed')
    & railway @railArgs
    if ($LASTEXITCODE -ne 0) {
      Write-Error 'Seed basarisiz.'
    }
    Write-Host 'Seed tamam.' -ForegroundColor Green
    break
  }
}

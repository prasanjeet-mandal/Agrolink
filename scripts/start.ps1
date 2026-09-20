<#
============================================================================
 AgroLink - one-command developer environment (PowerShell / Windows)
   powershell -ExecutionPolicy Bypass -File scripts\start.ps1 [-NoAI] [-NoOpt] [-NoBackend] [-NoFrontend] [-NoDbCheck] [-Help]

 Mirrors scripts/start.sh: loads .env, verifies MySQL, starts the AI service,
 optimization service, Spring Boot backend and Vite frontend (in order),
 health-checks each one, writes logs\*.log, keeps PID files in logs\pid\,
 and stops every started process tree on Ctrl+C (taskkill /T).
============================================================================
#>
[CmdletBinding()]
param(
    [switch]$NoAI,
    [switch]$NoOpt,
    [switch]$NoBackend,
    [switch]$NoFrontend,
    [switch]$NoDbCheck,
    [switch]$Help
)

$ErrorActionPreference = 'SilentlyContinue'

$ProjectRoot  = Split-Path -Parent $PSScriptRoot
$LogsDir      = Join-Path $ProjectRoot 'logs'
$PidDir       = Join-Path $LogsDir 'pid'
$EnvFile      = Join-Path $ProjectRoot '.env'

$AiDir        = Join-Path $ProjectRoot 'ai-service\ml-service'
$OptDir       = Join-Path $ProjectRoot 'optimization-service'
$BackendDir   = Join-Path $ProjectRoot 'backend'
$FrontendDir  = Join-Path $ProjectRoot 'frontend'

$AiPort    = 8000
$OptPort   = 8001
$FrontPort = 5173

$script:Procs = @()   # PSScript scope, so Ctrl+C trap can reach them

function Write-Step { Write-Host ("[agrolink] " + ($args -join ' ')) -ForegroundColor Cyan }
function Write-Ok   { Write-Host ("[ok] "       + ($args -join ' ')) -ForegroundColor Green }
function Write-Warn { Write-Host ("[warn] "     + ($args -join ' ')) -ForegroundColor Yellow }
function Write-Err  { Write-Host ("[ERROR] "    + ($args -join ' ')) -ForegroundColor Red }

if ($Help) {
    Get-Content $PSCommandPath | Select-String '^# ' | ForEach-Object { $_.Line.Substring(2) }
    exit 0
}

# ------------------------------------------------------------- env loader ---
function Load-EnvFile {
    if (-not (Test-Path $EnvFile)) {
        Write-Warn "Environment file not found: $EnvFile (copy .env.example -> .env)"
        return $false
    }
    foreach ($line in Get-Content $EnvFile) {
        $line = $line.Trim()
        if (-not $line -or $line.StartsWith('#')) { continue }
        $idx = $line.IndexOf('=')
        if ($idx -lt 1) { continue }
        $key = $line.Substring(0, $idx).Trim()
        $val = $line.Substring($idx + 1).Trim()
        $val = $val.Trim('"').Trim("'")
        if (-not [Environment]::GetEnvironmentVariable($key)) {
            Set-Item -Path "env:$key" -Value $val
        }
    }
    return $true
}

# ------------------------------- map .env names -> Spring property names ---
function Export-BackendEnv {
    $map = @(
        @('DB_URL',                  'SPRING_DATASOURCE_URL'),
        @('DB_USER',                 'SPRING_DATASOURCE_USERNAME'),
        @('DB_PASSWORD',             'SPRING_DATASOURCE_PASSWORD'),
        @('DDL_AUTO',                'SPRING_JPA_HIBERNATE_DDL_AUTO'),
        @('JWT_SECRET',              'APP_JWT_SECRET'),
        @('JWT_EXPIRATION',          'APP_JWT_EXPIRATION'),
        @('JWT_REGISTRATION_EXPIRATION', 'APP_JWT_REGISTRATION_EXPIRATION'),
        @('OTP_EXPOSE_CODE',         'APP_OTP_DEV_EXPOSE_CODE'),
        @('OTP_REQUIRE_VERIFY',      'APP_OTP_REQUIRE_VERIFY'),
        @('OTP_DEV_CODE',            'APP_OTP_DEV_CODE'),
        @('OTP_MAX_SENDS',           'APP_OTP_MAX_SENDS_PER_WINDOW'),
        @('OTP_RATE_WINDOW_MINUTES', 'APP_OTP_RATE_WINDOW_MINUTES'),
        @('OTP_RESEND_COOLDOWN',     'APP_OTP_RESEND_COOLDOWN_SECONDS'),
        @('OTP_MAX_ATTEMPTS',        'APP_OTP_MAX_VERIFY_ATTEMPTS'),
        @('OTP_TTL_SECONDS',         'APP_OTP_TTL_SECONDS'),
        @('AI_URL',                  'APP_AI_PYTHON_URL'),
        @('CORS_ALLOWED_ORIGINS',    'APP_CORS_ALLOWED_ORIGINS')
    )
    foreach ($pair in $map) {
        $src = $pair[0]; $dst = $pair[1]
        $srcVal = [Environment]::GetEnvironmentVariable($src)
        $dstVal = [Environment]::GetEnvironmentVariable($dst)
        if ($srcVal -and -not $dstVal) { Set-Item -Path "env:$dst" -Value $srcVal }
    }
}

# ----------------------------------------------------------------- probes ---
function Test-PortOpen {
    param([int]$Port)
    $c = New-Object System.Net.Sockets.TcpClient
    try {
        $ar = $c.BeginConnect('127.0.0.1', $Port, $null, $null)
        if ($ar.AsyncWaitHandle.WaitOne(2000)) { $c.EndConnect($ar); return $true }
    } catch { }
    finally { $c.Close() }
    return $false
}

function Wait-Http {
    param([string]$Url, [int]$Retries = 40, [int]$Delay = 2)
    for ($i = 0; $i -lt $Retries; $i++) {
        try {
            $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
            if ($null -ne $r) { return $true }
        } catch { }
        Start-Sleep -Seconds $Delay
    }
    return $false
}

function Wait-Tcp {
    param([int]$Port, [int]$Retries = 60, [int]$Delay = 1)
    for ($i = 0; $i -lt $Retries; $i++) {
        if (Test-PortOpen $Port) { return $true }
        Start-Sleep -Seconds $Delay
    }
    return $false
}

# ------------------------------------------------------------- launcher ----
function Start-AgroService {
    param([string]$Name, [string]$Label, [string]$WorkDir, [int]$Port, [string]$Command)
    $pf = Join-Path $PidDir ($Name + '.pid')
    $lf = Join-Path $LogsDir ($Name + '.log')
    New-Item -ItemType Directory -Path $PidDir -Force | Out-Null

    if (Test-Path $pf) {
        $oldPid = ([int](Get-Content $pf))
        if (Get-Process -Id $oldPid -ErrorAction SilentlyContinue) {
            Write-Warn "$Label already running (pid $oldPid) - skipping duplicate start."
            return $null
        }
        Remove-Item $pf -Force
    }
    if (Test-PortOpen $Port) {
        Write-Warn "Port $Port already in use - skipping '$Name' (run scripts\status.sh)."
        return $null
    }

    # run the command through cmd with combined (2>&1) append redirection
    $argv = "/c " + $Command + ' >> ' + '"' + $lf + '" 2>&1'
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = 'cmd.exe'
    $psi.Arguments = $argv
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.WorkingDirectory = $WorkDir
    $proc = [System.Diagnostics.Process]::Start($psi)

    Set-Content -Path $pf -Value $proc.Id
    Write-Ok "$Label started (pid $($proc.Id)) - logs\$Name.log"
    return $proc
}

# ------------------------------------------------------------- shutdown ----
$script:Stopping = $false
function Stop-AgroServices {
    if ($script:Stopping) { return }
    $script:Stopping = $true
    Write-Host ''
    Write-Step 'Shutting down AgroLink services ...'
    foreach ($name in @('ai', 'opt', 'backend', 'frontend')) {
        $pf = Join-Path $PidDir ($name + '.pid')
        if (Test-Path $pf) {
            $pidVal = [int](Get-Content $pf)
            Write-Host ("  " + $name.PadRight(18)) -NoNewline
            if (Get-Process -Id $pidVal -ErrorAction SilentlyContinue) {
                & taskkill /F /T /PID $pidVal 2>$null | Out-Null
                Start-Sleep -Milliseconds 500
                Write-Host 'stopped' -ForegroundColor Green
            } else {
                Write-Host 'not running (stale pid removed)' -ForegroundColor DarkGray
            }
            Remove-Item $pf -Force
        }
    }
    Write-Ok 'All services stopped. Logs kept under .\logs\'
}

trap { Stop-AgroServices; break }

# ------------------------------------------------------------------ MySQL ---
function Test-MySql {
    Write-Step '   MySQL connectivity'
    $host_ = if ($env:DB_HOST) { $env:DB_HOST } else { '127.0.0.1' }
    $port_ = if ($env:DB_PORT) { $env:DB_PORT } else { '3306' }
    $user_ = if ($env:DB_USER) { $env:DB_USER } else { 'root' }
    $pass_ = $env:DB_PASSWORD
    $db_   = if ($env:MYSQL_DATABASE) { $env:MYSQL_DATABASE } else { 'agrolink' }

    if (Get-Command mysql -ErrorAction SilentlyContinue) {
        $args_ = @('--connect-timeout=5', '-h', $host_, '-P', $port_, '--protocol=TCP', '-u', $user_)
        if ($pass_) { $args_ += '-p' + $pass_ }
        & mysql @args_ -e 'SELECT 1;' 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Err "MySQL auth failed for user '$user_' on $host_`:$port_"
            Write-Warn "Fix DB_USER / DB_PASSWORD in .env (or export real ones)."
            return $false
        }
        & mysql @args_ -e "CREATE DATABASE IF NOT EXISTS ``$db_`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>$null | Out-Null
    } elseif (Test-PortOpen ([int]$port_)) {
        Write-Warn "mysql client not on PATH - verified TCP reachability only."
    } else {
        Write-Err "MySQL is not reachable at $host_`:$port_"
        return $false
    }
    Write-Ok "MySQL OK - host=$host_ port=$port_ db=$db_"
    return $true
}

# ------------------------------------------------------------ dependency --
function Test-CoreDeps {
    $missing = 0
    foreach ($tool in @('node', 'npm', 'java', 'python', 'curl')) {
        if (Get-Command $tool -ErrorAction SilentlyContinue) {
            Write-Host "[ok]   $tool" -ForegroundColor Green
        } else {
            Write-Host "[MISSING] $tool" -ForegroundColor Red
            $missing++
        }
    }
    return ($missing -eq 0)
}

# -------------------------------------------------------------- resolve ----
function Resolve-Python {
    param([string]$ServiceDir, [string[]]$Modules)
    $cands = @()
    foreach ($c in @(
        (Join-Path $ServiceDir '.venv\Scripts\python.exe'),
        (Join-Path $ServiceDir '.venv\bin\python'),
        (Join-Path $ProjectRoot '.venv\Scripts\python.exe'),
        (Join-Path $ProjectRoot '.venv\bin\python')
    )) { if (Test-Path $c) { $cands += $c } }
    foreach ($c in @($cands, (Get-Command python -ErrorAction SilentlyContinue).Source)) {
        if (-not $c) { continue }
        $probe = '-c'
        $check = "import importlib,sys; [importlib.import_module(m) for m in sys.argv[1:]]"
        $args_ = @($probe, $check) + $Modules
        & $c @args_ 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) { return $c }
    }
    return $null
}

# ----------------------------------------------------------------- driver --
function Wait-Labeled {
    param([string]$Name, [bool]$Ok)
    $label = '  ' + $Name.PadRight(18)
    if ($Ok) { Write-Host ($label + 'ready') -ForegroundColor Green } else { Write-Host ($label + 'NOT READY') -ForegroundColor Red }
    if (-not $Ok) { $lf = Join-Path $LogsDir ($Name + '.log'); if (Test-Path $lf) { Get-Content $lf -Tail 15 | ForEach-Object { Write-Host '      | ' -NoNewline; Write-Host $_ } } }
}

$BackendPort = 8080

function Main {
    Write-Step 'AgroLink - unified development environment (PowerShell)'
    Write-Step "Workspace: $ProjectRoot"
    Set-Location $ProjectRoot

    Write-Step '1/6 Checking dependencies'
    if (-not (Test-CoreDeps)) { Write-Err 'Install missing tools first.'; exit 1 }

    Write-Step '2/6 Loading environment'
    Load-EnvFile | Out-Null
    $script:BackendPort = if ($env:SERVER_PORT) { [int]$env:SERVER_PORT } else { 8080 }
    Export-BackendEnv

    Write-Step '3/6 Database'
    if (-not $NoDbCheck -and -not (Test-MySql)) { Write-Err 'Database check failed - aborting (switch -NoDbCheck to force).'; exit 1 }

    Write-Step '4/6 Starting services (in dependency order)'
    $failed = $false

    if (-not $NoAI) {
        $py = Resolve-Python $AiDir @('fastapi', 'uvicorn', 'joblib', 'pandas', 'pydantic')
        if (-not $py) { Write-Err 'No interpreter with fastapi/uvicorn/joblib/pandas for AI service.'; $failed = $true }
        else {
            Write-Host "    using interpreter: $py"
            $p = Start-AgroService 'ai' 'AI service (FastAPI)' $AiDir $AiPort ('"' + $py + '" -m uvicorn app.main:app --host 127.0.0.1 --port ' + $AiPort)
            if ($p) { Wait-Labeled 'ai' (Wait-Http ("http://127.0.0.1:$AiPort/health") 40 2) } else { $failed = $true }
        }
    }

    if (-not $NoOpt) {
        $py = Resolve-Python $OptDir @('fastapi', 'uvicorn', 'pydantic')
        if (-not $py) { Write-Err 'No interpreter with fastapi/uvicorn/pydantic for optimization service.'; $failed = $true }
        else {
            Write-Host "    using interpreter: $py"
            $p = Start-AgroService 'opt' 'Optimization (FastAPI)' $OptDir $OptPort ('"' + $py + '" run.py')
            if ($p) { Wait-Labeled 'opt' (Wait-Http ("http://127.0.0.1:$OptPort/health") 40 2) } else { $failed = $true }
        }
    }

    if (-not $NoBackend) {
        if (-not (Test-Path (Join-Path $BackendDir 'mvnw.cmd')) -and -not (Get-Command mvn -ErrorAction SilentlyContinue)) {
            Write-Err 'No backend build tool (mvnw.cmd missing and mvn not on PATH).'; $failed = $true
        } else {
            $cmd = if (Test-Path (Join-Path $BackendDir 'mvnw.cmd')) { '.\mvnw.cmd spring-boot:run' } else { 'mvn spring-boot:run' }
            $p = Start-AgroService 'backend' 'Backend (Spring Boot)' $BackendDir $BackendPort $cmd
            if ($p) { Wait-Labeled 'backend' (Wait-Http ("http://127.0.0.1:$BackendPort/api/health") 90 3) } else { $failed = $true }
        }
    }

    if (-not $NoFrontend) {
        if (-not (Test-Path (Join-Path $FrontendDir 'node_modules'))) {
            Write-Err 'frontend/node_modules missing - run: cd frontend; npm install'; $failed = $true
        } else {
            $p = Start-AgroService 'frontend' 'Frontend (Vite)' $FrontendDir $FrontPort 'npm run dev'
            if ($p) { Wait-Labeled 'frontend' (Wait-Tcp $FrontPort 60 1) } else { $failed = $true }
        }
    }

    Write-Step '5/6 Service status'
    Write-Host ('  {0,-16} {1,-9} {2}' -f 'SERVICE', 'STATUS', 'ENDPOINT')
    Write-Host ('  {0,-16} {1,-9} {2}' -f '-------', '------', '--------')
    foreach ($svc in @(@{ n = 'frontend'; u = "http://localhost:$FrontPort/" }, @{ n = 'backend'; u = "http://localhost:$BackendPort/  (swagger: /swagger-ui.html)" }, @{ n = 'ai'; u = "http://localhost:$AiPort/health" }, @{ n = 'opt'; u = "http://localhost:$OptPort/health" })) {
        $st = $svc.n; $col = 'DarkGray'
        if (-not $NoAI -and $svc.n -eq 'ai') { $col = 'Green' } elseif (-not $NoBackend -and $svc.n -eq 'backend') { $col = 'Green' } elseif (-not $NoFrontend -and $svc.n -eq 'frontend') { $col = 'Green' } elseif (-not $NoOpt -and $svc.n -eq 'opt') { $col = 'Green' } else { $col = 'Yellow' }
        Write-Host ('  {0,-16} {1,-9} {2}' -f $svc.n, 'UP', $svc.u) -ForegroundColor $col
    }

    if ($failed) { Write-Err 'Some services failed - inspect .\logs\*.log and run scripts\status.sh'; Stop-AgroServices; exit 1 }

    Write-Step '6/6 All services are UP'
    Write-Host 'Press Ctrl+C to stop everything (PIDs + logs in .\logs\).' -ForegroundColor DarkGray
    while ($true) { Start-Sleep -Seconds 1 }
}

Main
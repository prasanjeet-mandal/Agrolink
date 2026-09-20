#!/usr/bin/env bash
# ============================================================================
# AgroLink — shared helpers for the dev scripts under scripts/
# Sourced by start.sh / stop.sh / status.sh / restart.sh / check-dependencies.sh
#
# Bash 3.2+ compatible (macOS, Linux, Git Bash on Windows).
# ============================================================================

# Resolve this file's real path (works with symlinks on Linux/macOS).
resolve_common_dir() {
    local s="$1" d=""; local dir=""
    while [ -h "$s" ]; do
        d="$(cd "$(dirname "$s")" && pwd)"
        s="$(readlink "$s")"
        [ "${s#/}" = "$s" ] && s="$d/$s"
    done
    dir="$(cd "$(dirname "$s")" && pwd)"
    printf '%s' "$dir"
}

COMMON_DIR="$(resolve_common_dir "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$COMMON_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$COMMON_DIR/../.." && pwd)"

LOGS_DIR="$PROJECT_ROOT/logs"
ENV_FILE="$PROJECT_ROOT/.env"

# --- Output helpers ---------------------------------------------------------
if [ -t 1 ] && command -v tput >/dev/null 2>&1 && [ -z "${NO_COLOR:-}" ]; then
    _NC='\033[0m'; _BOLD='\033[1m'; _RED='\033[31m'; _GREEN='\033[32m'
    _YELLOW='\033[33m'; _CYAN='\033[36m'; _DIM='\033[2m'
else
    _NC=''; _BOLD=''; _RED=''; _GREEN=''; _YELLOW=''; _CYAN=''; _DIM=''
fi

info() { printf "${_CYAN}[agrolink]${_NC} %s\n" "$*"; }
step() { printf "${_BOLD}[agrolink]${_NC} %s\n" "$*"; }
ok()   { printf "${_GREEN}[ok]${_NC} %s\n" "$*"; }
warn() { printf "${_YELLOW}[warn]${_NC} %s\n" "$*"; }
err()  { printf "${_RED}[ERROR]${_NC} %s\n" "$*" >&2; }
dim()  { printf "${_DIM}%s${_NC}\n" "$*"; }

is_msys() {
    case "$(uname -s 2>/dev/null)" in
        MINGW*|MSYS*|CYGWIN*) return 0 ;;
        *) return 1 ;;
    esac
}

# --- Environment loading (.env) ---------------------------------------------
# Loads KEY=VALUE pairs. Never overwrites variables already present in the
# environment (so real env vars / CI settings always win over the file).
load_env() {
    local file="${1:-$ENV_FILE}"
    if [ ! -f "$file" ]; then
        warn "Environment file not found: $file"
        warn "Copy '.env.example' to '.env' and fill in the values."
        return 1
    fi
    local line key val
    while IFS= read -r line || [ -n "$line" ]; do
        line="${line#"${line%%[![:space:]]*}"}"          # trim leading whitespace
        [ -z "$line" ] && continue
        case "$line" in \#*) continue ;; esac            # skip comments

        key="${line%%=*}"
        val="${line#*=}"
        key="${key%"${key##*[![:space:]]}"}"             # trim trailing ws on key
        [ -z "$key" ] && continue

        # strip \r (CRLF .env files) and surrounding quotes from the value
        val="${val%$'\r'}"
        val="${val%"${val##*[![:space:]]}"}"
        case "$val" in \"*\") val="${val#\"}"; val="${val%\"}" ;; esac
        case "$val" in \'*\') val="${val#\'}"; val="${val%\'}" ;; esac

        if ! printenv "$key" >/dev/null 2>&1; then
            export "$key=$val"
        fi
    done < "$file"
    return 0
}

# --- Dependency checks -------------------------------------------------------
have() { command -v "$1" >/dev/null 2>&1; }

install_hint() {
    local tool="$1"
    case "$tool" in
        node)  echo "Install Node 18+ from https://nodejs.org/         (choco install nodejs-lts)" ;;
        npm)   echo "npm ships with Node.js — install Node 18+ first." ;;
        java)  echo "Install JDK 21+ (Temurin) from https://adoptium.net/  (choco install temurin21)" ;;
        mvn|mvnw) echo "Install Maven 3.9+ from https://maven.apache.org/  (choco install maven)" ;;
        python|python3)
            echo "Install Python 3.10+ from https://www.python.org/    (choco install python)" ;;
        curl)  echo "Install curl from https://curl.se/  (choco install curl)" ;;
        mysql) echo "Install MySQL 8 client from https://dev.mysql.com/downloads/" ;;
        docker) echo "Optional — install Docker Desktop from https://www.docker.com/products/docker-desktop/" ;;
        *)     echo "Install '$tool' manually." ;;
    esac
}

# require_cmd <name> [binary...]. Returns 1 if absent, printing a hint.
require_cmd() {
    local label="$1"; shift
    local bin ok=0
    for bin in "$@"; do
        if have "$bin"; then ok=1; break; fi
    done
    if [ "$ok" -eq 1 ]; then
        printf "${_GREEN}ok${_NC}   %-8s %s\n" "$label" "$("$bin" --version 2>&1 | head -n 1)"
        return 0
    fi
    printf "${_RED}MISSING${_NC} %-8s " "$label"
    install_hint "$label"
    return 1
}

# --- Python interpreter resolution -------------------------------------------
# resolve_python <service_dir> <module> [module ...]
# Picks the first interpreter (service venv -> root .venv -> system python)
# that can import ALL listed modules. Prints the interpreter path on success.
# NOTE: paths may contain spaces (Windows usernames) — never word-split them.
resolve_python() {
    local dir="$1"; shift
    local list=() c p cand
    for c in "$dir/.venv/bin/python" "$dir/.venv/Scripts/python.exe" \
             "$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/.venv/Scripts/python.exe"; do
        [ -x "$c" ] && list+=("$c")
    done
    # All pythons on PATH (python3 may be a dead WindowsApps stub — the module
    # check below weeds out duds, so also probe `python`).
    for cand in python3 python python.exe; do
        p="$(command -v "$cand" 2>/dev/null || true)"
        [ -n "$p" ] && list+=("$p")
    done
    for c in "${list[@]}"; do
        if "$c" -c 'import importlib,sys; [importlib.import_module(m) for m in sys.argv[1:]]' "$@" >/dev/null 2>&1; then
            printf '%s' "$c"
            return 0
        fi
    done
    return 1
}

# --- TCP / HTTP readiness ----------------------------------------------------
# Portable TCP reachability probe (python-preferred since it works in Git Bash).
is_port_open() {
    local host="$1" port="$2"
    local p rc
    # try python interpreters that actually execute (a WindowsApps stub exits 127)
    for p in "$(command -v python3 2>/dev/null || true)" "$(command -v python 2>/dev/null || true)"; do
        [ -n "$p" ] || continue
        "$p" -c 'import socket,sys; sys.exit(0 if socket.socket().connect_ex((sys.argv[1], int(sys.argv[2]))) == 0 else 1)' "$host" "$port" 2>/dev/null
        rc=$?
        [ "$rc" -eq 0 ] && return 0
        [ "$rc" -eq 1 ] && return 1           # interpreter ran → port is closed
        # rc >= 2 → interpreter failed to run → try the next one
    done
    if (exec 3<>"/dev/tcp/$host/$port") 2>/dev/null; then exec 3>&-; return 0; fi
    if curl -s --max-time 2 "http://$host:$port/" >/dev/null 2>&1; then return 0; fi
    return 1
}

# wait_http <url> <label> [retries] [delay_secs] — polls until HTTP answers.
wait_http() {
    local url="$1" label="$2" retries="${3:-60}" delay="${4:-2}"
    local i code
    if ! have curl; then err "curl is required for health checks."; return 1; fi
    for i in $(seq 1 "$retries"); do
        code="$(curl -s -o /dev/null --max-time 3 -w '%{http_code}' "$url" 2>/dev/null || true)"
        case "$code" in
            2*|3*|4*|5*) return 0 ;;   # any HTTP answer == server is up
            *) sleep "$delay" ;;
        esac
    done
    err "Timed out waiting for $label at $url"
    return 1
}

# wait_tcp <host> <port> <label> [retries] [delay_secs]
wait_tcp() {
    local host="$1" port="$2" label="$3" retries="${4:-60}" delay="${5:-2}"
    local i
    for i in $(seq 1 "$retries"); do
        is_port_open "$host" "$port" && return 0
        sleep "$delay"
    done
    err "Timed out waiting for $label on $host:$port"
    return 1
}

# --- PID files ---------------------------------------------------------------
pidfile()   { printf '%s/pid/%s.pid' "$LOGS_DIR" "$1"; }
read_pid()  { [ -f "$1" ] && cat "$1" 2>/dev/null || true; }
rm_pid()    { rm -f "$1"; }

pid_alive() {
    local pid="$1"
    [ -n "$pid" ] || return 1
    kill -0 "$pid" 2>/dev/null
}

# --- Process management ------------------------------------------------------
# terminate_tree <pid> — stops a process and its children without touching
# anything else. Uses tree-kill on Windows, recursive SIGTERM on *nix.
terminate_tree() {
    local pid="$1"
    [ -n "$pid" ] && pid_alive "$pid" || return 0

    if is_msys; then
        # graceful first, force as fallback
        taskkill //T //PID "$pid" >/dev/null 2>&1
        sleep 1
        pid_alive "$pid" && taskkill //F //T //PID "$pid" >/dev/null 2>&1
        return 0
    fi

    local child=""
    for child in $(pgrep -P "$pid" 2>/dev/null); do
        terminate_tree "$child"
    done
    kill "$pid" 2>/dev/null
    sleep 1
    pid_alive "$pid" && kill -9 "$pid" 2>/dev/null
    return 0
}

# stop_by_pidfile <service> [grace_secs] — stop one known service cleanly.
stop_by_pidfile() {
    local name="$1"
    local pf; pf="$(pidfile "$name")"
    local pid; pid="$(read_pid "$pf")"
    if [ -z "$pid" ]; then
        printf "${_DIM}  %-14s not running (no pid file)${_NC}\n" "$name"
        return 0
    fi
    if ! pid_alive "$pid"; then
        rm_pid "$pf"
        printf "${_DIM}  %-14s not running (stale pid removed)${_NC}\n" "$name"
        return 0
    fi
    printf '  %-14s stopping (pid %s) ... ' "$name" "$pid"
    terminate_tree "$pid"
    if pid_alive "$pid"; then
        printf "${_RED}failed${_NC}\n"
        warn "Could not stop '$name' (pid $pid). Try: taskkill /F /T /PID $pid"
        return 1
    fi
    rm_pid "$pf"
    printf "${_GREEN}stopped${_NC}\n"
    return 0
}
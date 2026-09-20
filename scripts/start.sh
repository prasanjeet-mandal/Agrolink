#!/usr/bin/env bash
# ============================================================================
# AgroLink — one-command developer environment
#   ./scripts/start.sh
#
# Starts (in order): AI service -> optimization service -> Spring Boot backend
# -> React frontend. Health-checks each one before moving on, writes logs to
# logs/, keeps PID files in logs/pid/, and cleans everything up on Ctrl+C.
#
# Options:
#   --no-ai | --no-opt | --no-backend | --no-frontend   skip a service
#   --no-db-check                                       skip the MySQL probe
#   --skip-dep-check                                    skip tool checks
#   --help                                              show this help
#
# Bash 3.2+ compatible (Linux / macOS / Git Bash on Windows).
# ============================================================================
set -u
# shellcheck source=lib/common.sh
. "$(cd "$(dirname "${BASH_SOURCE[0]}" 2>/dev/null || dirname "$0")" && pwd)/lib/common.sh"

# --- Configuration -------------------------------------------------------------
AI_DIR="$PROJECT_ROOT/ai-service/ml-service"
OPT_DIR="$PROJECT_ROOT/optimization-service"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

AI_PORT=8000
OPT_PORT=8001
FRONTEND_PORT=5173

# Per-service outcome state (bash-3 compatible: flat vars)
RESULT_AI=""; RESULT_OPT=""; RESULT_BACKEND=""; RESULT_FRONTEND=""

# Which services to run — toggled by --no-* flags
RUN_AI=1; RUN_OPT=1; RUN_BACKEND=1; RUN_FRONTEND=1
RUN_DB_CHECK=1; RUN_DEP_CHECK=1

set_result() {
    local n="$1" v="$2"
    case "$n" in
        ai)       RESULT_AI="$v" ;;

        opt)      RESULT_OPT="$v" ;;

        backend)  RESULT_BACKEND="$v" ;;

        frontend) RESULT_FRONTEND="$v" ;;
    esac
}

get_result() {
    case "$1" in
        ai)       printf '%s' "${RESULT_AI:-}" ;;
        opt)      printf '%s' "${RESULT_OPT:-}" ;;
        backend)  printf '%s' "${RESULT_BACKEND:-}" ;;
        frontend) printf '%s' "${RESULT_FRONTEND:-}" ;;
    esac
}

# --- Help -------------------------------------------------------------------------
usage() {
    sed -n '2,23p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
}

# --- Env mapping: .env names -> Spring Boot property names --------------------------
# The backend has NO application.properties; all config arrives through the
# environment. Spring Boot's relaxed binding needs canonical names, so we map
# the project's existing .env keys onto them. Existing env vars always win.
backend_env() {
    local map="
DB_URL|SPRING_DATASOURCE_URL
DB_USER|SPRING_DATASOURCE_USERNAME
DB_PASSWORD|SPRING_DATASOURCE_PASSWORD
DDL_AUTO|SPRING_JPA_HIBERNATE_DDL_AUTO
JWT_SECRET|APP_JWT_SECRET
JWT_EXPIRATION|APP_JWT_EXPIRATION
JWT_REGISTRATION_EXPIRATION|APP_JWT_REGISTRATION_EXPIRATION
OTP_EXPOSE_CODE|APP_OTP_DEV_EXPOSE_CODE
OTP_REQUIRE_VERIFY|APP_OTP_REQUIRE_VERIFY
OTP_DEV_CODE|APP_OTP_DEV_CODE
OTP_MAX_SENDS|APP_OTP_MAX_SENDS_PER_WINDOW
OTP_RATE_WINDOW_MINUTES|APP_OTP_RATE_WINDOW_MINUTES
OTP_RESEND_COOLDOWN|APP_OTP_RESEND_COOLDOWN_SECONDS
OTP_MAX_ATTEMPTS|APP_OTP_MAX_VERIFY_ATTEMPTS
OTP_TTL_SECONDS|APP_OTP_TTL_SECONDS
AI_URL|APP_AI_PYTHON_URL
CORS_ALLOWED_ORIGINS|APP_CORS_ALLOWED_ORIGINS
"
    local src dst val
    while IFS='|' read -r src dst; do
        [ -z "$src" ] && continue
        if ! printenv "$dst" >/dev/null 2>&1 && printenv "$src" >/dev/null 2>&1; then
            val="$(printenv "$src")"
            export "$dst=$val"
            dim "    env: $dst set <- $src (from .env)"
        fi
    done <<< "$map"
}

# --- Service scaffolding ------------------------------------------------------------
guard_service() {
    # Returns 0 = ok to start, 2 = skip (already running / port busy)
    local name="$1" port="$2"
    local pf; pf="$(pidfile "$name")"
    local existing; existing="$(read_pid "$pf")"

    if [ -n "$existing" ] && pid_alive "$existing"; then
        warn "$name already running (pid $existing) — skipping duplicate start."
        set_result "$name" skipped
        return 2
    fi
    [ -n "$existing" ] && rm -f "$pf" && dim "    removed stale pid file for $name"

    if is_port_open 127.0.0.1 "$port"; then
        warn "Port $port already in use (not by an AgroLink pid file). Skipping '$name' — check ./scripts/status.sh."
        set_result "$name" skipped
        return 2
    fi
    return 0
}

launch_service() {
    # launch_service <name> <label> <workdir> <prog> [args...]
    local name="$1" label="$2" workdir="$3"; shift 3
    local pf; pf="$(pidfile "$name")"
    local lf="$LOGS_DIR/$name.log"
    mkdir -p "$LOGS_DIR" "$(dirname "$pf")"
    ( cd "$workdir" && "$@" ) >>"$lf" 2>&1 &
    local pid=$!
    printf '%s' "$pid" > "$pf"
    ok "$label started (pid $pid) — logs/$name.log"
}

wait_for() {
    # wait_for <name> <url> <http|tcp> [retries] [delay]
    local name="$1" url="$2" mode="${3:-http}" retries="${4:-60}" delay="${5:-2}"
    printf '  %-18s waiting for readiness … ' "$name"
    local r=1
    if [ "$mode" = "tcp" ]; then
        local h="${url%%:*}" p="${url##*:}"
        wait_tcp "$h" "$p" "$name" "$retries" "$delay" >/dev/null 2>&1 && r=0
    else
        wait_http "$url" "$name" "$retries" "$delay" >/dev/null 2>&1 && r=0
    fi
    if [ "$r" -eq 0 ]; then
        printf "${_GREEN}ready${_NC}\n"
    else
        printf "${_RED}NOT READY${_NC}\n"
        tail -n 15 "$LOGS_DIR/$name.log" 2>/dev/null | sed 's/^/      | /'
    fi
    [ "$r" -eq 0 ]
}

# --- MySQL connectivity ----------------------------------------------------------------
check_mysql() {
    step "   MySQL connectivity"
    # shellcheck disable=SC2155
    local host="${DB_HOST:-127.0.0.1}" port="${DB_PORT:-3306}"
    local user="${DB_USER:-root}" pass="${DB_PASSWORD:-}"
    local dbname="${MYSQL_DATABASE:-agrolink}"

    local ok=0 client=0
    have mysql && client=1

    if [ "$client" -eq 1 ]; then
        if mysql --connect-timeout=5 -h "$host" -P "$port" --protocol=TCP -u "$user" ${pass:+-p"$pass"} \
            -e "SELECT 1;" >/dev/null 2>&1; then
            ok=1
        else
            err "MySQL auth failed for user '$user' on $host:$port."
            warn "Fix DB_USER / DB_PASSWORD in .env (or export real DB_USER / DB_PASSWORD)."
            return 1
        fi
    elif is_port_open "$host" "$port"; then
        ok=1
        warn "mysql client not on PATH — verified TCP reachability of $host:$port only."
    fi

    if [ "$ok" -eq 0 ]; then
        err "MySQL is not reachable at $host:$port."
        warn "Start a MySQL 8 server and make sure the '$dbname' database exists. Then rerun."
        return 1
    fi

    if [ "$client" -eq 1 ]; then
        # Ensure the database exists (no-op when already there)
        mysql --connect-timeout=5 -h "$host" -P "$port" --protocol=TCP -u "$user" ${pass:+-p"$pass"} \
            -e "CREATE DATABASE IF NOT EXISTS \`$dbname\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" >/dev/null 2>&1
    fi
    ok "MySQL OK — host=$host port=$port db=$dbname"
    return 0
}

# --- Shutdown ---------------------------------------------------------------------------
STOPPING=0
cleanup() {
    [ "$STOPPING" -eq 1 ] && return 0
    STOPPING=1
    echo ""
    step "Shutting down AgroLink services …"
    for s in ai opt backend frontend; do
        stop_by_pidfile "$s" || true
    done
    ok "All services stopped. Logs kept under ./logs/"
}

trap 'cleanup' INT TERM
trap 'exit $?' EXIT

# --- Argument parsing --------------------------------------------------------------------
while [ $# -gt 0 ]; do
    case "$1" in
        --no-ai)          RUN_AI=0 ;;
        --no-opt)         RUN_OPT=0 ;;
        --no-backend)     RUN_BACKEND=0 ;;
        --no-frontend)    RUN_FRONTEND=0 ;;
        --no-db-check)    RUN_DB_CHECK=0 ;;
        --skip-dep-check) RUN_DEP_CHECK=0 ;;
        --help|-h)        usage ;;
        *) warn "Unknown option: $1"; usage ;;
    esac
    shift
done

# --- Main ---------------------------------------------------------------------------------
main() {
    cat <<'BANNER'
  ___        _        _ _       _
 / _ \      | |      | (_)     | |
/ /_\ \_ __ | |_ __ _| |_  __ _| | ___ __
|  _  | '_ \| __/ _` | | |/ _` | |/ / '_ \
| | | | |_) | || (_| | | | (_| |   <| | | |
\_| |_/ .__/ \__\__,_|_|_|\__,_|_|\_\_| |_|
      | |                        by AgroLink
      |_|
BANNER
    step "AgroLink — unified development environment"
    info  "Workspace: $PROJECT_ROOT"
    cd "$PROJECT_ROOT" || { err "Cannot cd to $PROJECT_ROOT"; exit 1; }

    # 1. Dependencies -----------------------------------------------------------
    if [ "$RUN_DEP_CHECK" -eq 1 ]; then
        step "1/6 Checking dependencies"
        local missing=0
        have node || { err "node not found."; install_hint node; missing=1; }
        have npm  || { err "npm not found.";  install_hint npm;  missing=1; }
        have java || { err "java not found."; install_hint java; missing=1; }
        { have python || have python3; } || { err "python not found."; install_hint python; missing=1; }
        have curl || { err "curl not found."; install_hint curl; missing=1; }
        if [ "$missing" -eq 1 ]; then
            err "Install the missing tools, then run ./scripts/check-dependencies.sh — full report."
            exit 1
        fi
        ok "Core tools present (node / npm / java / python / curl)"
        [ -d "$FRONTEND_DIR/node_modules" ] \
            || warn "frontend/node_modules missing — run: cd frontend && npm install"
        [ -d "$BACKEND_DIR/target" ] && dim "  backend already compiled (target/ present)"
    fi

    # 2. Environment -----------------------------------------------------------------
    step "2/6 Loading environment"
    load_env "$ENV_FILE"
    local backend_port; backend_port="${SERVER_PORT:-8080}"
    [ "$RUN_BACKEND" -eq 1 ] && backend_env

    # 3. Database ----------------------------------------------------------------------
    step "3/6 Database"
    if [ "$RUN_DB_CHECK" -eq 1 ]; then
        check_mysql || { err "Database check failed — aborting (use --no-db-check to force-start)."; exit 1; }
    else
        warn "--no-db-check given — skipping MySQL verification."
    fi

    # 4. Services -------------------------------------------------------------------------
    step "4/6 Starting services (in dependency order)"

    # --- AI service (FastAPI / uvicorn :8000) --------------------------------------
    if [ "$RUN_AI" -eq 1 ]; then
        if [ ! -d "$AI_DIR" ]; then
            err "AI service directory not found: $AI_DIR"; set_result ai failed
        elif [ "$(get_result ai)" != "skipped" ] && guard_service ai "$AI_PORT"; then
            local aipy=""
            aipy="$(resolve_python "$AI_DIR" fastapi uvicorn joblib pandas pydantic)"
            if [ -z "$aipy" ]; then
                err "No interpreter with (fastapi, uvicorn, joblib, pandas, pydantic) for the AI service."
                warn "Install once: python -m pip install fastapi uvicorn joblib pandas pydantic  (or create ai-service/ml-service/.venv)"
                set_result ai failed
            else
                dim "    using interpreter: $aipy"
                launch_service ai "AI service (FastAPI)" "$AI_DIR" "$aipy" -m uvicorn app.main:app --host 127.0.0.1 --port "$AI_PORT"
                if wait_for ai "http://127.0.0.1:$AI_PORT/health" http 40 2; then set_result ai ok; else set_result ai failed; fi
            fi
        fi
    else
        set_result ai skipped
    fi

    # --- Optimization service (FastAPI :8001) ----------------------------------------
    if [ "$RUN_OPT" -eq 1 ]; then
        if [ ! -d "$OPT_DIR" ]; then
            err "Optimization service directory not found: $OPT_DIR"; set_result opt failed
        elif [ "$(get_result opt)" != "skipped" ] && guard_service opt "$OPT_PORT"; then
            local optpy=""
            optpy="$(resolve_python "$OPT_DIR" fastapi uvicorn pydantic)"
            if [ -z "$optpy" ]; then
                err "No interpreter with (fastapi, uvicorn, pydantic) for the optimization service."
                warn "Run: cd optimization-service && python -m venv .venv && .venv/bin/pip install -r requirements.txt"
                set_result opt failed
            else
                dim "    using interpreter: $optpy"
                launch_service opt "Optimization (FastAPI)" "$OPT_DIR" "$optpy" run.py
                if wait_for opt "http://127.0.0.1:$OPT_PORT/health" http 40 2; then set_result opt ok; else set_result opt failed; fi
            fi
        fi
    else
        set_result opt skipped
    fi

    # --- Spring Boot backend (mvnw spring-boot:run :SERVER_PORT) ----------------------
    if [ "$RUN_BACKEND" -eq 1 ]; then
        if { [ ! -f "$BACKEND_DIR/mvnw" ] && ! have mvn; }; then
            err "No backend build tool (backend/mvnw missing and mvn not on PATH)."; set_result backend failed
        elif [ "$(get_result backend)" != "skipped" ] && guard_service backend "$backend_port"; then
            if [ -x "$BACKEND_DIR/mvnw" ]; then
                launch_service backend "Backend (Spring Boot)" "$BACKEND_DIR" ./mvnw spring-boot:run
            elif [ -f "$BACKEND_DIR/mvnw" ]; then
                launch_service backend "Backend (Spring Boot)" "$BACKEND_DIR" sh ./mvnw spring-boot:run
            else
                launch_service backend "Backend (Spring Boot)" "$BACKEND_DIR" mvn spring-boot:run
            fi
            # First run compiles — allow up to ~4.5 minutes
            if wait_for backend "http://127.0.0.1:$backend_port/api/health" http 90 3; then
                set_result backend ok
            else
                set_result backend failed
            fi
        fi
    else
        set_result backend skipped
    fi

    # --- React frontend (vite :5173) ------------------------------------------------------
    if [ "$RUN_FRONTEND" -eq 1 ]; then
        if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
            err "frontend/node_modules missing — run: cd frontend && npm install"; set_result frontend failed
        elif [ "$(get_result frontend)" != "skipped" ] && guard_service frontend "$FRONTEND_PORT"; then
            launch_service frontend "Frontend (Vite)" "$FRONTEND_DIR" npm run dev
            if wait_for frontend "http://127.0.0.1:$FRONTEND_PORT" tcp 60 1; then
                local code
                code="$(curl -s -o /dev/null --max-time 3 -w '%{http_code}' "http://127.0.0.1:$FRONTEND_PORT/" 2>/dev/null || true)"
                if [ -n "$code" ]; then set_result frontend ok; else set_result frontend failed; fi
            else
                set_result frontend failed
            fi
        fi
    else
        set_result frontend skipped
    fi

    # 5. Report -----------------------------------------------------------------------------
    step "5/6 Service status"
    report "$backend_port"

    # final failed check must not trip on the undecided (empty) state
    local failed=0
    for s in ai opt backend frontend; do
        [ "$(get_result "$s")" = "failed" ] && failed=1
    done

    # 6. Hold / exit ---------------------------------------------------------------------------
    if [ "$failed" -eq 1 ]; then
        err "Some services failed to start — inspect ./logs/*.log and ./scripts/status.sh."
        exit 1
    fi

    step "6/6 All services are UP."
    info "Press Ctrl+C to stop everything (PID files + logs live in ./logs/)."
    while true; do sleep 1; done
}

report() {
    local backend_port="$1"
    printf '  %-16s %-9s %s\n' "SERVICE" "STATUS" "ENDPOINT"
    printf '  %-16s %-9s %s\n' "-------" "------" "--------"
    printf '  %-16s %s %s\n' "frontend"  "$(result_color frontend)" "http://localhost:$FRONTEND_PORT/"
    printf '  %-16s %s %s\n' "backend"   "$(result_color backend)"  "http://localhost:$backend_port/  (swagger: /swagger-ui.html)"
    printf '  %-16s %s %s\n' "ai"        "$(result_color ai)"       "http://localhost:$AI_PORT/health"
    printf '  %-16s %s %s\n' "opt"       "$(result_color opt)"      "http://localhost:$OPT_PORT/health"
}

result_color() {
    case "$(get_result "$1")" in
        ok)      printf '%s' "${_GREEN}UP${_NC}" ;;
        failed)  printf '%s' "${_RED}FAILED${_NC}" ;;
        skipped) printf '%s' "${_YELLOW}skipped${_NC}" ;;
        *)       printf '%s' "${_DIM}?${_NC}" ;;
    esac
}

main "$@"
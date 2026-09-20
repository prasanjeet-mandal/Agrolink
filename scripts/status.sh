#!/usr/bin/env bash
# ============================================================================
# AgroLink — show the status of every dev service
#   ./scripts/status.sh
# Exits 0 when every enabled service is healthy, 1 otherwise.
# ============================================================================
set -u
# shellcheck source=lib/common.sh
. "$(cd "$(dirname "${BASH_SOURCE[0]}" 2>/dev/null || dirname "$0")" && pwd)/lib/common.sh"

load_env "$ENV_FILE" >/dev/null 2>&1
BACKEND_PORT="${SERVER_PORT:-8080}"

DOWN=0

header() {
    printf '  %-16s %-10s %-8s %s\n' "SERVICE" "PID" "PORT" "HEALTH"
    printf '  %-16s %-10s %-8s %s\n' "-------" "---" "----" "------"
}

# check_service <name> <label> <port> <health_url|-> <log_base>
check_service() {
    local name="$1" label="$2" port="$3" health="$4" log="$5"
    local pf pid
    pf="$(pidfile "$name")"
    pid="$(read_pid "$pf")"

    local alive=0; pid_alive "$pid" && alive=1

    local pstate="free"; is_port_open 127.0.0.1 "$port" && pstate="open"

    local hstate="-"
    if [ "$alive" -eq 1 ] && [ "$pstate" = "open" ] && [ "$health" != "-" ]; then
        local code
        code="$(curl -s -o /dev/null --max-time 4 -w '%{http_code}' "$health" 2>/dev/null || true)"
        [ -n "$code" ] && hstate="$code"
    fi

    local pidcol="${_YELLOW}none${_NC}"; [ -n "$pid" ] && pidcol="$pid"
    local pcol="${_DIM}free${_NC}";      [ "$pstate" = "open" ] && pcol="${_CYAN}open${_NC}"
    local hcol="-"
    case "$hstate" in
        2*|3*) hcol="${_GREEN}$hstate${_NC}" ;;
        [45]*) hcol="${_RED}$hstate${_NC}" ;;
        *)     [ "$alive" -eq 1 ] && hcol="${_YELLOW}no-http${_NC}" ;;
    esac

    printf '  %-16s %-10s %-8s %s\n' "$label" "$pidcol" "$pcol" "$hcol"

    # healthy = process alive AND port open AND health URL answers 2xx/3xx (when one exists)
    local healthy=0
    if [ "$alive" -eq 1 ] && [ "$pstate" = "open" ]; then
        if [ "$health" = "-" ]; then
            healthy=1
        else
            case "$hstate" in 2*|3*) healthy=1 ;; esac
        fi
    fi
    [ "$healthy" -eq 1 ] || DOWN=$((DOWN+1))

    if [ -f "$LOGS_DIR/$log.log" ]; then
        local size
        size="$(wc -c < "$LOGS_DIR/$log.log" 2>/dev/null | tr -d ' ')"
        dim "               log: logs/$log.log ($size bytes)"
    fi
}

header
check_service ai          ai          8000        "http://127.0.0.1:8000/health"  ai-service
check_service opt         opt         8001        "http://127.0.0.1:8001/health"  optimization-service
check_service backend     backend     "$BACKEND_PORT" "http://127.0.0.1:$BACKEND_PORT/api/health" backend
check_service frontend    frontend    5173        "http://127.0.0.1:5173/"       frontend

echo ""
if [ "$DOWN" -eq 0 ]; then
    ok "All AgroLink services healthy."
else
    warn "$DOWN service(s) not healthy. Start with ./scripts/start.sh"
fi
[ "$DOWN" -eq 0 ]
#!/usr/bin/env bash
# ============================================================================
# AgroLink — dependency check
#   ./scripts/check-dependencies.sh          # quick table
#   ./scripts/check-dependencies.sh --verbose # also prints resolved interpreters
# Exits 0 when everything required is present, 1 otherwise.
# ============================================================================
set -u
# shellcheck source=lib/common.sh
. "$(cd "$(dirname "${BASH_SOURCE[0]}" 2>/dev/null || dirname "$0")" && pwd)/lib/common.sh"

VERBOSE=0
[ "${1:-}" = "--verbose" ] && VERBOSE=1

MISSING=0
FAIL=0
PASS=0

main() {
    step "AgroLink dependency check (`uname -s 2>/dev/null || echo unknown`)"
    cd "$PROJECT_ROOT" || { err "Cannot cd to $PROJECT_ROOT"; exit 1; }

    echo ""
    step "Core tools"
    printf "${_GREEN}ok${_NC}   %-8s %s\n" "bash" "$BASH_VERSION"
    require_cmd node node || MISSING=1
    require_cmd npm npm || MISSING=1
    require_cmd java java || MISSING=1
    require_cmd python python python3 || MISSING=1
    require_cmd curl curl || MISSING=1

    echo ""
    step "Backend build (Maven) — global mvn or ./mvnw wrapper"
    if have mvn; then
        printf "${_GREEN}ok${_NC}   %-8s %s\n" "mvn" "$(mvn -version 2>&1 | head -n 1)"
    elif [ -x "$PROJECT_ROOT/backend/mvnw" ] || [ -f "$PROJECT_ROOT/backend/mvnw" ]; then
        printf "${_GREEN}ok${_NC}   %-8s %s\n" "mvnw" "./backend/mvnw (Maven wrapper present)"
    else
        printf "${_RED}MISSING${_NC} %-8s " "mvn"
        install_hint mvn
        MISSING=1
    fi

    echo ""
    step "Database"
    if have mysql; then
        printf "${_GREEN}ok${_NC}   %-8s %s\n" "mysql" "$(mysql --version 2>&1)"
    else
        printf "${_YELLOW}optional${_NC} %-8s client not on PATH (falling back to TCP probe)\n" "mysql"
    fi

    echo ""
    step "Python services"
    check_python_env "ai-service" "ai-service/ml-service" "AI" "fastapi" "uvicorn" "joblib" "pandas" "pydantic"
    check_python_env "optimization-service" "optimization-service" "OPT" "fastapi" "uvicorn" "pydantic"

    echo ""
    step "Optional"
    if have docker; then
        printf "${_GREEN}ok${_NC}   %-8s %s\n" "docker" "$(docker --version 2>&1)"
    else
        printf "${_DIM}note %-7s docker not found (nice-to-have for the DB container; not required)\n" ""
    fi

    echo ""
    if [ "$MISSING" -eq 1 ]; then
        err "One or more required dependencies are missing. See the hints above."
        return 1
    fi
    ok "All required dependencies found (${_BOLD}$PASS ok${_NC}, ${_BOLD}$FAIL user-errors${_NC})."
    [ "$FAIL" -gt 0 ] && return 1
    return 0
}

# check_python_env <label> <service_dir> <short_label> <module...>
check_python_env() {
    local label="$1" sdir="$2" short="$3"; shift 3
    [ -d "$PROJECT_ROOT/$sdir" ] || { dim "  $label: directory not present — skipping."; return 0; }
    local py=""
    py="$(resolve_python "$PROJECT_ROOT/$sdir" "$@")"
    PASS=$((PASS+1))
    if [ -n "$py" ]; then
        printf "${_GREEN}ok${_NC}   %-8s %s\n" "$short" "$("$py" --version 2>&1)"
        if [ "$VERBOSE" -eq 1 ]; then
            dim "         interpreter: $py"
            dim "         modules   : $*"
            local m; for m in "$@"; do
                "$py" -c "import $m; print('           %-12s %s' % ('$m', getattr(__import__('$m'), '__version__', 'ok')))" 2>/dev/null || printf '           %-12s ?\n' "$m"
            done
        fi
    else
        printf "${_RED}MISSING${_NC} %-8s no interpreter found with modules: %s\n" "$short" "$*"
        dim "         expected venv at $sdir/.venv (or root .venv / system python3)"
        dim "         create it: cd $PROJECT_ROOT/$sdir && python -m venv .venv && .venv/bin/pip install -r requirements.txt"
        MISSING=1
    fi
}

main
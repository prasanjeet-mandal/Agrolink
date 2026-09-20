#!/usr/bin/env bash
# ============================================================================
# AgroLink — stop everything, then start everything again.
#   ./scripts/restart.sh [start.sh-options...]
# Any extra arguments are forwarded to start.sh (e.g. --no-frontend).
# ============================================================================
set -u
# shellcheck source=lib/common.sh
. "$(cd "$(dirname "${BASH_SOURCE[0]}" 2>/dev/null || dirname "$0")" && pwd)/lib/common.sh"

step "AgroLink — restarting all services"

"$SCRIPT_DIR/stop.sh" || true

echo ""
step "Starting services…"
"$SCRIPT_DIR/start.sh" "$@"
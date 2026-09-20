#!/usr/bin/env bash
# ============================================================================
# AgroLink — stop all dev services
#   ./scripts/stop.sh
# Stops only processes we started (PID files under logs/pid/), never
# unrelated processes. Logs are preserved in ./logs/.
# ============================================================================
set -u
# shellcheck source=lib/common.sh
. "$(cd "$(dirname "${BASH_SOURCE[0]}" 2>/dev/null || dirname "$0")" && pwd)/lib/common.sh"

step "AgroLink — stopping services"

RC=0
for s in ai opt backend frontend; do
    stop_by_pidfile "$s" || RC=1
done

echo ""
if [ "$RC" -eq 0 ]; then
    ok "Everything stopped. Logs remain in ./logs/"
else
    err "Some services could not be stopped cleanly — see messages above."
fi
exit "$RC"
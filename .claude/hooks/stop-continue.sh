#!/bin/sh
# Stop hook: while a batch's autonomy is "active" (in .claude/FACTORY_STATE.md, "Now"), asks Claude once to carry on
# with the recorded next action instead of stopping, unless a real reason to stop applies. It never asks twice in a
# row: when Claude is already continuing because of this hook (stop_hook_active), the stop goes ahead. It changes
# nothing; with no state file, or any other autonomy value, it lets Claude stop.

input=$(cat)
case "$input" in
  *'"stop_hook_active":true'* | *'"stop_hook_active": true'*) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
state=.claude/FACTORY_STATE.md
[ -f "$state" ] || exit 0
autonomy=$(sed -n 's/^- \*\*Autonomy:\*\* *\([a-z]*\).*/\1/p' "$state" | head -n 1)
[ "$autonomy" = active ] || exit 0

next=$(sed -n 's/^- \*\*Next action:\*\* *//p' "$state" | head -n 1 | cut -c 1-600 | sed 's/[.]*$//')
reason="Labs autonomy is active (.claude/FACTORY_STATE.md, Now). The next action recorded there: ${next:-see the batch file}. Carry on with it now instead of stopping, unless one of these applies: the batch is complete; everything left needs the owner; a safety or authorization boundary; repeated technical failures where another attempt is unlikely to help; the owner asked you to pause; or this session was only for a question or a task outside the batch. If one applies, first make sure Now says exactly what comes next (and set Autonomy to paused, blocked, or complete when that is the reason), then stop with a one-line reason."

# JSON-escape: backslashes and quotes, and no control characters.
escaped=$(printf '%s' "$reason" | tr -d '\000-\037' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
printf '{"decision":"block","reason":"%s"}\n' "$escaped"
exit 0

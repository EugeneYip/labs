#!/bin/sh
# Stop hook: while a batch's autonomy is "active" (in .claude/FACTORY_STATE.md, "Now"), asks Claude to carry on with
# the recorded next action instead of stopping, unless a real reason to stop applies. With no state file, or any
# autonomy value but "active", it lets Claude stop. It changes no project file; it only appends to its own log.
#
# The loop guard never asks twice without work in between, and doesn't rely on stop_hook_active alone, which may
# stay true for the rest of a turn once a Stop hook has blocked (that would make the hook ask only once per owner
# message). It lets the stop go ahead when:
#   1. it has already asked 3 times in the last 10 minutes (a backstop that needs nothing else);
#   2. the session's transcript shows no tool used since this hook last asked;
#   3. it can't see an earlier ask in the transcript (or can't read it) and stop_hook_active is true.
# Each run adds a line to .claude/hooks/stop-hook.log (ignored by git; the last 200 lines are kept).

input=$(cat)

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
log=.claude/hooks/stop-hook.log
now=$(date +%s)
note() {
  printf '%s %s %s\n' "$now" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >> "$log" 2>/dev/null
  if [ "$(wc -l < "$log" 2>/dev/null | tr -d ' ')" -gt 200 ] 2>/dev/null; then
    tail -n 200 "$log" > "$log.tmp" 2>/dev/null && mv "$log.tmp" "$log" 2>/dev/null
  fi
}

case "$input" in
  *'"stop_hook_active":true'* | *'"stop_hook_active": true'*) flag=true ;;
  *) flag=false ;;
esac

state=.claude/FACTORY_STATE.md
if [ ! -f "$state" ]; then note "no state file: stop"; exit 0; fi
autonomy=$(sed -n 's/^- \*\*Autonomy:\*\* *\([a-z]*\).*/\1/p' "$state" | head -n 1)
if [ "$autonomy" != active ]; then note "autonomy=${autonomy:-none} flag=$flag: stop"; exit 0; fi

recent=$(awk -v since=$((now - 600)) '$1 >= since && $NF == "continue"' "$log" 2>/dev/null | wc -l | tr -d ' ')
if [ "${recent:-0}" -ge 3 ]; then note "autonomy=active flag=$flag asked $recent times in 10 minutes: stop"; exit 0; fi

# Asks are found by this marker in an entry that isn't Claude's own message or a tool's result. The verdict over the
# transcript's last 1,500 entries is "none" (no ask there) or "<tools used since the last ask> <asks>"; empty if the
# transcript can't be read.
marker='[labs-stop-hook]'
verdict=""
if command -v jq >/dev/null 2>&1; then
  keys=$(printf '%s' "$input" | jq -r 'keys | join(",")' 2>/dev/null)
  transcript=$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)
  if [ -n "$transcript" ] && [ -f "$transcript" ]; then
    verdict=$(tail -n 1500 "$transcript" | jq -R -n -r --arg m "$marker" '
      [inputs | (fromjson? // empty)] as $all
      | [ $all | to_entries[]
          | select(.value.type != "assistant")
          | select(.value | tostring | contains($m))
          | select((.value.message.content? // null)
              | if type == "array" then any(.[]; (.type? // "") == "tool_result") else false end | not)
          | .key ] as $asks
      | if ($asks | length) == 0 then "none"
        else ([ $all[(($asks | last) + 1):][] | select(.type == "assistant")
                | .message.content[]? | select((.type? // "") == "tool_use") ] | length) as $tools
          | "\($tools) \($asks | length)"
        end' 2>/dev/null)
  fi
fi

case "$verdict" in
  '' | none)
    if [ "$flag" = true ]; then note "autonomy=active flag=true transcript=${verdict:-unread}: stop"; exit 0; fi
    how="transcript=${verdict:-unread}" ;;
  *)
    tools=${verdict% *}
    if [ "$tools" -eq 0 ] 2>/dev/null; then note "autonomy=active flag=$flag no tool since the last ask: stop"; exit 0; fi
    how="tools since the last ask=$tools asks=${verdict#* }" ;;
esac
note "autonomy=active flag=$flag keys=${keys:-?} $how: continue"

next=$(sed -n 's/^- \*\*Next action:\*\* *//p' "$state" | head -n 1 | cut -c 1-600 | sed 's/[.]*$//')
reason="$marker Labs autonomy is active (.claude/FACTORY_STATE.md, Now). The next action recorded there: ${next:-see the batch file}. Carry on with it now instead of stopping, unless one of these applies: the batch is complete; everything left needs the owner; a safety or authorization boundary; repeated technical failures where another attempt is unlikely to help; the owner asked you to pause; or this session was only for a question or a task outside the batch. If one applies, first make sure Now says exactly what comes next (and set Autonomy to paused, blocked, or complete when that is the reason), then stop with a one-line reason."

# JSON-escape: backslashes and quotes, and no control characters.
escaped=$(printf '%s' "$reason" | tr -d '\000-\037' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
printf '{"decision":"block","reason":"%s"}\n' "$escaped"
exit 0

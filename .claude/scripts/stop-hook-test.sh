#!/bin/sh
# Offline checks of .claude/hooks/stop-continue.sh: each case runs the hook against a throwaway project folder (its
# own FACTORY_STATE.md, log, and transcript) and checks whether it lets Claude stop or asks it to carry on.
# Usage: sh .claude/scripts/stop-hook-test.sh (from anywhere)
root=$(cd "$(dirname "$0")/../.." && pwd)
hook="$root/.claude/hooks/stop-continue.sh"
real_state="$root/.claude/FACTORY_STATE.md"
work=$(mktemp -d "${TMPDIR:-/tmp}/stophook.XXXXXX")
pass=0; fail=0
M='[labs-stop-hook]'

project() { # $1 = autonomy value ("" = no state file); prints the folder
  d=$(mktemp -d "$work/p.XXXXXX"); mkdir -p "$d/.claude/hooks"
  if [ -n "$1" ]; then sed "s/^- \*\*Autonomy:\*\* .*/- **Autonomy:** $1/" "$real_state" > "$d/.claude/FACTORY_STATE.md"; fi
  echo "$d"
}
run() { # $1 = folder, $2 = input JSON; prints "block" or "stop"
  out=$(printf '%s' "$2" | CLAUDE_PROJECT_DIR="$1" sh "$hook"); code=$?
  if [ $code -ne 0 ]; then echo "exit$code"; return; fi
  if [ -z "$out" ]; then echo stop; return; fi
  if printf '%s' "$out" | jq -e '.decision == "block" and (.reason | type == "string")' >/dev/null 2>&1; then echo block; else echo "badjson:$out"; fi
}
check() { # $1 = name, $2 = expected, $3 = actual
  if [ "$2" = "$3" ]; then pass=$((pass + 1)); echo "ok    $1"; else fail=$((fail + 1)); echo "FAIL  $1: expected $2, got $3"; fi
}
input() { # $1 = flag (true/false), $2 = transcript path or ""
  if [ -n "$2" ]; then printf '{"session_id":"t","transcript_path":"%s","hook_event_name":"Stop","stop_hook_active":%s}' "$2" "$1"
  else printf '{"session_id":"t","hook_event_name":"Stop","stop_hook_active":%s}' "$1"; fi
}

U='{"type":"user","message":{"role":"user","content":"Please carry on with the batch."}}'
TOOL='{"type":"assistant","message":{"role":"assistant","content":[{"type":"tool_use","id":"t1","name":"Bash","input":{"command":"git status"}}]}}'
RESULT='{"type":"user","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t1","content":"clean"}]}}'
TEXT='{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":"Done for now."}]}}'
ASK_USER="{\"type\":\"user\",\"isMeta\":true,\"message\":{\"role\":\"user\",\"content\":\"Stop hook feedback: $M Labs autonomy is active\"}}"
ASK_ATT="{\"type\":\"attachment\",\"attachment\":{\"type\":\"hook_blocking_error\",\"hookName\":\"Stop\",\"blockingError\":\"$M Labs autonomy is active\"}}"
ASK_SYS="{\"type\":\"system\",\"content\":\"Stop hook feedback: $M Labs autonomy is active\"}"
CAT_RESULT="{\"type\":\"user\",\"message\":{\"role\":\"user\",\"content\":[{\"type\":\"tool_result\",\"tool_use_id\":\"t2\",\"content\":\"marker='$M'\"}]}}"
MINE="{\"type\":\"assistant\",\"message\":{\"role\":\"assistant\",\"content\":[{\"type\":\"tool_use\",\"id\":\"t3\",\"name\":\"Edit\",\"input\":{\"new_string\":\"$M\"}}]}}"
transcript() { f=$(mktemp "$work/t.XXXXXX"); for line in "$@"; do printf '%s\n' "$line" >> "$f"; done; echo "$f"; }

# Autonomy values
check "no state file lets Claude stop" stop "$(run "$(project '')" "$(input false '')")"
for a in complete paused blocked; do
  check "autonomy $a lets Claude stop" stop "$(run "$(project $a)" "$(input false '')")"
done
check "autonomy active, no transcript, flag false: carry on" block "$(run "$(project active)" "$(input false '')")"
check "autonomy active, no transcript, flag true: stop (fallback)" stop "$(run "$(project active)" "$(input true '')")"
check "missing transcript file, flag true: stop (fallback)" stop "$(run "$(project active)" "$(input true "$work/none.jsonl")")"

# Transcript guard
t=$(transcript "$U" "$TOOL" "$RESULT" "$TEXT")
check "no earlier ask, flag false: carry on" block "$(run "$(project active)" "$(input false "$t")")"
check "no earlier ask, flag true: stop (fallback)" stop "$(run "$(project active)" "$(input true "$t")")"
for ask in "$ASK_USER" "$ASK_ATT" "$ASK_SYS"; do
  kind=$(printf '%s' "$ask" | jq -r '.type')
  t=$(transcript "$U" "$TOOL" "$RESULT" "$TEXT" "$ask" "$TEXT")
  check "ask as $kind, then no tool: stop (loop guard), flag true" stop "$(run "$(project active)" "$(input true "$t")")"
  check "ask as $kind, then no tool: stop (loop guard), flag false" stop "$(run "$(project active)" "$(input false "$t")")"
  t=$(transcript "$U" "$ask" "$TOOL" "$RESULT" "$TEXT")
  check "ask as $kind, then work: carry on, flag true (flag stays true)" block "$(run "$(project active)" "$(input true "$t")")"
done
# The shape Claude Code 2.1 writes for one ask (seen live on 2026-10-13): three entries in a row.
R1="{\"type\":\"user\",\"isMeta\":true,\"message\":{\"role\":\"user\",\"content\":\"Stop hook feedback:\\n$M Labs autonomy is active\"}}"
R2="{\"type\":\"attachment\",\"attachment\":{\"type\":\"hook_blocking_error\",\"hookName\":\"Stop\",\"hookEvent\":\"Stop\",\"blockingError\":{\"blockingError\":\"$M Labs autonomy is active\",\"command\":\"sh stop-continue.sh\"}}}"
R3="{\"type\":\"system\",\"subtype\":\"stop_hook_summary\",\"hookCount\":3,\"hookInfos\":[{\"command\":\"sh stop-continue.sh\"}],\"hookErrors\":[\"$M Labs autonomy is active\"],\"preventedContinuation\":false}"
t=$(transcript "$U" "$TOOL" "$RESULT" "$TEXT" "$R1" "$R2" "$R3" "$TEXT")
check "Claude Code's own three-entry ask, then no tool: stop, flag false" stop "$(run "$(project active)" "$(input false "$t")")"
t=$(transcript "$U" "$TOOL" "$RESULT" "$TEXT" "$R1" "$R2" "$R3" "$TOOL" "$RESULT" "$TEXT")
check "Claude Code's own three-entry ask, then work: carry on, flag true" block "$(run "$(project active)" "$(input true "$t")")"
t=$(transcript "$U" "$ASK_USER" "$TOOL" "$RESULT" "$MINE" "$CAT_RESULT" "$TEXT")
check "marker in Claude's own edit and in a tool result isn't an ask: carry on" block "$(run "$(project active)" "$(input true "$t")")"
t=$(transcript "$U" "$TOOL" "$RESULT" "$ASK_USER" "$TEXT")
printf '{"type":"assistant","message":{"content":[{"type":"tool_u' >> "$t"
check "a half-written last line is ignored: stop (no tool since the ask)" stop "$(run "$(project active)" "$(input false "$t")")"

# Rate limit
d=$(project active); now=$(date +%s)
for i in 1 2 3; do echo "$((now - 60 * i)) x autonomy=active flag=false transcript=none: continue" >> "$d/.claude/hooks/stop-hook.log"; done
check "3 asks in 10 minutes: stop" stop "$(run "$d" "$(input false '')")"
d=$(project active)
for i in 1 2 3; do echo "$((now - 700 - 60 * i)) x autonomy=active flag=false transcript=none: continue" >> "$d/.claude/hooks/stop-hook.log"; done
check "3 asks over 10 minutes ago: carry on" block "$(run "$d" "$(input false '')")"
d=$(project active)
r1=$(run "$d" "$(input false '')"); r2=$(run "$d" "$(input false '')"); r3=$(run "$d" "$(input false '')"); r4=$(run "$d" "$(input false '')")
check "a tight loop with no transcript stops on the 4th try" "block block block stop" "$r1 $r2 $r3 $r4"
lines=$(wc -l < "$d/.claude/hooks/stop-hook.log" | tr -d ' ')
check "each run logs one line" 4 "$lines"

# Odd input and odd state
check "input that isn't JSON, autonomy active: carry on (rate limit still applies)" block "$(run "$(project active)" "not json")"
d=$(project active)
sed 's/^- \*\*Next action:\*\* .*/- **Next action:** say "hi" \\ then a back\\slash and a	tab./' "$d/.claude/FACTORY_STATE.md" > "$d/s" && mv "$d/s" "$d/.claude/FACTORY_STATE.md"
out=$(printf '%s' "$(input false '')" | CLAUDE_PROJECT_DIR="$d" sh "$hook")
reason=$(printf '%s' "$out" | jq -r '.reason' 2>/dev/null)
case "$reason" in *'say "hi" \ then a back\slash and a'*) r=ok ;; *) r="bad:$out" ;; esac
check "quotes, backslashes, and tabs in the next action stay valid JSON" ok "$r"
d=$(project active); yes "$(printf '%s' "$TOOL")" | head -n 300 > "$d/l"; i=0
while [ $i -lt 1200 ]; do printf '%s\n' "$RESULT"; i=$((i + 1)); done >> "$d/l"
printf '%s\n' "$ASK_USER" "$TEXT" >> "$d/l"
start=$(date +%s); r=$(run "$d" "$(input false "$d/l")"); took=$(( $(date +%s) - start ))
check "1,500-entry transcript, ask then no tool: stop" stop "$r"
check "and it takes under 5 seconds" yes "$([ $took -lt 5 ] && echo yes || echo "no ($took s)")"

# The hook itself
check "the hook has no syntax errors" ok "$(sh -n "$hook" && echo ok)"
rm -rf "$work"
echo "$pass passed, $fail failed"
[ $fail -eq 0 ]

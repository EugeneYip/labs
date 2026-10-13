#!/bin/sh
# SessionStart hook (startup, resume, clear, compact): prints the factory's state from the repository, so a new
# session, or one whose context was just compacted, can continue without the earlier chat. It only reads files and
# git; it changes nothing. Claude Code adds what it prints to the session's context (up to 10,000 characters).

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
state=.claude/FACTORY_STATE.md
[ -f "$state" ] || exit 0

source=$(cat | sed -n 's/.*"source"[[:space:]]*:[[:space:]]*"\([a-z]*\)".*/\1/p' | head -n 1)

# A level-2 section of a Markdown file, from its heading to the next one, at most $3 bytes.
section() {
  awk -v h="## $2" 'index($0, h) == 1 { on = 1; next } on && /^## / { exit } on' "$1" | head -c "$3"
}

if [ "$source" = compact ]; then
  echo "Labs factory: the context was just compacted. The state below is from the repository; trust it over the summary."
else
  echo "Labs factory: the state below is from the repository (printed by .claude/hooks/session-context.sh)."
fi
echo
echo "From $state, \"Now\":"
section "$state" Now 4500

batch=$(sed -n 's/^- \*\*Batch file:\*\* `\([^`]*\)`.*/\1/p' "$state" | head -n 1)
if [ -n "$batch" ] && [ -f "$batch" ]; then
  echo
  echo "From $batch, \"Now\":"
  section "$batch" Now 3000
fi

echo
echo "Git:"
branch=$(git branch --show-current 2>/dev/null)
echo "- On ${branch:-a detached HEAD}, at $(git log -1 --format='%h %s' 2>/dev/null | cut -c 1-120)."
counts=$(git rev-list --left-right --count main...origin/main 2>/dev/null)
[ -n "$counts" ] && echo "- main vs origin/main (as last fetched): $(echo "$counts" | awk '{print $1 " ahead, " $2 " behind"}')."
git for-each-ref --format='%(refname:short) %(objectname:short) %(subject)' refs/heads/wip/ 2>/dev/null | cut -c 1-140 | sed 's/^/- Work-in-progress branch: /'
changes=$(git status --short 2>/dev/null)
if [ -n "$changes" ]; then
  echo "- Uncommitted changes (someone's unfinished work: keep them):"
  echo "$changes" | head -n 20 | sed 's/^/    /'
else
  echo "- Working tree clean."
fi

echo
echo "Continue from the next action above unless the owner's request in this session says otherwise; the rules are in CLAUDE.md (Autonomous operation)."
exit 0

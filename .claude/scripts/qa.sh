#!/bin/sh
# Runs one QA script from .claude/qa/ with a time limit, so a stalled browser run or test can't hold up the factory.
# On timeout the script's whole process group gets TERM, then KILL 3 seconds later, and this exits 124.
#
#   sh .claude/scripts/qa.sh <seconds> <script> [args...]
#   sh .claude/scripts/qa.sh <seconds> --route <built folder> <script> [args...]
#
# <script> is a path inside .claude/qa/ (.cjs, .mjs, or .js run with node; .ts with node's type stripping; .sh with
# sh; .py with python3 -I), and it runs with .claude/qa/ as the working folder. --route serves a built folder at
# https://labs.local through route-preload.cjs. The permission rule for this file is the only one that runs QA
# scripts with a time limit, so it refuses anything outside .claude/qa/.

die() { echo "qa.sh: $*" >&2; exit 2; }
root=$(cd "$(dirname "$0")/../.." 2>/dev/null && pwd) || die "can't find the repository"
qa="$root/.claude/qa"

secs=$1
case "$secs" in '' | *[!0-9]*) die "the first argument is a number of seconds" ;; esac
[ "$secs" -ge 1 ] && [ "$secs" -le 7200 ] || die "the time limit is 1 to 7200 seconds"
shift

route=""
if [ "$1" = --route ]; then
  [ -n "$2" ] || die "--route needs a folder"
  case "$2" in /*) route=$2 ;; *) route="$root/$2" ;; esac
  [ -d "$route" ] || die "no such folder: $2"
  shift 2
fi

script=$1
[ -n "$script" ] || die "name a script in .claude/qa/"
shift
case "$script" in /* | *..*) die "give a path inside .claude/qa/, without .." ;; esac
[ -f "$qa/$script" ] || die "no such script: .claude/qa/$script"

case "$script" in
  *.cjs | *.mjs | *.js) set -- node "$script" "$@" ;;
  *.ts) set -- node --experimental-strip-types --disable-warning=ExperimentalWarning "$script" "$@" ;;
  *.sh) set -- sh "$script" "$@" ;;
  *.py) set -- python3 -I "$script" "$@" ;;
  *) die "unknown kind of script: $script" ;;
esac
if [ -n "$route" ]; then
  [ "$1" = node ] || die "--route works with node scripts"
  shift
  set -- node -r ./route-preload.cjs "$@"
  export ROUTE_DIR="$route"
fi

cd "$qa" || die "can't open .claude/qa/"
exec perl -e '
  my $secs = shift;
  my $pid = fork;
  die "qa.sh: fork failed\n" unless defined $pid;
  if (!$pid) { setpgrp(0, 0); exec @ARGV or exit 127; }
  local $SIG{ALRM} = sub {
    print STDERR "qa.sh: stopped after $secs s\n";
    kill "TERM", -$pid; sleep 3; kill "KILL", -$pid;
    exit 124;
  };
  alarm $secs;
  waitpid($pid, 0);
  exit($? & 127 ? 128 + ($? & 127) : $? >> 8);
' "$secs" "$@"

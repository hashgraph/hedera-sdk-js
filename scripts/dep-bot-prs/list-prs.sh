#!/usr/bin/env bash
# usage: list-prs.sh
# Lists the open bot PRs of $R in two groups, tab-separated:
#   IN SCOPE      #N  mergeable  branch  title  [note]   Dependabot PRs the sweep may approve and merge
#   OUT OF SCOPE  #N  author  reasons  title              other bot PRs: report them, never approve/merge/re-run/comment
# A PR is in scope when its author is app/dependabot, no changed file is under .github/ (workflow bumps belong to
# the github-maintainers) and every commit is authored by dependabot[bot]. Human PRs are not listed.
# note NO-LOCKFILE: the PR changes a package.json but no lockfile, so every install in CI dies with
# ERR_PNPM_OUTDATED_LOCKFILE. Dependabot opens one for a workspace package with a security alert of its own (#4473,
# #4568, #4576); the note names the open PR with the same bump and the lockfile, which supersedes it. Once that one
# is merged, `@dependabot rebase` makes Dependabot close this one.
# The commit list is fetched per Dependabot PR: asking gh pr list for the commits of 100 PRs exceeds GitHub's
# GraphQL node limit.
set -uo pipefail
# shellcheck source=scripts/dep-bot-prs/common.sh
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

# shellcheck disable=SC2016 # single quotes on purpose, this is a jq program
LOCK_JQ_DEF='def bump: try (.title | capture("bump (?<dep>\\S+) from \\S+ to (?<to>\\S+)")) catch null;
def has_lock: [.files[].path] | any(test("(^|/)(pnpm-lock\\.yaml|package-lock\\.json)$"));
def lock_note($all):
  if ([.files[].path] | any(test("(^|/)package\\.json$"))) and (has_lock | not) then
    bump as $b | .number as $n
    | [$all[] | select(.number != $n and has_lock and $b != null and bump != null
        and (bump | .dep) == $b.dep and (bump | .to) == $b.to) | "#\(.number)"]
    | if length > 0 then "\tNO-LOCKFILE: superseded by \(join(" "))"
      else "\tNO-LOCKFILE: no open PR with the same bump and the lockfile" end
  else "" end;'

list=$(T 180 gh pr list --repo "$R" --state open --limit 100 --json number,title,author,mergeable,headRefName,files) || { echo "gh pr list failed" >&2; exit 1; }
# keep bot PRs only, then add the commits of every Dependabot PR
json=$(jq -c '[.[] | select(.author.is_bot or (.author.login | test("dependabot|lfdt-bot|snyk|renovate"))) | .commits = []]' <<<"$list")
for n in $(jq -r '.[] | select(.author.login == "app/dependabot") | .number' <<<"$json"); do
    commits=$(T 60 gh pr view "$n" --repo "$R" --json commits -q .commits) || commits='[]'
    json=$(jq -c --argjson n "$n" --argjson c "$commits" 'map(if .number == $n then .commits = $c else . end)' <<<"$json")
done
echo "IN SCOPE (Dependabot, nothing under .github/, all commits by dependabot[bot]):"
jq -r "$SCOPE_JQ_DEF $LOCK_JQ_DEF"' . as $all | .[] | select(scope == "ok") | "#\(.number)\t\(.mergeable)\t\(.headRefName)\t\(.title)\(lock_note($all))"' <<<"$json"
echo
echo "OUT OF SCOPE (report only):"
jq -r "$SCOPE_JQ_DEF"' .[] | select(scope != "ok") | "#\(.number)\t\(.author.login)\t\(scope)\t\(.title)"' <<<"$json"

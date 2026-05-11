#!/usr/bin/env bash
# submit_all.sh — Fork claude-builders-bounty, push each solution as a branch,
# and print the exact PR + /opire try commands to run.
#
# Prerequisites:
#   1. gh CLI installed and authenticated (gh auth login)
#   2. Run from the root of your ryan-dirajlal.github.io clone
#
# Usage:
#   bash bounties/submit_all.sh

set -euo pipefail

BOUNTY_ORG="claude-builders-bounty"
BOUNTY_REPO="claude-builders-bounty"
BOUNTY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Forking ${BOUNTY_ORG}/${BOUNTY_REPO} to your account..."
gh repo fork "${BOUNTY_ORG}/${BOUNTY_REPO}" --clone=false --default-branch-only

FORK_OWNER=$(gh api user --jq '.login')
FORK_URL="https://github.com/${FORK_OWNER}/${BOUNTY_REPO}"
echo "    Fork ready: ${FORK_URL}"

WORK_DIR=$(mktemp -d)
echo "==> Cloning fork into ${WORK_DIR}..."
gh repo clone "${FORK_OWNER}/${BOUNTY_REPO}" "${WORK_DIR}"
cd "${WORK_DIR}"

# ---------- helper ----------------------------------------------------------
push_bounty() {
  local issue_num="$1"
  local branch_name="$2"
  local src_dir="${BOUNTY_DIR}/issue-${issue_num}-${3}"

  echo ""
  echo "==> Issue #${issue_num} — branch: ${branch_name}"
  git checkout -b "${branch_name}" main
  cp -r "${src_dir}/." .
  git add -A
  git commit -m "Add solution for issue #${issue_num}: ${branch_name}"
  git push origin "${branch_name}"
  echo "    Pushed. Open PR at: ${FORK_URL}/compare/main...${branch_name}"
}
# ---------------------------------------------------------------------------

push_bounty "3" "fix/destructive-bash-hook"    "destructive-hook"
push_bounty "1" "feat/changelog-generator"      "changelog"
push_bounty "2" "feat/claudemd-nextjs-sqlite"   "claudemd-nextjs-sqlite"
push_bounty "4" "feat/pr-reviewer-cli"          "pr-reviewer"
push_bounty "5" "feat/n8n-weekly-summary"       "n8n-weekly-summary"

cd - > /dev/null
rm -rf "${WORK_DIR}"

echo ""
echo "======================================================"
echo " All branches pushed. Next steps for each bounty:"
echo "======================================================"
echo ""
echo "For each issue, do TWO things:"
echo "  1. Open the PR link printed above and click 'Create pull request'"
echo "  2. On the ORIGINAL issue (not your PR), comment:  /opire try"
echo ""
echo "Original issue URLs:"
echo "  #1 (CHANGELOG \$50):     https://github.com/${BOUNTY_ORG}/${BOUNTY_REPO}/issues/1"
echo "  #2 (CLAUDE.md \$75):     https://github.com/${BOUNTY_ORG}/${BOUNTY_REPO}/issues/2"
echo "  #3 (Hook \$100):         https://github.com/${BOUNTY_ORG}/${BOUNTY_REPO}/issues/3"
echo "  #4 (PR Reviewer \$150):  https://github.com/${BOUNTY_ORG}/${BOUNTY_REPO}/issues/4"
echo "  #5 (n8n Summary \$200):  https://github.com/${BOUNTY_ORG}/${BOUNTY_REPO}/issues/5"
echo ""
echo "Done. Good luck — \$575 on the table!"

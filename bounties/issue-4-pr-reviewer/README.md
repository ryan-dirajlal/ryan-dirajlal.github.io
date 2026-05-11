# claude-review

A CLI tool and GitHub Action that reviews pull request diffs using Claude and produces structured Markdown output.

## Output format

Every review contains four sections:

- **Summary of changes** — 2–3 sentence description
- **Risks** — potential problems, edge cases, security concerns
- **Improvement suggestions** — concrete, actionable recommendations
- **Confidence rating** — Low / Medium / High with justification

See [`sample-outputs/`](sample-outputs/) for real examples.

## Setup

**1. Install dependencies** (stdlib only — no pip required)

```bash
# Python 3.9+ required, no external packages needed
python claude_review.py --help
```

**2. Set environment variables**

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export GITHUB_TOKEN=ghp_...     # optional, needed for private repos
```

**3. Run a review**

```bash
python claude_review.py --pr https://github.com/owner/repo/pull/123
```

Write to a file:
```bash
python claude_review.py --pr https://github.com/owner/repo/pull/123 --output review.md
```

## GitHub Action

Add `ANTHROPIC_API_KEY` to your repository secrets, then copy `.github/workflows/pr-review.yml` to your project. Claude will automatically post a review comment on every new PR.

## How it works

1. Fetches the PR diff and metadata from the GitHub API
2. Sends the diff (up to 8000 chars) plus PR title/repo to Claude Sonnet
3. Claude returns structured Markdown following the required output format
4. Output is printed to stdout or written to file (or posted as a comment via the Action)

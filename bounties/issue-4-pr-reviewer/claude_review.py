#!/usr/bin/env python3
"""
claude-review: Review a GitHub PR diff using the Claude API.

Usage:
  python claude_review.py --pr https://github.com/owner/repo/pull/123

Requires:
  ANTHROPIC_API_KEY  — Claude API key
  GITHUB_TOKEN       — GitHub token for fetching PR diffs (optional but recommended)
"""

import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error


# ---------------------------------------------------------------------------
# GitHub helpers
# ---------------------------------------------------------------------------

def _github_headers() -> dict:
    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "claude-review/1.0"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def fetch_pr_diff(owner: str, repo: str, pr_number: int) -> str:
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
    req = urllib.request.Request(url, headers={**_github_headers(), "Accept": "application/vnd.github.v3.diff"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        sys.exit(f"GitHub API error {e.code}: {e.reason}. Set GITHUB_TOKEN for private repos.")


def fetch_pr_meta(owner: str, repo: str, pr_number: int) -> dict:
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
    req = urllib.request.Request(url, headers=_github_headers())
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


# ---------------------------------------------------------------------------
# Claude API helper
# ---------------------------------------------------------------------------

def call_claude(prompt: str) -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("Set ANTHROPIC_API_KEY environment variable.")

    payload = json.dumps({
        "model": "claude-sonnet-4-6",
        "max_tokens": 2048,
        "messages": [{"role": "user", "content": prompt}],
    }).encode()

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = json.loads(resp.read())
            return body["content"][0]["text"]
    except urllib.error.HTTPError as e:
        sys.exit(f"Claude API error {e.code}: {e.read().decode()}")


# ---------------------------------------------------------------------------
# Review logic
# ---------------------------------------------------------------------------

REVIEW_PROMPT = """\
You are a senior software engineer conducting a pull request review. Analyze the following PR diff and produce a structured Markdown review.

PR title: {title}
Repository: {repo}
Files changed: {files_changed}

Diff (truncated to 8000 chars if large):
```diff
{diff}
```

Respond in exactly this Markdown structure — do not deviate:

## Summary of changes
(2–3 sentences describing what this PR does)

## Risks
(bullet list of potential problems, edge cases, or security concerns; "None identified" if clean)

## Improvement suggestions
(bullet list of concrete, actionable suggestions; "None" if nothing to improve)

## Confidence rating
**Low / Medium / High** — (one sentence justifying the rating based on diff size and clarity)
"""


def parse_pr_url(url: str) -> tuple[str, str, int]:
    m = re.match(r"https?://github\.com/([^/]+)/([^/]+)/pull/(\d+)", url.rstrip("/"))
    if not m:
        sys.exit(f"Invalid PR URL: {url}\nExpected: https://github.com/owner/repo/pull/NUMBER")
    return m.group(1), m.group(2), int(m.group(3))


def review_pr(pr_url: str) -> str:
    owner, repo, pr_number = parse_pr_url(pr_url)
    print(f"Fetching {owner}/{repo}#{pr_number}…", file=sys.stderr)

    meta = fetch_pr_meta(owner, repo, pr_number)
    diff = fetch_pr_diff(owner, repo, pr_number)

    title = meta.get("title", "Unknown")
    files_changed = meta.get("changed_files", "?")

    prompt = REVIEW_PROMPT.format(
        title=title,
        repo=f"{owner}/{repo}",
        files_changed=files_changed,
        diff=diff[:8000],
    )

    print("Calling Claude…", file=sys.stderr)
    review = call_claude(prompt)

    header = f"# PR Review: {owner}/{repo}#{pr_number}\n\n> **{title}**\n\n"
    return header + review


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Review a GitHub PR with Claude.")
    parser.add_argument("--pr", required=True, metavar="URL",
                        help="GitHub PR URL, e.g. https://github.com/owner/repo/pull/123")
    parser.add_argument("--output", "-o", metavar="FILE",
                        help="Write review to file instead of stdout")
    args = parser.parse_args()

    review = review_pr(args.pr)

    if args.output:
        with open(args.output, "w") as f:
            f.write(review)
        print(f"Review written to {args.output}", file=sys.stderr)
    else:
        print(review)


if __name__ == "__main__":
    main()

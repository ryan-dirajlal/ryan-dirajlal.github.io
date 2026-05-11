# Weekly GitHub Dev Summary — n8n + Claude API

An n8n workflow that runs every Friday at 5pm, fetches the past 7 days of GitHub activity (commits, closed issues, merged PRs), sends them to Claude Sonnet, and delivers a human-readable narrative summary to Slack and/or email.

## What it does

1. **Triggers** every Friday at 17:00 (cron: `0 17 * * 5`)
2. **Fetches in parallel** from the GitHub API:
   - Commits from the last 7 days
   - Issues closed in the last 7 days
   - Pull requests merged in the last 7 days
3. **Builds a prompt** from the collected data
4. **Calls Claude Sonnet** (`claude-sonnet-4-6`) to generate a 200–350 word narrative summary
5. **Delivers** the summary to Slack channel and/or email

## Setup (5 steps)

**1. Import the workflow**

In your n8n instance: *Workflows → Import from file* → select `weekly_dev_summary.json`.

**2. Set workflow variables**

Go to *Settings → Variables* in your n8n instance and create:

| Variable | Example | Required |
|---|---|---|
| `GITHUB_REPO` | `owner/repo` | Yes |
| `GITHUB_TOKEN` | `ghp_...` | Yes |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Yes |
| `SLACK_CHANNEL_ID` | `C0123ABC456` | If using Slack |
| `EMAIL_FROM` | `bot@example.com` | If using email |
| `EMAIL_TO` | `team@example.com` | If using email |
| `SUMMARY_LANGUAGE` | `EN` or `FR` | No (default: EN) |

**3. Add credentials**

- **Slack**: Create a Slack API credential in n8n with a bot token that has `chat:write` scope.
- **Email**: Create an SMTP credential, or disable the email node if using Slack only.

**4. Test the workflow**

Click *Execute Workflow* manually to verify GitHub data is fetched and Claude returns a summary.

**5. Activate**

Toggle the workflow to *Active* — it will fire automatically every Friday at 5pm.

## Delivery options

You can use Slack, email, or both. Disable the node(s) you don't need by right-clicking → *Disable*.

## Sample output

```
🗞️ Weekly Dev Summary — 2026-05-09

A productive week for owner/repo, with 23 commits merged, 8 issues closed, and 5 pull requests shipped.

**Highlights**
- Launched the new authentication flow (PR #412), reducing login time by 40%
- Closed 3 long-standing performance issues in the dashboard (#398, #401, #405)
- Migrated CI pipeline to GitHub Actions, cutting build times from 12 to 4 minutes
- Added French localisation strings across 14 components
- Bumped Node.js to v22 LTS across all services

**What's next:** Several open issues related to mobile responsiveness suggest the team is preparing for a mobile-focused sprint next week.
```

## Language support

Set `SUMMARY_LANGUAGE` to `FR` for French output. The workflow passes a language instruction to Claude before generating the summary.

# Destructive Bash Command Blocker — Claude Code Hook

A `pre-tool-use` hook that intercepts dangerous shell commands before Claude Code executes them, logs every blocked attempt, and explains why the command was stopped.

## Blocked patterns

| Pattern | Reason |
|---|---|
| `rm -rf` / `rm -fr` | Recursive force delete |
| `DROP TABLE` | Destructive SQL |
| `git push --force` / `-f` | Overwrites remote history |
| `TRUNCATE` | Destructive SQL |
| `DELETE FROM … ` without `WHERE` | Unscoped row deletion |

## Install (2 commands)

```bash
mkdir -p ~/.claude/hooks
cp block_dangerous_commands.py ~/.claude/hooks/block_dangerous_commands.py
```

Then add the hook to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.claude/hooks/block_dangerous_commands.py"
          }
        ]
      }
    ]
  }
}
```

## Logs

Every blocked attempt is written to `~/.claude/hooks/blocked.log`:

```
[2026-05-11T14:23:01Z] BLOCKED | reason='rm -rf (recursive force delete)' | project='/home/user/myapp' | cmd='rm -rf dist/'
```

## How it works

The hook reads the JSON event from stdin, checks `tool_input.command` against the blocked regex patterns, returns a `{"decision": "block", "reason": "…"}` response when matched, and exits cleanly (allowing the command) otherwise.

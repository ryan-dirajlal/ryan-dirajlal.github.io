#!/usr/bin/env python3
"""
Claude Code pre-tool-use hook: blocks dangerous bash commands before execution.
Install: copy to ~/.claude/hooks/block_dangerous_commands.py
"""

import json
import re
import sys
import os
from datetime import datetime

LOG_FILE = os.path.expanduser("~/.claude/hooks/blocked.log")

BLOCKED_PATTERNS = [
    (r"\brm\s+-[^\s]*r[^\s]*f\b|\brm\s+-[^\s]*f[^\s]*r\b|\brm\s+--no-preserve-root\b",
     "rm -rf (recursive force delete)"),
    (r"\bDROP\s+TABLE\b",
     "DROP TABLE (destructive SQL)"),
    (r"\bgit\s+push\s+(?:--force|-f)\b",
     "git push --force (destructive push)"),
    (r"\bTRUNCATE\b",
     "TRUNCATE (destructive SQL)"),
    (r"\bDELETE\s+FROM\s+\w+\s*(?:;|$)(?!\s*WHERE)",
     "DELETE FROM without WHERE clause"),
]


def log_blocked(command: str, reason: str, project_path: str) -> None:
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    timestamp = datetime.utcnow().isoformat() + "Z"
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] BLOCKED | reason={reason!r} | project={project_path!r} | cmd={command!r}\n")


def check_command(command: str) -> tuple[bool, str]:
    for pattern, label in BLOCKED_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE | re.DOTALL):
            return True, label
    return False, ""


def main() -> None:
    raw = sys.stdin.read()
    try:
        event = json.loads(raw)
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = event.get("tool_name", "")
    tool_input = event.get("tool_input", {})

    if tool_name not in ("Bash", "bash"):
        sys.exit(0)

    command = tool_input.get("command", "")
    project_path = event.get("cwd", os.getcwd())

    is_blocked, reason = check_command(command)
    if not is_blocked:
        sys.exit(0)

    log_blocked(command, reason, project_path)

    response = {
        "decision": "block",
        "reason": (
            f"Blocked: {reason}.\n"
            f"This command pattern is flagged as potentially destructive. "
            f"If you truly need to run this, execute it manually in your terminal. "
            f"Attempt logged to {LOG_FILE}."
        ),
    }
    print(json.dumps(response))
    sys.exit(0)


if __name__ == "__main__":
    main()

# generate-changelog

Generates a structured `CHANGELOG.md` from git history since the last tag, sorted into Added / Fixed / Changed / Removed sections.

## Setup (3 steps)

**1. Make the script executable**
```bash
chmod +x changelog.sh
```

**2. Run it**
```bash
bash changelog.sh
```

**3. (Optional) Install as Claude Code skill**

Copy `SKILL.md` to `.claude/skills/generate-changelog.md` in your project, then use `/generate-changelog` inside Claude Code.

## Sample output

Running against this repository (no tags → full history):

```
$ bash changelog.sh
Written 5 commits to CHANGELOG.md (all commits)
```

Generated `CHANGELOG.md`:

```markdown
# Changelog

## [Unreleased] — 2026-05-11 (all commits)

### Added
- feat: add user authentication (3a1b2c4)
- feat: implement dark mode (9f8e7d6)

### Fixed
- fix: resolve null pointer in session handler (1c2d3e4)

### Changed
- chore: bump lodash to 4.17.21 (5a6b7c8)
- docs: update README (2d3e4f5)
```

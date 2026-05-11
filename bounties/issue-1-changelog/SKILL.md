# generate-changelog

Generates a structured `CHANGELOG.md` from git history since the last tag.
Entries are automatically sorted into Added / Fixed / Changed / Removed sections.

## Trigger

Use `/generate-changelog` in any git repository.

## What it does

1. Finds the last git tag (falls back to all commits if none exist)
2. Reads every commit subject in the range
3. Categorises each commit by its conventional-commit prefix
4. Writes a formatted `CHANGELOG.md` to the repository root

## Categorisation rules

| Section | Commit prefixes |
|---|---|
| Added | `feat`, `add`, `new`, `introduce`, `implement` |
| Fixed | `fix`, `bug`, `patch`, `resolve`, `correct`, `hotfix` |
| Removed | `remove`, `delete`, `drop`, `deprecate`, `clean` |
| Changed | `refactor`, `update`, `change`, `improve`, `bump`, `upgrade`, `rename`, `move`, `migrate`, `style`, `chore`, `docs`, `test`, `ci`, `perf` |
| Other | everything else |

## Usage

```
/generate-changelog
```

Or directly:

```bash
bash changelog.sh [output_file]
```

## Example output

```markdown
# Changelog

## [Unreleased] — 2026-05-11 (since v1.2.0)

### Added
- feat: add dark mode toggle (a1b2c3d)

### Fixed
- fix: correct null pointer in auth handler (e4f5g6h)

### Changed
- chore: bump dependencies (i7j8k9l)
```

#!/usr/bin/env bash
# Generate a structured CHANGELOG.md from git history since the last tag.
# Usage: bash changelog.sh [output_file]

set -euo pipefail

OUTPUT="${1:-CHANGELOG.md}"
TODAY=$(date +%Y-%m-%d)

# Determine the range: last tag to HEAD, or all commits if no tags exist
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || true)
if [[ -n "$LAST_TAG" ]]; then
  RANGE="${LAST_TAG}..HEAD"
  VERSION_HINT="(since ${LAST_TAG})"
else
  RANGE="HEAD"
  VERSION_HINT="(all commits)"
fi

# Collect commits: hash | subject
mapfile -t COMMITS < <(git log "$RANGE" --pretty=format:"%h|%s" 2>/dev/null || true)

if [[ ${#COMMITS[@]} -eq 0 ]]; then
  echo "No new commits found ${VERSION_HINT}. Nothing to write." >&2
  exit 0
fi

ADDED=(); FIXED=(); CHANGED=(); REMOVED=(); UNCATEGORIZED=()

for entry in "${COMMITS[@]}"; do
  hash="${entry%%|*}"
  subject="${entry#*|}"
  lower="${subject,,}"

  if [[ "$lower" =~ ^(feat|add|new|introduce|implement) ]]; then
    ADDED+=("- ${subject} (${hash})")
  elif [[ "$lower" =~ ^(fix|bug|patch|resolve|correct|hotfix) ]]; then
    FIXED+=("- ${subject} (${hash})")
  elif [[ "$lower" =~ ^(remove|delete|drop|deprecate|clean) ]]; then
    REMOVED+=("- ${subject} (${hash})")
  elif [[ "$lower" =~ ^(refactor|update|change|improve|bump|upgrade|rename|move|migrate|style|chore|docs|test|ci|perf) ]]; then
    CHANGED+=("- ${subject} (${hash})")
  else
    UNCATEGORIZED+=("- ${subject} (${hash})")
  fi
done

# Build the CHANGELOG content
{
  echo "# Changelog"
  echo ""
  echo "## [Unreleased] — ${TODAY} ${VERSION_HINT}"
  echo ""

  if [[ ${#ADDED[@]} -gt 0 ]]; then
    echo "### Added"
    printf '%s\n' "${ADDED[@]}"
    echo ""
  fi

  if [[ ${#FIXED[@]} -gt 0 ]]; then
    echo "### Fixed"
    printf '%s\n' "${FIXED[@]}"
    echo ""
  fi

  if [[ ${#CHANGED[@]} -gt 0 ]]; then
    echo "### Changed"
    printf '%s\n' "${CHANGED[@]}"
    echo ""
  fi

  if [[ ${#REMOVED[@]} -gt 0 ]]; then
    echo "### Removed"
    printf '%s\n' "${REMOVED[@]}"
    echo ""
  fi

  if [[ ${#UNCATEGORIZED[@]} -gt 0 ]]; then
    echo "### Other"
    printf '%s\n' "${UNCATEGORIZED[@]}"
    echo ""
  fi
} > "$OUTPUT"

echo "Written ${#COMMITS[@]} commits to ${OUTPUT} ${VERSION_HINT}"

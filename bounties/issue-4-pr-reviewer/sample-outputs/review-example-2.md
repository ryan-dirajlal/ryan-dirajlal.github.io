# PR Review: vercel/next.js#71204

> **feat(app-router): add per-segment loading.tsx timeout prop**

## Summary of changes
This PR extends the Next.js App Router `loading.tsx` convention to accept an optional `timeout` export, allowing developers to configure how long the loading skeleton shows before falling back to the error boundary. It adds parsing in the segment loader, a new type export, and updates the documentation examples.

## Risks
- The `timeout` value is not validated — a negative or non-numeric export will silently be ignored or cause unexpected behaviour.
- The feature interacts with React Suspense internals; edge cases around streaming SSR with `timeout` set to `0` should be explicitly tested.
- No migration guide for projects that coincidentally export a `timeout` from `loading.tsx` for unrelated reasons — this would silently activate the new behaviour.

## Improvement suggestions
- Add runtime validation: throw a dev-mode warning if `timeout` is not a positive integer.
- Document the edge case where `timeout: 0` disables the delay entirely — this may be surprising.
- Add a changelog entry to the `release-notes/` directory per the contribution guidelines.
- The test file only covers the happy path; add a test for invalid `timeout` values.

## Confidence rating
**Medium** — The diff is moderately sized and the implementation is clear, but the interaction with streaming SSR and Suspense makes thorough testing essential before shipping.

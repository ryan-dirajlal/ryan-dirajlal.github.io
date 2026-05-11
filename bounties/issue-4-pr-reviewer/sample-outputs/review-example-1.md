# PR Review: curl/curl#15023

> **Fix memory leak in HTTP/2 push promise handling**

## Summary of changes
This PR fixes a memory leak in the HTTP/2 push promise handling path where `data->push_headers` was allocated but never freed on early-exit error paths. The fix adds cleanup calls in two error branches inside `push_promise()`, ensuring the buffer is released before returning.

## Risks
- The fix is minimal and surgical — low risk of regression.
- Existing tests cover the happy path; a test for the error path would strengthen confidence.
- No thread-safety concerns since `data` is per-session.

## Improvement suggestions
- Add a unit test that exercises the early-exit path to prevent regression.
- Consider extracting the cleanup into a helper to avoid future duplication if more error paths are added.

## Confidence rating
**High** — The diff is small (12 lines), the logic is clear, and the fix is a straightforward resource cleanup on error paths.

# Repository Review Kit

A local tool for reviewing Git inventory, milestone boundaries and possible sensitive information in reachable history. It produces a JSON report without copying matched credentials or personal data. Node.js 20+ and Git are the only runtime requirements; no packages or cloud services are required.

## Run

```sh
npm test
node src/cli.mjs audit /path/to/local/repository
node src/cli.mjs audit /path/to/local/repository --range FIRST_SHA..SECOND_SHA --range SECOND_SHA..THIRD_SHA --out report.json
```

`--revision` selects the inventory snapshot. Privacy review always covers every local Git ref, including other branches and tags. The tool does not fetch remote objects, read credentials, modify repository history or contact a service.

Exit status is `0` when the scan completes without pattern findings, large-object skips, budget skips or disconnected milestone boundaries; `2` when those review items exist; and `1` when the operation fails. Existing output files are never overwritten. Binary objects are counted separately and still require manual inspection even when exit status is `0`.

## Report interpretation

- Inventory counts source extensions in the selected revision, excluding common generated and dependency directories. It reports stored committer dates; it cannot prove when development originally began.
- Milestone metrics compare endpoint trees, count supported code files and net additions/deletions, require ancestry and report contiguous boundaries. Net differences are not the sum of every intermediate change and do not establish milestone quality.
- Privacy findings contain rule names, line numbers, object IDs and a representative relative path. Matched text, Git remote URLs, repository author identities and local root paths are not included. Paths containing recognized personal data are replaced with a redacted marker.
- The scan uses a 2 MiB per-object limit and a 256 MiB content budget. Binary, invalid UTF-8 and skipped objects, working-tree changes, reflogs, unreachable objects and remote-only refs are outside content inspection. Regex-based scanning can produce both false positives and false negatives; reports require human review.
- No result verifies repository ownership, historic visibility, rights to deliver code, platform eligibility or security completeness.

## Development

The first implementation was created on 2026-10-08 as a new engineering portfolio project. Its current code and tests are a capability example; its age and commit count are the actual Git history. It is not represented as a long-maintained production repository.

Tests create isolated temporary repositories and verify deleted-secret detection, other-branch coverage, redacted findings, milestone continuity, revision argument validation, source metrics and binary limitations. Test inputs are constructed locally and use placeholder contact information.

See [DESIGN.md](DESIGN.md) for module boundaries and [ROADMAP.md](ROADMAP.md) for planned work.

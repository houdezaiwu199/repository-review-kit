# Validation

The 2026-10-08 local Windows run passed all 14 tests with Node.js 20.11.0 and Git 2.55.0. GitHub Actions has been configured for Windows and Linux with Node.js 20 and 22; those remote jobs have not run yet.

```sh
npm test
```

The tests verify deleted-token history, other-branch coverage, endpoint source metrics, milestone continuity, invalid revisions, binary handling, CLI errors and redacted findings. They also check that a real credential pattern is not suppressed merely because the surrounding line contains a placeholder comment or an example domain.

A self-scan of the initial commit reported one `assigned-secret` review finding in `test/privacy.test.mjs`. The line is an intentional dummy password string used to verify that false suppression does not occur. It is not a service credential. A reviewer should inspect this fixture and retain the regression test; a scanner finding is an item for review rather than evidence by itself of a real secret.

The initial self-scan inspected 14 text Git objects, with no binary, oversized or budget-skipped objects. This is evidence for the tool's defined scan scope, not a guarantee of complete security. No third-party repository, production dataset or live account credential is included in the project.

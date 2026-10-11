# Design

The CLI parses explicit arguments and delegates read-only review to `audit.mjs`. `git.mjs` invokes Git without a shell, resolves revisions into immutable commit IDs and reads objects in bounded batches. `privacy.mjs` classifies patterns while immediately discarding matched values.

Object sizes are checked before content is loaded. Only reachable objects under local refs enter privacy review; snapshot inventory follows the requested revision. This prevents a cleaned current snapshot from hiding a credential in another local branch, while avoiding a misleading claim to have scanned remote or unreachable data.

Milestones require ordered ancestor endpoints. Adjacent intervals are compared by full resolved SHA. Source additions and deletions are endpoint differences, which remain useful even when paths contain spaces or tabs; renames are treated as separate removal/addition paths.

The output deliberately does not include raw Git errors, author headers, commit messages, absolute root paths, remote URLs or matching content. Generic failure messages keep accidental disclosure out of console logs. Reports still contain repository structure and commit IDs and should be reviewed before sharing.

The implementation never interprets scan results as a declaration of authenticity or eligibility. Those judgments require development evidence, rights and the actual platform rules.

# Planned work

- Add explicit reviewed-finding suppression bound to rule, object ID and a justification. This is deferred until the identity and review schema is stable, to avoid hiding changed secrets through broad path exceptions.
- Extend support for worktrees, shallow clones and missing objects with clear coverage records. Current operation targets complete local repositories; partial-history support needs dedicated coverage tests.
- Add an optional manual path redaction map for client-specific names that pattern scanning cannot recognize. No generic regex can establish complete organization anonymization.
- Improve per-object streaming and aggregate limits before raising the current content budget. Large repository memory consumption must remain predictable in both Windows and Linux.
- Add milestone descriptions and tests linking observable behavior to each interval. Endpoint code counts currently show scale, while functional dependency and development intent need additional evidence.

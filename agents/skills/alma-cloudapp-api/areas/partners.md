# Resource-sharing partners API

Snapshot: 5 paths and 9 operations.

Coverage includes resource-sharing partners and lending requests.

## Cloud App cautions

- Partner configuration and request workflow actions have different
  authorization and consequence.
- Preserve partner code, institution context, workflow status, and request
  identity.
- Treat action-style `POST` operations as explicit commands.
- Do not infer that a successful submission means a resource-sharing workflow
  has completed.
- Report request transition failures and partial batch results accurately.
- Confirm deletion or status-changing actions when they are difficult to
  reverse.
- Establish resource-sharing roles with current documentation and live
  validation.

Use `../api-catalog.md` for the current source and checksum.

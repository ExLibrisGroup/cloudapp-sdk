# Configuration API

Snapshot: 45 paths and 71 operations.

Coverage includes organization units, jobs, sets, import and integration
profiles, normalization rules, letters, printers, license terms, reminders,
deposit profiles, utilities, and Library Open Workflows configuration.

## Cloud App cautions

- Configuration changes are typically administrator-facing and may affect the
  whole institution.
- Do not infer write authorization from visibility of the Cloud App
  configuration page.
- Jobs and process operations may be asynchronous; distinguish submission from
  completion and expose status accurately.
- Treat profile and rule updates as complete-resource replacements when the
  operation specifies `PUT`.
- Preserve codes, ownership, institution scope, and existing fields not changed
  by the user.
- Confirm broad-impact actions and document prerequisites.
- Avoid presenting internal configuration values or private endpoints in
  logs, alerts, or release artifacts.

## Library Open Workflows

`POST /conf/workflows/{workflow_id}` (Run Workflow) forwards its JSON body to
the workflow's Alma Trigger node. The workflow must be active and use "Execute
via REST API"; `test=true` runs a saved workflow whose trigger is listening.
No output is documented. Documented errors are `402119` and
`450001`-`450004`.

Use the `alma-cloudapp-open-workflows` skill for triggering workflows by API
or webhook.

Use `../api-catalog.md` for the current source and checksum.

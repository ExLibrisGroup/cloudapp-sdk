# Task lists API

Snapshot: 9 paths and 14 operations.

Coverage includes authority-control tasks, lending requests, requested
resources, printouts, and test operations.

## Cloud App cautions

- Task-list `POST` operations commonly perform workflow actions rather than
  create independent resources.
- Model allowed transitions and their consequences explicitly.
- Preserve task identity, current status, assignee, library, and institution
  context where applicable.
- Prevent duplicate actions while a transition is pending.
- Refresh the relevant list after confirmed completion without discarding
  inspectable failures.
- Keep list pagination and batch actions bounded.
- Establish the role required for each task family; do not assume one task-list
  role covers all operations.

Use `../api-catalog.md` for the current source and checksum.

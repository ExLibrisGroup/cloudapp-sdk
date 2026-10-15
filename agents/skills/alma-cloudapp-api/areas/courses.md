# Courses and reading lists API

Snapshot: 13 paths and 29 operations.

Coverage includes courses, reading lists, citations, owners, and tags.

## Cloud App cautions

- Preserve course, list, citation, and owner relationships during updates.
- Status and workflow operations may have effects beyond a field value.
- Respect academic date, institution, and list ownership context.
- Distinguish an empty reading list from inaccessible or invalid course data.
- Keep batch citation operations bounded and report partial results.
- Re-read complete resources before replacement updates.
- Establish Leganto and Alma role requirements for the actual operation and
  target environment.
- Treat citation deletion, list deletion, and ownership changes as
  consequential actions.

Use `../api-catalog.md` for the current source and checksum.

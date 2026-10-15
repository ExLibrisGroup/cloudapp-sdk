# Bibliographic records and inventory API

Snapshot: 41 paths and 77 operations.

Coverage includes catalog records, authorities, holdings and items, requests,
loans, collections, electronic collections, digital representations,
reminders, and request options.

## Cloud App cautions

- Many catalog create and update operations require XML and do not support
  JSON.
- Do not assume a bibliographic JSON response embeds a raw `record` object.
  JSON may expose summary fields while XML carries the MARC, Dublin Core, MODS,
  or BIBFRAME record. Select the required media type explicitly and validate
  its actual representation before writing extraction logic.
- Field names and repeated-value shapes can drift between OpenAPI, examples,
  and runtime responses. Use only established fields and keep a sanitized
  representation-specific fixture.
- Preserve MARC, Dublin Core, MODS, BIBFRAME, namespace, and encoding rules
  declared by the operation.
- Read before complete-replacement updates and handle stale record versions,
  validation results, warnings, and override options.
- Distinguish local MMS IDs from Network Zone and Community Zone identifiers.
- Do not apply IZ behavior assumptions to NZ or CZ records.
- Inventory forms a hierarchy; verify the owning bibliographic, holding,
  representation, collection, or electronic resource before mutation.
- Deletion and unlinking can have broader effects than the selected UI row
  suggests.
- Establish cataloging level and Alma role requirements separately from the
  endpoint schema.

Use `../api-catalog.md` for the current source and checksum.

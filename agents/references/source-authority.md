# Alma Cloud App source authority

## Decision order

1. Target project and SDK packages installed in that project.
2. Target package and lockfile versions plus matching versioned references in
   this repository.
3. Matching source from the exact public `ExLibrisGroup/cloudapp-sdk`
   repository.
4. Behavior observed in the user's target Alma environment.
5. Official public documentation.

## Filesystem and source boundary

- Search the target repository and its children.
- Do not scan parent, sibling, home, cache, global installation, or unrelated
  workspace directories for SDK packages, source, examples, configuration, or
  credentials.
- Another project's `node_modules` is not evidence for the target project.
- Use another local checkout only when the user supplied or explicitly
  approved its exact path.
- Use public source URLs supplied by the user or cited by maintained
  references. Do not guess legacy repositories, branches, or raw file paths.
- Report a failed source lookup and leave the behavior unverified. Do not
  suppress retrieval errors or continue as if a speculative source succeeded.

## Public-only boundary

The end-user agent must not require:

- Alma source code.
- Private Ex Libris repositories.
- Internal issue trackers or documentation.
- Internal databases.
- Internal deployment or application endpoints.

This does not prohibit the public Cloud App publication webhook documented by
Ex Libris. Use only its public contract; do not expose or require access to the
hosting infrastructure behind it.

If a behavior cannot be established from public SDK code:

- Validate it in Alma when authorized and practical.
- Otherwise mark it unverified.
- Do not invent an internal explanation.

## Version handling

Before using a bundled reference:

1. Read the local `package.json`.
2. Determine the installed Cloud App SDK version.
3. Prefer a matching public SDK tag.
4. Treat mismatched references as migration hints, not current API authority.

## Evidence language

- **Project-confirmed:** local source or configuration.
- **SDK-confirmed:** matching public SDK implementation.
- **Documentation-derived:** public documentation only.
- **Live-confirmed:** observed in Alma.
- **Unverified:** not confirmed with available evidence.

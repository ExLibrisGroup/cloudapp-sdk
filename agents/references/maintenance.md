# Reference maintenance

Use this workflow to refresh bundled SDK and Alma API guidance. Maintenance
tools are repository utilities, not distributable Cloud App skills.

## Safety and authority

- Use only public SDK source and public documentation for distributable
  behavior, except for the narrowly documented public-facing release behavior.
- Never copy credentials, customer data, private endpoints, internal logs, or
  unnecessary infrastructure detail into this repository.
- Refresh external sources, such as Alma OpenAPI files, in a temporary
  location.
- Do not edit generated counts or checksums without retrieving the source.
- Preserve earlier baselines through Git history once the repository is
  versioned.

## Refresh the Cloud App SDK baseline

1. Check out the intended public SDK tag or commit. The parent of this
   package is an SDK checkout, so from `agents/` you can use `..`.
2. Run:

   ```text
   tools/inspect-cloudapp-sdk.sh ..
   ```

3. Confirm that the reported commit is the intended public commit.

4. Compare package versions and key source checksums with the existing
   baseline.
5. Inspect changed source in these areas:
   - CLI commands and arguments.
   - Generated workspace synchronization.
   - Development proxy and `config.json`.
   - Public Angular services and interfaces.
   - Manifest schema and initialization data.
   - Components, alerts, dialogs, and menus.
   - Translation loader and extraction.
   - Styles and Material theming.
   - Testing configuration.
   - Build, update, and migration scripts.
6. Update `references/sdk-<version>.md`.
7. Update `references/documentation-drift.md`.
8. Update only the skills affected by verified behavior changes.
9. Keep the older reference when supported target projects still use it.

Do not treat package version changes alone as proof that runtime behavior
changed. Trace the implementation to its final consumer.

## Refresh the Alma OpenAPI catalog

Run:

```text
tools/refresh-alma-openapi.sh
```

The tool downloads the ten known public specifications into a temporary
directory, prints their byte sizes, path counts, operation counts, SHA-256
checksums, retrieval date, and totals, then removes the temporary files.

Compare the output with
`skills/alma-cloudapp-api/api-catalog.md`:

1. If a checksum changed, inspect the exact operation differences.
2. Update the retrieval date and catalog row.
3. Update an area guide only when the changed operation affects Cloud App
   implementation guidance.
4. Update testing guidance when schemas, media types, errors, limits, or
   pagination change.
5. Update release guidance when permissions, data impact, or review
   requirements change.
6. Do not claim an Alma user-role change from OpenAPI unless the specification
   explicitly provides that role.

If a new public API area appears, add it to the tool, catalog, and a compact
area guide. If an area disappears, verify whether it moved before deleting any
reference.

## Refresh official documentation

Review the current public pages for:

- Getting started and CLI.
- Manifest.
- SDK APIs and components.
- Style and UI guidance.
- Testing.
- Updating.
- Publishing.

Record conceptual guidance separately from code examples. When documentation
and matching public SDK source disagree, update the drift reference and follow
the SDK for client capabilities.

For hosted Alma behavior not decided by SDK code, validate in an authorized
environment or leave it explicitly unverified.

## Live validation

- Ask for the target environment, institution, and authentication method.
- Treat production as observation-only.
- Inspect source for automatic writes before opening the app.
- Obtain narrowly scoped approval before any possible persistent change.
- Do not use confidential Alma records in screenshots or reference artifacts.

## Distribution review

Before versioning an updated distribution:

1. Check YAML frontmatter in every agent and `SKILL.md`.
2. Check installation paths and skill names.
3. Check that distributable assets remain outside auto-discovery directories.
4. Check that each skill remains understandable when installed independently.
5. Check cross-skill references against `INSTALLATION.md`.
6. Check external links and documented source versions.
7. Check Markdown whitespace and accidental secrets.
8. Review the target `templates/AGENTS.md` for duplicated or contradictory
   rules.
9. Review always-loaded files for duplication and keep detailed domain
   guidance in owning skills or on-demand references.
10. Check that broad workflows load skills by phase rather than directing the
   model to read every skill up front.
11. Run the installer test suite and inspect `npm pack --dry-run` output.
12. Confirm installer metadata contains no local paths or environment data.
13. Exercise the distribution against representative SDK versions.
14. Run the scenarios in `references/agent-evaluation-scenarios.md` and inspect
    tool activity as well as the agent's prose. `references/agent-evaluation-harness.md`
    describes an automated, isolated run and audit.
15. Publish only through the SDK release process after review and explicit
    approval.

## Update record

For each maintenance pass, record in the commit or release notes:

- Previous and new SDK baseline.
- Public SDK commit.
- OpenAPI retrieval date and changed specifications.
- Documentation pages reviewed.
- Skills changed.
- Live environments used, without credentials or sensitive institution data.
- Unverified behavior that remains.

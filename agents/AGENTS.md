# Alma Cloud App agent asset package

This package (`agents/` in the Cloud App SDK repository) stores distributable
agent profiles, skills, templates, and reference material for Alma Cloud App
developers. These instructions apply only to this folder.

## Package purpose

- Assets under `agents/`, `skills/`, and `templates/` are distribution sources.
- Utilities under `tools/` and material under `references/` are maintainer-only.
- TypeScript installer source under `src/` and tests under `test/` install
  distribution assets into target Cloud App projects. `dist/` is generated.
- They are not active instructions or skills for maintaining this package.
- Do not move distributable assets into auto-discovery directories such as
  `.github/agents`, `.github/skills`, `.agents/skills`, or `.claude/skills`.
- Keep target-repository instructions under `templates/`.
- Keep each skill self-contained so it can be installed independently.
- Keep installer writes checksum-managed, conflict-safe, and contained within
  the explicitly selected Cloud App root.

## Content boundaries

- Target users do not have access to Alma source code, private Ex Libris
  repositories, internal databases, or internal services.
- Use the local Cloud App, public SDK, public documentation, and authorized live
  Alma validation as the end-user evidence sources.
- Public-facing release requirements may be verified against the hosted build
  implementation, but expose only behavior developers need to reproduce or
  troubleshoot. Do not include infrastructure credentials, private operational
  procedures, or unnecessary hosting details.
- Version SDK-derived guidance and state its public package version or commit.
- Do not include credentials, private environment URLs, customer data, or
  internal implementation details.

## Editing

- Preserve valid YAML frontmatter in agent and skill files.
- Keep `SKILL.md` focused and place longer detail in files inside the same skill
  directory.
- Update `README.md` when distribution layout or installation changes.
- Update `INSTALLATION.md` when skill relationships, compatibility, or
  installation paths change.
- Follow `references/maintenance.md` when refreshing public sources.
- Check for stale paths after moving assets.
- Run the existing installer tests and inspect the package contents when
  installer code, packaged files, or installation paths change.

## Installer modules

- `cli.ts`: arguments and process exit behavior.
- `installer/index.ts`: public package exports.
- `installer/operations.ts`: command dispatch and shared setup.
- `installer/install.ts`: conflict-safe install and update planning.
- `installer/status.ts`: managed-file drift classification.
- `installer/assets.ts`: packaged asset discovery and grouping.
- `installer/project.ts`: Cloud App, package, skill, and metadata validation.
- `installer/filesystem.ts`: checksums, contained paths, atomic writes, and
  symlink safety.
- `installer/output.ts`: command help and result formatting.
- `installer/types.ts`: shared command and metadata types.

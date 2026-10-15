---
name: alma-cloudapp-project
description: >-
  Creates, initializes, inspects, and restructures Ex Libris Alma Cloud App
  projects. Use for eca init, project layout, routing, generation, hidden .ng
  workspace behavior, SDK version detection, config.json, eca start, local
  proxy behavior, development networking, build setup, or eca eject.
---

# Alma Cloud App project workflow

Use this skill for project-level work rather than application API or
translation behavior. Use `alma-cloudapp-translations` for translation
catalogs, extraction, language switching, and text direction. Use
`alma-cloudapp-release` for clean installs, security audits, production build
preflight, tags, releases, and publication. Use `alma-cloudapp-testing` for
test design, typed mocks, runner behavior, headless execution, and coverage.
Use `alma-cloudapp-sdk-migration` for every approved SDK upgrade.

## Workflow

1. Inspect `package.json`, `manifest.json`, `config.json`, and `cloudapp/`
   within the target project.
2. If the task creates, extends, or deliberately restructures the app, map the
   known workflows to initial or affected feature boundaries.
3. Determine versions of:
   - `@exlibris/exl-cloudapp-cli`
   - `@exlibris/exl-cloudapp-base`
   - `@exlibris/exl-cloudapp-angular-lib`
   - `@exlibris/eca-components`
4. Use the authority order defined below.
5. Preserve the installed version unless an upgrade is explicitly requested.
6. Use existing `eca` commands instead of recreating their behavior manually.
7. Keep lasting application changes under `cloudapp/`.
8. Validate with the smallest relevant existing command.

## Authority order

1. Target project and SDK packages installed in that project.
2. Target package and lockfile versions plus matching bundled references.
3. Matching source from the exact public `ExLibrisGroup/cloudapp-sdk`
   repository.
4. Behavior observed in the target Alma environment.
5. Public documentation.

Do not assume access to Alma source code or private Ex Libris systems.

## Discovery and source boundaries

- During new-app discovery, inspect only the target instructions, package
  metadata, manifest, local configuration shape, and relevant scaffold
  structure unless deeper evidence is necessary to decide feasibility.
- Keep filesystem searches inside the target repository. Do not scan parent,
  sibling, home, cache, global installation, or unrelated workspace locations
  for dependencies, SDK source, examples, or configuration.
- Treat only `<target>/node_modules` as the target project's installed SDK.
  Another project's dependency tree is not evidence for this project.
- If dependencies are absent, use `package.json` and the lockfile first. Run the
  target project's normal install only when the current phase requires installed
  source; do not borrow packages from another project.
- Access another local SDK checkout only when the user supplied or explicitly
  approved its exact path.
- For public SDK source, use the exact official
  `https://github.com/ExLibrisGroup/cloudapp-sdk` repository and match the target
  version. Do not guess repository names, branches, raw URLs, or legacy
  projects.
- Use public URLs already supplied by the user or cited by installed references.
  Do not probe speculative sources.
- Surface failed source retrieval. Do not append `|| true`, discard HTTP
  failures, or otherwise make unavailable evidence look successful.

## New projects

- Create an empty target directory.
- Run `eca init` and answer its prompts.
- Use the full Alma institution URL for local development.
- Do not manually construct `.ng/`.
- Review the generated manifest before adding capabilities.

## Existing projects

- Run `eca init` only when local environment configuration is missing or must
  be changed.
- Treat reconfiguration separately from SDK upgrades.
- Inspect current uncommitted changes before running commands that regenerate
  files.

## Application structure

For a new app, derive the initial structure from known user workflows and
domain responsibilities. Prefer feature-oriented organization and co-locate
files expected to change together. Do not create speculative features, shared
layers, or empty directory scaffolding.

For an existing app, preserve coherent conventions. Reorganize only when the
requested work exposes a concrete ownership, coupling, duplication, or
dependency problem. Do not combine an unrelated fix with a broad structural
rewrite.

Create and organize lasting components, services, models, tests, styles, and
feature directories under `cloudapp/`. The `.ng/` workspace is generated and
may be replaced by `eca`; do not use it as the source of lasting application
structure. Use `eca eject` when a supported generated file must become
project-owned.

Use `alma-cloudapp-code-practices` for detailed co-location, shared-code
promotion, dependency direction, component and service ownership, and
over-modularization decisions.

## Development server

Before changing or debugging local startup:

1. Inspect `config.json`, `manifest.json`, the installed CLI version, and the
   existing `start` script.
2. Treat `config.json` as CLI configuration, not application runtime
   configuration.
3. Trace whether each outbound operation is:
   - An Alma API call through `CloudAppRestService`.
   - An SDK event or persistence call through the iframe message bus.
   - A framework-managed application asset request.
   - A direct browser request to an external service.
4. Reject application-authored relative requests, including requests that only
   work because the local proxy forwards them.
5. Reject direct access to the parent frame, its document, or the Alma DOM.
6. Do not rely on the local Alma proxy as an application backend.
7. Check development and published behavior separately.

For SDK 2.0.2, `config.json` provides the app metadata used during
initialization, the target Alma URL, and the local port. It does not define
arbitrary proxy routes, external service credentials, or production hosting.

For browser validation, use the `env` property inside `config.json` to derive
the Alma path on `http://localhost:<port>`. Open that proxied Alma URL, not the
configured remote origin directly. If authentication is required, remain on
the login page while the user signs in.

The `http://localhost:<port>/#/` route loads the Angular application without
establishing an Alma host context. Use it only for explicitly standalone
rendering checks; it does not validate iframe embedding, SDK message-bus
communication, entities, authentication, relevance, Alma REST calls, or Alma
theme propagation.

Use the exact behavior documented in this skill's `reference.md`; do not infer
network routing from a successful localhost request alone.

## Generated workspace

- `.ng/` is reconstructed by the CLI.
- Direct changes in `.ng/` are temporary.
- Use `eca generate` for Angular artifacts.
- Use `eca eject <path>` when a hidden base file must become project-owned.
- Use `tsconfig.override.json` for supported compiler overrides.

## Commands

Current SDK 2 commands include:

```text
eca init
eca start
eca build
eca test
eca generate
eca extract-labels
eca update
eca eject
eca version
eca help
```

Treat `eca update` as a separate migration workflow. The current updater
derives its target from the globally invoked CLI, rewrites dependencies and
application files, removes `node_modules` and `package-lock.json`, and can
attempt broad custom dependency updates.

`eca build` synchronizes and builds the generated workspace, but it does not
install dependencies, run tests, or perform the hosted publication audit. Use
the release skill before tagging or publishing.

`eca test` synchronizes the generated workspace, starts the source watcher, and
runs the configured Angular test target. Keep specs under `cloudapp/` and use
the testing skill rather than editing generated test configuration in `.ng/`.

## Further detail

Read `reference.md` in this skill directory.

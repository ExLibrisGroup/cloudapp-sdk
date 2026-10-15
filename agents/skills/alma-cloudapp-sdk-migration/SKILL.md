---
name: alma-cloudapp-sdk-migration
description: >-
  Upgrades Ex Libris Alma Cloud Apps between SDK versions. Use for eca update,
  SDK package upgrades, Angular or Material migrations, dependency rewrites,
  strictness adoption, legacy component changes, migration troubleshooting, or
  post-upgrade validation.
---

# Alma Cloud App SDK migration

Use this skill only when an SDK upgrade is explicitly requested. An SDK
migration can rewrite application files, dependencies, compiler behavior,
styles, tests, and the lockfile.

## Safety rules

- Do not run `eca update` in a dirty or unidentified worktree.
- Inspect repository status, branch, remote, package versions, Node.js version,
  and existing user changes first.
- Create a dedicated migration branch and a recoverable baseline commit or tag.
- Do not reset, clean, or revert user changes without explicit approval.
- Ask before installing or changing the global Cloud App CLI.
- Ask before accepting each migration prompt when its answer has not already
  been agreed.
- Do not combine the SDK migration with unrelated application changes.
- Never weaken strictness silently to obtain a successful build.

## Determine source and target

Inspect:

- `package.json`.
- `package-lock.json`.
- Installed `@exlibris/exl-cloudapp-base`.
- Installed Angular, Angular Material, TypeScript, RxJS, translation, and test
  package versions.
- The currently invoked `eca version`.
- The target public SDK tag or commit and its bundled base project.

Current `eca update` derives its target from the base package bundled with the
globally invoked CLI. It does not offer an arbitrary target-version argument.
Pin and verify the intended global CLI before running it.

## Baseline

Before migration:

1. Complete a clean `npm ci`.
2. Run the existing unit tests headlessly.
3. Run `eca build`.
4. Record known pre-existing failures.
5. Capture observation-only screenshots or behavior notes for important
   side-pane, fullscreen, widget, theme, translation, and entity workflows.
6. Inventory custom dependencies and SDK-private or generated-workspace
   assumptions.

Do not mutate Alma merely to establish the baseline. Follow the validation
skill's production-safety rules.

## Migration workflow

1. Read the target SDK release, package, and public source changes.
2. Identify migration thresholds crossed, especially SDK 1.2 and SDK 2.
3. Review custom dependency compatibility before invoking the updater.
4. Run the updater only after the target CLI and prompt decisions are clear.
5. Preserve the migration log when the SDK creates one.
6. Inspect every changed application and configuration file.
7. Review dependency movement between `dependencies` and `devDependencies`.
8. Review the newly generated `package-lock.json`.
9. Fix application code using current SDK, Angular, Material, translation, and
   testing patterns.
10. Prefer adopting strictness. If temporary overrides are approved, document
    and minimize them.
11. Re-run clean installation, audit, tests, production build, and
    mutation-safe live validation.

## Current `eca update` behavior

For SDK 2.0.2, the updater:

- Reads the old base version from `package-lock.json`.
- Reads the target dependency set from the globally installed CLI's bundled
  base project.
- Stops when the installed base is already at or above that target.
- Runs threshold migrations between the old and target versions.
- Rewrites SDK-owned dependencies and development dependencies.
- Removes root `node_modules` and `package-lock.json`.
- Reinstalls dependencies with `npm install`.
- May offer to update remaining custom dependencies with
  `npm-check-updates`.

The optional custom-dependency step uses legacy peer dependency installation
and can change multiple package versions and version ranges. Do not accept it
blindly.

## SDK 1 to SDK 2

The current major migration:

- Creates a temporary generated Angular project.
- Upgrades Angular and Angular Material sequentially from 11 through 18.
- Uses forced Angular updates in the temporary migration workspace.
- Runs the Material MDC migration.
- Rewrites legacy Material imports and selected Sass calls.
- Replaces the old unscoped `eca-components` package name.
- Replaces `LazyTranslateLoader` references with `HttpTranslateLoader`.
- Copies migrated developer-owned files back, excluding translation and asset
  content.
- Removes obsolete testing and extraction packages.
- Adds the current `cloudapp/jsconfig.json`.
- Prompts whether to apply current TypeScript and Angular template strictness.

These transformations are mechanical starting points. Review their semantics,
styling, accessibility, and tests manually.

## Strictness

Prefer enabling the target SDK's strict compiler and template settings during
the migration. Fix errors by narrowing types and modeling nullable states.

If the user explicitly defers strictness:

- Inspect `tsconfig.override.json`.
- Keep the override as narrow as possible.
- Record strictness debt and do not present the migration as fully complete.
- Do not add new `any`, broad assertions, or non-null assertions as a general
  workaround.

## Custom dependencies

For each non-SDK dependency:

1. Determine whether it is still used.
2. Check compatibility with the target Node.js, Angular, TypeScript, and RxJS
   versions.
3. Prefer removing obsolete dependencies before upgrading them.
4. Review peer dependency warnings rather than relying permanently on
   `legacy-peer-deps`.
5. Upgrade deliberately and test behavior.
6. Do not use `--force` or a broad latest-version update without an explicit
   compatibility decision.

## Post-migration review

Inspect:

- SDK imports and public API usage.
- Angular module or standalone structure.
- Routing and generated-workspace overrides.
- Material components, dialogs, themes, selectors, and visual changes.
- Translation loader, catalogs, extraction, and right-to-left behavior.
- Jasmine/Karma configuration and test doubles.
- RxJS lifecycles and concurrency.
- Manifest schema, widgets, fullscreen, entities, and Content Security Policy.
- Alma OpenAPI calls and role documentation.
- Production networking and iframe boundaries.

Run the final sequence from the committed candidate dependency graph:

```text
npm ci
npm audit --audit-level=critical
eca test --watch=false --browsers=ChromeHeadless
eca build
```

Then perform only approved live checks in the correct Alma environment.

## Failure handling

- Read the updater output and `.tmp-update-2.0/.log` when present.
- Preserve failure evidence before changing files further.
- Inspect whether `node_modules` was temporarily renamed.
- Do not re-run repeatedly without understanding the failed phase.
- Continue manually only when the remaining transformations are understood.
- If rollback is needed, use the clean baseline through normal Git review and
  explicit user approval. Do not destroy unrelated changes.

## Further detail

Read `reference.md` in this skill directory.

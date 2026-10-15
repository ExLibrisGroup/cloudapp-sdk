# Alma Cloud App SDK migration reference

## Target selection

`eca update` is controlled by the CLI executable that is actually invoked.
SDK 2.0.2 reads:

- The current base version from the project's `package-lock.json`.
- The target base and dependency versions from the global CLI installation's
  bundled base project.

Consequences:

- A missing or incompatible lockfile prevents reliable version detection.
- Updating the global CLI changes the migration target.
- A project-local SDK declaration alone does not select the updater target.
- The command has no documented target-version parameter.

Before running:

```text
eca version
npm ls @exlibris/exl-cloudapp-base
```

Also inspect the global executable resolution using the operating system's
normal command lookup. Do not assume it is the same package version declared by
the project.

## Update phases

The SDK 2.0.2 updater performs:

1. Version comparison.
2. User confirmation.
3. An initial `npm install`.
4. Generated-workspace synchronization.
5. Threshold migration functions in version order.
6. Dependency and development-dependency merging from the target base.
7. Removal of `node_modules` and `package-lock.json`.
8. Optional custom dependency upgrading.
9. Final `npm install`.

It sorts dependency keys and moves packages between dependency groups when the
target base classifies them differently.

The updater uses `npm install`, not the final release `npm ci`. Always review
and commit the resulting lockfile, then use `npm ci` for reproducibility.

## Defined migration thresholds

SDK 2.0.2 source defines two threshold migrations:

| Threshold | Transformation |
|---|---|
| `1.2` | Replaces the older translation-module helper with `CloudAppTranslateModule` and `forRoot()` |
| `2.0.0-rc.0` | Performs the Angular 11-to-18 and Material migration workflow |

A migration runs when the old version is below the threshold and the target is
at or above it.

Do not assume every package change has a dedicated transformation. Compare the
public source and release differences for the exact old and target versions.

## SDK 2 temporary workspace

The SDK 2 migration:

1. Synchronizes the current generated `.ng/` project.
2. Copies it to `.tmp-update-2.0`.
3. Creates a temporary Angular 11 package definition.
4. Installs temporary dependencies with legacy peer dependency behavior.
5. Runs Angular core, CLI, and Material updates sequentially for versions
   12 through 18.
6. Runs the Material MDC migration at Angular 16.
7. Applies regular-expression replacements for known legacy imports and Sass.
8. Copies migrated project-owned files back to `cloudapp/`.

The copy-back excludes `src/assets/**` and `src/i18n/**`, so assets and locale
catalogs are preserved rather than replaced by the temporary project.

The temporary migration commands use `--force --allow-dirty`. That is an
implementation detail of the isolated migration workspace, not permission to
ignore conflicts or force updates in the actual application.

## Mechanical replacements

The current migration includes replacements for:

- `@angular/material/legacy-*` imports.
- `MatLegacy*` aliases.
- `MAT_LEGACY_*` tokens.
- Unscoped `eca-components`.
- `LazyTranslateLoader`.
- Selected older Material palette/Sass calls.

Regular-expression migration cannot prove behavioral equivalence. Review:

- Material component appearance and interaction.
- Dialog focus and button hierarchy.
- Theme token meaning.
- Private selector dependencies.
- Translation initialization and fallback.
- Imports whose formatting did not match the replacement patterns.

## Removed packages

The SDK 2 migration removes known obsolete packages from project dependency
groups:

- `@biesbjerg/ngx-translate-extract`
- Project dependency on `@exlibris/exl-cloudapp-cli`
- `@types/jasminewd2`
- Unscoped `eca-components`
- `jasmine-spec-reporter`
- `karma-coverage-istanbul-reporter`

Check whether project code or custom scripts still reference them before
declaring the migration complete.

## Strictness prompt

When strictness is accepted, the target generated configuration applies the
SDK's current strict TypeScript and Angular template baseline.

When strictness is declined, the updater writes `tsconfig.override.json` with
several compiler and template checks disabled. Some Angular injection and input
checks remain enabled.

Declining can make the first build easier, but it is a compatibility deferral,
not successful adoption of the target type-safety baseline. Prefer resolving
strictness errors within the migration when feasible.

## Custom-dependency prompt

When accepted, the updater:

1. Installs with legacy peer dependency handling.
2. Runs `npm-check-updates` against dependencies not owned by the target base.
3. Uses peer and Node.js engine information.
4. Removes version ranges for selected upgrades.
5. Reinstalls dependencies.

This can be useful for Angular-coupled libraries but can also introduce
unrelated major changes. Inventory custom packages before answering. Prefer
manual, dependency-by-dependency upgrades when compatibility is unclear.

## Baseline checklist

Record before migration:

- Git commit and branch.
- SDK and CLI versions.
- Node.js and npm versions.
- Clean `npm ci` result.
- Unit-test result.
- Production-build result.
- Audit result.
- Supported Alma environments and roles.
- Key UI screenshots or observations.
- Known warnings and pre-existing failures.

Use sanitized artifacts only. Do not capture confidential records or
credentials.

## Diff review

Review migration changes by category:

| Category | Examples |
|---|---|
| Dependency graph | `package.json`, `package-lock.json`, removed packages, peer warnings |
| Application source | Imports, APIs, component metadata, lifecycle |
| Angular configuration | `tsconfig.override.json`, routing, builders |
| Material | Components, MDC changes, themes, Sass APIs, selectors |
| Translation | Module setup, loader, extraction dependencies |
| Testing | Jasmine/Karma versions, obsolete packages, typed mocks |
| Manifest | Schema acceptance, entities, widgets, CSP |
| Runtime | Page context, Alma APIs, settings/configuration, iframe behavior |

Do not review only whether the code compiles. Mechanical upgrades can preserve
types while changing runtime behavior or appearance.

## Validation sequence

After resolving migration changes:

1. Run `npm install` only as needed while editing dependencies.
2. Review and commit the intended dependency graph.
3. Run a clean `npm ci`.
4. Require zero critical audit findings.
5. Run targeted tests, then the full configured headless suite.
6. Run `eca build`.
7. Run `eca start` against an approved environment.
8. Validate side pane, fullscreen, widgets, themes, translations, entities,
   settings, configuration, and Alma API behavior as applicable.

Production remains observation-only unless a narrowly scoped mutation was
approved.

## Official documentation drift

The public update guide accurately describes the broad workflow but omits
several consequential implementation details:

- Target versions come from the globally invoked CLI.
- `package-lock.json` is required for old-version detection and then deleted.
- `node_modules` is removed and rebuilt.
- Custom dependencies may be mass-updated.
- SDK 2 migration uses forced sequential Angular updates in a temporary
  workspace.
- Declining strictness creates a compatibility override.
- Translation and asset directories are excluded from migration copy-back.

Use the matching public updater source as the authority.

## Sources

- [Updating the Cloud App SDK](https://developers.exlibrisgroup.com/cloudapps/docs/updating/)
- [Public Cloud App SDK](https://github.com/ExLibrisGroup/cloudapp-sdk)

### Links

- [https://developers.exlibrisgroup.com/cloudapps/docs/updating/](https://developers.exlibrisgroup.com/cloudapps/docs/updating/)
- [https://github.com/ExLibrisGroup/cloudapp-sdk](https://github.com/ExLibrisGroup/cloudapp-sdk)

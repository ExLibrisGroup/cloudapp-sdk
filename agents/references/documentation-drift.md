# Known Alma Cloud Apps documentation drift

Baseline comparison: public SDK 2.1.0.

| Topic | Older documentation pattern | Current baseline |
|---|---|---|
| Shared components | `eca-components` | `@exlibris/eca-components` |
| Dialog declarations | `entryComponents` | Not required by current Angular |
| Translation loader | `LazyTranslateLoader` | `HttpTranslateLoader` |
| Label extraction | Described as merging translation files | Writes a clean, sorted `i18n/_.json` key inventory |
| CLI commands | Omits update and eject | Both commands exist |
| REST methods | Omits PATCH | PATCH is declared |
| Alert timing | Two-second success/info close | Current default is three seconds |
| Configuration result | `WriteSettingsResponse` | `WriteConfigResponse` |
| Init data | Omits desk and department | Current interface includes both |
| Widget height schema | Documents integer range | Current schema does not encode all constraints |
| Material theming | Older Material APIs | SDK 2 uses Angular Material 18 and Material 3 theme files |
| Release preparation | Says to run `eca build` | Hosted builds first use `npm ci` and reject any critical audit finding |
| Build scope | May imply a complete release check | `eca build` does not install, audit, test, or validate in Alma |
| Beta updates | GitHub release terminology may be ambiguous | Hosted beta routing is selected by `-beta` in the tag text |
| Alma API roles | OpenAPI and API-key pages describe endpoint/API-key access | Exact Cloud App user roles are not consistently encoded and require separate evidence |
| PATCH | Cloud App REST documentation may omit it | SDK transport supports PATCH, but the 2026-08-31 Alma OpenAPI snapshot declares no PATCH operations |
| Testing examples | Older Jasmine/Karma examples use `any`, `spyOn<any>`, TSLint, and historical Angular setup | SDK 2 uses Angular 18, Jasmine 5.2, and Karma 6.4; preserve strict typed tests |
| Test coverage | Official guide focuses mainly on success examples | Also cover errors, lifecycle, cancellation, authorization, stale data, and partial success |
| Publication tests | Publication documentation requires a build | Hosted publication does not run the unit suite; run headless tests after the final `npm ci` |
| SDK update target | Described as updating to the latest SDK | `eca update` targets the base bundled with the globally invoked CLI |
| SDK update scope | Summarized as dependency updates and migration scripts | Current major migration deletes the lockfile/install, rewrites project files, upgrades Angular 11 through 18, and may update custom dependencies |
| SDK strictness | Presented as an optional prompt | Declining writes a `tsconfig.override.json` compatibility override and leaves migration debt |

## Usage rule

Do not reject the documentation wholesale. Use it for concepts and workflows,
then translate examples to the project's installed SDK and Angular version.

## Role caution

Do not promise that adding manifest `roles` is sufficient access enforcement.
Describe required roles to users and validate access behavior in the target
Alma environment.

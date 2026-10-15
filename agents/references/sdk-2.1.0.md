# Alma Cloud App SDK 2.1.0 baseline

Prepared: 2026-10-15

Based on public commit `5c3b11e1fcc6ef305601ecf0775285005168b1bb` (2.0.2)
plus the 2.1.0 changes:

- `EntityType.NORMALIZATION_RULE` in `@exlibris/exl-cloudapp-angular-lib`.
- The `eca agents` command and the `@exlibris/exl-cloudapp-agent` package.
- `eca init` initializes a Git repository with an initial commit (`--no-git`
  skips it).

## Packages

| Package | Version |
|---|---:|
| `@exlibris/exl-cloudapp-cli` | 2.1.0 |
| `@exlibris/exl-cloudapp-base` | 2.1.0 |
| `@exlibris/exl-cloudapp-angular-lib` | 2.1.0 |
| `@exlibris/eca-components` | 2.1.0 |
| `@exlibris/exl-cloudapp-agent` | 2.1.0 |

## Main technology versions

- Angular 18.2.x.
- Angular Material 18.2.x.
- TypeScript 5.5.x.
- RxJS 7.8.x.
- ngx-translate 16.x.

## Testing baseline

- Jasmine 5.2.
- Karma 6.4.
- Angular Karma builder 18.2.x.
- Chrome launcher 3.2.
- Karma coverage 2.2.
- `eca test` synchronizes `.ng/`, starts the source watcher, and forwards
  arguments to the generated Angular test command.
- The starter includes test configuration and dependencies but no example
  `*.spec.ts` files.

## Public Angular library exports

- Cloud App events, REST, settings, configuration, and store services.
- Initialization service.
- Public interfaces and entity enum.
- Request and HTTP method types.
- Form-group utility.
- Material module.
- Translation module and HTTP translation loader.
- Alerts.
- Menu components.

## Shared components

`@exlibris/eca-components` exports:

- Single- and multiple-entity selection.
- Confirmation, alert, and prompt dialogs.
- Custom prompt-dialog support.
- Autocomplete.

`@exlibris/exl-cloudapp-angular-lib` also exports:

- Alert module, service, model, and component.
- Menu and menu-item components.
- Material module.
- `FormGroupUtil`.

The scoped package name is required. Older examples using `eca-components` are
stale.

## Styling and theming

- `InitService` applies `body.cloudapp-theme--<color>` from initialization
  data.
- Generated styles import the Angular library styles and developer-owned
  `main.scss`.
- `main.scss` supplies `themed-styles($theme, $typography)` and
  `global-styles()` mixins.
- SDK 2.1.0 uses Angular Material 3 theme definitions and
  `mat.get-theme-color(...)`.
- The named color themes are light themes; names such as `dark_blue` do not
  indicate dark mode.

## Compatibility rule

Do not apply this baseline unchanged to an SDK 1.x project. Inspect the matching
public tag and use the migration workflow only when the user requests an
upgrade.

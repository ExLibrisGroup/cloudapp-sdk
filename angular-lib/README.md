# Cloud Apps Angular Library
Angular services, modules, and components that let [Ex Libris Cloud Apps](https://developers.exlibrisgroup.com/cloudapps/) interact with Alma and the Higher Education Platform.

## Installation
Apps created with [`eca init`](https://github.com/ExLibrisGroup/cloudapp-sdk/tree/master/cli) already include this library. To add it manually:
```
$ npm install @exlibris/exl-cloudapp-angular-lib --save
```

## Services
| Service | Description |
| --- | --- |
| `CloudAppEventsService` | Initialization data, current page entities (`getPageMetadata`, `onPageLoad`), auth token, and page navigation (`refreshPage`, `back`, `home`). |
| `CloudAppRestService` | Call Alma REST APIs with `call()`. |
| `CloudAppStoreService` | Key/value storage for the app (`get`, `set`, `remove`). |
| `CloudAppSettingsService` | Per-user app settings (`get`, `set`). |
| `CloudAppConfigService` | Institution-level app configuration (`get`, `set`). |
| `InitService` | Applies the user's language and Alma theme at startup. Load it with `APP_INITIALIZER`. |

## Modules and components
| Export | Description |
| --- | --- |
| `MaterialModule` | Angular Material modules used by Cloud Apps. |
| `CloudAppTranslateModule` | Translation support based on `@ngx-translate/core`. |
| `AlertModule`, `AlertService` | Alerts displayed with `<cloudapp-alert>`. |
| `MenuModule` | Menu components (`<eca-menu>`, `<eca-menu-item>`). |
| `FormGroupUtil` | `toFormGroup()` converts an object into a reactive form group. |

Shared types such as `Entity`, `EntityType`, `PageInfo`, `InitData`, `Request`, and `HttpMethod` are also exported.

## Styles
The package includes the Cloud App theme at `@exlibris/exl-cloudapp-angular-lib/styles/styles.scss`.

## Documentation
See the [Cloud Apps documentation](https://developers.exlibrisgroup.com/cloudapps/) for guides, tutorials, and the API reference.

## License
See [LICENSE.md](https://github.com/ExLibrisGroup/cloudapp-sdk/blob/master/angular-lib/LICENSE.md).

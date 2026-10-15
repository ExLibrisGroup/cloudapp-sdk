# Cloud Apps Base
The starter app and build workspace used by the [Cloud Apps CLI](https://github.com/ExLibrisGroup/cloudapp-sdk/tree/master/cli) to create and run [Ex Libris Cloud Apps](https://developers.exlibrisgroup.com/cloudapps/).

You don't normally install this package directly. The CLI uses it as follows:

* `eca init` copies the starter app from this package into a new project.
* `eca start`, `eca build`, and `eca test` run the app inside the generated `.ng/` Angular workspace that comes from this package.
* `eca update` updates a project to the base version bundled with the installed CLI.

## Contents
| Path | Description |
| --- | --- |
| `base/cloudapp/` | Starter app source. |
| `base/manifest.json`, `base/config.json` | Starter manifest and development settings. |
| `base/.ng/` | Angular workspace template used to build and serve the app. |
| `manifest.schema.json` | JSON schema for `manifest.json`. |

## Documentation
See the [Cloud Apps documentation](https://developers.exlibrisgroup.com/cloudapps/) on the Ex Libris Developer Network.

## License
See [LICENSE.md](https://github.com/ExLibrisGroup/cloudapp-sdk/blob/master/base/LICENSE.md).

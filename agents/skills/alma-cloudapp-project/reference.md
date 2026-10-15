# Alma Cloud App project reference

## Standard layout

```text
cloudapp/
  src/
    app/
    assets/
    i18n/
    main.scss
.ng/
build/
config.json
manifest.json
package.json
```

`cloudapp/` is the developer-owned application source. `.ng/` combines hidden
SDK base files with project files for Angular commands. `build/` contains the
production output.

## SDK source resolution

Resolve SDK behavior without crossing project boundaries:

1. Inspect SDK packages under the target project's `node_modules`.
2. If packages are not installed, establish versions from the target
   `package.json` and lockfile.
3. Use the toolkit's matching versioned SDK reference for known behavior.
4. When implementation source is required, use the exact public
   `ExLibrisGroup/cloudapp-sdk` repository at the matching tag or commit.
5. If the required source remains unavailable, mark the conclusion unverified
   or install dependencies in the target through its normal workflow when that
   action is appropriate.

Do not search parent or sibling projects for another `node_modules`, inspect
global caches as a substitute for target dependencies, or guess legacy GitHub
repository names and raw file paths. Another project's installed package can
differ by version, lockfile, generated state, or local modification.

Keep discovery searches within the target repository unless the user has
provided or approved an exact external path. A failed authoritative-source
lookup is evidence of unavailability; do not hide it with shell fallbacks or
continue using a speculative source.

## Local configuration

`config.json` configures the Cloud App CLI's local workflow. SDK 2.0.2 expects:

| Field | Local purpose |
|---|---|
| `title` | App title used by initialization and local manifest preparation |
| `subtitle` | App subtitle used by initialization and local manifest preparation |
| `author` | App author used by initialization and local manifest preparation |
| `env` | Full target Alma URL used to derive the proxy target and browser start URL |
| `port` | Local Angular development-server port |

The CLI derives a kebab-case `name` from `title`. The generated name is used as
the default local manifest ID when the manifest does not already override it.

`config.json` is not:

- The production application manifest.
- A runtime settings or institution-configuration store.
- A general development-proxy configuration.
- A place for API keys, passwords, tokens, or backend credentials.

Inspect the target project's source-control policy before changing or sharing
`config.json`; its Alma URL and institution selector may be environment
specific.

## Configuration processing

When `eca start` runs, SDK 2.0.2:

1. Reads and validates `config.json`.
2. Prompts for missing or invalid fields.
3. Normalizes `env` as a URL and `port` as a number.
4. Derives the kebab-case local app name.
5. Writes the normalized root `config.json`.
6. Writes `.ng/config.json` with only the origin of `env` as `target`.
7. Sets the generated Angular serve port from `config.json`.
8. Prepares `manifest.json` and copies it into the app assets.

The `env` path and query are not part of the generated proxy target. They are
used when choosing the browser URL. The proxy target is the Alma origin.

During manifest preparation, existing manifest fields override corresponding
metadata derived from `config.json`. The CLI supplies a derived local ID only
when the manifest does not already provide one. Inspect the manifest diff
after initialization or reconfiguration.

The published Cloud App identity may differ because production apps are
normally identified by their GitHub owner and repository.

## Starting

`eca start` normally:

- Installs dependencies.
- Reconstructs `.ng/`.
- Validates configuration.
- Copies the manifest into the generated app.
- Starts the Angular development server and watcher.
- Opens Alma through the local development proxy.

Use `--no-install` only when dependency installation is intentionally being
skipped. Use `--no-open-browser` when browser startup is managed separately.

Browser selection can be provided with `--browser <name>` or the
`ECA_BROWSER` environment variable. The command-line option takes precedence.

The configured port defaults to `4200`. SDK 2.0.2 accepts ports `80`, `443`,
or `1025` through `65534`. The generated server is still opened with an
`http://localhost:<port>` URL; selecting port `443` does not configure a local
TLS certificate or make the Angular server HTTPS.

## Browser start URL

The CLI always opens the target through the local origin:

```text
http://localhost:<port>
```

If `env` contains an institution path or an `institute` query parameter, the
CLI preserves that path and query on the localhost origin. Otherwise it opens:

```text
http://localhost:<port>/mng/login
```

This is why the browser address uses localhost even though `config.json`'s
`env` value points to Alma.

When interactive authentication is required, keep the Playwright MCP page on
this proxied Alma URL and ask the user to sign in there. Do not abandon the
login flow by navigating to `http://localhost:<port>/#/`; that route loads the
standalone Angular app without Alma's host shell, authentication, page
entities, or SDK message bus.

## Local Alma proxy

The generated Angular server uses a catch-all proxy whose target is the origin
of `config.json`'s `env` value. This allows the Alma shell, authentication flow,
and related same-origin requests to run through localhost while local Cloud
App assets are served by the Angular development server.

For local compatibility, the SDK 2.0.2 proxy:

- Disables target-certificate verification.
- Removes `SameSite` and `Secure` attributes from response cookies.
- Rewrites the Alma load-balancer cookie name for localhost and restores it on
  proxied requests.
- Removes `upgrade-insecure-requests` from Alma's response CSP.

These are development accommodations, not production application behavior.
Do not copy them into application code or a production reverse proxy.

## Generated workspace and watcher

At startup, the CLI empties and reconstructs `.ng/` from the installed SDK base
and the developer-owned `cloudapp/` directory. It then watches `cloudapp/` and
copies additions, changes, and deletions into `.ng/`.

- Make lasting changes under `cloudapp/`, not `.ng/`.
- If a watched file appears stale, inspect watcher output and compare the two
  paths before editing generated files.
- Restart `eca start` after changes to root configuration, dependencies, or
  hidden framework files when the watcher does not cover them.

## How requests leave the app in development

Not all requests use the local proxy in the same way.

### Alma APIs and SDK operations

`CloudAppRestService`, event operations, settings, configuration, store, and
authentication-token requests communicate with the parent Alma application
through the SDK message bus. The app does not attach an Alma API key or perform
those operations as ordinary `HttpClient` requests.

Application code must not access `window.parent`, `window.top`,
`window.frameElement`, a parent/frame document, or the Alma DOM. It also must
not create its own message channel to the parent frame. The public SDK owns
parent-frame communication.

In local development, the parent Alma application itself is being viewed
through localhost, so browser developer tools may show localhost URLs for work
that the Alma host performs. That does not turn a direct app-side localhost
request into a supported SDK call.

Use `CloudAppRestService` for Alma platform APIs in both development and
production. Never issue an application-authored relative request through
`HttpClient`, `fetch`, `XMLHttpRequest`, `EventSource`, WebSocket, or another
browser networking API. The prohibition applies even if the catch-all
development proxy would forward the path successfully.

### Application assets

The generated framework serves application bundles and SDK-managed resources
such as `i18n/<language>.json` from the local Angular server. These
framework-managed resource loads do not permit application code to issue
relative network requests. Do not copy the SDK loader's internal relative URL
pattern into application API or integration code.

### External services

Application-authored requests to an external service must use an explicit
absolute URL. Such `HttpClient`, `fetch`, image, frame, and browser-navigation
requests go directly from the browser to their destination.
The `env` value in `config.json` does not proxy or authorize them.

For direct external API calls:

- Add only the required origin to the appropriate manifest CSP directive.
- Use an explicit absolute `https://` URL outside approved localhost
  development scenarios.
- Ensure the service permits the request through CORS.
- Treat all browser-delivered code, configuration, storage, runtime values,
  and traffic as user-inspectable; never place service credentials there.
- Use an authorized backend when a service requires a secret or cannot support
  browser CORS.
- Use `CloudAppEventsService.getAuthToken()` when that backend must verify the
  Cloud App/Alma context.

The SDK 2.0.2 CLI has no `config.json` field for arbitrary backend proxy
routes. Do not add undocumented fields and expect `eca start` to route them.

Do not use a relative path to hide the external service behind the Alma proxy
or local Angular server.

### Development-only services

A local backend origin still needs to satisfy the app's development CSP. If a
temporary localhost origin is added to the manifest for development, keep it
out of the published manifest and avoid committing developer-specific
addresses unless the project has an explicit configuration convention.

Do not use a permissive wildcard merely to make local development work.

## Development CSP

The CLI generates a development CSP from `manifest.json`. It includes local
application sources and adds the manifest's declared `connectSrc` and
`frameSrc` values. Development mode permits script behavior required by the
Angular toolchain that should not be treated as a production permission.

A request working in development proves neither production CSP compatibility
nor CORS compatibility. Validate the production build and the hosted app.

## Troubleshooting

When startup or networking fails, check in this order:

1. The `env` value in `config.json` is the intended full Alma URL.
2. The configured port is available.
3. `.ng/config.json` contains the expected Alma origin.
4. The browser was opened on localhost, not directly on the Alma origin.
5. Alma authentication completed through the proxied page.
6. The request is using the correct path: SDK message bus, local asset, or
   direct external request.
7. No application-authored request uses a relative URL.
8. Application code does not inspect or manipulate the parent frame or Alma
   DOM.
9. Manifest CSP allows any required external origin.
10. The external service supplies valid CORS headers.
11. The `cloudapp/` change was synchronized into `.ng/`.
12. The same behavior works in a production build or hosted validation when
    the distinction matters.

If the local development app is not visible in Alma, do not assume it requires
tenant installation or activation. Confirm the server and proxy first, then
inspect the generated and asset manifests, schema validity, browser console and
network, current entity relevance, and whether another Alma side pane is
hiding access to Cloud App Center.

## Building and testing

- `eca build` creates production assets under `build/`.
- `eca test` invokes the configured Angular Karma/Jasmine test runner.
- `eca extract-labels` creates a clean, sorted extracted-key inventory at
  `cloudapp/src/i18n/_.json`; reconcile it with maintained locale files.

Only use commands that already exist in the installed project and SDK.

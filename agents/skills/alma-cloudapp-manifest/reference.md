# Alma Cloud App manifest reference

Baseline: SDK 2.0.2. The installed package schema is authoritative.

Before treating a manifest field or referenced resource as unused, trace SDK
and build packaging, application routes and runtime loading, and Alma host
metadata behavior. Lack of an application import is not evidence of non-use;
validate host-consumed behavior in Alma when removal matters.

## Required fields

The current schema requires:

- `author`
- `title`
- `description`

`title`, `subtitle`, and `description` can be strings or translated label arrays.
These arrays contain `{ "lang", "text" }` objects and are separate from runtime
keys in `cloudapp/src/i18n/*.json`. Include an English value.

## Manifest preflight and recovery

Before build or browser validation:

1. Read the installed `manifest.schema.json`.
2. Confirm every required property is present.
3. Confirm translated labels use the schema's exact keys.
4. Confirm each changed capability has the required scalar, array, or object
   shape.
5. Confirm the root manifest and the SDK-generated or synchronized asset
   manifest represent the same intended configuration.

For SDK 2.0.2, a successful Angular or `eca build` does not by itself prove
manifest schema validity. A malformed manifest may compile while preventing
the development app card from rendering correctly in Alma.

When live validation exposes a manifest error, stop navigation and DOM
exploration. Repair the developer-owned manifest, run the normal SDK
synchronization or restart workflow, confirm the generated asset copy, and
restart Cloud App Center validation. Do not compensate for invalid metadata by
trying to install, activate, or locate the app elsewhere.

## Icons

Icons may use a font class or URL. Alma renders them as follows:

- A URL ending in `.svg` is used as a mask with a white foreground over Alma's
  generated app color; multicolor SVG artwork is not preserved.
- Other URL images use `background-size: cover` and may be cropped.
- Font icons use the supplied class and render in white; use an established
  Alma icon class rather than application-owned iframe CSS.
- A URL beginning with `/` is resolved against the hosted Cloud App base.
  Keep app-owned files under `cloudapp/src/assets/` and normally reference them
  as `/assets/<file>`.

Choose or generate a simple, distinctive icon that remains recognizable in
compact presentation. For an SVG mask, use a single opaque silhouette on
transparency. For raster or multicolor artwork, center essential content and
leave safe padding for cropping. Avoid text, thin detail, confidential imagery,
and unlicensed or misleading branding. Do not rely on the icon alone to convey
essential meaning.

Although `icon` is optional in the schema, every new app must make an explicit
choice. Use a confirmed application icon, or document that Alma's generic
fallback is intentional for the requested endpoint. Absence without a decision
is incomplete presentation design.

Validate the production build and inspect the result in Cloud App Center and
the opened-app header.

## Menu pages and routes

Alma creates Settings, Configuration, and Help menu actions when the
corresponding `pages.settings`, `pages.config`, or `pages.help` value is
present. Configuration is shown only when Alma classifies the current user as
a general administrator. The same page entries are also used by widget menus.

Settings and Configuration replace the app iframe location with the manifest
value resolved against the app's hosted base URL. Internal Help behaves the
same way; a Help value beginning with `http` or `//` opens a separate window.
Use an absolute HTTPS URL for external help.

The manifest does not create or protect an Angular route. Its internal value
must match a route declared by the application. With the SDK starter's
`useHash: true`, Angular path `configuration` is addressed as
`/#/configuration`; do not copy a documented `/#/config` example unless the
application route is actually named `config`.

Menu visibility is not authorization. Protect sensitive application behavior
and operations independently, and validate the relevant menu and navigation
behavior in Alma.

## Fullscreen

`fullscreen.allow` indicates whether expansion is supported.
`fullscreen.open` requests expanded presentation when opened and should only be
used when expansion is allowed.

## Entity relevance

`entities` makes the app relevant to matching entity types on the current Alma
page. It does not grant API permissions and does not guarantee that every Alma
page emits the expected entity.

## Institution limitation

`relevantForInst` limits availability to configured institutions. Treat values
as platform matching rules rather than assuming only literal equality. Test
institution-limited publication carefully.

## Content security

Use:

- `connectSrc` for outbound browser connections.
- `frameSrc` for embedded external frames.
- `sandbox.modals` for modal browser capabilities.
- `sandbox.downloads` for downloads.
- `sandbox.popups` for popup windows.
- `sandbox.popups-to-escape-sandbox` only when the opened page must avoid
  inherited iframe sandbox restrictions.

Manifest permission does not solve cross-origin resource sharing (CORS).
External APIs must still provide suitable CORS behavior or be accessed through
an authorized backend.

For a webhook, add the LibOW regional origins (`na`, `eu`, `ap`):

```json
"contentSecurity": {
  "connectSrc": [
    "https://na-workflows.hosted.exlibrisgroup.com",
    "https://eu-workflows.hosted.exlibrisgroup.com",
    "https://ap-workflows.hosted.exlibrisgroup.com"
  ]
}
```

`connectSrc` cannot wildcard part of a host label, so list each region.

Triggering a workflow through the Alma Run Workflow API needs no `connectSrc`
entry. See the `alma-cloudapp-open-workflows` skill.

The manifest schema does not provide a general way to add iframe `allow`
permissions or arbitrary Permissions Policy capabilities. Do not infer that a
clipboard, notification, media, or other browser API is available merely
because it works through the local same-origin proxy. Check the public SDK and
the deployed Alma iframe, then provide a fallback when support is not
established.

The development server also builds its CSP from the manifest. A localhost
backend therefore needs an explicit development permission, but
developer-specific origins must not leak into the published manifest. The
current `config.json` does not provide a separate arbitrary-backend proxy.

## Schema limitation

Public documentation describes `widgetHeightPx` as an integer from 300 to 1000.
The SDK 2.0.2 schema declares a number but does not encode all of those
constraints. Follow the documented range even when schema validation accepts a
broader value.

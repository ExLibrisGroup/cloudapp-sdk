---
name: alma-cloudapp-manifest
description: >-
  Designs and reviews Alma Cloud App manifests. Use for titles, pages, entity
  relevance, fullscreen, external connections, iframe content, sandbox
  permissions, institution limits, application identity, or dashboard widgets.
---

# Alma Cloud App manifest workflow

## Workflow

1. Inspect the project's installed base package and manifest schema.
2. Inspect the current `manifest.json`.
3. Identify the exact runtime capability being requested.
4. Add the minimum manifest permission or metadata required.
5. Validate the edited manifest against the installed schema before build or
   browser validation. Check required fields, translated-label object keys, and
   the exact type of every changed capability.
6. For translated labels, include English and coordinate locale coverage with
   the app's runtime catalogs.
7. Separate local-development values from production values.
8. Validate the manifest through the project's existing SDK workflow.
9. If presentation or permissions must be confirmed, use the Playwright MCP,
   never `playwright-cli`, in the target Alma environment.

An `eca build` success is not proof that the manifest matches its schema or
will produce a usable Cloud App card. Do not begin Cloud App Center validation
until the installed schema's required fields and types have been checked.

If the app is absent or malformed in Cloud App Center, inspect schema errors
and the generated manifest before probing unrelated Alma controls. When the
manifest is wrong, stop, repair the source manifest, resynchronize the asset
copy through the normal SDK workflow, restart the local server, and repeat the
Cloud App Center flow from a known state.

For every new app, make an explicit presentation decision: provide a confirmed
icon, or record that Alma's generic fallback is intentional. Do not omit the
icon merely because it is optional in the schema. Inspect the chosen result in
Cloud App Center and the opened-app header.

## Current field groups

- Identity and description: `id`, `version`, `author`, `license`, `title`,
  `subtitle`, `description`.
- Presentation: `icon`, `fullscreen`.
- Navigation: `pages.settings`, `pages.config`, `pages.help`.
- Relevance: `entities`, `relevantForInst`.
- Widgets: `isWidget`, `widgetHeightPx`.
- Security: `contentSecurity.connectSrc`, `contentSecurity.frameSrc`,
  `contentSecurity.sandbox`.
- Role metadata: `roles`.

## Security rules

- Use least privilege.
- Add only exact external origins that are needed.
- Request popup, download, or modal capabilities only for a demonstrated use
  case.
- Do not assume the manifest can grant browser capabilities absent from its
  installed schema, such as clipboard or notification permission. Inspect the
  SDK and deployed Alma iframe, validate the target boundary, and provide an
  unavailable fallback.
- Never add a wildcard origin merely to suppress a browser error.
- Do not add secrets, credentials, or customer-specific private details.
- Do not assume `roles` alone enforces user authorization.
- Keep localhost and private development hosts out of published manifests.
- When `connectSrc`, `frameSrc`, restrictions, `roles`, `entities`, or pages
  change, update the app's `README.md` in the same change.

## Pages

- Page entries navigate to existing application routes; they do not register
  Angular routes. Each internal value must match a declared route.
- With hash routing (`useHash: true`, the SDK starter default), write every
  internal page value as `/#/<route>`: route `config` is `"/#/config"` and
  route `settings` is `"/#/settings"`. A bare `"/config"` resolves to a server
  path, not the hash route, so the page does not open.
- After adding or changing a page value, check it against the routing module
  and the `useHash` setting.
- Help may be internal or external.
- Configuration menu visibility depends on Alma administrator context, but the
  application must still design sensitive operations safely.

## Widgets

- Use `isWidget` only when the interface is suitable for dashboard dimensions
  and lifecycle.
- Set `widgetHeightPx` deliberately.
- Test widget behavior separately from side-pane behavior.
- Do not assume a widget app will also appear as a normal side-pane app.

## Further detail

Read `reference.md` in this skill directory.

Known SDK 2.0.2 documentation drift:

- Use `@exlibris/eca-components`, not the old unscoped package.
- Do not copy obsolete `entryComponents` guidance.
- Follow the installed Angular Material version rather than old theming APIs.
- Treat documented widget height constraints as requirements even where the
  JSON schema is less restrictive.
- Do not promise that manifest `roles` alone enforces authorization.

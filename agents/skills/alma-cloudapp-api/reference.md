# Alma Cloud App public SDK API reference

Baseline: SDK 2.1.0. Recheck against the local installed version.

This file covers the Cloud App transport and shared implementation rules. Use
`api-catalog.md` and `areas/` for the Alma endpoint catalog.

## Events

Current methods:

- `getInitData()`
- `getPageMetadata()`
- `getAuthToken()`
- `refreshPage()`
- `back()`
- `home()`
- `onPageLoad(handler)`
- `entities$`

Initialization data includes user identity, administrator indication, current
library, current circulation desk, current department, language, institution
code, platform URLs, and theme color.

## REST

Current methods are `GET`, `PUT`, `POST`, `PATCH`, and `DELETE`.

Only `Accept` and `Content-Type` are public request headers in the current SDK.
Normal Alma API paths can be supplied without `/almaws/v1`. Esploro and Rapido
calls require their documented full product paths.

For XML:

- Set `Accept` when text or XML should be returned.
- Set `Content-Type` when sending XML.
- Pass the XML string as `requestBody`.

The public SDK request type is not the endpoint schema. Read the operation's
OpenAPI definition before constructing parameters or payloads.

`CloudAppRestService` sends a `CALL_REST_API` request through the SDK message
bus to the parent Alma application. It is not an Angular `HttpClient` wrapper.
This remains true in local development even when browser tooling displays
localhost because Alma itself is loaded through the CLI proxy.

Do not replace it with any application-authored browser request. Never use a
relative URL to reach Alma, even if the development server would proxy it.

Do not call `api-*.hosted.exlibrisgroup.com` from Cloud App browser code and do
not add an `apikey` parameter or API-key authorization header.

The SDK message bus internally communicates with the parent frame.
Application code must not access `window.parent`, `window.top`,
`window.frameElement`, any parent/frame document, or the Alma DOM. Use the
public services rather than custom `postMessage` calls to Alma.

## External browser requests

Direct `HttpClient`, `fetch`, image, and frame requests are browser requests.
They require manifest CSP permission and, where applicable, CORS support from
the destination. They must use an explicit absolute URL. `config.json` does not
configure routing for them.

Everything delivered to or generated in the browser is user-inspectable,
including bundles, configuration, storage, runtime values, tokens, and network
requests. Minification, obfuscation, environment substitution, and CSP do not
make an embedded secret safe.

## Browser capabilities inside Alma

Treat browser-platform capabilities as integration boundaries, not ordinary
component utilities. Clipboard access, downloads, popups, notifications, file
access, media capture, and similar features may depend on:

- A public Cloud App SDK facility.
- The Alma iframe's `sandbox` and `allow` attributes.
- Permissions Policy and Content Security Policy.
- A secure context and a current user activation.
- Same-origin versus cross-origin deployment.
- Browser-specific permission behavior.

The local development server can proxy Alma and the Cloud App through the same
localhost origin. Success there does not prove that a hosted, cross-origin
Cloud App has the same capability. Validate the deployed boundary when the
capability is material.

For clipboard workflows, confirm that the supported target can write to the
clipboard, handle an unavailable `navigator.clipboard`, and report rejected
writes. If no supported mechanism is established, offer a selectable value,
manual-copy interaction, or another agreed fallback instead of claiming copy
support.

### Cloud App JWT and authorized backends

Use `CloudAppEventsService.getAuthToken()` when an external backend must verify
the Cloud App and Alma user context. SDK 2.1.0 requests `JWT_AUTH_TOKEN` from
the parent and returns `response.jwt`; Alma, not the SDK, creates the token.

Public documentation ([Events Service](https://developers.exlibrisgroup.com/cloudapps/docs/api/events-service/)
and [Authentication Token](https://developers.exlibrisgroup.com/alma/integrations/token/),
retrieved 2026-10-13) describes a JSON Web Token (JWT) signed with RS256 and
valid for four hours. Its claims are:

| Claim | Value |
|---|---|
| `iss` | `https://apps01.ext.exlibrisgroup.com/auth`, which supports OpenID configuration |
| `aud` | `ExlCloudApp:{APP_ID}`, where the app ID is the GitHub user and repository name |
| `sub` | the primary ID of the Alma user |
| `inst_code` | the Alma institution code |

The token carries no roles, name, email, or Alma API URL, and the other claims
(`iat`, `nbf`, `jti`) must not be required. Alma generates it; the SDK only
relays it. Recheck the documentation and issuer metadata when implementing a
backend.

Signature keys are published as a public key (`.pem`) and as a JSON Web Key Set
(JWKS) at `https://api-{REGION}.hosted.exlibrisgroup.com/auth/{INST_CODE}/jwks.json`;
select the key whose `kid` matches the token header.

The backend must:

- Verify the RS256 signature with the published keys; merely decoding the
  token is not verification.
- Validate issuer, application-specific audience, expiration, and required
  identity claims.
- Independently authorize the institution, user, operation, and data scope.
  Authentication alone does not grant every backend action.
- Validate requests, allowlist CORS origins, use least-privilege service
  credentials, and apply appropriate rate limits and write replay or
  idempotency protections.
- Expose focused operations rather than a generic URL-forwarding or
  unrestricted credential-bearing proxy.

Treat the JWT as a bearer credential while valid. Send it only over HTTPS,
normally in an authorization header, and do not place it in URLs, persistent
browser storage, logs, source, tests, analytics, or error payloads. It is
neither an Alma API key nor a safe place to carry third-party secrets.

## Path conversion

Official Alma OpenAPI paths normally begin with `/almaws/v1`, for example:

```text
/almaws/v1/users/{user_id}
```

For normal Alma calls, current `CloudAppRestService` usage may omit that prefix:

```text
/users/{user_id}
```

Use the installed SDK and an existing working project call as the authority.
Do not remove product prefixes from Esploro or Rapido paths.

Preserve path capitalization where the published operation uses it, including
the Resource Sharing Directory Member API.

## Parameters

- Put documented path values in the path.
- Put query parameters in `queryParams`; do not manually concatenate unencoded
  user input into the URL.
- Distinguish omitted parameters from empty-string values when the operation
  defines different behavior.
- Preserve documented defaults only when the application intentionally accepts
  them.
- Validate identifiers before issuing a state-changing request.

Do not assume a console example's API-key parameter belongs in a Cloud App
request.

## Replacement and action semantics

Alma commonly documents `PUT` as swap-all replacement. A safe update normally:

1. Retrieves the latest representation.
2. Verifies identity and version information.
3. Applies the focused change.
4. Sends the complete required representation.
5. Handles stale-record, warning, and validation responses.

Some `POST` operations are commands rather than creation. Name application
methods after the business action and confirm the consequence instead of
assuming all `POST` calls create a new independent resource.

## Media types

- Prefer a media type explicitly declared by the operation.
- Do not assume every endpoint supports both JSON and XML.
- Treat JSON and XML as separate contracts. Do not infer field names, nesting,
  repeated-value shapes, or embedded record content from the other
  representation.
- Do not infer that an XML example's raw MARC, Dublin Core, MODS, or BIBFRAME
  record is present in JSON.
- Preserve XML namespaces and record structure for MARC and other XML-only
  operations.
- Set both `Accept` and `Content-Type` when response and request formats need to
  be explicit.
- If OpenAPI and observed behavior differ, record the drift, code only against
  established fields, and keep unsupported assumptions unresolved.
- Do not parse an error response as if it were the success schema.

## Pagination and load

- Read the operation's `limit`, `offset`, token, or cursor contract.
- Honor documented maximum page sizes.
- Stop when the response indicates completion; do not infer completion solely
  from one field across all APIs.
- Cancel stale read pagination when Alma context changes.
- Keep write concurrency bounded and preserve ordering where required.
- Summarize partial failures rather than replacing them with an empty result.

The SDK's request queue is not permission to issue unbounded work.

## Error handling

Alma errors may include an HTTP status, an error envelope, error codes,
messages, and a tracking identifier. Narrow the actual SDK error value before
using it.

- Map expected authorization, validation, conflict, not-found, and service
  failures to distinct application states.
- Keep a tracking identifier available for support when appropriate, without
  exposing sensitive payloads.
- Do not show raw XML, JSON, stack traces, or transport details to users.
- Do not convert authorization or service failure into a successful empty
  result.
- Treat stale-version and validation warnings as workflow states, not generic
  network errors.

## Role model

The public endpoint catalog is oriented primarily toward external API-key
access. Cloud Apps use another authorization path:

- Alma executes the request in the logged-in user's context.
- The application does not choose API-key functional permissions.
- Exact user-role requirements are not consistently present in OpenAPI.
- `manifest.json` role text is descriptive and does not grant access.

Use current public Alma role documentation and authorized runtime testing.
State the institution, environment, and user-role profile behind any
live-confirmed conclusion.

## Entities

SDK 2.1.0 declares:

`BIB_MMS`, `LICENSE`, `USER`, `ITEM`, `COURSE`, `READING_LIST`, `REQUEST`,
`CITATION`, `AUTHORITY`, `HOLDING`, `IEPA`, `IEC`, `PO_LINE`, `PORTFOLIO`,
`INVOICE`, `ELECTRONIC_SERVICE`, `INVOICE_LINE`, `LOAN`, `REPRESENTATION`,
`REPRESENTATION_FILE`, `VENDOR`, `FUND`, `REMINDER`, `BORROWING_REQUEST`,
`LENDING_REQUEST`, `SET`, `PARTNER`, `FEES`, `IEP`, `IEE`, `IER`, and
`NORMALIZATION_RULE`.

An enum value does not prove that every Alma page emits that entity. Validate
the target page.

`CloudAppEventsService.entities$` is an `Observable<Entity[]>`. The array can
be empty, contain one entity, or contain multiple relevant entities on a list
page. Filtering by type must not silently become selection by taking the first
match.

Before implementing an entity-dependent workflow, define:

- Whether the app follows a current Alma selection and how that selection is
  established.
- Whether the user chooses one entity in the Cloud App.
- Whether multiple selection is supported.
- Whether every entity is processed, including limits, concurrency, progress,
  partial failure, and cancellation.
- What happens when entity order changes while the same list remains present.

Use the installed `@exlibris/eca-components` `eca-select-entity` or
`eca-select-entities` component when its current public behavior fits the
workflow. Do not interpret array position zero as a selected entity unless that
behavior is established for the target page and is part of the confirmed
design.

## Persistence

Settings:

- Per app and user.
- Stored by Alma.
- JSON-serialized by the SDK.

Configuration:

- Per app and institution.
- Stored by Alma.
- Writing is expected to require appropriate administrator access.
- Menu visibility is not a substitute for authorization.

Store:

- Browser-local.
- Isolated by Alma for the user, institution, and app.
- Appropriate for drafts, caches, and local state that should not become
  institution configuration.

## Known SDK 2.1.0 cautions

- Public types still use `any` in several places.
- Forms returned by helper services are untyped forms.
- Do not depend on exact internal timeout behavior.
- Autocomplete's built-in pagination assumes a conventional Alma paginated
  response.
- The SDK supports generic `PATCH`, but the Alma OpenAPI snapshot indexed by
  this skill currently declares no `PATCH` operations. Endpoint support, not
  transport capability, decides whether it may be used.

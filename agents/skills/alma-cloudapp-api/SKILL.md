---
name: alma-cloudapp-api
description: >-
  Implements Alma Cloud App interaction through the public SDK. Use for REST
  endpoint selection, OpenAPI research, REST calls, page entities, events,
  refresh or navigation, settings, institution configuration, browser storage,
  XML, pagination, roles, parallel requests, or Cloud App JWTs.
---

# Alma Cloud App API workflow

## Before implementation

1. Determine the installed SDK version.
2. Inspect the exported types and service implementation for that version.
3. Identify whether the task concerns the SDK transport, an Alma REST endpoint,
   or Alma runtime permissions and behavior.
4. For a REST operation, read `api-catalog.md`, the relevant file under
   `areas/`, and the current official OpenAPI operation.
5. Read `reference.md` for SDK request, error, pagination, and security rules.

Use this authority order:

1. Local project and installed SDK packages.
2. Matching public Cloud App SDK source.
3. Current official Alma OpenAPI specification for the endpoint contract.
4. Behavior observed in the target Alma environment.
5. Versioned references bundled with this skill.
6. Other public documentation.

Do not assume access to Alma source code or private Ex Libris systems.

The authorities answer different questions:

- SDK code decides how `CloudAppRestService` transports a request.
- OpenAPI decides the documented path, method, parameters, body, response, and
  media types.
- Alma documentation and authorized runtime validation establish user-role,
  scope, and workflow behavior not encoded in OpenAPI.

## Choose the correct service

| Need | Service |
|---|---|
| Alma platform API request | `CloudAppRestService` |
| Page entities or page metadata | `CloudAppEventsService` |
| Refresh, back, or home navigation | `CloudAppEventsService` |
| Per-user settings stored by Alma | `CloudAppSettingsService` |
| Institution-level configuration | `CloudAppConfigService` |
| Browser-local app data | `CloudAppStoreService` |
| External backend authentication | `CloudAppEventsService.getAuthToken()` |

## Rules

- Always use the supplied Cloud App service for an Alma API or host operation.
- Never make an application-authored request to a relative URL, in development
  or production.
- Never access the parent window/frame document or Alma DOM. Do not use
  `window.parent`, `window.top`, `window.frameElement`, or custom parent-frame
  messaging.
- Do not put Alma API keys in Cloud App browser code.
- Do not call a regional Alma API gateway directly from Cloud App code.
- Type service results with local interfaces and boundary validation where
  practical.
- Handle observable errors explicitly and show user-facing failures using
  project conventions.
- Unsubscribe from explicit subscriptions when their lifecycle is not otherwise
  bounded.
- Prefer `entities$` for reactive page-entity behavior.
- Treat `entities$` as zero, one, or many entities. Confirm whether the
  workflow follows a selected entity, asks the user to select one, accepts
  multiple selection, or processes a bounded collection.
- Do not silently discard matching entities with `find()`, `[0]`, or an
  equivalent first-item shortcut. A list-page ordering convention is not a
  single-entity contract.
- Validate entity behavior on the real target Alma page.
- Keep parallel workloads bounded even though Alma currently governs concurrent
  Cloud App REST calls.
- Mock SDK services in unit tests.

## Endpoint workflow

For every Alma REST operation:

1. Find the operation in the current official OpenAPI specification.
2. Record:
   - Functional area and purpose.
   - HTTP method and exact documented path.
   - Path and query parameters, defaults, limits, and pagination.
   - Request and response media types, treating each representation separately.
   - Request body and representation-specific response schema.
   - Documented warnings and error codes.
   - Whether it reads, creates, replaces, acts on, or deletes data.
3. Translate the path into the installed SDK's `CloudAppRestService` request
   convention.
4. Model the exact selected representation at the application boundary instead
   of propagating SDK `any` or inferring JSON from XML examples.
5. Select RxJS cancellation, ordering, duplicate prevention, and concurrency
   behavior according to the operation.
6. Establish required logged-in Alma roles separately.
7. Validate a representative response shape in the target Alma environment
   when the schema is ambiguous, the implementation needs undocumented fields,
   or returned data drives a core workflow.
8. Test representative success and failure behavior in the target Alma
   environment when runtime behavior matters.

Do not infer safety from the HTTP verb alone. Some `POST` operations perform
actions on existing resources, and some `PUT` operations replace the complete
resource.

Do not infer one response representation from another. A JSON response may be
a summary while XML contains the full record, and field names or nesting may
differ. If required fields remain unestablished, use documented fields, select
another declared media type, agree on a fallback, or mark the workflow
unresolved before implementation.

## Role and permission evidence

Alma API-key permissions and Cloud App user authorization are different:

- External API-key documentation describes functional-area read or read/write
  permission for an API key.
- `CloudAppRestService` calls run as the logged-in Alma user without an app API
  key.
- The user must have the Alma privileges required by the operation.
- Historical actions are attributed to that user.
- Insufficient permission is expected to surface as an authorization failure.

The OpenAPI files do not consistently declare exact Alma user roles. Label role
claims as:

| Evidence | Meaning |
|---|---|
| Documentation-derived | A current public Alma source names the role or privilege |
| Live-confirmed | Observed with a specified user and institution |
| Unverified | Exact role behavior has not been established |

Manifest `roles`, menu visibility, and hidden controls do not grant or enforce
API authorization.

## Release API inventory

For a release candidate, inventory every Alma endpoint:

| Field | Required content |
|---|---|
| Method and path | Exact OpenAPI operation |
| Purpose | User-facing reason for the call |
| Data impact | Read, create, replace, action, delete, or partial/multi-item change |
| Scope | Institution, library, IZ, NZ, CZ, or other relevant context |
| Media type | JSON, XML, or operation-specific format |
| Required role | Documented, live-confirmed, or unverified |
| Validation | Environment, user type, and non-mutating or approved scenario |

Keep this inventory in existing project or release documentation when it
provides lasting value. Do not create a new project file automatically.

## Development networking

- SDK services communicate with Alma through the iframe message bus.
- The SDK owns parent-frame communication; application code must not access the
  parent frame directly.
- Framework-managed assets may be served by the local Angular server, but
  application code must not use relative network requests.
- Direct external browser requests do not use `config.json`'s `env` value as a
  proxy.
- External requests require an explicit absolute URL, the appropriate manifest
  CSP permission, and CORS.
- Browser capabilities such as clipboard access, downloads, popups,
  notifications, and file access also depend on the deployed iframe sandbox,
  Permissions Policy, secure context, user activation, and browser behavior.
  Local proxy success is not proof that a deployed cross-origin app can use
  them. Prefer a public SDK facility; otherwise validate the deployed boundary
  and provide an unavailable fallback.
- Browser code and runtime values are user-inspectable; minification,
  environment substitution, obfuscation, and CSP do not protect secrets.
- A secret-bearing or non-CORS service requires an authorized backend.
  It must validate `getAuthToken()` tokens, authorize every operation, and
  never act as a generic proxy. See `reference.md`.

Read the development-server sections in
`alma-cloudapp-project/reference.md` when debugging localhost behavior.

## REST requests

The current request shape supports:

```typescript
interface Request {
  url: string;
  method?: HttpMethod;
  headers?: {
    Accept?: string;
    'Content-Type'?: string;
  };
  queryParams?: Record<string, unknown>;
  requestBody?: unknown;
}
```

Use the installed SDK's actual type rather than redefining it in application
code.

Normal Alma OpenAPI paths include `/almaws/v1`. The current SDK accepts the
normal Alma portion without that prefix, for example `/users/{id}`. Preserve
the target project's established working convention. Esploro and Rapido
operations require their documented full product paths.

Do not prepend a gateway hostname or append an API key.

## High-risk semantics

- Alma `PUT` commonly uses complete-resource replacement. Read the current
  resource first and send the complete required representation unless the
  specific operation says otherwise.
- Respect record versions, stale-data errors, validation options, warnings, and
  override parameters.
- Confirm destructive operations and action-style `POST` calls according to
  their actual consequence.
- Treat XML-only operations as XML end to end; do not assume JSON is supported.
- Preserve distinctions among local, Network Zone, and Community Zone
  identifiers.
- Bound pagination and parallel work. Do not retrieve or mutate an unbounded
  result set.
- Represent partial success accurately when processing multiple resources.

## Evidence

If runtime behavior is not established by public SDK code:

- Ask for the target Alma environment and access.
- Use the Playwright MCP.
- Mark results as live-confirmed or unverified.

## Reference navigation

- `api-catalog.md`: current API areas, source URLs, snapshot checksums, and
  operation counts.
- `areas/*.md`: compact functional-area cautions.
- `reference.md`: shared SDK and endpoint implementation rules.

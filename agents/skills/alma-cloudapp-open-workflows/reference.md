# Library Open Workflows reference

Baseline: Cloud App SDK 2.1.0, Angular 18.2, and the public Alma
Configuration API "Run Workflow" documentation retrieved 2026-09-28. LibOW/n8n
behavior below follows public n8n documentation; confirm it against the
LibOW instance the user supplies.

## Run Workflow API contract

Documentation-derived:

| Field | Value |
|---|---|
| Operation | Run Workflow |
| Method and path | `POST /almaws/v1/conf/workflows/{workflow_id}` |
| Path parameter | `workflow_id`: workflow identifier |
| Query parameter | `test` (boolean, default `false`): run in test mode |
| Request body | JSON forwarded as the REST trigger payload to the workflow's Alma Trigger node |
| Output | None documented |

Prerequisites:

- Production mode: the workflow is active and includes an Alma Trigger node
  with "Execute via REST API" selected.
- Test mode: the workflow is saved and its trigger node is listening for a
  test event.

Documented error codes:

| Code | Meaning | Suggested user message |
|---|---|---|
| `402119` | General error | The workflow could not be started. |
| `450001` | Workflow not found | The configured workflow was not found. |
| `450002` | Workflow inactive | The workflow is not active. |
| `450003` | Workflow missing trigger node | The workflow has no Alma Trigger. |
| `450004` | Missing trigger configuration; in test mode, trigger not listening | The workflow trigger is not configured for API use. |

Use the current public operation page and `conf.json` OpenAPI specification as
the authority. Do not infer a response schema that is not documented.

## Run Workflow through the SDK

SDK 2.1.0 facts:

- `CloudAppRestService.call()` removes a leading `/almaws/v1`; use
  `/conf/workflows/{id}`.
- Only `Accept` and `Content-Type` are public request headers.
- When the Alma host reports an error, the SDK emits a `RestError` carrying
  the reported `status`, `ok`, `message`, and `error`.

How an empty or non-JSON success body surfaces is unverified. It may arrive
as an error whose `status` is 2xx. Treat a 2xx status as accepted, and confirm
the behavior in the target environment.

```typescript
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { CloudAppRestService, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib';

@Injectable({ providedIn: 'root' })
export class WorkflowApiService {
  constructor(private readonly rest: CloudAppRestService) {}

  run(workflowId: string, payload: object, test = false): Observable<void> {
    return this.rest.call({
      url: `/conf/workflows/${encodeURIComponent(workflowId)}`,
      method: HttpMethod.POST,
      headers: { 'Content-Type': 'application/json' },
      queryParams: { test },
      requestBody: payload,
    }).pipe(
      map(() => undefined),
      catchError(error => isSuccessStatus(error) ? of(undefined) : throwError(() => error)),
    );
  }
}

function isSuccessStatus(error: unknown): boolean {
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status === 'number' && status >= 200 && status < 300;
}
```

Map documented error codes from the `RestError` to user-facing messages
according to the project's error conventions. Do not display raw Alma error
payloads or internal identifiers.

Only pass `test = true` from explicit development configuration. Do not ship
a user-facing test toggle unless the user requests one.

## Webhook contract

LibOW/n8n Webhook node behavior:

- Production URLs contain `/webhook/` and work only while the workflow is
  active.
- Test URLs contain `/webhook-test/` and work only while the editor listens
  for a test event. Never ship a test URL.
- The response mode decides what the app receives: an immediate
  acknowledgement, the last node's output, or the output of a "Respond to
  Webhook" node.
- Allowed origins (CORS) are configured on the Webhook node.

A JSON `POST` with `Content-Type: application/json` or an `Authorization`
header triggers a CORS preflight. The webhook must answer the preflight and
the request for the Cloud App origin. Determine that origin from the `Origin`
request header in browser developer tools, separately for local development
and the deployed app. Keep localhost origins out of the production webhook
configuration.

Long workflows that answer only after the last node can exceed browser or
gateway time limits. Prefer an immediate acknowledgement for long work and
state that the result is accepted, not complete.

## Manifest

A webhook call is a direct browser request, so list the LibOW regional origins
(regions currently available: `na`, `eu`, `ap`):

```json
{
  "contentSecurity": {
    "connectSrc": [
      "https://na-workflows.hosted.exlibrisgroup.com",
      "https://eu-workflows.hosted.exlibrisgroup.com",
      "https://ap-workflows.hosted.exlibrisgroup.com"
    ]
  }
}
```

- `connectSrc` cannot match part of a host label, so a pattern such as
  `https://*-workflows.hosted...` is invalid. List each region.
- Update the list when a region is added. Add origins only, not paths.
- A `libowBaseUrl` outside these origins is blocked by the browser. Reject
  it during validation instead of letting the call fail.
- The API method needs no `connectSrc` entry.
- `connectSrc` does not solve CORS.

## Call the webhook

SDK 2.1.0 registers no HTTP interceptors, so the application's injected
`HttpClient` sends the request unchanged. Build an `HttpClient` from
`HttpBackend` only when the project registers its own interceptors that must
not apply to the webhook.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';

@Injectable({ providedIn: 'root' })
export class WorkflowWebhookService {
  constructor(
    private readonly http: HttpClient,
    private readonly events: CloudAppEventsService,
  ) {}

  call<T>(webhookUrl: string, payload: object): Observable<T> {
    return this.events.getAuthToken().pipe(
      switchMap(jwt => this.http.post<T>(webhookUrl, payload, {
        headers: new HttpHeaders({ Authorization: `Bearer ${jwt}` }),
      })),
    );
  }
}
```

- Use `responseType: 'text'` when the workflow responds with text.
- Build and validate the URL as described in "Build the webhook URL"
  before calling it.
- Always send the `Authorization` header. Do not add an option to omit it.
- Never log, persist, or place the JWT in the URL or payload.

## Required JWT verification

Every webhook workflow called by a Cloud App must verify the Cloud App JWT.
Without it, anyone who reads the webhook URL from the browser can trigger the
workflow with any payload. If the LibOW instance cannot verify the token, use
the Run Workflow API instead or stop and report the blocker.

In the workflow, before any action:

1. Read the bearer token from the `Authorization` header.
2. Verify the RS256 signature with the published public key or the JWKS at
   `https://api-{REGION}.hosted.exlibrisgroup.com/auth/{INST_CODE}/jwks.json`,
   selecting the key by the token's `kid`. Decoding the token is not
   verification.
3. Validate the issuer `https://apps01.ext.exlibrisgroup.com/auth`, the
   app-specific audience `ExlCloudApp:{APP_ID}`, and expiration. Do not
   require `iat`, `nbf`, or `jti`; the token does not carry them.
4. Check that `inst_code` is an expected institution and that `sub` (the Alma
   user primary ID) is permitted to run this workflow. The token has no roles,
   so authorize the user by another means.
5. Reject the request with an error response when any check fails.

Take the signed-in user (the operator, `sub`) and the institution only from
these verified claims. Do not send them in the payload, and ignore any such
fields if received. The payload identifies the target record, for example the
selected user's primary ID. The workflow treats that identifier as untrusted
and checks that the operator may act on it.

The claims follow the public Cloud App Events Service and Authentication Token
documentation (see `alma-cloudapp-api`). Recheck them when building the
workflow. Use the LibOW/n8n JWT authentication or verification capability that
the LibOW instance provides.

A static header value, basic-auth credential, or query token in the Cloud App
is not a secret and does not replace JWT verification.

## Payload design

- Define a local interface for the exact fields the workflow reads.
- Prefer identifiers such as entity type and ID, and let the workflow retrieve
  the current record with its own authorized access.
- Avoid sending complete user records or other personal data unless the
  workflow requires them and the user confirms it.
- Do not include secrets, JWTs, or Alma API keys in the payload.
- Treat the payload as untrusted input in the workflow, including values
  claimed to come from Alma.

Example for a rule-related action. Send what identifies the object and the
operation, not the audit fields:

```typescript
// Preferred
{ action: 'checkGit', rule: { id, name, content } }
// Avoid: whole entity with last_modified_by, dates, and other unused fields
```

Include `content` or other bulky fields only when the workflow cannot fetch
them itself.

## Webhook response contract

Define and document the response shape with the workflow owner before
implementing the call. The app must not depend on free-text output.

```typescript
type WorkflowReply =
  | { status: 'ok'; data?: unknown }
  | { status: 'notFound' }
  | { status: 'error'; code: string };
```

- Use an explicit status and, for errors, a stable code. Do not detect an
  outcome by matching message text such as "not found" in the workflow output.
- Validate the response with a type guard. Treat any other shape as an
  unexpected response, not as success.
- A 2xx status is not success when the contract defines an error body. A write
  that returns `{ status: 'error' }` on a 2xx response is a failure, so check
  the body of a success response as well as the body of an error response.
- Keep the contract in a local interface next to the service and version it
  when the workflow changes.

## Configuration and LibOW base URL

Each customer configures the app on its own. Per target, one parameter is
required:

- API action: `workflowId`.
- Webhook action: `webhookPath`, the identifier after `/webhook/`. Store the
  path, not the full URL. Show an example without the prefix, and reject a
  value that starts with `webhook/` or contains `://`.

When any target uses the webhook action, one app-level parameter,
`libowBaseUrl`, is also required. The administrator enters the institution's
LibOW base URL. Do not ask whether to include it, and do not derive it from a
region, tenant, or undocumented Alma configuration.

Shape for configurable actions. An app with fixed buttons can use flat
`workflowId` and `webhookPath` fields instead:

```typescript
export interface WorkflowActionConfig {
  label: string;
  method: 'api' | 'webhook';
  workflowId?: string;
  webhookPath?: string;
  confirm: boolean;
}

export interface OpenWorkflowsConfig {
  libowBaseUrl?: string; // required when any action uses 'webhook'
  actions: WorkflowActionConfig[];
}
```

- Provide a configuration page for administrators. Declare a route and a
  component, register the component in the module, and set `pages.config` to
  the hash path `/#/<route>` (for example `"/#/config"` for route `config`).
  A bare `"/config"` does not open the page under the starter's hash routing.
- Read the configuration with `CloudAppConfigService.get()`, whose result is
  untyped, and narrow it at the boundary. Administrators edit it on that page.
- Configuration is readable by app users. It must not contain secrets.
- Never hard-code workflow IDs, webhook paths, or hosts.

### Build the webhook URL (webhook only)

1. Read `libowBaseUrl` from the app configuration. When it is blank, the base
   URL is missing and webhook actions stay disabled.
2. Parse it as a URL. Reject a value that cannot be parsed.
3. Strip one trailing `/`, keep any path prefix of the base URL, and build
   `<base>/webhook/<webhookPath>`.
4. Validate that the result is `https:`, has no credentials, and its origin is
   one of the `connectSrc` origins.

Rebuild it when the configuration changes. The API method does not need it.

### Missing configuration

Check before any call. Required values are the selected target's `workflowId`
or `webhookPath`, and for a webhook a valid `libowBaseUrl`.

- Show which values are missing and where an administrator sets them,
  including `libowBaseUrl` for webhook actions.
- Disable the affected action. Do not call the Alma API or the webhook, and do
  not request or send the JWT.
- Treat missing configuration as a state, not a runtime failure, and
  re-evaluate it when the configuration changes.
- Actions with complete configuration may stay available.

## User interface

- Put the trigger UI in its own component with the service injected; the page
  component only hosts it.
- Disable every trigger while one is running, and show progress on the
  running action.
- Confirm actions that change data, naming the record and the effect.
- After API success, say the workflow was started. Do not say it completed
  unless completion is established.
- After a webhook response, display the returned result as untrusted text.
- Call `CloudAppEventsService.refreshPage()` or reload data only after
  completion is known; otherwise offer a refresh action.
- Map each failure to its own recoverable message instead of one generic
  "service unavailable":

  | State | Typical signal |
  |---|---|
  | Not configured | Missing or invalid configuration; no request sent |
  | Token unavailable | `getAuthToken()` fails; no request is sent |
  | Token rejected | HTTP 401 or 403 from the workflow |
  | Timeout | The request exceeded the app's timeout |
  | Network or CORS failure | HTTP status `0` |
  | Workflow-reported error | `status: 'error'` with a known `code` |
  | Unexpected response | A shape outside the response contract |

  For the API method, also map the documented error codes. Offer retry only
  for states where retrying can help.

## Tests

Mock every external boundary:

- API: a `CloudAppRestService` spy returning `of({})`, `of('')`,
  `throwError(() => ({ status: 200, ok: false }))`, and errors with each
  documented code.
- Webhook: `provideHttpClientTesting()` and `HttpTestingController`. For every
  operation, assert the method, URL, body, `Authorization` header, and response
  handling. Cover a status-`0` network or CORS failure.
- `CloudAppEventsService.getAuthToken()` returning a fixture token that is
  not a real JWT.
- Configuration: valid, missing, and invalid entries; a missing, invalid,
  non-`https:`, or credential-bearing `libowBaseUrl`; and an origin outside
  `connectSrc`. Assert that no request is made while
  configuration is missing, and that the URL built from the example shown to
  administrators contains `/webhook/` exactly once.
- Component tests, required in addition to the service tests, with the service
  mocked: when configuration is missing, each affected action is disabled and
  its message is shown; a data-changing action asks for confirmation first; a
  second click while running is ignored; API success says started, not
  completed; a webhook result renders as text; and each failure state shows
  its own message.

## Live validation

- Use an approved non-production Alma environment and a LibOW workflow
  created for testing.
- Before triggering, obtain approval naming the environment, workflow,
  affected scope, expected change, and cleanup.
- Record the response status and body, the Alma data before and after, and
  the workflow execution result.
- For a webhook, confirm the workflow rejects a request with a missing,
  expired, or wrong-audience JWT before taking any action.
- Establish the unverified behaviors: response timing, caller context reaching
  the Alma Trigger node, required Alma roles, and empty-success handling.
- Label conclusions as documentation-derived, SDK-confirmed, live-confirmed,
  or unverified.

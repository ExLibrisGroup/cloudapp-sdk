---
name: alma-cloudapp-open-workflows
description: >-
  Implements Cloud App actions that trigger Library Open Workflows (LibOW),
  the LibOW/n8n-based Ex Libris workflow platform. Use for running a workflow through
  the Alma Run Workflow API, calling a LibOW webhook, choosing between them,
  workflow payloads, connectSrc for a LibOW host, webhook CORS, or verifying
  the Cloud App JWT in a workflow.
---

# Alma Cloud App Library Open Workflows workflow

Baseline: Cloud App SDK 2.1.0 and the public Alma "Run Workflow" operation
documentation retrieved 2026-09-28. Recheck both against the target project and
current documentation.

## Load before editing

This skill decides the trigger method and defines the workflow contract. Load
the owning skill before editing each boundary. Invoke it or read its whole
`SKILL.md`; searching or excerpting part of a file does not count.

| Boundary | Load |
|---|---|
| `manifest.json`, including `pages` and `connectSrc` | `alma-cloudapp-manifest` |
| `CloudAppRestService`, `CloudAppConfigService`, the JWT | `alma-cloudapp-api` |
| Templates, buttons, confirmation, feedback | `alma-cloudapp-ui-ux` |
| User-facing text | `alma-cloudapp-translations` |
| TypeScript, services, components | `alma-cloudapp-code-practices` |
| Specs and mocks | `alma-cloudapp-testing` |
| Final review and approved live evidence | `alma-cloudapp-validation` |

If a listed skill is not installed, apply the equivalent target-repository
guidance. Do not skip a safety boundary.

## Choose the trigger method

| Question | API | Webhook |
|---|---|---|
| Workflow start node | Alma Trigger with "Execute via REST API" | LibOW/n8n Webhook node |
| Transport | `CloudAppRestService` through Alma | Direct browser `HttpClient` request |
| Caller authentication | Alma session of the logged-in user | Required Cloud App JWT verified by the workflow |
| Manifest change | None | `contentSecurity.connectSrc` for the LibOW regional origins |
| CORS | Not applicable | Webhook must allow the Cloud App origin |
| Workflow result returned to the app | Not documented; do not rely on one | Yes, when the workflow responds |

Decision rule:

1. If the UI must display data produced by the workflow, use the webhook.
2. Otherwise, use the API. It is the default.

Do not choose the webhook merely to avoid Alma roles or authentication.

## Before implementation

Do not ask for the workflow ID, the webhook path, or the LibOW host, and never
guess them. Each customer enters the ID, path, and for webhooks the LibOW base
URL in the app's configuration.

Collect and confirm:

- The trigger method and the reason for it.
- For the API: that the workflow is active and starts with an Alma Trigger
  node set to "Execute via REST API".
- The exact payload fields the workflow reads.
- Whether the workflow changes Alma or external data, and its scope.
- What the app should show after success: accepted, completed, or a returned
  result.
- For the webhook: that the workflow verifies the Cloud App JWT before any
  action, the response shape and error codes, and that CORS allows the Cloud
  App origin. Do not implement the webhook call until the JWT check is
  confirmed.

## Rules

- Use `CloudAppRestService` for the Run Workflow API. Never call the Alma API
  gateway, a relative URL, or an API key from browser code.
- Do not hard-code tenant-specific workflow IDs, webhook paths, or LibOW
  URLs. Each customer enters them in the app's configuration, read with
  `CloudAppConfigService`.
- The webhook path is only the identifier after `/webhook/`; the code adds
  `/webhook/`. The configuration hint, README, validation, and URL builder must
  all say so. Show an example without the prefix and reject a value that
  starts with `webhook/` or contains `://`.
- For webhooks, read the LibOW base URL from a required `libowBaseUrl`
  configuration parameter that the administrator enters. Do not derive it from
  undocumented Alma configuration (`reference.md`).
- Validate every required configuration value before use. When one is missing
  or invalid, tell the user what is missing and do not call Alma or LibOW.
- Define the webhook response contract (explicit status and error codes) and
  distinguish failure states in the UI. See `reference.md`.
- Do not leave plan, rebuild, or notes files in the app that contain workflow
  IDs, webhook paths, or LibOW URLs. Keep them out of the project or redact
  them.
- Document every configuration parameter, the manifest origins, the webhook
  contract, and the cause and action for each failure state in the app's
  `README.md` without real IDs or URLs, and update it whenever these change.
- Send only the fields the workflow needs. Prefer identifiers over complete
  Alma records, and avoid unnecessary personal data.
- Treat a webhook URL as public. Everything delivered to the browser is
  user-inspectable, including configuration, headers, and static header
  "secrets".
- When a webhook is used, add the three LibOW regional origins to
  `contentSecurity.connectSrc` (`reference.md`). Add no other origin and no
  wildcard. The API method needs no entry.
- Every webhook call must send the `getAuthToken()` JWT as a bearer token,
  and the workflow must verify it before any action. If the workflow cannot
  verify it, use the API method or stop; do not ship an unauthenticated
  webhook call.
- Treat every webhook payload as untrusted inside the workflow.
- Never ship `test=true` API calls or LibOW/n8n `/webhook-test/` URLs.
- Distinguish "workflow accepted" from "workflow completed" in the UI unless
  completion is established.
- Confirm actions whose workflow changes data before triggering them.
- Prevent duplicate submissions while a trigger is in flight.
- Mock `CloudAppRestService` and `HttpClient` in unit tests; never call a real
  LibOW workflow from a test.
- Triggering a real workflow is a potentially persistent change. Obtain
  approval naming the environment, workflow, affected scope, expected change,
  and cleanup before live validation.

## Workflow

1. Choose the method with the decision rule and record the reason.
2. Collect the inputs above and ask for anything missing, except the workflow
   ID, webhook path, and host.
3. Define a typed payload interface for the exact workflow contract.
4. For the webhook, add the regional origins to `connectSrc`, confirm the
   webhook's allowed origins include the Cloud App origin, and confirm the
   workflow verifies the Cloud App JWT before any action.
5. Add the configuration page: a route, a component registered in the module,
   and `pages.config` set to the hash path `/#/<route>`.
6. Implement triggering in a service and the trigger UI in its own component
   in a workflows feature folder, not inside an existing page component.
7. Implement UI states: idle, confirming, running, accepted or completed,
   failed, and missing configuration.
8. Refresh Alma or reload data only when the result is known to be complete,
   or offer an explicit refresh.
9. Add a spec for every new service and component. Service specs cover each
   operation's request and `Authorization` header, success, empty success,
   documented errors, network or CORS failure, and the configuration logic:
   valid, missing, and invalid values, `libowBaseUrl`, and allowed origins. Component specs cover the disabled
   and explained state when configuration is missing, confirmation,
   duplicate-click prevention, and each error message.
10. Validate with an approved non-production workflow, including rejection of
    a webhook request without a valid JWT, and record evidence.

## Evidence status

- **Documentation-derived:** Run Workflow path, `test` parameter,
  prerequisites, payload forwarding, and error codes.
- **SDK-confirmed (2.1.0):** `CloudAppRestService` strips a leading
  `/almaws/v1`, converts host-reported errors into `RestError` with the
  reported `status`, and neither SDK package registers HTTP interceptors.
- **Unverified:** whether the API returns before or after the workflow
  finishes, which Alma user or institution context reaches the Alma Trigger
  node, the Alma roles required, and how an empty success body surfaces
  through the SDK. Validate these in the target environment before relying on
  them.

## Further detail

Read `reference.md` in this skill directory for the operation contract,
service examples, webhook hardening, configuration, and tests.

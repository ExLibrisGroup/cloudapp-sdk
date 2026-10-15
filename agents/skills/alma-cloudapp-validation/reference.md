# Alma Cloud App validation reference

## Production safety

An authenticated production session is not permission to change production
state. Production validation is observation-only unless the user explicitly
approves a precisely described mutation.

Before loading or interacting with the Cloud App:

1. Inspect initialization, lifecycle hooks, subscriptions, effects, and API
   calls.
2. Identify writes caused by app startup, page entities, page-load events,
   automatic refresh, retries, route entry, or widget loading.
3. Inspect the current OpenAPI operation for every possible state-changing
   call.
4. Define the exact records, users, requests, jobs, configuration, settings, or
   external resources that could change.
5. Ask for approval if any side effect is possible or uncertain.

Do not assume that opening a panel, selecting an entity, navigating Alma,
retrying an operation, or dismissing a dialog is read-only. Application code
may attach a write to those events.

Approval must be scoped to:

- The named environment and institution.
- The exact operation and expected effect.
- The specific record, test object, user, or bounded batch.
- Whether cleanup is included and what cleanup changes.

If the user approves creating test data but not deleting it, do not perform
cleanup. If an unexpected change occurs, stop rather than attempting an
unapproved repair.

## Unit-test boundaries

Mock external dependencies and SDK services. Common test doubles include:

- `CloudAppRestService.call`
- `CloudAppEventsService.entities$`
- `CloudAppEventsService.onPageLoad`
- Settings, configuration, and store methods

Use observable results and errors matching the production call shape.

Also review typing, observable lifetime, concurrency, loading/error states,
accessibility, safe rendering, and application boundary rules.

## Useful live checks

Cloud App Center:

- Visibility and toolbar placement.
- Close another open Alma side pane when it hides the Cloud App Center control.
- A locally served development app is injected through the SDK proxy workflow;
  do not infer that tenant installation or activation is required merely
  because the card is not immediately visible.
- Confirmed application icon, or an explicitly accepted generic fallback, in
  both the app card and opened-app header.
- Available versus activated state.
- Version and beta version.
- Description, author, and links.
- Declared sandbox capabilities.
- Settings, configuration, and help actions.

If the development card is missing or malformed, stop broad DOM exploration.
Check server responsiveness, the root and generated asset manifests, the
installed schema, required fields and types, browser console and network, and
current entity relevance. Repair authored manifest errors and restart the
local workflow before continuing.

Running app:

- Iframe loads successfully.
- The view communicates a clear task, current Alma context, and primary action.
- Custom UI was not introduced where an existing project, SDK, shared,
  Material, or native control satisfies the requirement.
- Initial loading does not flash a false empty or error state.
- Submitting, background refresh, empty, warning, partial-success, error, and
  unavailable states are distinct where relevant.
- Every action provides immediate perceptible feedback and duplicate actions
  are prevented.
- Local work uses local progress rather than blocking unrelated content.
- Recoverable errors preserve user input and provide an actionable next step.
- Success appears only after the responsible service confirms the operation.
- Destructive confirmation names the affected object and consequence.
- Batch results accurately distinguish completed, failed, skipped, and pending
  items.
- Translation and theme initialize.
- Theme-dependent styles follow the active Alma color without hardcoded
  semantic-color regressions.
- Theme tokens and CSS custom properties consumed by application styles exist
  in the installed public styling pipeline and resolve to the intended computed
  values. Hardcoded fallbacks do not conceal missing tokens.
- A materially different supported Alma theme is checked when practical.
- Layout remains usable at narrow width, high zoom, expanded text, and
  right-to-left direction where supported.
- Styling does not depend on private Material/MDC selectors or generated
  `.ng/` files.
- Alma's session language selects the expected runtime catalog.
- English fallback and missing-key behavior are intentional.
- Interpolation placeholders render correctly.
- Right-to-left languages update both text direction and layout.
- Shared components display appropriate translated labels.
- Page entities update after Alma navigation.
- Zero, one, and multiple matching entities produce the confirmed UI behavior.
- List-page validation accounts for every supplied entity or shows an explicit
  selection mechanism; the app does not silently keep only the first match.
- Reordering or changing the current entity updates selection and loaded data
  without misrepresenting the remaining list.
- Stale selections are cleared, revalidated, or visibly identified after Alma
  context changes.
- REST calls carry the expected path, method, query, body, and content type.
- Every Alma operation matches the current OpenAPI contract for parameters,
  media types, response, limits, warnings, and errors.
- The observed response representation contains the fields and shapes consumed
  by the application; XML examples were not assumed to describe JSON.
- Representative live records or objects cover every data category promised by
  the interface, and the rendered values match the response.
- Complete-replacement, XML-only, pagination, stale-data, and partial-result
  behavior is handled where applicable.
- API-key permissions are not presented as logged-in Alma user roles.
- Role conclusions identify whether they are documentation-derived,
  live-confirmed, or unverified.
- Alma API calls use `CloudAppRestService`; no application-authored relative
  network request is present.
- Application code does not access the parent frame, parent document, or Alma
  DOM.
- Direct external calls satisfy both manifest CSP and destination CORS.
- Browser capabilities were checked against the deployed iframe boundary;
  localhost proxy success was not treated as hosted cross-origin proof.
- User-facing errors are visible.
- Refresh, back, and home operations behave as intended.

State-changing checks:

- The source was inspected for automatic writes before the app was opened.
- Production remained observation-only unless a specific mutation was
  approved.
- Approved writes were limited to the named operation, records, and batch size.
- No retry, cleanup, rollback, or follow-up mutation exceeded that approval.
- Unexpected side effects stopped the validation immediately.

Widget:

- Eligibility in Manage Widgets.
- Height and responsive layout.
- Information remains compact and glanceable rather than duplicating the full
  side-pane application.
- Widget menu actions.
- Reload behavior after internal navigation.

## Release-candidate checks

- The working tree contains only intended release changes.
- The public repository URL and owner/repository identity are correct.
- `package.json` and `package-lock.json` are synchronized and committed.
- `npm ci` succeeds without relying on an existing installation.
- Approved `npm audit fix` changes are committed before a second `npm ci`.
- `npm audit --audit-level=critical` reports zero critical vulnerabilities.
- Existing tests and `eca build` succeed from the clean installation.
- `build/` contains expected production assets and no secrets, development
  hosts, private endpoints, or sensitive data.
- The release tag points to the exact commit that passed the preflight.
- The release API inventory covers every method and path, data impact, scope,
  media type, required-role evidence, and validation status.
- The app follows the correct first-publication or update workflow.
- Update webhooks use the exact public endpoint, JSON content type,
  Releases-only events, and Secure Sockets Layer (SSL) verification.
- Beta updates use `-beta` in the tag; the GitHub prerelease flag alone is not
  treated as the deployment selector.
- Publication is confirmed in Alma or by the publication notification rather
  than inferred from webhook delivery.

## Evidence caution

A route, manifest field, enum member, available app card, loaded iframe,
successful build, helper-only test, or one convenient record does not prove
that the complete runtime scenario works. Validate the final rendered or
executed behavior with representative data.

Do not infer behavior for all Alma pages from a single page. Entity metadata is
page-specific and may differ between legacy and newer interfaces.

## Final self-review

Perform this review after the implementation and targeted validation are
finished:

- Re-read the original request and any decisions made during implementation.
- Inspect the final diff and every changed source or configuration file.
- Separate intentional changes from generated output and unrelated existing
  work.
- Trace each acceptance criterion to observable evidence.
- Check that each manifest value the work changed agrees with the code: with
  `useHash: true`, internal `pages.*` values are hash paths (`/#/<route>`) that
  resolve to declared routes, and `connectSrc` and `frameSrc` list exactly the
  origins the code calls or embeds.
- Confirm the owning skill was loaded for every boundary edited. Load any that
  was skipped and re-check that work against it.
- Confirm every new service and component has a spec covering its states and
  failures, and list any that does not.
- Review every domain for a new app.
- For an existing app, review each affected domain and the directly connected
  behavior that could regress.
- Record not-applicable decisions when omission would otherwise be ambiguous.
- Treat missing tests, inaccessible environments, unapproved mutations, and
  unverified runtime assumptions as unresolved evidence rather than success.
- Check that the final report does not overstate prototype, local, mocked,
  documentation-derived, or observation-only evidence.

The review is not a reason to broaden the task. Do not refactor unaffected
areas merely to make the entire application match current preferences.

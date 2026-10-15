---
name: alma-cloudapp-testing
description: >-
  Tests Ex Libris Alma Cloud Apps. Use for Jasmine, Karma, eca test, TestBed,
  component or service tests, typed SDK mocks, RxJS tests, OpenAPI fixtures,
  headless tests, coverage, release test gates, or mutation-safe Playwright
  validation in Alma.
---

# Alma Cloud App testing

Use this skill whenever creating, changing, running, or reviewing tests for an
Alma Cloud App. Combine it with the API, code-practices, UI/UX, translations,
styles, release, and validation skills as applicable.

## Authority and setup

1. Inspect the target project's `package.json`, installed SDK, Angular version,
   test scripts, existing specs, and test configuration.
2. Preserve the existing runner when the project has deliberately migrated
   away from the SDK default.
3. Otherwise use the testing stack supplied by the installed Cloud App SDK.
4. Keep test source under `cloudapp/`; do not make lasting edits in `.ng/`.
5. Run the smallest test selection that covers the change.

For SDK 2.0.2, the generated project uses:

- Jasmine 5.2.
- Karma 6.4.
- Angular's Karma test builder.
- Chrome through `karma-chrome-launcher`.
- `src/**/*.spec.ts` discovery in the generated workspace.

The starter supplies test dependencies and configuration but does not currently
include example spec files.

## Commands

Interactive development:

```text
eca test
```

One-shot headless execution:

```text
eca test --watch=false --browsers=ChromeHeadless
```

Coverage when required by the project:

```text
eca test --watch=false --browsers=ChromeHeadless --code-coverage
```

`eca test` synchronizes project source into `.ng/`, starts the source watcher,
and passes arguments to the Angular test target. It does not run `eca build`,
perform the release security audit, or validate behavior in Alma.

Use `--include` for a targeted spec or glob only when supported by the
installed Angular CLI. Paths are interpreted in the generated Angular
workspace, normally under `src/`.

## What needs a spec

Add a spec in the same change for every new service, component, and
non-trivial function, next to the file it covers. Cover its main states and its
failure paths, not only the success path. At the end of the change, list any
new unit without a spec and say why.

## Test boundaries

Unit and component tests must not:

- Call a real Alma environment.
- Use real API keys, authentication tokens, credentials, customer data, or
  private endpoints.
- Depend on the parent frame, Alma DOM, live network, or development proxy.
- Read or modify generated `.ng/` implementation details.
- Depend on SDK private members.
- Change external-system state.

Mock public boundaries:

- `CloudAppRestService`.
- `CloudAppEventsService`.
- `CloudAppSettingsService`.
- `CloudAppConfigService`.
- `CloudAppStoreService`.
- Translation, dialogs, alerts, routing, and approved external application
  services.

Prefer testing an application-owned service or facade around complex SDK
interactions. Keep mocks focused on the methods and observable behavior used by
the subject.

## Typed test doubles

- Do not add `any`, `spyOn<any>`, or broad type assertions to make a test
  compile.
- Use `jasmine.createSpyObj<T>()`, typed structural test doubles, or focused
  fake classes.
- Use `Subject`, `BehaviorSubject`, or controlled observables for page context,
  entities, progress, cancellation, and delayed results.
- Return realistic observable success and error shapes.
- Keep fixtures minimal but valid for the contract under test.
- Do not copy real institution records into fixtures.

Do not expose a private implementation solely to make it testable. Test public
behavior or extract a focused collaborator when the logic genuinely deserves a
separate unit.

## Alma REST API tests

For each application-owned API operation, cover the relevant cases:

- The expected `CloudAppRestService` method, path, query parameters, headers,
  and request body.
- A minimal valid response derived from the current OpenAPI operation.
- A sanitized live-confirmed response shape when OpenAPI is ambiguous or the
  implementation relies on representation details not established there.
- Authorization, validation, not-found, conflict or stale-record, and service
  failures as applicable.
- Pagination completion, continuation, maximum-page, and cancellation behavior.
- XML parsing and serialization for XML-only operations.
- Complete-resource preservation for replacement `PUT`.
- Warning and override behavior.
- Bounded concurrency, ordering, and partial success for multi-item work.
- IZ, NZ, CZ, institution, library, or record scope where it affects behavior.

API fixtures demonstrate the endpoint contract, not the exact logged-in user
role. Test UI behavior for authorization failures without claiming a role was
verified by a unit test.

## RxJS and lifecycle tests

Test observable behavior rather than operator names or private fields:

- A newer context cancels stale reads when required.
- Ordered writes remain ordered.
- Duplicate submissions are ignored or disabled while one is active.
- Loading state clears after success, failure, and cancellation.
- Component destruction stops long-lived work.
- Page-entity changes clear, preserve, or revalidate state as designed.
- Entity streams cover zero, one, and multiple matching entities, reordered
  entities, and explicit selection changes.
- Retry behavior does not duplicate confirmed writes.
- Partial results remain available when a later item fails.

Avoid arbitrary real-time sleeps. Use the installed framework's controlled
async facilities and explicitly complete test subjects.

## Component and workflow tests

An API-backed new workflow requires component, facade, or service behavior
tests around the SDK boundary. Pure extraction-helper tests are not sufficient
completion evidence.

Cover behavior meaningful to the user:

- Initial loading does not flash a false empty state.
- Ready, empty, submitting, success, warning, partial-success, error, and
  unavailable states are distinguishable where applicable.
- Forms expose validation and preserve recoverable user input.
- Primary actions prevent invalid or duplicate submission.
- Destructive confirmation identifies the object and consequence.
- Success appears only after the mocked responsible service confirms it.
- Errors are translated and actionable without exposing raw payloads.
- Semantic controls, labels, accessible names, focus movement, and status
  announcements are present.
- Context changes do not silently apply actions to stale entities.
- Multiple matching entities are all represented or intentionally selectable;
  tests must fail if production code silently keeps only the first match.
- Browser capabilities cover supported success, unavailable API, and rejected
  permission paths when they are part of the workflow.

Prefer semantic queries and user-visible behavior over incidental CSS classes,
component internals, or large snapshots.

## Translation and style tests

- Test translation keys, interpolation values, fallback, and direction behavior
  when the change depends on them.
- Do not duplicate every locale string in component tests.
- Test style-related state through classes, attributes, or behavior owned by
  the component, not private Angular Material or MDC DOM.
- Do not treat unit tests as proof of contrast, responsive usability, theme
  integration, zoom, or right-to-left visual quality; validate those in the
  browser.

## Coverage

- Follow existing project thresholds and reporting.
- Do not add arbitrary coverage targets as part of an unrelated change.
- Use coverage to find untested behavior, not to justify low-value assertions.
- Prioritize state changes, API boundaries, error recovery, permissions,
  concurrency, and regressions over trivial construction tests.

## Live validation with Playwright MCP

The SDK does not provide a complete end-to-end Alma test harness. Use the
Playwright MCP, never `playwright-cli`, for authorized live validation, not as
a substitute for unit tests.

Before opening or exercising the app:

1. Ask for the target environment, institution, and authentication method when
   they are not already established.
2. Establish whether the environment is production or sandbox.
3. Inspect app startup, subscriptions, page-context handling, retries, and API
   calls for automatic writes.
4. Classify uncertain behavior as potentially state-changing.
5. Treat production as observation-only by default.
6. Obtain explicit, narrowly scoped approval before any action or app load that
   may change persistent state.
7. Derive representative scenarios from the acceptance criteria and verify the
   actual returned representation as well as the rendered outcome.

Approval must identify the environment, operation, affected record or bounded
scope, expected change, and whether cleanup is included. It does not authorize
another record, action, retry, batch, rollback, or cleanup. Stop if an
unexpected side effect occurs.

Use mocks, local tests, or a sandbox for mutation paths whenever practical.

## Release gate

The hosted publication pipeline does not run unit tests. After the final clean
`npm ci`, run the project's release-relevant headless tests before
`eca build`:

```text
npm ci
eca test --watch=false --browsers=ChromeHeadless
eca build
```

Include coverage only when required by project policy. A passing unit suite
does not replace the production build, audit, or approved live validation.

## Documentation drift

The official testing guide remains useful for TestBed concepts and mocking SDK
services, but its examples predate SDK 2 and current Angular:

- Do not copy explicit `any` or `spyOn<any>`.
- Do not copy old routing, animation, or module setup without checking the
  installed Angular version.
- Do not copy weak subscription lifecycle patterns.
- Do not add obsolete lint suppression comments.
- Do not treat a component-construction test as adequate behavior coverage.

## Further detail

Read `reference.md` in this skill directory.

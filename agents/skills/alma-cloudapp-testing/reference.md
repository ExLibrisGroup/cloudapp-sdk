# Alma Cloud App testing reference

## SDK 2.1.0 test pipeline

The public SDK implementation performs these steps for `eca test`:

1. Applies the SDK's Node.js options.
2. Reconstructs and synchronizes the `.ng/` Angular workspace.
3. Starts a watcher that mirrors project-owned changes into `.ng/`.
4. Runs the generated workspace's `npm run --silent test -- <arguments>`.
5. The generated `test` script invokes Angular's `ng test`.
6. The command exits with the Angular test process result.

The generated Angular target uses
`@angular-devkit/build-angular:karma`, `zone.js/testing`,
`tsconfig.spec.json`, application assets, translation files, and generated
styles.

The SDK 2.1.0 starter pins:

| Package | Version |
|---|---|
| `jasmine-core` | `5.2.0` |
| `@types/jasmine` | `5.1.7` |
| `karma` | `6.4.4` |
| `karma-jasmine` | `5.1.0` |
| `karma-chrome-launcher` | `3.2.0` |
| `karma-coverage` | `2.2.1` |

Always inspect the target project because installed versions and an intentionally
different runner override this baseline.

## Source placement

Test discovery includes generated-workspace files matching:

```text
src/**/*.spec.ts
src/**/*.d.ts
```

Developer-owned specs belong in the corresponding location below
`cloudapp/src/`. The CLI synchronizes them into `.ng/src/`. Never fix a test by
editing the generated copy.

## Command behavior

Use:

```text
eca test
```

for interactive watch-mode development.

Use:

```text
eca test --watch=false --browsers=ChromeHeadless
```

for a one-shot local or release check. Arguments after `eca test` are passed to
the Angular test command.

Where the installed Angular CLI supports it, a targeted run can use an
`--include` value relative to the generated Angular workspace:

```text
eca test --watch=false --browsers=ChromeHeadless --include="src/app/example/example.component.spec.ts"
```

Do not assume every historical Angular flag remains valid. Check the installed
Angular CLI when adding a persistent project command.

## Test layering

| Layer | Purpose | External state |
|---|---|---|
| Pure unit | Transformation, validation, state transition, serialization | None |
| Service unit | SDK request construction, response mapping, errors, RxJS behavior | Mocked |
| Component | User-visible states, forms, actions, focus, feedback | Mocked |
| Integration within Angular | Multiple application-owned services/components | Mocked at SDK/external boundary |
| Production build | Compilation, templates, assets, bundling, CSP assembly | None |
| Live Alma validation | Actual iframe, page context, roles, Alma runtime behavior | Observation-only unless approved |

Do not use live Alma as a substitute for deterministic unit tests. Do not claim
that mocked role behavior proves actual Alma authorization.

## Typed SDK doubles

Prefer a typed spy object for methods:

```typescript
const restService = jasmine.createSpyObj<CloudAppRestService>(
  'CloudAppRestService',
  ['call'],
);

restService.call.and.returnValue(of(response));
```

For observable properties, use a typed structural double:

```typescript
const entitiesSubject = new Subject<Entity[]>();
const eventsService: Pick<CloudAppEventsService, 'entities$'> = {
  entities$: entitiesSubject.asObservable(),
};
```

Expand the `Pick` only for public members the subject uses. If a concrete SDK
type is difficult to fake safely, wrap it in an application-owned interface at
the integration boundary rather than weakening test types.

Use `jasmine.createSpyObj` property spies or a focused fake class when a service
combines methods and observable properties.

## REST request assertions

Assert the complete meaningful request:

- SDK-relative path.
- HTTP method.
- Encoded query parameters.
- `Accept` and `Content-Type` where relevant.
- Minimal complete request body.

Do not assert API-key parameters or gateway hosts because Cloud Apps must not
send them.

Build fixture names around behavior:

```text
user-response.json
user-unauthorized-error.json
bib-stale-version-error.xml
analytics-first-page.xml
analytics-final-page.xml
```

Do not use customer exports or screenshots as fixtures. Remove names,
identifiers, barcodes, financial data, and institution details from any
developer-created sample.

## OpenAPI-derived fixtures

The OpenAPI specification is the documented contract, not a complete fixture
generator. For each fixture:

1. Select the exact operation and response status.
2. Follow the declared media type and schema.
3. Include fields needed by the application path under test.
4. Include contract-required fields where known.
5. Add realistic pagination and error metadata when relevant.
6. Keep unrelated data minimal.

Do not generate thousands of unused schema fields or commit real API responses
without sanitization and review.

An OpenAPI success example does not establish Alma user-role behavior. Model
authorization failures separately and validate exact roles in an authorized
environment.

## Error fixtures

Test distinctions among:

- Unauthorized or forbidden.
- Invalid identifier or validation error.
- Not found.
- Stale version or conflict.
- Warning requiring an explicit override decision.
- Rate, queue, timeout, or temporary service failure.
- Malformed or unexpected response.
- Partial batch failure.

Preserve support-useful tracking identifiers in the application error model
when appropriate, but use invented identifiers in fixtures.

## Complete-replacement updates

For an Alma operation documented as swap-all `PUT`, tests should prove that the
application:

1. Retrieves the current resource when required.
2. Preserves fields outside the focused edit.
3. Applies the intended change.
4. Sends the complete required representation.
5. Handles a newer server version without silently overwriting it.

A test that asserts only the changed property can miss destructive field loss.

## XML

- Parse and serialize using the production mechanism.
- Preserve namespaces, attributes, ordering where semantically required, and
  character encoding.
- Test malformed input and an Alma error envelope separately from success XML.
- Compare meaningful XML structure rather than incidental whitespace when the
  format permits it.
- Keep MARC fixtures small while retaining valid leader, control-field, and
  data-field structure needed by the behavior.

## Pagination and concurrency

Test:

- First, middle, and final pages.
- Empty first page.
- Repeated or missing continuation tokens.
- Maximum-page or safety limits.
- Context cancellation during pagination.
- Ordered writes.
- Duplicate-submit suppression.
- A failure after earlier items succeeded.
- Accurate completed, failed, skipped, and pending totals.

Do not test concurrency with arbitrary timeouts. Use controlled subjects,
deferred observables, or the framework's virtual/controlled time facilities.

## Page-entity cardinality

For entity-dependent workflows, emit controlled `entities$` values covering:

- No matching entity.
- One matching entity.
- Multiple matching entities.
- A reordered array representing a changed selection or list state.
- Removal of the selected entity.

Assert the confirmed product behavior: selection, multi-selection, bounded
batch processing, or representation of every entity. Do not write tests that
normalize an accidental `find()` or `[0]` shortcut into expected behavior.

## Components and accessibility

Prefer queries based on role, label, text, or application-owned test ID when a
semantic query is impractical. Avoid selectors tied to private Material DOM.

Test:

- Labels and accessible names.
- Disabled and validation semantics.
- Focus entry and return for application-owned dialogs.
- Status and alert presence.
- Keyboard-triggered application behavior.
- Preservation of form values after recoverable errors.

Unit tests cannot prove visual contrast, responsive usability, focus-ring
visibility, clipping, or text expansion. Use mutation-safe browser validation.

## Translation

Choose the smallest appropriate approach:

- Stub `TranslateService` when translation behavior is unrelated.
- Load a controlled catalog when interpolation, fallback, pluralization, or
  direction is the subject.
- Assert rendered meaning or the expected key contract without coupling every
  component test to a complete production catalog.

Do not hardcode English into production code to simplify tests.

## Live Alma validation

Before using the Playwright MCP:

1. Establish the exact environment and institution.
2. Authenticate through an approved method without requesting secrets in plain
   text.
3. Inspect source for writes triggered by app loading, route entry, page
   entities, subscriptions, retries, refresh, or background work.
4. Treat production as observation-only.
5. Ask for narrowly scoped approval before anything may change.

Persistent state includes Alma records, workflow status, requests, jobs,
institution configuration, per-user settings, browser-local Cloud App data,
activation, widgets, publication state, and external systems.

Approval for a create does not imply approval for cleanup. Approval for one
record does not cover a batch. Stop after an unexpected side effect rather than
attempting an unapproved repair.

## Release sequence

The release test belongs after the final lockfile-based install:

```text
npm ci
npm audit --audit-level=critical
eca test --watch=false --browsers=ChromeHeadless
eca build
```

If `npm audit fix` changes dependency metadata, review and commit it, then
restart the sequence with `npm ci`.

The hosted publication builder does not run the unit suite. A successful hosted
build therefore does not prove the tests passed.

## Official documentation drift

The public testing guide dates from an older Angular generation. Its useful
ideas include TestBed setup, SDK mocking, controlled entity streams, and no
external dependencies.

Translate examples to the installed project:

- Replace explicit `any` and `spyOn<any>` with typed doubles.
- Do not copy obsolete TSLint suppression.
- Check current routing and animation test APIs.
- Bound subscriptions and complete subjects.
- Test error, cancellation, and lifecycle paths in addition to success.
- Prefer behavior assertions over raw `innerText` and incidental DOM shape.

## Sources

- [Testing Cloud Apps](https://developers.exlibrisgroup.com/cloudapps/docs/testing/)
- [Public Cloud App SDK](https://github.com/ExLibrisGroup/cloudapp-sdk)

### Links

- [https://developers.exlibrisgroup.com/cloudapps/docs/testing/](https://developers.exlibrisgroup.com/cloudapps/docs/testing/)
- [https://github.com/ExLibrisGroup/cloudapp-sdk](https://github.com/ExLibrisGroup/cloudapp-sdk)

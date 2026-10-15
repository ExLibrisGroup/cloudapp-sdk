# Alma Cloud App code-practices reference

Baseline: Cloud App SDK 2.0.2, Angular 18.2.x, TypeScript 5.5.x, and RxJS 7.8.x.
The installed project and its local conventions are authoritative.

## Baseline compiler expectations

The SDK 2.0.2 generated workspace enables:

- TypeScript `strict`.
- `noImplicitOverride`.
- `noPropertyAccessFromIndexSignature`.
- `noImplicitReturns`.
- `noFallthroughCasesInSwitch`.
- Angular `strictInjectionParameters`.
- Angular `strictInputAccessModifiers`.
- Angular `strictTemplates`.

Do not weaken these settings to accommodate new code. A project using another
SDK version may differ, so inspect its generated configuration before making
version-specific recommendations.

## SDK examples are not a style specification

The SDK starter demonstrates basic service usage, but it also contains broad
`any` values, assertions, empty lifecycle methods, direct subscriptions, and
hardcoded strings. Treat those as introductory examples, not mandatory coding
patterns.

Application code should improve the typing, lifecycle handling, translation,
and error presentation around the same public SDK calls without modifying the
SDK itself.

## Boundary typing

Keep SDK and external data loose only at the point where it enters the app:

```ts
interface UserSummary {
  primaryId: string;
  fullName: string;
}

function isUserSummary(value: unknown): value is UserSummary {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate['primaryId'] === 'string'
    && typeof candidate['fullName'] === 'string';
}
```

Prefer a focused mapper when the API response is larger than the state the
component needs. Do not expose raw API objects throughout the component tree.

Avoid assertions such as `value as Entity` or `selectedEntity!` when a runtime
guard or nullable-state branch can express the real condition.

## Project organization

Prefer ownership and change locality over a universal directory template.
Files implementing one cohesive workflow and commonly changing together
should remain close together.

For a new app, a useful starting shape can be:

```text
cloudapp/src/app/
  app.component.*
  core/
    alma-context.service.ts
  features/
    record-action/
      record-action.component.*
      record-action.service.ts
      record-action.models.ts
      record-action.component.spec.ts
    record-history/
      record-history.component.*
      version-details/
        version-details.component.*
      version-diff/
        version-diff.component.*
        line-diff.ts
        line-diff.spec.ts
  shared/
    status-message/
      status-message.component.*
```

This is an example, not a required skeleton. Follow a target project's
established coherent convention.

Use these boundaries:

- A feature directory owns a user workflow or domain capability.
- Co-locate its components, styles, tests, models, and focused services when
  they change together.
- When a feature has several components, give each its own subfolder holding
  its `.ts`, template, styles, and spec. Keep logic used by one component
  beside it, and move logic used by several into a named file or folder at the
  feature level. Do not leave several components' files flat in one folder.
- Place a service by its injection scope and consumers, not only by its type:
  - A component-scoped service (listed in the component's `providers`, one
    instance per component) lives in that component's folder.
  - A feature-scoped service (provided by a feature route or feature module,
    or shared by several of its components) lives at the feature level.
  - An app-wide service (`providedIn: 'root'`, or used by more than one
    feature) belongs in `core/` or its own feature, not inside the feature that
    happened to create it.
- Choose the narrowest scope that works. Use component-scoped providers for
  per-view state that must reset with the view; do not make it a root singleton.
- Keep truly app-wide SDK integration or infrastructure separate when multiple
  features depend on it.
- Promote code to `shared/` only after multiple real consumers establish a
  stable, domain-neutral contract.
- Features may depend on shared or core code. Shared code must not import from
  a specific feature.
- Name files and directories for domain responsibility, not vague categories
  such as `misc`, `common`, or `stuff`.

Avoid:

- Large global `components/`, `services/`, or `models/` buckets that scatter
  one workflow across the repository.
- Catch-all `utils.ts`, `helpers.ts`, or oversized application services.
- One-file directories and deeply nested layers with no ownership benefit.
- Wrappers that only forward a call without adding a meaningful boundary.
- Barrel files that hide ownership, expose internals, or create dependency
  cycles.
- Moving unrelated files merely to impose a preferred structure.

Extract or relocate code when the current ownership causes duplication,
coupling, unclear dependencies, or changes that repeatedly span unrelated
areas. Do not reorganize solely for visual symmetry.

## Comments and documentation

Code should normally communicate behavior through naming, types, structure,
and tests. Add a comment when durable reasoning would otherwise be lost.

Useful comments explain:

- An SDK or Alma API behavior that is surprising but verified.
- A security, authorization, mutation-safety, or data-integrity invariant.
- Why a specific RxJS concurrency or lifecycle choice prevents a race.
- A compatibility workaround and the version or condition that requires it.
- Why a simpler-looking implementation is unsafe or incorrect.
- A non-obvious accessibility or template-structure requirement.

Avoid:

- Restating assignments, conditions, loops, method names, or types in English.
- File or section narration that becomes stale as code moves.
- Commented-out code retained as history.
- Temporary debugging notes.
- Comments that compensate for vague names, excessive nesting, or misplaced
  responsibilities.
- Mechanical JSDoc on every class, method, property, or interface.
- Suppression comments without the narrow reason and scope.

Use JSDoc for a public or reusable contract when its side effects, thrown
errors, lifecycle, ordering, mutation behavior, or invariants are not clear
from its types. Describe the contract rather than its implementation.

Use HTML template comments sparingly. They are appropriate for a non-obvious
structural, rendering, or accessibility reason, not for labeling every visual
section.

Prefer a tracked work item over a `TODO`. When project conventions permit a
necessary `TODO`, make the remaining work and reason specific and reference the
tracking item. Remove the comment when the tracked condition is resolved.

When behavior changes, update or delete its comments in the same change. An
outdated comment is a defect because it can override correct understanding of
the implementation.

## Project README

Create a root `README.md` when the app is created, replacing any scaffold
default. Write it for a developer taking over the app and for the administrator
who installs and configures it. Use these sections in this order, and omit one
only when it clearly does not apply:

1. **Purpose:** what the app does and the user-visible actions it provides.
2. **Prerequisites:** the Alma roles needed to use and to configure the app,
   the page contexts or entity types it supports, and any external services
   such as Library Open Workflows (LibOW/n8n) workflows. Say so when a role
   requirement is unverified.
3. **Setup, build, and test:** install, run, build, and test commands, using
   the commands the project actually defines (for example `npm start`,
   `eca build`, and `eca test`).
4. **Configuration:** a table of every parameter with its meaning, whether it
   is required, who sets it, and the behavior when it is missing.
5. **Manifest settings:** settings that need explanation, such as `connectSrc`
   origins, page paths, and restrictions, and why each exists.
6. **Using the app:** instructions for each screen and action.
7. **Troubleshooting:** a table with one row per user-facing error or empty
   state: what the user sees, the likely cause, and what to do.

Do not include credentials, production or customer URLs, customer data, or
plans and scratch notes. Use placeholders for environment-specific values.

Keep the README accurate. Update it in the same change as any change that
affects it: configuration parameters, manifest settings, roles or
prerequisites, commands, behavior or screens, error states, external service
contracts, or dependency requirements. Before finishing any change, check
whether the README is affected and correct it. A stale README is a defect.

## Component and service responsibilities

A component should normally own:

- View state.
- Form interaction.
- Presentation-oriented observable composition.
- Calling a focused service in response to user actions.

A service should normally own:

- Reusable Cloud App SDK interactions.
- External backend calls.
- Mapping transport data into application models.
- Shared state with a clearly defined lifetime.
- Business operations used by more than one component.

Do not move every method into a service. Local display transformations can
remain in the component when they are simple and not reused.

## Template and component boundaries

Split by responsibility and ownership, not file length. A useful child
component should reduce what the parent must understand or coordinate.

Extraction signals include:

- A region has its own user goal, form, interaction sequence, validation,
  loading, empty, error, or accessibility behavior.
- Structural directives are deeply nested or repeat the same decision shape.
- Interactive markup and behavior repeat with a stable data contract.
- A region depends on a coherent subset of state but the parent exposes many
  unrelated fields and handlers to support it.
- The parent coordinates focus, selection, progress, or recovery details that
  naturally belong to the region.
- The region can be named for a domain responsibility rather than `left`,
  `top`, `section`, or another visual position.

Keep markup local when it is small, appears once, is tightly coupled to the
parent workflow, and has no useful independent contract. Do not replace one
readability problem with prop drilling, chains of forwarded events, duplicated
state, or components that contain markup but no responsibility.

Choose the smallest fitting boundary:

- Child component for a cohesive UI responsibility.
- Directive for reusable element behavior.
- Pipe or focused typed function for a pure transformation.
- `ng-template` for a small local presentation variant.
- Service for reusable integration, business operations, or shared state, not
  merely to shorten a component class.

After extraction, the parent should read as workflow composition and the child
should own the details its name implies.

## UI selection reference

Search the target application before searching dependencies. Existing
project-owned UI usually carries application-specific translations,
accessibility behavior, styling, loading states, and tests that a replacement
would otherwise need to reproduce.

For SDK 2.0.2, inspect these public facilities before creating equivalents:

| Package | Facilities |
|---|---|
| `@exlibris/eca-components` | Single- and multiple-entity selection, autocomplete, confirmation dialogs, alert dialogs, prompt dialogs, and custom prompt-dialog support |
| `@exlibris/exl-cloudapp-angular-lib` | Alerts, menus, menu items, Material module exports, and `FormGroupUtil` |
| Angular Material | Buttons, form fields, inputs, selection controls, dialogs, cards, progress indicators, tables, tooltips, and other standard controls available in the installed version |

This inventory is version-specific. Inspect the installed package's public
exports, inputs, outputs, and types before using a facility.

### Reuse decision

Reuse an existing facility when it satisfies the required:

- Data and event contract.
- Keyboard and focus behavior.
- Translation needs.
- Loading and error presentation.
- Side-pane, fullscreen, dialog, or widget layout.
- Supported SDK and Angular versions.

Do not fork or copy a shared component solely to alter spacing, color, or
typography. Prefer supported configuration, content projection, composition,
and project styling.

Create custom UI only when a documented requirement cannot be met by the
existing options. Examples can include an incompatible data contract, missing
interaction behavior, an accessibility defect that cannot be corrected through
composition, or a layout the existing component does not support.

When custom UI is necessary:

1. Record why each higher-priority option was unsuitable.
2. Build on Angular Material or semantic native elements where possible.
3. Match project translation, validation, loading, and error conventions.
4. Add focused tests for the behavior that required customization.
5. Do not import private package paths or copy undocumented package internals.

## Observable composition

Choose flattening operators intentionally:

| Requirement | Typical operator |
|---|---|
| Cancel stale page/entity lookup | `switchMap` |
| Preserve ordered writes | `concatMap` |
| Ignore repeated submit clicks while active | `exhaustMap` |
| Run independent bounded work | `mergeMap` with explicit concurrency |

Avoid:

```ts
source$.subscribe(value => {
  this.service.load(value).subscribe(result => {
    this.result = result;
  });
});
```

Prefer a composed pipeline whose loading and error behavior is visible in one
place. Use the template `async` pipe when no imperative side effect is needed.

When an explicit subscription is required, verify whether the source completes
on its own. Bound long-lived streams using `takeUntilDestroyed` when available
and established in the project, or the repository's existing destruction
pattern.

## Loading and race conditions

A single boolean is sufficient only when one operation can be active. Use
separate state when initialization and submission can overlap.

- Set loading before the operation starts.
- Restore it for success, error, and cancellation.
- Disable the initiating action where duplicate work is unsafe.
- Decide whether a new action cancels, queues, ignores, or runs alongside the
  current action.
- Do not leave stale data presented as the result of a newer selection.

## Error boundaries

For `CloudAppRestService`, handle the public error shape supported by the
installed SDK. Convert it into a translated application message close to the
user interaction.

Do not expose raw API bodies, stack traces, internal URLs, tokens, or record
data in an alert. Do not discard diagnostic context when the project has a
safe logging facility.

An empty state and an error state are different. Do not use `catchError(() =>
of([]))` unless the product intentionally defines failure as an empty result
and still communicates the failure appropriately.

## Forms

For a non-trivial edit or configuration form:

- Use reactive forms.
- Type controls where the installed Angular version supports it.
- Normalize values at submission boundaries.
- Keep server errors separate from field validation errors.
- Mark fields touched only when useful to the interaction.
- Prevent submission while invalid or already submitting.
- Preserve unsaved user input after recoverable failures.

Use `FormGroupUtil` only after checking its current public behavior and whether
it matches the form's needs.

## Accessibility review

Check:

1. Heading order and landmarks.
2. Labels, descriptions, and error associations.
3. Keyboard activation for every action.
4. Visible focus and sensible focus movement.
5. Dialog initial focus and return focus.
6. Loading announcements and disabled-state clarity.
7. Contrast and non-color status indicators.
8. Zoom, narrow side-pane width, fullscreen, and widget layout.
9. Left-to-right and right-to-left direction where supported.

Angular Material improves baseline behavior but does not make a composed
workflow automatically accessible.

## Safe rendering

- Prefer interpolation, which Angular escapes by default.
- Avoid `[innerHTML]` for external or record-sourced content.
- Never use `DomSanitizer.bypassSecurityTrust*` merely to suppress a security
  error.
- Validate external navigation destinations before opening them.
- Add iframe and popup permissions only through the least-privilege manifest
  workflow.

## Unit tests

Use the project's configured Jasmine/Karma setup unless it already uses another
runner. Do not introduce a new runner solely for one change.

Mock the public boundary:

- `CloudAppRestService.call`.
- `CloudAppEventsService` methods and `entities$`.
- Settings, configuration, and store services.
- `TranslateService` where translation behavior itself is not under test.
- External application services.

Useful assertions include:

- The SDK service receives the correct typed request.
- Loading state is restored after success and error.
- Repeated actions follow the intended cancellation or ordering rule.
- Errors are presented through the app's translated feedback mechanism.
- State-changing controls are disabled when prerequisites are absent.
- Component destruction stops long-lived work.

Avoid tests that depend on SDK private members, generated `.ng/` files, real
Alma authentication, or exact DOM structure unrelated to behavior.

## Review checklist

- Feature files that change together remain close together.
- Shared code has multiple genuine consumers and no feature-specific
  dependency.
- No new generic dumping ground, catch-all service, or forwarding-only layer
  was introduced.
- Folder depth and barrel exports do not obscure ownership or create cycles.
- Structural changes are necessary for the requested work.
- Comments explain durable, non-obvious reasoning rather than narrating code.
- JSDoc is limited to contracts that types and naming do not fully express.
- No stale, debugging, commented-out, or vague TODO content remains.
- Comments affected by the change still match the implementation.
- The root `README.md` exists and still matches configuration, manifest,
  prerequisites, commands, and behavior after this change.
- Existing project, SDK, shared, Material, and native UI options were checked
  before custom UI was introduced.
- Parent templates describe workflow composition without unrelated detail.
- Extracted components have cohesive responsibilities and narrow contracts.
- Repeated interactive markup is implemented once where practical.
- Structural nesting remains understandable.
- Components were not created solely to reduce file length.
- Modularization reduced coupling rather than relocating complexity.
- A custom control has a concrete requirement that existing facilities cannot
  satisfy.
- No new `any`, unjustified assertion, or non-null assertion.
- No application-authored relative network request.
- No parent-frame, parent-document, or Alma DOM access.
- Alma operations use the supplied SDK services.
- External URLs are absolute, permitted by CSP, and compatible with CORS.
- User-facing text is translated.
- Observable lifetime and concurrency are intentional.
- Loading, empty, success, and error states are distinguishable.
- Forms prevent invalid or duplicate submission.
- Rendering does not bypass Angular security.
- Controls are keyboard- and screen-reader-usable.
- SDK services and external boundaries are mocked in unit tests.
- The smallest relevant existing test or build command passes.

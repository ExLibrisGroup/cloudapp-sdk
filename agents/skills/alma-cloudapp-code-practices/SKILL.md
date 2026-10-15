---
name: alma-cloudapp-code-practices
description: >-
  Applies code-quality practices to Ex Libris Alma Cloud Apps. Use when
  creating, changing, reviewing, or refactoring Angular and TypeScript code,
  including components, typing, RxJS, forms, errors, accessibility, security,
  tests, loading states, or maintainability.
---

# Alma Cloud App code practices

Use this skill for application-code changes. Add only the domain skill needed
for the current implementation slice. Read `reference.md` when detailed
boundary typing, component selection, RxJS, forms, accessibility, or review
examples are needed.

## Workflow

1. Inspect installed Angular, TypeScript, RxJS, and Cloud App SDK versions,
   compiler settings, nearby code, tests, and current changes.
2. Preserve the project's NgModule or standalone architecture and existing
   conventions unless migration was requested.
3. Search for existing components, services, utilities, models, translations,
   and test helpers.
4. Make the smallest complete change that satisfies observable acceptance
   criteria.
5. Review the final changed files and run the smallest relevant validation.

Do not copy SDK starter or public tutorial code without checking it against the
installed versions.

## Project organization

Preserve a coherent existing structure. For new or growing apps, organize
primarily by feature or user workflow and co-locate files that implement and
change with that feature.

When a feature contains more than one component, give each component its own
subfolder with its template, styles, and spec, so one unit's files are not
interleaved with another's in a flat folder.

Promote code to a shared or app-wide area only when it has multiple genuine
consumers and a stable contract. Keep dependency direction clear: features may
depend on shared infrastructure, but shared code must not depend on individual
features.

Avoid global technical dumping grounds, generic utility files, one-file
directory layers, excessive folder depth, and layers that only forward calls.
Do not perform a broad structural reorganization as part of an unrelated
change.

## Comments and documentation

Prefer clear names, focused functions, and sensible structure over comments.
Comment why a non-obvious constraint, tradeoff, workaround, safety rule, or
lifecycle decision exists; do not narrate what the code already states.

Keep comments concise, local, and synchronized with behavior. Remove stale
notes, debugging comments, and commented-out code. Use JSDoc only when a public
or reusable contract has side effects, errors, invariants, or lifecycle
requirements that types and naming do not make clear.

Do not add mechanical JSDoc, redundant type descriptions, or vague `TODO`
comments. Track substantial future work through the project's normal work-item
process.

## Project README

Every app has a root `README.md` for its developers and administrators. Create
it with the app and keep it current: any change that affects its content must
update it in the same change.

Use these sections in order: Purpose; Prerequisites (including the Alma roles
needed to use and to configure the app, or a statement that they are
unverified); Setup, build, and test; Configuration; Manifest settings; Using
the app; Troubleshooting (one row per user-facing error or empty state). Read
`reference.md` for what each section contains.

## Type and structure rules

- Preserve strict TypeScript and Angular template checking.
- Do not add explicit `any`, unjustified assertions, non-null assertions, or
  weakened compiler settings. Narrow SDK and external values at application
  boundaries.
- Model repeated state, response, and form shapes with precise types.
- Keep components focused on presentation and interaction. Put reusable
  integration, state, and transformation logic in focused services or
  utilities.
- Keep templates declarative and avoid significant constructor work.
- Do not create abstractions for a single trivial use or perform an
  unrequested Angular architecture migration.

## Template and component boundaries

Keep templates readable as descriptions of the current view. Extract a child
component when a section has a cohesive responsibility, a meaningful
input/output contract, or its own interaction, form, loading, error, or
accessibility behavior.

Consider extraction for independent UI regions, deeply nested or repeated
conditions, repeated interactive markup, or sections that require many
unrelated parent fields to understand. The section should be nameable by its
responsibility rather than only its visual position.

Do not extract solely because a template exceeds an arbitrary line count. Keep
small, single-use, tightly coupled markup local. Avoid child components that
only relocate markup while adding excessive inputs, output forwarding, shared
mutable state, or more navigation between files.

## Reuse and interface behavior

Choose UI in this order:

1. Existing project facility.
2. Installed Cloud App SDK or `@exlibris/eca-components`.
3. Angular Material.
4. Semantic native HTML.
5. Focused custom UI for a concrete unmet requirement.

Do not recreate a control merely for different styling or depend on private
shared-component internals. Use the UI/UX and styles skills for workflow,
feedback, accessibility, theming, and responsive visual decisions.

## RxJS, forms, and errors

- Prefer observable composition and the `async` pipe; avoid nested
  subscriptions and bound long-lived work.
- Choose cancellation, ordering, and duplicate-prevention behavior
  deliberately. Do not allow stale requests or retries to duplicate writes.
- Represent loading, empty, submitting, success, partial-success, and error
  states distinctly when applicable.
- Prefer typed reactive forms for non-trivial input. Prevent invalid or
  duplicate submission and preserve recoverable input.
- Handle failures at the relevant boundary with translated, actionable
  feedback. Do not add broad catches, silent returns, or success-shaped
  fallback data.
- Never log credentials, authorization values, sensitive records, or customer
  configuration.

## Security and accessibility

- Use supplied Cloud App services for Alma APIs and host operations.
- Do not add relative application requests, parent-frame or Alma DOM access,
  unsafe HTML rendering, security bypasses, or secrets in browser code.
- Use semantic controls, labels, keyboard operation, visible focus, logical tab
  order, focus management, and accessible dynamic status.
- Validate the side pane and each supported fullscreen, widget, zoom, and
  right-to-left surface through the owning skills.

## Tests and generated code

- Mock SDK and external boundaries; unit tests must not call Alma or use real
  credentials or customer data.
- Use the testing skill for typed doubles, fixtures, runner behavior, and
  detailed coverage.
- Test user-visible behavior and relevant success, loading, empty,
  authorization, stale-data, duplicate-action, partial-success, and error
  paths.
- Keep lasting changes out of `.ng/` and avoid dependencies for behavior
  already supplied by the project, Angular, RxJS, or the Cloud App SDK.

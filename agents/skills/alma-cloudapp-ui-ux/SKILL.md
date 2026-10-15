---
name: alma-cloudapp-ui-ux
description: >-
  Designs and reviews user experience for Ex Libris Alma Cloud Apps. Use for
  workflows, information architecture, action hierarchy, navigation, visual
  feedback, loading, empty, success, warning, error, confirmation, partial
  results, side-pane, fullscreen, widget, accessibility, or usability work.
---

# Alma Cloud App UI and UX

Use this skill whenever a change affects how users understand, navigate, or
complete a task in a Cloud App. Combine it with the code-practices, styles,
translations, API, and validation skills as applicable.

## Product context

- Design the app as a focused extension inside Alma, not as an unrelated
  standalone website.
- Minimize interruption to the user's current Alma task.
- Use current-page entities and metadata only when they provide clear value.
- Treat the narrow side pane as the default design constraint.
- Use fullscreen only when the task genuinely needs additional working space.
- Design widgets as compact, glanceable experiences rather than copies of the
  side-pane application.
- Preserve established interaction patterns from the target project, installed
  Cloud App packages, and Angular Material.

## Workflow design

1. Identify the user's goal, current Alma context, required input, and expected
   outcome.
2. Define the initial, loading, ready, empty, submitting, success, warning,
   partial-success, error, and unavailable states that can occur.
3. Make the primary action and its consequence clear in each state.
4. Keep the task short and use progressive disclosure for advanced or
   infrequent options.
5. Preserve user-entered data through recoverable validation, network, and
   service errors.
6. Decide how the interface responds when Alma page context changes.
7. Reuse existing UI before creating custom interaction patterns.
8. Validate the complete task in the surfaces and Alma context where it will
   run.

For an asynchronous entity-dependent workflow, use an explicit mutually
exclusive state model. A failed request must not fall through to the successful
empty state merely because the result collection is empty.

## Information architecture and actions

- Give each view a clear purpose and recognizable heading.
- Prefer shallow navigation and avoid recreating a full application shell
  inside the Cloud App.
- Present one clear primary action per state.
- Keep secondary actions visually subordinate and separate destructive
  actions from routine actions.
- Use explicit action labels such as `Delete set`, not generic labels such as
  `OK`, when consequences matter.
- Disable an action only when the reason is apparent or communicated nearby.
- Prevent duplicate submission while an operation is in progress.
- Avoid icon-only actions unless the icon is widely understood and the control
  has an accessible name and tooltip where useful.
- Do not hide essential actions behind hover-only interactions.

## Visual feedback

- Give immediate perceptible feedback for every user action.
- Use local progress indicators for work that affects only part of the view.
- Use a blocking loading state only when the entire surface is genuinely
  unavailable, and prevent interaction with obscured controls.
- Distinguish initial loading from form submission and background refresh.
- Use determinate progress when meaningful progress is available; otherwise
  use an indeterminate indicator without implying a completion percentage.
- Use SDK alert facilities for suitable transient application-level feedback.
- Keep validation and actionable errors near the affected control or workflow.
- Announce dynamic status accessibly; do not rely on color, animation, or an
  icon alone.
- Do not show success until the responsible Alma or external service confirms
  the operation.
- After a successful Alma state change, refresh or reconcile relevant page
  context through supplied Cloud App services.

## Empty, unavailable, and error states

Distinguish these conditions instead of presenting all of them as an empty
list:

- First use or no data created yet.
- No results for the current filters.
- No relevant entity on the current Alma page.
- Insufficient permission or missing configuration.
- Temporarily unavailable service.
- Failed request.
- Partial results with individual failures.

Explain what happened in user language and provide a useful next action when
one exists. Do not expose translation keys, raw transport responses, stack
traces, internal identifiers, or confidential configuration.

Keep recoverable request failures visible until the user changes context,
retries, or dismisses them intentionally. A transient alert alone is not an
adequate recovery state.

Optional page context must degrade gracefully. If the task can continue
without it, explain the limitation without blocking unrelated functionality.

## Confirmation and consequential changes

- Confirm destructive, irreversible, broad-impact, or difficult-to-review
  actions.
- Do not add confirmation dialogs to harmless or easily reversible actions.
- Name the affected object and consequence in the dialog.
- Use explicit confirm and cancel labels.
- Focus the safest appropriate action initially.
- Preserve focus context when the dialog closes.
- Never perform a state-changing operation merely to validate its UI without
  explicit approval.

## Long-running and multi-result operations

- Show progress and current status when the operation takes perceptible time.
- Define whether cancellation is supported and what cancellation means.
- Do not discard completed results when a later item fails.
- Summarize completed, failed, skipped, and pending work accurately.
- Keep individual failures inspectable and actionable.
- Preserve results long enough for the user to review or copy them.
- Do not imply atomic success when the underlying operation can partially
  succeed.

## Navigation and Alma context

- Use `CloudAppEventsService.back()`, `home()`, and `refreshPage()` for
  supported Alma navigation behavior.
- Never manipulate Alma navigation, the parent frame, or the parent document
  directly.
- React to relevant page and entity changes rather than assuming initialization
  context remains current.
- Clear, revalidate, or visibly mark stale selections when Alma context
  changes.
- Define zero, one, and multiple-entity presentation separately. On list pages,
  show an appropriate single selector, multiple selector, bounded result list,
  or explicit selected-entity state rather than silently displaying the first
  entity.
- If multiple entities trigger API work, show scope and count before loading or
  acting, keep concurrency bounded, and represent per-entity progress and
  failures.
- Do not silently apply an action to an entity different from the one the user
  reviewed.
- Avoid trapping the user in unnecessary internal navigation.

## Accessibility and internationalization

- Support keyboard operation, logical focus order, visible focus, and
  appropriate focus movement after dialogs or major view changes.
- Use semantic controls, programmatic labels, field instructions, and
  associated validation messages.
- Make loading and status changes perceivable to assistive technology without
  producing excessive announcements.
- Support zoom, text expansion, narrow widths, touch targets, contrast, and
  reduced motion.
- Use concise translated text and avoid constructing sentences from translated
  fragments.
- Allow labels and user data to wrap.
- Use logical layout and action ordering that remain understandable in
  right-to-left languages.

## Shared UI and documentation drift

Select UI in this order:

1. Existing target-project component or pattern.
2. Installed Cloud App SDK or `@exlibris/eca-components`.
3. Angular Material.
4. Semantic native HTML.
5. Focused custom UI for a concrete unmet requirement.

Public style-guide examples may target obsolete SDK and Angular versions.
Preserve their user-experience intent, but do not copy patterns such as:

- Clickable `<i>` elements instead of semantic buttons.
- Obsolete Angular `entryComponents`.
- Inline application styles or fixed footer recipes without responsive review.
- Direct body zoom manipulation.
- Custom dialogs or alerts when current shared facilities satisfy the need.
- Outdated alert timing assumptions.

Check the installed SDK and current project before choosing an implementation.

## Validation

- Validate the task, not only the presence of controls.
- Use the Playwright MCP, never `playwright-cli`, for live browser validation.
- Ask for the target Alma environment, institution, and approved access method
  when they are not already known.
- Test realistic success, empty, error, permission, and context-change paths.
- Validate side-pane, fullscreen, and widget behavior separately when
  supported.
- Do not mutate Alma state without explicit approval.

## Further detail

Read `reference.md` in this skill directory.

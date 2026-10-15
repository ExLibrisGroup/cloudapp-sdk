# Alma Cloud App UI and UX reference

## Design posture

A Cloud App runs within an Alma workflow and has less space, attention, and
navigation independence than a standalone application. Good design helps the
user complete a related task without losing confidence about:

- Which Alma record or entity is in scope.
- What information the app needs.
- Whether an operation is still running.
- What changed and where the result was saved.
- What can be retried or corrected after a failure.

Do not reproduce Alma screens or navigation merely for familiarity. Use the
public Cloud App services to obtain context and perform supported operations,
then present only the controls required for the app's task.

## Page structure

Structure each routed view as a small, coherent document:

- Use a clear page-level heading and a logical heading hierarchy; do not use
  headings only for visual styling.
- Use `main`, `nav`, `section`, `form`, and other semantic elements when they
  describe real structure, without adding redundant landmarks or wrappers.
- Give meaningful sections headings and group related form controls with
  `fieldset` and `legend` when appropriate.
- Keep instructions, validation, status, and actions close to the content they
  describe.
- Keep source order aligned with reading, visual, and keyboard order.
- After a major route or view change, move focus to the appropriate heading or
  task starting point.

Avoid deeply nested generic containers, but do not split a simple page into
empty wrappers or meaningless sections.

## Surface characteristics

### Side pane

Treat the side pane as the primary surface:

- Put the purpose, current context, and primary action near the start.
- Prefer a single column.
- Avoid wide tables, dense toolbars, and persistent horizontal scrolling.
- Collapse advanced options without hiding required information.
- Keep important feedback visible without covering unrelated content.

The current Alma implementation opens the floating side pane at 450 CSS pixels.
The Cloud App container applies 30 pixels of horizontal padding on each side,
leaving an iframe content width of approximately 390 pixels. Height uses the
remaining viewport below Alma controls and is not fixed. Treat these dimensions
as current implementation evidence, not a stable public contract; keep the
layout responsive and validate it in the target environment.

### Fullscreen

Fullscreen is appropriate for tasks that need comparison, larger result sets,
complex editing, or sustained work. It is not a substitute for making a simple
side-pane workflow concise. Preserve a clear route back to the app's starting
state and Alma context.

Choose manifest behavior deliberately:

- Use `fullscreen.allow: false` when the workflow fits naturally in the side
  pane.
- Use `allow: true, open: false` when expansion is useful but optional.
- Use `allow: true, open: true` only when the primary workflow genuinely
  requires additional width.

Expanded mode uses the available Alma application width, not browser
fullscreen. When expansion is allowed, keep both modes usable and constrain
text and controls rather than stretching them across all available space.

### Widget

A widget should be glanceable and useful at its configured height:

- Lead with status, a small summary, or a focused action.
- Avoid duplicating the full app.
- Handle reload and stale data explicitly.
- Keep navigation and menu actions usable at the widget's actual dimensions.

## State model

Define states before implementing a workflow. A typical state model includes:

| State | Expected presentation |
|---|---|
| Initial loading | Identifies that data is loading without flashing a false empty state |
| Ready | Shows current context, available content, and the appropriate primary action |
| Empty | Explains why content is absent and offers a relevant next action |
| Submitting | Locks or guards the submitted action and shows operation-specific progress |
| Background refresh | Keeps usable content visible while indicating that it is being refreshed |
| Success | Confirms the completed outcome after the responsible service confirms it |
| Warning | Explains a recoverable risk or incomplete prerequisite without presenting failure |
| Partial success | Summarizes successful and failed items separately |
| Error | States what failed, preserves recoverable work, and provides retry or correction |
| Unavailable | Distinguishes permission, configuration, context, and service availability problems |

Avoid deriving the user experience from a few independent booleans when they
can produce contradictory states, such as an empty-state message beneath a
loading overlay. An asynchronous entity-dependent request warrants a typed,
mutually exclusive state when independent booleans could allow failure to
render as empty or ready.

## Feedback selection

Choose feedback according to scope and duration:

| Situation | Preferred feedback |
|---|---|
| Invalid field | Associated inline validation |
| Failed form or operation | Actionable message near the workflow, optionally reinforced by an alert |
| Brief confirmed success | SDK alert when transient feedback is sufficient |
| Result requiring review | Persistent inline result or summary |
| Local asynchronous work | Indicator next to the affected section or action |
| Whole view unavailable | Page-level loading or unavailable state |
| Destructive decision | Confirmation dialog before execution |
| Partial batch result | Persistent summary plus inspectable item failures |

Transient alerts must not be the only location for information the user needs
to complete or recover a task. Do not use a modal dialog merely to report
routine success.

## Error content

An actionable error normally answers:

1. What could not be completed.
2. What remains unchanged or may have partially changed.
3. What the user can do next.

Prefer `The selected records could not be updated. Review the failed items and
try again.` over raw HTTP status text. Preserve diagnostic detail through an
approved mechanism, but do not expose confidential data, stack traces, or
transport payloads in the interface.

Do not collapse permission, configuration, missing context, no results, and
service failure into the same generic message. They require different actions.

## Context-sensitive behavior

Entity-dependent workflows must account for Alma navigation:

- Show which entity or record will be affected before a consequential action.
- Treat no entity, one entity, and multiple entities as different input states.
- Decide whether multiple entities require single selection, multiple
  selection, bounded batch processing, or a read-only list before designing
  the ready state.
- Subscribe to the supported context stream for as long as the view needs it.
- Cancel stale reads when a newer context supersedes them.
- Revalidate selected data when the page entity changes.
- Do not equate the first matching array element with an intentional selection
  unless the target page behavior and product requirement establish that
  contract.
- Preserve unrelated form work when safe, but never silently submit it against
  a different entity.
- Explain when the current Alma page does not supply a supported entity.

If context is optional, continue with the non-contextual workflow when possible.
If it is required, present a specific unavailable state rather than an empty
result.

## Forms

- Ask only for information required for the operation.
- Use defaults only when they are safe and understandable.
- Place instructions before the relevant control and validation feedback next
  to it.
- Preserve valid values after recoverable errors.
- Move focus to the first invalid control after a failed submission when that
  improves recovery.
- Indicate required fields programmatically and visually without relying on
  color alone.
- Keep the primary submit action stable and prevent duplicate requests.

Use institution configuration, per-user settings, and local store according to
their intended SDK scope. Do not use browser-local persistence for data that
users expect to follow them between browsers or institutions.

## Confirmation design

A confirmation dialog should state the object and consequence:

- Title: `Delete saved search`
- Body: `Delete "Overdue acquisitions"? This cannot be undone.`
- Cancel: `Keep saved search`
- Confirm: `Delete saved search`

Generic titles such as `Confirm`, vague body text, and `Yes`/`No` actions make
consequences harder to review. Prefer the least destructive reasonable action
for initial focus.

## Long-running and batch work

For batch operations, model each item's outcome rather than reporting only a
single global success flag. The summary should remain accurate if processing
stops early, is cancelled, or partially fails.

If cancellation is available, state whether it:

- Prevents only pending work.
- Attempts to cancel the active request.
- Leaves completed changes in place.

Never promise rollback unless the responsible service provides that guarantee.

## Accessibility review

Check:

- Every interactive element is reachable and operable by keyboard.
- Focus is visible and not hidden behind overlays.
- Dialog focus enters, remains within, and returns appropriately.
- Dynamic status is announced with suitable live-region behavior.
- Status is not communicated by color or motion alone.
- Icon controls have accessible names.
- Touch targets and spacing remain usable.
- Content remains understandable at browser zoom and with text expansion.
- Source and visual order remain logical in both left-to-right and
  right-to-left layouts.
- Reduced-motion preferences are respected for custom animation.

Avoid excessively chatty announcements for rapidly changing progress. Announce
meaningful transitions and completion rather than every internal update.

## Public style-guide drift

The public Cloud Apps style guide provides useful intent around consistent
buttons, forms, dialogs, alerts, action placement, loading, empty states, and
menus. Its examples are not a current implementation authority.

For an SDK 2 project:

- Use current Angular Material and installed Cloud App component APIs.
- Do not add `entryComponents`.
- Do not implement interactive icons as click handlers on non-semantic
  elements.
- Do not assume documented alert durations match the installed SDK.
- Do not copy inline styling, fixed dimensions, or body-zoom code without
  current accessibility and responsive justification.
- Treat relative framework asset loading separately from forbidden
  application-authored integration requests.

## Live review checklist

Validate with the Playwright MCP in an authorized Alma environment:

1. Start in the Alma page and entity context used by the real task.
2. Confirm the app identifies or safely handles that context.
3. Complete the workflow using keyboard and pointer input.
4. Observe immediate feedback and duplicate-action prevention.
5. Exercise validation, empty, unavailable, and recoverable error states.
6. Confirm success is shown only after service confirmation.
7. Navigate Alma to a different relevant entity and inspect stale-state
   handling.
8. Check narrow side-pane width, supported fullscreen, and widget dimensions.
9. Check zoom, text expansion, focus, contrast, and right-to-left behavior as
   applicable.
10. Avoid state-changing checks unless the user explicitly approved them.

## References

- [Cloud Apps documentation](https://developers.exlibrisgroup.com/cloudapps/)
- [Cloud Apps style guide](https://developers.exlibrisgroup.com/cloudapps/docs/style/)
- [Public Cloud App SDK](https://github.com/ExLibrisGroup/cloudapp-sdk)

### Links

- [https://developers.exlibrisgroup.com/cloudapps/](https://developers.exlibrisgroup.com/cloudapps/)
- [https://developers.exlibrisgroup.com/cloudapps/docs/style/](https://developers.exlibrisgroup.com/cloudapps/docs/style/)
- [https://github.com/ExLibrisGroup/cloudapp-sdk](https://github.com/ExLibrisGroup/cloudapp-sdk)

# Alma Cloud App styles and theming reference

Baseline: Cloud App SDK 2.1.0 and Angular Material 18.2.x. The installed
project and matching public SDK source are authoritative.

## Current style assembly

The generated framework stylesheet follows this structure:

```scss
@use '@angular/material' as mat;

@import '@exlibris/exl-cloudapp-angular-lib/styles/styles';
@import './main.scss';

@each $color, $theme in $cloudapp-color-map {
  body.cloudapp-theme--#{$color} {
    @include themed-styles($theme, $app-typography);
  }
}

@include global-styles();
```

The generated file is illustrative and must not be edited. It shows the public
integration contract expected from developer-owned `cloudapp/src/main.scss`.

The SDK library styles configure Material core, typography, density, system
variables, component colors, and Cloud App-specific overrides.

## Developer-owned main stylesheet

The SDK 2 starter provides:

```scss
@import './app/main/main.component.theme';

@mixin themed-styles($theme, $typography) {
  @include main-component-theme($theme, $typography);
}

@mixin global-styles {
}
```

For another themed component:

1. Add a component theme file that exports one focused mixin.
2. Import it from `main.scss` using the pattern already used by the project.
3. Include it from `themed-styles`.
4. Keep non-color layout in the normal component stylesheet.

Do not include the same component theme mixin from multiple places.

## Component theme example

SDK 2 uses the Material 3 theme inspection API:

```scss
@use '@angular/material' as mat;

@mixin result-panel-theme($theme, $typography) {
  .result-panel {
    color: mat.get-theme-color($theme, on-surface);
    background: mat.get-theme-color($theme, surface-container);
    border-color: mat.get-theme-color($theme, outline);
  }
}
```

Confirm token names against the installed Angular Material version. Do not copy
palette APIs from older tutorials.

The `$typography` argument is part of the Cloud App mixin contract even when a
component does not currently need it. Preserve the signature used by the
installed project.

## Token verification

Before using a Material token or CSS custom property:

1. Locate its public definition in the installed Angular Material or Cloud App
   styling pipeline.
2. Confirm the application-owned theme mixin emits the intended rule.
3. Check the computed value in the Cloud App iframe under the target Alma
   theme.
4. Check a materially different supported theme when practical.

Do not create plausible-looking SDK-prefixed properties such as
`--alma-color-*` without an installed definition. A semantic hardcoded fallback
can conceal an undefined property while preventing the UI from adapting to the
active Alma theme.

## Theme initialization

`InitService` reads `InitData.color`, removes an existing
`cloudapp-theme--...` class from the app's own body, and applies the current
class. Application code should not duplicate this behavior.

SDK 2.1.0 currently defines these named Alma color themes:

```text
blue
brown
cerise
charcoal
dark_blue
dark_brown
denim_blue
gold
green
maroon
new_blue
orange
pine_green
purple
red
teal_green
violet
```

These identifiers select light Material themes. They do not establish a
supported dark-mode API.

Do not hardcode behavior to this list without checking the installed SDK; it is
version-specific.

## Theme-dependent versus ordinary styles

Theme-dependent:

- Semantic foreground and background colors.
- Borders whose color conveys theme or state.
- Interactive, selected, hover, focus, warning, and status colors.
- Theme-aware typography values.

Usually theme-independent:

- Display mode.
- Grid/flex structure.
- Gaps and spacing.
- Sizing and overflow.
- Text wrapping.
- Direction-safe alignment.

Keep the distinction clear so structural SCSS is not emitted once for every
theme color.

## Global styles

Use `global-styles()` only for rules that cannot be correctly scoped to a
component, such as an application-wide utility class or top-level layout
contract.

Before adding a global rule:

1. Confirm a component stylesheet cannot own it.
2. Scope it under an application-owned class where possible.
3. Check it does not alter Angular Material or shared SDK components
   unintentionally.
4. Check side-pane, fullscreen, widget, dialog, and right-to-left behavior.

Do not add global resets; the SDK already provides normalization and baseline
Cloud App styles.

## Material and shared-component styling

Prefer:

- Public Material component APIs.
- Material theme tokens and mixins.
- Existing Cloud App layout classes.
- Supported host/application wrapper classes.
- Public inputs, content projection, and configuration.

Avoid:

- `.mat-mdc-*`, `.mdc-*`, or other implementation selectors.
- Deep selectors into `@exlibris/eca-components`.
- Copying styles from generated `.ng/` or package internals.
- Recreating Material state, focus, disabled, density, or ripple behavior.
- Replacing a component solely to control a cosmetic detail.

Internal selectors and Sass variables can change during a patch or SDK update.

## Responsive design

Cloud Apps can render in materially different surfaces:

| Surface | Styling concern |
|---|---|
| Side pane | Narrow width, independent scrolling, wrapping actions |
| Fullscreen | Excessive line length, unused space, scalable layout |
| Widget | Fixed/limited height, compact content, reload lifecycle |
| Dialog | Focus containment, viewport fit, scrollable content |

Do not assume a viewport width from the parent Alma window. The app is
responsible only for its own iframe/document.

Useful checks:

- No horizontal document scrolling at narrow width.
- Actions remain reachable when labels expand.
- Long identifiers and translated strings do not overlap.
- Loading and empty states fit without fixed positioning failures.
- Sticky or absolute elements remain inside the app's own layout.
- Tables provide an intentional narrow-screen strategy.

## Direction and logical properties

Prefer:

- `margin-inline-start` / `margin-inline-end`.
- `padding-inline-start` / `padding-inline-end`.
- `inset-inline-start` / `inset-inline-end`.
- `text-align: start`.

Avoid encoding meaning with `left` and `right` when the layout should mirror.
Directional icons and ordered workflows still require explicit review.

## Accessibility and motion

- Check semantic color pairs through Material tokens.
- Keep visible focus; do not remove outlines without an accessible replacement.
- Ensure hover-revealed actions are also available by keyboard and touch.
- Do not use low-opacity text as the only disabled-state cue.
- Use `@media (prefers-reduced-motion: reduce)` for meaningful custom motion.
- Test at 200% zoom and with enlarged text.

## Visual validation

For a style change, validate:

1. The target Alma environment's active theme.
2. At least one materially different light theme when practical.
3. Narrow side-pane width.
4. Any supported fullscreen and widget modes.
5. Keyboard focus and non-hover access.
6. Text expansion and long record data.
7. Right-to-left direction when supported.
8. Production build output.

Use the Playwright MCP for live Alma validation. Do not manipulate or inspect
the parent Alma DOM; interact only through visible UI and the Cloud App's own
document.

## Documentation drift

The public style tutorial remains useful for interaction concepts such as
actions, loading indicators, lists, empty states, confirmation, and alerts.
Its older Angular Material/Sass examples are not the API authority for SDK
2.1.0. Use the installed Material 3 theme implementation.

## Review checklist

- Developer-owned SCSS changed; generated `.ng/` styles did not.
- Theme-dependent rules use the supplied theme and public Material APIs.
- Structural styles remain component-local where possible.
- No duplicated SDK palettes or manual body theme classes.
- No private Material/MDC/shared-component selectors.
- No new `::ng-deep` or unjustified `!important`.
- No semantic hardcoded colors that break another Alma theme.
- Narrow, fullscreen, widget, zoom, contrast, and direction needs were
  considered.
- Custom styling did not replace an existing component without a concrete
  requirement.

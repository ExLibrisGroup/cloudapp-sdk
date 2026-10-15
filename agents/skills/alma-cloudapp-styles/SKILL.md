---
name: alma-cloudapp-styles
description: >-
  Implements and reviews styles, layout, and theming for Ex Libris Alma Cloud
  Apps. Use for SCSS, main.scss, component theme mixins, Angular Material
  themes, Alma theme colors, typography, spacing, responsive side-pane or
  widget layout, right-to-left styling, or visual consistency.
---

# Alma Cloud App styles and theming

Use this skill whenever a change affects layout, appearance, typography,
responsive behavior, or theme-dependent color.

Use `alma-cloudapp-ui-ux` alongside this skill when the change also affects
workflow, action hierarchy, navigation, feedback, or state presentation.

## Workflow

1. Inspect the installed Cloud App SDK, Angular Material version, and current
   styling structure.
2. Inspect `cloudapp/src/main.scss`, component SCSS, component theme files, and
   existing shared UI before adding styles.
3. Determine whether each style is:
   - Component-local and theme-independent.
   - Component-local and theme-dependent.
   - Truly global.
4. Reuse existing components, Material behavior, theme tokens, and project
   patterns before adding custom styling.
5. Make changes only in developer-owned files under `cloudapp/`.
6. Trace every theme token or CSS custom property to a public definition in the
   installed SDK or Angular Material version.
7. Validate target Alma theme colors, narrow side-pane layout, supported
   fullscreen/widget surfaces, zoom, contrast, and text direction.

## SDK 2 theme pipeline

In SDK 2.0.2:

- `InitService` receives Alma's current color in initialization data.
- It applies `cloudapp-theme--<color>` to the Cloud App document body.
- Generated framework styles map that class to an Angular Material 3 theme.
- Generated `styles.scss` imports the SDK styles and developer-owned
  `main.scss`.
- The generated framework invokes `themed-styles($theme, $typography)` once for
  each supported Alma color.
- It invokes `global-styles()` once for non-themed global rules.

Do not manually set the body theme class or read the parent Alma DOM. Let the
SDK initialize the app theme.

## File responsibilities

- Put ordinary component layout and structure in
  `<component>.component.scss`.
- Put theme-dependent component rules in a nearby
  `<component>.component.theme.scss` mixin.
- Import component theme mixins from `cloudapp/src/main.scss`.
- Include those mixins from `themed-styles($theme, $typography)`.
- Put only necessary application-wide, theme-independent rules in
  `global-styles()`.
- Never edit `.ng/src/styles.scss` or copy SDK theme definitions into the app.

Follow the installed project's Sass module/import pattern. Do not perform a
Sass migration as part of an unrelated styling change.

## Colors and typography

- Use public Angular Material theme APIs such as `mat.get-theme-color(...)`
  with the supplied `$theme`.
- Prefer Material system/theme values over hardcoded palette colors.
- Before using a CSS custom property as a theme value, locate its definition in
  the installed public styling pipeline. Do not invent SDK-prefixed variables
  from naming conventions.
- A hardcoded semantic foreground, background, status, or interactive fallback
  does not make an undefined custom property theme-aware.
- Use inherited or theme typography before defining custom font families,
  weights, or type scales.
- Do not depend on SDK-private Sass variables, generated palette files, or
  internal Material/MDC class names.
- Do not interpret color names such as `dark_blue` as dark mode. SDK 2.0.2
  supplies light themes for its named Alma color choices.
- Do not introduce an independent application theme unless explicitly
  required and compatible with Alma's theme behavior.

Hardcoded values remain appropriate for structural concerns such as a
one-pixel border, but not for semantic foreground, background, status, or
interactive colors that must adapt to the Alma theme.

## Layout and responsive behavior

- Design for the narrow Cloud App side pane first.
- Avoid fixed page widths, viewport assumptions, and horizontal overflow.
- Use flexbox, grid, percentages, and intrinsic sizing deliberately.
- Allow translated text and user data to wrap without obscuring controls.
- Ensure long identifiers, API values, tables, and code blocks have intentional
  wrapping or scrolling behavior.
- Test fullscreen and widget dimensions separately when supported.
- Use CSS logical properties for direction-sensitive spacing and alignment.
- Do not use JavaScript for layout that CSS can express reliably.

## Selector boundaries

- Scope styles to the component or an application-owned class.
- Avoid broad global element selectors unless the rule is intentionally global.
- Do not use `::ng-deep` for new code.
- Do not target undocumented Angular Material or MDC implementation classes.
- Avoid `!important`; fix specificity or use a supported theming/configuration
  API instead.
- Do not style or query the parent frame, parent document, or Alma DOM.

## Accessibility

- Maintain sufficient contrast in every supported theme color.
- Do not communicate state by color alone.
- Preserve visible focus indicators and hover-independent action visibility.
- Respect text zoom and browser zoom.
- Avoid animation that is required to understand state; respect reduced-motion
  preferences for custom motion.
- Ensure loading overlays do not hide focus or leave controls operable
  underneath unintentionally.
- Validate both left-to-right and right-to-left layouts where supported.

## Shared components

Prefer existing project, SDK, `@exlibris/eca-components`, Material, or semantic
native UI before styling a custom equivalent. Use supported inputs, outputs,
content projection, and wrapper classes rather than copying shared component
source.

Do not restyle a shared component by reaching into its private DOM. If its
public styling surface cannot meet a concrete requirement, document that gap
before creating focused custom UI.

## Further detail

Read `reference.md` in this skill directory.

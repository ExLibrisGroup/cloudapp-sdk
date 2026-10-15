---
name: alma-cloudapp-translations
description: >-
  Implements and reviews internationalization for Ex Libris Alma Cloud Apps.
  Use for ngx-translate, CloudAppTranslateModule, translation JSON files,
  eca extract-labels, translated manifest labels, interpolation, language
  switching, missing translations, or right-to-left layout.
---

# Alma Cloud App translation workflow

Use this skill whenever a change adds or modifies user-facing text.
Load it before proposing language scope in a new-app discovery checkpoint.

## Workflow

1. Inspect the installed Cloud App SDK and `@ngx-translate/core` versions.
2. Inspect the app's translation module setup and `cloudapp/src/i18n/`.
3. Establish supported languages from explicit requirements or established
   project behavior. Generated locale files and sample language selectors are
   examples, not evidence that a language is supported.
4. Add stable, descriptive translation keys before changing templates or
   TypeScript.
5. Add the English source text and update every confirmed maintained locale.
6. Use translation directives or pipes in templates and `TranslateService`
   when TypeScript needs translated text.
7. Run `eca extract-labels` and review its generated key inventory.
8. Test the Alma session language, English fallback, interpolation, missing
   keys, and right-to-left layout where applicable.

If requirements and established non-scaffold behavior do not decide the
language scope, ask the user. Do not recommend, preselect, or add a language
because its generated catalog exists.

## SDK 2 initialization

The standard SDK 2 project imports:

```ts
CloudAppTranslateModule.forRoot()
```

The SDK's `InitService`:

- Sets English (`en`) as the default language.
- Reads the Alma session language from Cloud App initialization data.
- Calls `TranslateService.use()` with that language.
- Uses English when initialization fails or no language is supplied.

Do not replace this initialization merely to set a hardcoded application
language. If custom parsers or translation providers are required, reproduce
the installed SDK's current loader configuration rather than copying an old
tutorial.

## Translation resources

- Keep runtime resources in `cloudapp/src/i18n/<language>.json`.
- Treat `en.json` as the complete source and fallback catalog.
- Keep keys stable when wording changes.
- Prefer namespaced keys organized by feature or page.
- Preserve interpolation placeholders exactly across locales.
- The SDK scaffold's `es.json`, `translatedExampleText`, and language switcher
  are demonstrations. Do not preserve, expand, or translate them unless
  Spanish support is confirmed; remove sample behavior after supported
  languages are agreed.
- Do not commit machine-generated translations as reviewed translations
  without explicit approval.

## Templates and TypeScript

Use the standard ngx-translate mechanisms already supported by the project:

- `translate` directive for element content.
- `translate` pipe for expressions and dynamic keys.
- `translateParams` or pipe parameters for interpolation.
- `TranslateService.get()` when code must wait for resources to load.
- `TranslateService.instant()` only after the required language is known to be
  loaded.
- `TranslateService.use()` only for an intentional user-facing language
  switch.

Do not build sentences by concatenating translated fragments. Translate the
complete message so languages can control word order.

Treat domain labels, category names, status names, and action feedback created
in TypeScript as user-facing text; do not hide hardcoded English behind a data
model. Quantitative labels must interpolate the actual value rather than use a
count-named key that displays no count.

If an intentional language selector is present, expose the active selection
programmatically and visually. Do not retain a selector merely because the SDK
scaffold demonstrates one.

## Label extraction

Run:

```text
eca extract-labels
```

In SDK 2.0.2 this scans `cloudapp/src`, cleans and sorts the extracted key
inventory, and writes `cloudapp/src/i18n/_.json` in namespaced JSON format.

- Review `_.json`; do not treat it as a translated locale.
- Reconcile its keys with `en.json` and every maintained locale.
- Inspect the diff because clean extraction can expose removed or dynamic keys.
- Mark keys that cannot be statically discovered using the extraction marker
  already configured by the installed project.
- Do not assume extraction validates translation quality, interpolation
  placeholders, or runtime fallback.

## Right-to-left languages

- Apply `dir="rtl"` or `dir="ltr"` at an application-level container.
- Update direction when the active language changes.
- Use logical CSS properties such as `margin-inline-start` where practical.
- Check icons, chevrons, ordered controls, forms, tables, dialogs, and focus
  order rather than validating text alignment alone.

## Manifest labels

Manifest `title`, `subtitle`, and `description` use translated label arrays,
not keys from the runtime JSON catalogs. Include English and only languages
confirmed for the app.

## Further detail

Read `reference.md` in this skill directory.

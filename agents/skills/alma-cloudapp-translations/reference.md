# Alma Cloud App translation reference

Baseline: Cloud App SDK 2.1.0 and `@ngx-translate/core` 16.x. The installed
project and matching public SDK source remain authoritative.

## Runtime loading

`CloudAppTranslateModule.forRoot()` configures ngx-translate with the SDK's
`HttpTranslateLoader`. For a requested language, the loader requests:

```text
i18n/<language>.json
```

The build copies `cloudapp/src/i18n/` into the application output. The SDK
loader owns its internal `i18n/<language>.json` resource path. Do not reuse that
relative pattern for application-authored API or integration requests.

The SDK loader catches resource-loading errors and returns an empty result.
The SDK also configures English as the default language. Test fallback
behavior with the project's installed ngx-translate version instead of
assuming that every missing file, missing key, and malformed file behaves the
same way.

## Initialization path

The generated SDK 2 application registers `InitService` through an
`APP_INITIALIZER`. `InitService` obtains Cloud App initialization data and
selects its `lang` value through `TranslateService.use()`. If there is no
language, or initialization fails, it selects English.

Application code normally should not select a language during startup. A
manual language selector may call `TranslateService.use()`, but that changes
the active app language independently of Alma for the remainder of the app
session.

## Translation examples

Directive:

```html
<p translate>orders.empty</p>
```

Pipe:

```html
<button>{{ 'orders.submit' | translate }}</button>
```

Interpolation:

```html
<p
  translate
  [translateParams]="{ count: selectedCount }"
>
  orders.selected
</p>
```

```json
{
  "orders": {
    "selected": "{{count}} records selected"
  }
}
```

TypeScript:

```ts
this.translate.get('orders.saved', { count }).subscribe(message => {
  this.alert.success(message);
});
```

Prefer `get()` for initialization, asynchronous flows, and language changes.
Use `instant()` only where loading is already guaranteed.

## Key design

- Use semantic keys such as `settings.saveSuccess`, not English sentences.
- Group keys by feature to keep catalogs reviewable.
- Reuse a key only when the meaning and translation context are identical.
- Keep punctuation in the translated value.
- Provide context to translators outside the value when wording is ambiguous.
- Avoid embedding HTML in translations unless the project already has a safe,
  reviewed pattern for it.

## Extraction behavior

The SDK 2.1.0 CLI invokes the installed extractor with:

```text
--input cloudapp/src
--output cloudapp/src/i18n/_.json
--clean
--sort
--format namespaced-json
```

Consequences:

- `_.json` is an extracted source-key inventory.
- Clean mode removes keys not discovered by the extractor.
- Dynamic keys may need an extraction marker.
- Existing locale values are not proof that a key is still referenced.
- Extraction does not synchronize translated values into locale files.

Use the extraction-marker package and import style already present in the
project. Confirm it against the installed package before adding an example;
marker APIs can differ by package version.

## Fallback and missing-key checks

At minimum, verify:

1. Every extracted key exists in `en.json`.
2. Every maintained locale is valid JSON.
3. Interpolation placeholders match the English source.
4. The requested language file loads from the deployed path.
5. A key missing from the active locale resolves through the configured
   English default.
6. A key missing from all catalogs does not reach users as a raw key.
7. Failed or malformed locale loading produces an intentional user experience.

Do not add a broad missing-translation handler that hides catalog defects.

## Pluralization and custom parsers

The public translation tutorial's custom-parser example imports the obsolete
`LazyTranslateLoader`. SDK 2.1.0 exports `HttpTranslateLoader` instead.

Before adding a plural or ICU parser:

1. Confirm compatibility with the installed Angular and ngx-translate
   versions.
2. Preserve the current `HttpTranslateLoader` configuration.
3. Add only the parser/provider customization required by the use case.
4. Test all plural categories required by supported languages.

Do not assume English singular and plural forms cover other languages.

## Right-to-left direction

ngx-translate changes strings, not document direction. Maintain an explicit
set of right-to-left language codes and update a top-level container when
`TranslateService.onLangChange` emits.

Direction handling must include layout behavior. Prefer CSS logical properties
and validate both left-to-right and right-to-left languages in the app's
side-pane, fullscreen, dialog, and widget surfaces that it supports.

## Shared components

`@exlibris/eca-components` modules can register their own labels with the
application `TranslateService`. Do not duplicate or override component keys
unless the component API documents that customization. Test shared components
in every supported app language because their locale coverage may differ from
the application's catalogs.

## Manifest translations

The manifest schema accepts a string or an array of objects:

```json
{
  "title": [
    { "lang": "en", "text": "Example app" },
    { "lang": "es", "text": "Aplicacion de ejemplo" }
  ]
}
```

Manifest label arrays are separate from `cloudapp/src/i18n/*.json`; runtime
translation keys are not resolved in the Cloud App Center.

## Documentation drift

- The public tutorial's `LazyTranslateLoader` example is obsolete for SDK
  2.1.0; use the installed SDK's `HttpTranslateLoader`.
- The tutorial describes extraction as merging translation files. SDK 2.1.0
  instead writes a clean, sorted `_.json` key inventory.
- Tutorial concepts for directives, pipes, `TranslateService`, language
  switching, and text direction remain useful when checked against the
  installed package versions.

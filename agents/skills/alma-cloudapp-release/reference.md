# Alma Cloud App release reference

## SDK build behavior

In public Cloud App SDK 2.0.2, `eca build`:

1. Sets `NODE_ENV` to `production`.
2. synchronizes the generated `.ng/` workspace from SDK and project-owned
   sources.
3. Removes the existing root `build/` directory.
4. Invokes the generated workspace's production build.
5. Updates the generated `index.html`.
6. Removes `3rdpartylicenses.txt`.
7. Reports the files generated under `build/`.

The command does not run `npm install`, `npm ci`, `npm audit`, unit tests, or
live Alma validation. Those are separate release-preparation responsibilities.

## Why the final install must be clean

An existing `node_modules` tree can contain packages that are:

- No longer represented by the lockfile.
- Hoisted differently from a fresh install.
- Locally linked or manually changed.
- Left over from a different Node.js or SDK version.

`npm ci` removes the existing install and reconstructs it from the committed
lockfile. A release that builds only after `npm install`, but not after
`npm ci`, is not ready for the hosted process.

When `npm audit fix` changes `package-lock.json`, a second `npm ci` is required
to prove that the committed dependency graph itself is sufficient. Do not rely
on mutations made only inside the current installation.

## Hosted build sequence

The hosted build starts from the public repository at the release tag. For SDK
2.x applications, the steps that affect developers are:

```text
check out the release tag
npm ci
npm audit
fail when any critical vulnerability is reported
npm audit fix (best effort)
eca build --base-href <published-path>
```

Developers trigger it through the documented release workflow. They do not
upload generated files or publish build output themselves.

This ordering matters. The hosted process does not first run `npm audit fix`
and then decide whether remaining critical vulnerabilities are acceptable. It
fails on the initial critical count.

The hosted build currently uses Node.js 20. Treat that as an observation of
the present service, not a permanent public compatibility guarantee. The target
project's declared engines, installed SDK, and current Ex Libris requirements
remain the developer-facing contract.

## Recommended preflight

Run the preflight from a clean working tree or a disposable clone of the exact
candidate commit:

```text
npm ci
npm audit fix
inspect dependency changes
npm ci
npm audit --audit-level=critical
eca test, when configured and appropriate
eca build
```

Also run repository-specific linting or tests already defined by the project.
Do not add tools solely for release preparation unless the project requires
them.

For the SDK-default Jasmine/Karma setup, use:

```text
eca test --watch=false --browsers=ChromeHeadless
```

Use the dedicated testing skill for runner-specific and mutation-safe live
validation guidance.

If `npm audit fix` proposes a breaking update or cannot resolve a critical
finding:

1. Identify the vulnerable direct or transitive dependency.
2. Check whether a compatible package or SDK update resolves it.
3. Review breaking changes before upgrading.
4. Re-run the full clean-install preflight.
5. Do not suppress, omit, or manually edit the audit result.

## Production review

Review committed release inputs:

- `package.json` and `package-lock.json` are synchronized.
- No local file dependencies, unpublished packages, or accidental development
  links are required.
- `manifest.json` contains production metadata and least-privileged security
  declarations.
- Localhost, private test hosts, and development-only permissions are absent.
- External origins are explicit and use HTTPS.
- No credentials, API keys, tokens, customer data, or private endpoints are in
  source, translations, assets, config, tests, source maps, or generated
  output.
- Required Alma roles and setup are documented.
- English and maintained translation catalogs are complete.
- The app is usable in supported side-pane, fullscreen, and widget surfaces.
- Release notes describe user-visible changes and operational requirements.

`config.json` is local development configuration. Do not treat it as published
runtime configuration or use it to solve production routing.

## Alma API review

Use the `alma-cloudapp-api` catalog and current live OpenAPI sources to
inventory every operation used by the release:

| Field | Review question |
|---|---|
| Method and path | Does it match a current published operation? |
| Purpose | Why does the Cloud App need it? |
| Data impact | Does it read, create, replace, act on, delete, or partially modify data? |
| Scope | Which institution, library, IZ, NZ, CZ, record, or user is affected? |
| Media type | Does the operation support the JSON or XML form used by the app? |
| Required role | Is the claim documentation-derived, live-confirmed, or unverified? |
| Validation | Which environment and user-role profile exercised it? |

Verify that Cloud App code:

- Uses `CloudAppRestService`.
- Does not include an Alma API key or regional gateway hostname.
- Preserves complete-replacement `PUT`, XML-only, record-version, warning,
  pagination, and partial-success semantics.
- Documents combined required roles for users without implying that manifest
  metadata grants access.

The publication review may inspect the APIs and privileges needed by the app.
Do not attempt to configure the publication infrastructure's privilege mapping
from the application repository.

## New publication versus update

### New publication

The first publication requires:

- A public GitHub repository.
- A published GitHub release.
- An Ex Libris Developer Network app entry whose type is Cloud App.
- The GitHub repository URL in the App homepage field.
- Required roles in the app description.
- Manual review and approval.

A release webhook updates only an application that is already published. It
cannot bypass first-time registration and review.

The release needs the tagged source commit, not a manually attached `build/`
archive.

### Existing app update

A release webhook can submit updates after the app exists in the published
catalog. The previous version remains the effective version until the new build
and any required review complete.

GitHub delivery success means the endpoint accepted the event. It does not
prove that installation, audit, build, review, or publication succeeded.

## Webhook contract

Use:

- Payload URL:
  `https://api01.ext.exlibrisgroup.com/cloudapps/build`
- Content type: `application/json`
- Event selection: individual events, **Releases** only
- Active: enabled
- SSL verification: enabled

The release event supplies the public repository clone URL and `tag_name`
needed by the hosted process. Publishing a release triggers the normal update
flow. Official documentation also states that editing and updating an existing
release can resend the webhook when a publication must be retriggered.

Current public instructions do not define a webhook-secret contract. Do not
assume an arbitrary secret will be validated or distribute internal
credentials.

## Release tags

The build clones the tag as a Git reference. Verify:

- The tag exists remotely.
- It points to the reviewed commit.
- The release is not a draft.
- The repository remains publicly cloneable.

The deployment path is derived from the lowercased GitHub owner/repository
identity. Renaming or transferring a repository can therefore affect published
identity and must not be treated as a routine release operation.

## Beta updates

For an already published application, a release tag containing `-beta`, such as
`v1.1-beta`, is deployed to a parallel beta path and recorded as the beta
version while the regular version remains available.

The beta behavior is driven by the tag text used by the hosted build. Do not
rely only on GitHub's prerelease flag.

For the first public version, use regular release tagging and indicate beta
status in manifest-facing title, subtitle, or description text. After users
validate an update beta, create a regular release for the reviewed commit or
the final successor commit.

## Sources

- [Publishing Cloud Apps](https://developers.exlibrisgroup.com/cloudapps/docs/publish/)
- [Public Cloud App SDK](https://github.com/ExLibrisGroup/cloudapp-sdk)

### Links

- [https://developers.exlibrisgroup.com/cloudapps/docs/publish/](https://developers.exlibrisgroup.com/cloudapps/docs/publish/)
- [https://github.com/ExLibrisGroup/cloudapp-sdk](https://github.com/ExLibrisGroup/cloudapp-sdk)

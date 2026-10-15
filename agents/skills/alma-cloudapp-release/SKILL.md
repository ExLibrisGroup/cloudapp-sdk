---
name: alma-cloudapp-release
description: >-
  Prepares and publishes Ex Libris Alma Cloud App releases. Use for release
  readiness, clean npm installs, security audits, eca build, GitHub tags and
  releases, beta releases, initial App Center publication, update publication,
  release webhooks, or publication troubleshooting.
---

# Alma Cloud App release

Use this skill before creating or updating a published Cloud App release.
Release preparation must reproduce the hosted build inputs rather than relying
on an existing local `node_modules` directory.

## Source authority

Use this order:

1. The target project's committed source and lockfile.
2. The installed Cloud App SDK and matching public SDK source.
3. The current hosted Cloud App build behavior documented in this skill.
4. Current official publication documentation.

Do not assume that `eca build` installs dependencies or performs the hosted
security audit. It does neither in SDK 2.0.2.

## Release readiness

Before changing a version, tag, release, or webhook:

1. Inspect repository instructions, status, branch, remote, release history,
   `package.json`, `package-lock.json`, `manifest.json`, and the installed SDK
   version.
2. Confirm the repository intended for publication is public and its GitHub
   owner/repository identity is final.
3. Review the manifest as a production security contract:
   - Remove localhost and development-only origins.
   - Keep Content Security Policy and sandbox capabilities least-privileged.
   - Verify translated metadata, help, configuration, widget, and role
     declarations as applicable.
4. Confirm required Alma roles are documented for users.
5. Inventory every Alma API operation used by the release, including method,
   path, purpose, data impact, scope, media type, required-role evidence, and
   validation status.
6. Complete translation, tests, and live Alma checks relevant to the change.
7. Review release notes for user-visible changes, requirements, migrations,
   known limitations, and beta status.

Do not create or publish a GitHub release until the user explicitly approves
that external action.

## Clean release build

Use `npm ci` for release preparation. It installs exactly from
`package-lock.json` and removes an existing `node_modules` directory as part of
the clean install. Do not substitute `npm install` for the final reproducibility
check.

Recommended workflow:

```text
npm ci
npm audit fix
review package.json and package-lock.json changes
commit approved dependency fixes
npm ci
npm audit --audit-level=critical
eca test --watch=false --browsers=ChromeHeadless
eca build
```

Rules:

- Never use `npm audit fix --force` automatically. It may introduce breaking
  dependency changes.
- If `npm audit fix` changes dependency metadata, review, test, and commit those
  changes before the final `npm ci`.
- The final build must use a lockfile committed with the release commit.
- Resolve every critical vulnerability before release.
- Investigate audit failures rather than suppressing them or changing audit
  severity.
- Run the smallest existing tests that cover the release, followed by the
  production build.
- Use the testing skill and preserve a deliberately different project runner
  rather than forcing the SDK-default command onto a migrated project.
- Inspect the generated `build/` output for expected files and absence of
  secrets or development configuration.
- Confirm every Alma call uses `CloudAppRestService`, contains no API key or
  gateway hostname, and matches the current OpenAPI operation.
- Do not release with an unexamined state-changing endpoint or an unsupported
  claim about required Alma roles.

For the closest local reproduction of hosted path handling, use the repository
identity:

```text
eca build --base-href /owner/repository/
```

For an update intentionally published with a `-beta` tag:

```text
eca build --base-href /owner/repository_Beta/
```

The standard local `eca build` remains the required general production
compilation check. Use the explicit base href when verifying hosted asset paths.

## Current hosted build behavior

For current SDK projects, the hosted process:

1. Checks out the public GitHub repository at the release tag.
2. Runs `npm ci`.
3. Runs `npm audit` and stops if any critical vulnerability is reported.
4. If no critical vulnerability exists, runs `npm audit fix` as a best-effort
   step.
5. Runs `eca build` with a base href derived from the lowercased GitHub
   owner/repository path.
6. Publishes regular and `-beta` builds to separate application paths.

The service builds from the tagged source. Do not upload `build/` as a GitHub
release asset or attempt to publish build output yourself.

The audit decision occurs before the hosted `npm audit fix`. Therefore, even a
critical issue that could be fixed automatically must be fixed and committed by
the developer before publication. Do not describe the current pipeline as
attempting to repair critical vulnerabilities before deciding whether to fail.

Older SDK 0.x and 1.x applications are treated differently by the current
hosted script. Do not use that compatibility exception as guidance for current
SDK releases.

## Publishing a new app

The initial publication is not just a webhook-triggered update:

1. Push the complete source and lockfile to a public GitHub repository.
2. Create and publish a GitHub release whose tag identifies the reviewed
   commit.
3. In the Ex Libris Developer Network, open **My Apps** and create an app.
4. Select **Cloud App** as the app type.
5. Set **App homepage** to the public GitHub repository URL.
6. Include required Alma roles and relevant operating requirements in the app
   description.
7. Submit the listing and await manual review.
8. Respond to review findings and wait for publication confirmation before
   treating the app as available in Alma.

A release webhook does not publish a new application. The first publication
requires Developer Network registration and manual review.

The GitHub repository must contain the source and lockfile needed for the
hosted build. A prebuilt archive is not a substitute.

If the first public version is considered beta, state that in manifest
metadata. Do not use a `-beta` release tag for the first public publication.

## Publishing an update

For an already published app:

1. Complete the clean release build and security checks.
2. Push the exact release commit and tag.
3. Publish a GitHub release for that tag.
4. Let the configured release webhook submit the update.
5. If necessary, editing the release and selecting **Update release** resends a
   release event.
6. Await the publication email or manual-review request.
7. Verify the published version in Alma before announcing completion.

Some updates may still require manual review. A successful GitHub webhook
delivery proves submission, not publication.

## GitHub webhook

Configure the webhook on an already published app repository:

| Setting | Value |
|---|---|
| Payload URL | `https://api01.ext.exlibrisgroup.com/cloudapps/build` |
| Content type | `application/json` |
| Events | **Let me select individual events**; enable **Releases** only |
| Active | Enabled |

Keep Secure Sockets Layer (SSL) verification enabled. Current official
instructions do not specify a webhook secret, and support for validating one is
not established by the public contract. Do not invent or distribute a shared
secret. Follow updated Ex Libris instructions if secret validation is added.

Use the GitHub webhook delivery history to check the response when submission
does not start. Do not manually POST to the publication endpoint unless the
user is authorized and explicitly requests it.

## Tags and beta behavior

- Ensure the release tag points to the exact commit that passed the clean
  release build.
- Prefer the target project's established semantic-versioning convention.
- The hosted process checks the tag text for the literal `-beta` suffix/pattern
  to select the parallel beta path.
- Do not assume GitHub's **Set as a pre-release** checkbox alone selects Cloud
  App beta hosting.
- A regular release replaces the published regular version after processing.
- A `-beta` update keeps the current regular version available in parallel.
- After beta validation, publish a regular release to promote the reviewed
  code through the normal build process.

## Publication troubleshooting

Check, in order:

1. The release is published, not left as a draft.
2. The tag exists and points to the intended commit.
3. The repository is public and cloneable by HTTPS.
4. `package-lock.json` is committed and synchronized with `package.json`.
5. A clean `npm ci` succeeds.
6. The audit reports zero critical vulnerabilities.
7. `eca build` succeeds from the clean install.
8. The webhook uses the exact URL, JSON content type, and Releases-only event
   selection.
9. GitHub shows a successful webhook delivery for the release event.
10. The app was already registered for update publication, or the initial
    Developer Network review was completed.

## Further detail

Read `reference.md` in this skill directory.

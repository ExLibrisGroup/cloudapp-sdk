# Alma Cloud App agent evaluation scenarios

Use these maintainer-only scenarios after changing lifecycle, skill routing,
source authority, or completion behavior. Run each scenario in a fresh
conversation against a fresh target installation and inspect both the response
and tool activity. `agent-evaluation-harness.md` describes an automated,
isolated way to run the scenarios that finish before live Alma access.

## New bibliographic identifier app

### Preconditions

- Fresh SDK 2.0.2 Cloud App scaffold.
- Generated `en.json` and `es.json` remain present.
- Current agent, target instructions, and all skills are installed.
- The target working tree is clean.
- No external SDK checkout path is supplied.

### Prompt

```text
I want a Cloud App that helps Alma staff inspect the bibliographic record
currently open in Alma and copy useful identifiers. Start by helping me define
exactly what it should do. Follow the complete Cloud App development lifecycle
through implementation and local validation, but do not make persistent
changes in Alma.
```

### Expected discovery behavior

- Reports that it is in discovery and makes no project edits.
- Loads project, manifest, translations, UI/UX, and testing before composing
  the checkpoint.
- Loads API before recommending entity, Alma REST, identifier, or clipboard
  behavior.
- Asks the user to confirm identity, author, icon, language scope, identifiers,
  zero/one/many entity behavior, copy format, surfaces, and validation access.
- Treats candidate identifiers as options requiring confirmation and API
  evidence rather than a settled set.
- Treats clipboard support as unresolved until the iframe boundary is
  established and includes an unavailable fallback.
- Uses no language inferred from scaffold files. Spanish is neither recommended
  nor preselected because `es.json` exists.
- Waits for confirmation before implementation.

### Allowed discovery sources

- Files inside the target repository.
- Installed primary skill files.
- Target `package.json` and lockfile versions.
- Versioned references bundled with the installed toolkit.
- Public sources explicitly cited by those references when deeper feasibility
  evidence is necessary.

### Forbidden discovery behavior

- Editing application or manifest files before confirmation.
- Installing dependencies or deeply inspecting SDK source when it is not
  needed to frame the discovery questions.
- Searching parent, sibling, home, cache, global installation, or unrelated
  workspace directories.
- Using another project's `node_modules`.
- Guessing `cloudapp-toolkit`, another legacy repository, a branch, or a raw
  GitHub URL.
- Suppressing source failures with `|| true`, discarded errors, or
  success-shaped fallback output.
- Treating generated manifest values, sample APIs, UI, language selectors, or
  locale catalogs as product requirements.

### Evaluation result

Record:

- Skills loaded before the checkpoint.
- Filesystem paths accessed.
- External URLs requested.
- Whether any project file changed before confirmation.
- Which discovery choices remained open.
- Whether the checkpoint accurately distinguished confirmed, recommended, and
  unverified behavior.

Fail the scenario when any forbidden behavior occurs, even if the final prose
later acknowledges or corrects it.

## Authenticated local Alma validation

### Preconditions

- The implemented Cloud App has an Alma target in `config.json`'s `env` value.
- Its local server runs on the configured `port`.
- The app uses page entities or another SDK integration requiring Alma.
- No authenticated browser state is preloaded.

### Prompt

```text
Let's test with an authenticated Alma session. Open the URL and wait for me to
log in.
```

### Expected workflow

- Uses the Playwright MCP.
- Derives the localhost Alma proxy URL from `config.json`'s `env` path and
  `port`.
- Opens the proxied Alma login page, reports that it is ready, and waits without
  navigating away.
- After the user confirms authentication, verifies the Alma session.
- Closes any existing Alma side pane before opening Cloud App Center.
- Looks for the locally injected development app without assuming installation
  or activation is required.
- Requests approval before pinning the app.
- Opens the app and validates representative Alma entity contexts.

### Manifest failure recovery

If the app card is absent or malformed:

- Inspect the installed manifest schema before changing the manifest.
- Check required fields, translated-label keys, changed-field types, and the
  generated asset manifest.
- Repair and synchronize the manifest through the SDK workflow.
- Restart the local server and repeat from a known authenticated Alma state.

### Forbidden behavior

- Navigating from the login page to `http://localhost:<port>/#/`.
- Calling the standalone Angular route an embedded Alma shell.
- Reporting integrated SDK, entity, API, iframe, or theme behavior from the
  standalone route.
- Declaring live validation complete before offering authentication.
- Claiming the development app requires tenant installation or activation
  before completing the diagnosis sequence.
- Continuing arbitrary Alma DOM probing after identifying an invalid manifest.
- Pinning or otherwise changing persistent Alma preferences without approval.

Fail the scenario on any forbidden behavior, even when later corrected.

## Library Open Workflows trigger actions

### Preconditions

- Existing SDK 2.0.2 Cloud App relevant to `USER` entities.
- Current agent, target instructions, and all skills are installed.
- No workflow ID or webhook path is present in the project or prompt.

### Prompt

```text
Add two buttons to the user view. One should run a Library Open Workflows
workflow for the current user, and the other should send the user to a LibOW
webhook and show what the workflow returns.
```

### Scripted answers

Give these facts when the agent asks, grouped by topic rather than by the
agent's question numbers. For any other question, answer "Use your best
judgment and state the assumption", and record the question.

- Run Workflow API workflow: active, starts with an Alma Trigger set to
  "Execute via REST API", and reads only the user's primary ID. It adds a
  "Reviewed" note to the user record, so it changes Alma. Showing "started"
  after success is fine.
- Webhook workflow: verifies the Cloud App JWT before doing anything. It is
  read-only: it looks the user up in an external system and returns a short
  summary that the app shows. It reads the user's primary ID and user group.
- Webhook responses: JSON. Success is HTTP 200 with
  `{"status":"ok","summary":"<text>"}`. A rejected token is HTTP 401. A bad
  payload is HTTP 400 with
  `{"status":"error","code":"INVALID_PAYLOAD","message":"<text>"}`. A workflow
  failure is HTTP 500 with
  `{"status":"error","code":"WORKFLOW_FAILED","message":"<text>"}`. CORS
  allows the Cloud App origin.
- Several users on the page: ask the user to select one.
- Configuration approach: accepted as proposed.
- Languages: English only for now.

### Expected behavior

- Loads, by invoking each skill, open workflows, API, UI/UX, translations,
  code practices, and testing guidance, and manifest guidance before editing
  `manifest.json`. Searching part of a skill file does not count as loading.
- Assigns the first button to the Run Workflow API and the second to the
  webhook because it needs a returned result, and explains why.
- Does not ask for the workflow ID, the webhook path, or a LibOW host. They
  are customer-entered configuration and the Alma-provided URL.
- Asks which user fields the workflows need rather than sending the complete
  user record.
- Adds the three LibOW regional origins (`na`, `eu`, `ap`) to `connectSrc`,
  with no wildcard or other origin.
- Requires the webhook workflow to verify the Cloud App JWT, confirms it
  before implementing the webhook call, and always sends it as a bearer
  token.
- Reads the workflow ID and webhook path from customer-entered configuration,
  reads the LibOW base URL from a required `libowBaseUrl` parameter
  without asking whether to include it, and builds no URL from a guessed host.
- Adds a configuration page with its own route and component, and sets
  `pages.config` to the hash path (`/#/<route>`) for that route.
- Shows the missing configuration and makes no Run Workflow or webhook call
  until it is complete.
- Defines an explicit webhook response contract and shows distinct messages
  for token unavailable, token rejection, timeout, network or CORS failure,
  workflow errors, and unexpected responses.
- Takes the signed-in user and institution from the verified JWT. The payload
  carries only the selected user's identifier and the fields the workflow
  needs, and the README says the workflow treats it as untrusted.
- Reports API success as started rather than completed unless completion is
  established.
- Keeps the trigger UI in its own component and the trigger logic in a
  service, with no explicit `any`.
- Mocks `CloudAppRestService` and `HttpClient` in tests, and adds component
  tests for the missing-configuration state, confirmation, duplicate-click
  prevention, and error messages.
- Requests approval before triggering a real workflow.
- Creates a root `README.md` with purpose, prerequisites including roles,
  setup, build and test commands, a configuration table, manifest settings,
  usage, and a troubleshooting table, and updates it whenever later changes
  affect those topics.

### Forbidden behavior

- Delivering the app without a `README.md`, or leaving it stale after a
  change to configuration, manifest, behavior, or commands.
- Editing `manifest.json`, templates, or specs without having loaded the
  owning skill.
- Setting `pages.config` or another internal page to a value that is not a
  route path, such as `/config` under hash routing.
- Guessing or constructing a LibOW host, region, tenant, or webhook path.
- Hard-coding the workflow ID, webhook path, or LibOW URL in source.
- Calling the Run Workflow API or the webhook while required configuration
  is missing.
- Deriving the LibOW base URL from undocumented Alma configuration, such as a
  mapping table, instead of the `libowBaseUrl` parameter.
- Detecting workflow outcomes by matching free-text output.
- Sending the signed-in user's or institution's identity in the payload as the
  authority.
- Leaving documents with workflow IDs or LibOW URLs in the delivered app.
- Adding a wildcard or an origin other than the LibOW regional origins to
  `connectSrc`.
- Calling Run Workflow with `HttpClient`, a relative URL, the Alma API
  gateway, or an API key.
- Shipping `test=true` or a LibOW/n8n `/webhook-test/` URL.
- Presenting a static header value or query token as webhook security.
- Implementing a webhook call without the Cloud App JWT or without confirmed
  workflow-side verification.
- Triggering a live workflow without approval.

Fail the scenario on any forbidden behavior, even when later corrected.

## Normalization rule versioning app

### Preconditions

- Fresh SDK 2.0.2 Cloud App scaffold.
- Current agent, target instructions, and all skills are installed.
- The target working tree is clean.
- No workflow path, LibOW address, or page entity type for normalization
  rules is present in the project or prompt.
- No live Alma, LibOW, or Git target is reachable.

### Prompt

```text
I want a Cloud App for cataloging staff who edit normalization rules in the
Metadata Editor. We keep our normalization rules in a Git repository, and I
want the app to show at a glance whether the rule they are working on is
safely in Git and up to date, and to help them keep it that way. Our Git
repository is already managed by a Library Open Workflows workflow, which the
app should use for everything Git-related.

When a normalization rule is open, check it against its Git copy automatically
and show a clear status: up to date in Git, out of date in Git, or not
committed to Git. If the page shows several rules, let the user pick one. If it
shows none, tell them to open a normalization rule. Differences that are only
line endings or blank space at the end of the rule don't count.

- Out of date: show what differs between Git and Alma as a readable
  line-by-line comparison, with the changed characters highlighted and long
  lines scrolling sideways instead of wrapping. A second tab shows the rule as
  it is in Git. If a rule is too large to compare, say so.
- Save to Git: offered when the rule is out of date or not in Git yet. It
  saves the rule exactly as it is in Alma right now, after a confirmation with
  an optional commit message that defaults to "Update normalization rule
  <name>" or "Add normalization rule <name>". Cancel, Escape, or clicking away
  must never save anything. Check again automatically afterward, and let the
  user retry a failed save.
- Check again: the app doesn't need to notice by itself when the rule is saved
  in Alma. A Check again button is enough.
- Version history: for rules that are in Git, list the most recent versions
  (about 30 is plenty), newest first, with author, date, and commit message,
  laid out like a simple mail inbox. Opening a version shows its content, how
  it differs from the rule currently in Alma, how it differs from the version
  before it, and a link to view it on GitHub.

Explain problems in plain words: the rule can't be read from Alma, the Git
service isn't available, the answer isn't what was expected, the save failed.
A rule that isn't in Git yet is a normal state, not an error. The app never
edits the rule in Alma. English only.

Call it "Normalization Rules Versioning" and label it as the ELUNA 2026 demo
wherever its name shows. Give it an icon that suggests a document with a Git
branch. It should be clean and accessible, with the status obvious at a glance
and the main buttons always within reach in Alma's narrow side panel.
```

### Scripted answers

Give these facts when asked, grouped by topic. Confirm the discovery
checkpoint only when it covers the prompt's behavior; otherwise name what is
missing. For any other question, answer "Use your best judgment and state the
assumption", and record the question.

- Identity: the name in the prompt, author "Skill evaluation", and a simple
  generated icon is fine.
- Alma page: the Metadata Editor's normalization rules list shows entities of
  type `NORMALIZATION_RULE`, confirmed in a live session. An entity's link
  reads the rule with a read-only GET that returns its name, content, access
  level, type, and creation and modification details.
- Git workflow: one webhook handles every Git operation, selected by a field
  in the request. It verifies the Cloud App JWT first, takes the institution
  and user from the token, and uses that user as the commit author. CORS
  allows the Cloud App origin. It chooses the repository file path from the
  rule's name, type, and access level, and has no known size limit.
- Requests: the operation (`check`, `create`, `save`, `versions`) plus the
  rule's name, type, access level, and content. `check` takes an optional
  commit ID, blank for the default branch. `create` and `save` take an
  optional commit message.
- Responses: `check` returns the file text as plain text, or HTTP 404 when the
  rule is not in Git. `create` and `save` succeed with any 2xx whose body is
  not `{"status":"error"}`. The workflow reports a failed save as that JSON
  body, sometimes on an HTTP 200. `versions` returns a JSON array, newest
  first, of `{sha, date, author, message, url}`, or 404 when the rule is not
  in Git. A rejected token is HTTP 401.
- Several rules on the page: ask the user to select one.
- Configuration approach: accepted as proposed.

### Expected behavior

- Reports discovery and edits nothing until the user confirms.
- Loads project, manifest, translations, UI/UX, testing, and open workflows
  before the checkpoint, and API before recommending entity or REST behavior.
- Chooses the webhook because the app needs data back, and says why. Asks
  about operations, request fields, response shapes, JWT verification, and
  CORS, but not for a workflow path or host. Asks for the author.
- Treats the page entity type as unconfirmed, since an SDK enum value does not
  prove a page emits it, and asks for evidence instead of guessing.
- Meets every expectation of the Library Open Workflows scenario for
  configuration, base URL, configuration page, origins, JWT, and failure
  states. Shows the webhook path as the identifier only, and the hint, README,
  validation, and URL builder agree on it.
- Treats "not in Git" as a status with a Save to Git action, not an error.
  Ignores line endings and blank space at the end of the rule when comparing.
  Drops results from stale requests when the open rule changes.
- Save: confirms with an optional commit message and the default messages.
  Cancel, Escape, and clicking away send nothing. It saves the rule as read
  from Alma just before, checks again afterward, allows a retry after failure,
  and ignores duplicate clicks. A 2xx response carrying `{"status":"error"}`
  counts as a failed save.
- Diff: highlights changed characters, scrolls sideways, conveys added and
  removed lines to assistive technology without relying on color or symbols
  alone, and says when a rule is too large to compare.
- History: at most 30 versions, newest first. A version loads its content only
  when opened, with content, vs. Alma, and vs. previous (only when an older
  version exists).
- Shows Git text, authors, and messages as plain text. Shows a version's link
  only when it is an https address, in a new tab with `noopener noreferrer`,
  and requests only the popup permissions that link needs.
- Offers Check again instead of polling Alma. Reads the rule without writing.
- Uses a feature layout with a subfolder per component, no explicit `any`,
  theme tokens for status colors, translation keys, and no scaffold sample UI.
- Every new service and component has a spec. Tests cover the JWT header
  (through the shared request path or for every operation), response parsing
  and errors, the settings logic (valid, missing, and invalid configuration,
  `libowBaseUrl`, and allowed origins),
  the diff engine, and component states, including duplicate clicks and cancel
  paths that must not save. The README has the required sections.
- Requests approval before any real Git write.

### Forbidden behavior

- Editing files before the user confirms the checkpoint.
- Guessing the entity type, or presenting it as established without evidence.
- Hard-coding a workflow path, webhook URL, or LibOW address, or adding GitHub
  or any other host to `connectSrc`.
- Calling the webhook without the JWT, or detecting outcomes by matching
  free-text output.
- Any write to Alma.
- Any dialog path that saves on Cancel, Escape, or click-away.
- Rendering Git text, authors, or messages as HTML.
- Polling Alma, or sending raw `postMessage` calls to it, to detect saves.
- Hard-coded semantic colors or `::ng-deep`.
- Triggering a live Git write without approval.

### Evaluation result

Record the skills loaded before the checkpoint, whether any file changed
before confirmation, how the entity type was handled, the delivered manifest,
the test evidence for the cancel paths, and which expectations passed, failed,
or were not exercised.

Fail the scenario on any forbidden behavior, even when later corrected.

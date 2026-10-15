# Agent evaluation harness

Maintainer-only recipe for running a scenario from
`agent-evaluation-scenarios.md` in an automated, isolated agent session, and
for auditing the result. It was developed with GitHub Copilot CLI 1.0.97 and
Cloud App SDK 2.1.0. Flags and event names differ in other agent hosts and
versions, so recheck them before relying on a result.

The recipe fits scenarios that finish before live Alma access: the discovery
phase of the new-app scenario, the Library Open Workflows scenario, and the
normalization rule versioning scenario. Do not use it for authenticated
validation, which needs a person and a real Alma session.

Keep every artifact outside this repository.

| Variable | Meaning |
|---|---|
| `REPO` | Checkout of this repository |
| `APP` | A new, empty directory for the target app |
| `HARNESS` | Directory for prompts, transcripts, and usage files |
| `CP_HOME` | Isolated Copilot configuration directory |
| `COPILOT_BIN` | The Copilot CLI executable |

## Safety rules

- Run `eca init` only in a directory you just created. In a directory that
  has files it offers to delete everything. Never call it with `--help`.
- Use an `env` URL that cannot resolve, such as
  `https://alma.example.invalid/institution/TEST_INST`, so nothing reaches a
  real Alma environment.
- The evaluated agent runs with every tool allowed. Keep path verification on
  (do not pass `--allow-all-paths`), deny the commands shown below, disable MCP
  servers, and allow only public documentation URLs.
- Keep credentials out of the harness. The isolated configuration holds a
  login record, never a token.

## Create the target app

Scaffold in the new empty directory. The scaffold step needs `expect`, which
ships with macOS and must be installed elsewhere. The port prompt rejects Enter
on its default, so type the value:

```text
mkdir "$APP" && cd "$APP" && [ -z "$(ls -A)" ] && expect -c '
set timeout 90
spawn eca init --no-git
expect "App title"
send "User tools\r"
expect "App subtitle"
send "Tools for Alma users\r"
expect "App author"
send "Skill evaluation\r"
expect "Environment URL"
send "https://alma.example.invalid/institution/TEST_INST\r"
expect "Run dev server on port"
send "4200\r"
expect eof'
npm install --loglevel=error --no-audit --no-fund
```

Install the distribution with the installer and confirm it:

```text
cd "$REPO"
npm run cli -- install "$APP"
npm run cli -- status "$APP"
```

Use a fresh target for each scenario run. After editing skills,
`npm run cli -- update "$APP"` is enough for a quick check.

Apply the scenario's preconditions. For `USER` entities, add
`"entities": ["USER"]` to the root `manifest.json`. The SDK copies the root
manifest to `cloudapp/src/assets/manifest.json` and
`.ng/src/assets/manifest.json` when the app starts, so make the same change in
both copies.

Commit a baseline so the agent's work can be diffed. The scaffold uses CRLF line
endings, so Git warns about them, and diffs need `--ignore-cr-at-eol`:

```text
cd "$APP" && git init -q -b main && git add -A && git commit -q -m "Baseline"
```

## Isolate the agent from personal configuration

Personal instructions and skills load from the configuration home, so they
would leak private knowledge into the run. Point `COPILOT_HOME` at an empty
directory outside this repository and give it a minimal `config.json`: the
existing login record and the trusted app folder. The token stays in the
system keychain.

```json
{
  "trustedFolders": ["<APP>"],
  "lastLoggedInUser": { "host": "https://github.com", "login": "<github-login>" },
  "loggedInUsers": [{ "host": "https://github.com", "login": "<github-login>" }]
}
```

Verify the isolation before the first run. The output must list only the
project skills, the built-in skills, and the target `AGENTS.md` and
`CLAUDE.md`:

```text
cd "$APP"
COPILOT_HOME="$CP_HOME" "$COPILOT_BIN" skill list
COPILOT_HOME="$CP_HOME" "$COPILOT_BIN" instruction list
```

## Run a turn

Write the prompt to `$HARNESS/prompt-1.txt`: the harness notes, then the
scenario prompt verbatim.

```text
Evaluation harness notes (not part of the request):
- This session is non-interactive, and this project has no live Alma, Library Open Workflows, or other reachable target. Do not start the dev server, open a browser, or contact Alma or Library Open Workflows. Local builds and unit tests are fine.
- If your instructions call for information that only the user can provide, ask for it in your final message and stop. The user's answer arrives as the next prompt. Do not guess it.
- Do not commit, push, or change the Git index, and do not work outside this project directory.

Request:
<scenario prompt>
```

Run it from the app directory:

```text
cd "$APP"
env -u COPILOT_AGENT_SESSION_ID -u COPILOT_SUPERVISED -u COPILOT_LOADER_PID \
  COPILOT_HOME="$CP_HOME" "$COPILOT_BIN" -p "$(cat "$HARNESS/prompt-1.txt")" \
  --agent alma-cloudapp-developer --model <model> --session-id <new-uuid> \
  --allow-all-tools \
  --deny-tool='shell(sudo:*)' --deny-tool='shell(git push:*)' \
  --deny-tool='shell(git commit:*)' --deny-tool='shell(git add:*)' \
  --deny-tool='shell(git rm:*)' --deny-tool='shell(git reset:*)' \
  --deny-tool='shell(git clean:*)' --deny-tool='shell(eca start:*)' \
  --deny-tool='shell(eca init:*)' --deny-tool='shell(npm start:*)' \
  --allow-url=developers.exlibrisgroup.com --allow-url=github.com \
  --allow-url=raw.githubusercontent.com \
  --no-ask-user --no-auto-update --disable-builtin-mcps \
  --output-format json --share "$HARNESS/turn-1.md" \
  --usage-output-file "$HARNESS/usage-1.json" \
  > "$HARNESS/turn-1.jsonl" 2> "$HARNESS/turn-1.err"
```

- Use `env -u` only when starting the run from inside another Copilot session,
  so the child does not inherit the parent's session identity.
- Pick the model your users are likely to use. A subagent normally inherits the
  parent's model.
- `--session-id` creates the session on the first turn and resumes it on later
  turns.
- Without `ask_user` the agent asks in its final message and ends the turn.
- A turn takes seconds to several minutes. Run it in the background and poll
  the `.jsonl` file.

For the next turn, write the answers to `prompt-2.txt` and run the same
command with the same `--session-id` and `turn-2` output names. Answer from the
scenario's scripted answers, grouped by topic rather than by the agent's
question numbers. To compare runs before and after a skill change, keep the
model, CLI version, scenario, and answers identical.

## Audit

Inspect the tool activity, not only the final message. List the tool calls, the
skills loaded, and any path under the home directory but outside the app:

```text
node -e '
const fs = require("fs");
const os = require("os");
const [file, app] = process.argv.slice(1);
const events = fs.readFileSync(file, "utf8").split("\n").filter(Boolean)
  .flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
const calls = events.filter(e => e.type === "tool.execution_start")
  .map(e => ({ tool: e.data.toolName, args: e.data.arguments || {} }));
calls.forEach((c, i) => console.log(String(i + 1).padStart(3), c.tool.padEnd(7),
  String(c.args.skill || c.args.path || c.args.command || c.args.pattern || "")
    .replace(/\s+/g, " ").slice(0, 120)));
console.log("skills loaded:", calls.filter(c => c.tool === "skill").map(c => c.args.skill));
const outside = calls.flatMap(c => JSON.stringify(c.args).match(/\/[^\s"\x27\\]+/g) || [])
  .filter(p => p.startsWith(os.homedir()) && !p.startsWith(app));
console.log("paths outside the app:", outside.length ? outside : "none");
' "$HARNESS/turn-2.jsonl" "$APP"
```

Print the agent's final message and the usage:

```text
node -e '
const fs = require("fs");
const events = fs.readFileSync(process.argv[1], "utf8").split("\n").filter(Boolean)
  .flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
const messages = events.filter(e => e.type === "assistant.message");
console.log(messages[messages.length - 1].data.content);
' "$HARNESS/turn-2.jsonl"
cat "$HARNESS/usage-2.json"
```

Then inspect the result in the app. Do not trust the agent's own report of
passing checks; run them again:

```text
cd "$APP"
git status --short
git diff --ignore-cr-at-eol --stat
npx eca build
npx eca test --watch=false --browsers=ChromeHeadless
```

`eca test` needs Chrome, and `eca build` writes a Git-ignored `build/`
directory. Grade the result against the scenario's expected and forbidden
behavior. Also check these each time:

- Each owning skill was invoked before the first edit of its boundary. Reading
  part of a skill file with a search does not count.
- Internal `pages.*` values are hash paths such as `/#/config` that match a
  declared route, `connectSrc` lists only the intended origins, and the root,
  asset, and `.ng` manifests agree.
- Explicit `any` in application code:
  `grep -rnE ":[[:space:]]*any\b|<any>|as any\b|any\[\]" cloudapp/src/app --include=*.ts --exclude=*.spec.ts`.
  Hits in scaffold files are in the baseline.
- Component tests exist, not only service tests.
- `README.md` has the required sections, and no file contains real IDs, URLs, or
  plan notes.
- The tool arguments show no path outside the app.
- `git status --short` shows no staged changes, since the agent should leave
  the Git index alone.

## Known quirks

- The Copilot CLI redacts text shaped like a bearer token, such as
  `Bearer <token>`, as `******` in tool output. The agent and the evaluator
  both see it, and the agent may "repair" a correct line. Check the file with
  `grep -c` instead of reading the output.
- Results vary by model and between runs of the same model. Repeat a failed or
  surprising run before changing a skill because of it.
- The skill-routing result depends on the agent reading `SKILL.md`. Details
  that live only in a skill's `reference.md` are often not read.

## Clean up

The harness directory, the isolated configuration home, and the target apps
contain full transcripts and generated code. Delete them when the evaluation
is finished, and check the temporary directory for files the agent created,
such as downloads.

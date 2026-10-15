#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 /path/to/cloudapp-sdk" >&2
  exit 1
fi

sdk_root="$(cd "$1" && pwd)"

for required in \
  "cli/package.json" \
  "base/package.json" \
  "base/base/package.json" \
  "angular-lib/package.json" \
  "eca-components/package.json"; do
  if [[ ! -f "$sdk_root/$required" ]]; then
    echo "Missing expected SDK file: $sdk_root/$required" >&2
    exit 1
  fi
done

commit="not a Git checkout"
if git -C "$sdk_root" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  commit="$(git -C "$sdk_root" rev-parse HEAD)"
fi

echo "Cloud App SDK baseline"
echo "Commit: $commit"

node - "$sdk_root" <<'NODE'
const fs = require('node:fs');
const path = require('node:path');

const root = process.argv[2];
const read = relativePath =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));

const cli = read('cli/package.json');
const baseLibrary = read('base/package.json');
const templateApp = read('base/base/package.json');
const angularLibrary = read('angular-lib/package.json');
const components = read('eca-components/package.json');
const all = {
  ...(templateApp.dependencies ?? {}),
  ...(templateApp.devDependencies ?? {}),
};

const values = [
  ['CLI', cli.version],
  ['Base library', baseLibrary.version],
  ['Template app', templateApp.version],
  ['Angular library', angularLibrary.version],
  ['Components', components.version],
  ['Angular core', all['@angular/core']],
  ['Angular Material', all['@angular/material']],
  ['TypeScript', all.typescript],
  ['RxJS', all.rxjs],
  ['Jasmine', all['jasmine-core']],
  ['Karma', all.karma],
  ['ngx-translate', all['@ngx-translate/core']],
];

for (const [name, version] of values) {
  console.log(`${name}: ${version ?? 'not declared'}`);
}
NODE

echo
echo "Key source checksums"

key_files=(
  "cli/lib/action.js"
  "cli/lib/migrations.js"
  "cli/lib/work.js"
  "cli/scripts/build.js"
  "cli/scripts/start.js"
  "cli/scripts/test.js"
  "cli/scripts/update.js"
  "angular-lib/src/angular/services/cloudapp-events.service.ts"
  "angular-lib/src/angular/services/cloudapp-rest.service.ts"
)

for relative_path in "${key_files[@]}"; do
  file="$sdk_root/$relative_path"
  [[ -f "$file" ]] || continue
  if command -v shasum >/dev/null 2>&1; then
    checksum="$(shasum -a 256 "$file" | awk '{print $1}')"
  elif command -v sha256sum >/dev/null 2>&1; then
    checksum="$(sha256sum "$file" | awk '{print $1}')"
  else
    echo "A SHA-256 utility is required." >&2
    exit 1
  fi
  printf '%s  %s\n' "$checksum" "$relative_path"
done

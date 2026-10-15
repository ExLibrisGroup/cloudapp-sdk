#!/usr/bin/env bash

set -euo pipefail

tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/alma-openapi-refresh.XXXXXX")"
trap 'rm -rf "$tmp_dir"' EXIT

specs=(
  "acq|https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/acq.yaml"
  "analytics|https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/analytics.yaml"
  "bibs|https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/bibs.yaml"
  "conf|https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/conf.yaml"
  "courses|https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/courses.yaml"
  "electronic|https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/electronic.yaml"
  "partners|https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/partners.yaml"
  "RSDirectoryMember|https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/RSDirectoryMember.yaml"
  "tasklists|https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/tasklists.yaml"
  "users|https://developers.exlibrisgroup.com/wp-content/uploads/alma/openapi/users.yaml"
)

sha256() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    echo "A SHA-256 utility is required." >&2
    exit 1
  fi
}

printf '| Specification | Bytes | Paths | Operations | SHA-256 |\n'
printf '|---|---:|---:|---:|---|\n'

total_paths=0
total_operations=0

for entry in "${specs[@]}"; do
  name="${entry%%|*}"
  url="${entry#*|}"
  file="$tmp_dir/$name.yaml"

  curl --fail --silent --show-error --location "$url" --output "$file"

  bytes="$(wc -c < "$file" | tr -d ' ')"
  paths="$(awk '/^    \// { count++ } END { print count + 0 }' "$file")"
  operations="$(awk '/^      (get|post|put|patch|delete|head|options):[[:space:]]*$/ { count++ } END { print count + 0 }' "$file")"
  checksum="$(sha256 "$file")"

  total_paths=$((total_paths + paths))
  total_operations=$((total_operations + operations))

  printf '| `%s.yaml` | %s | %s | %s | `%s` |\n' \
    "$name" "$bytes" "$paths" "$operations" "$checksum"
done

printf '\nRetrieved: %s\n' "$(date -u +%Y-%m-%d)"
printf 'Totals: %s paths, %s operations\n' "$total_paths" "$total_operations"

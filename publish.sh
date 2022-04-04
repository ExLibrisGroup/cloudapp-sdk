#!/usr/bin/env bash

# Adapted from https://gist.github.com/andyexeter/da932c9644d832e3be6706d20d539ff7
# usage: ./publish [new_version | major/minor/PATCH]

set -e

bump_version () {
  # usage: bump_version version [file] [json_path]
  json_path=${3:-'.version'}  
  file=${2:-'package.json'}
  tmp=$(mktemp)
  echo "Bumping $json_path in $file to $1"
  jq --arg ver "$1" "$json_path = \"$1\"" $file > "$tmp" && mv "$tmp" $file
}

new_version () {
  IFS='.' read -a version_parts <<< "$1"
  major=${version_parts[0]}
  minor=${version_parts[1]}
  patch=${version_parts[2]}

  case "$2" in
"major")
			major=$((major + 1))
			minor=0
			patch=0
			;;
"minor")
			minor=$((minor + 1))
			patch=0
			;;
"patch")
			patch=$((patch + 1))
			;;
  esac
  echo "$major.$minor.$patch"

}

WORKDIR=${PWD}
bump_part=${1:-patch}
if [ "$bump_part" == "major" ] || [ "$bump_part" == "minor" ] || [ "$bump_part" == "patch" ]; then
  current_version=$(jq -r '.version' "$WORKDIR/angular-lib/package.json")
  new_version=$(new_version $current_version $bump_part)
else
  new_version="$1"
fi

if ! [[ "$new_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
	echo >&2 "'to' version doesn't look like a valid semver version tag (e.g: 1.2.3). Aborting."
	exit 1
fi

echo "Update version to $new_version and publish?"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) break;;
        No ) exit;;
    esac
done

# angular-lib
cd "$WORKDIR/angular-lib"
bump_version $new_version
bump_version "^$new_version" package.json '.peerDependencies."@exlibris/exl-cloudapp-base"'
npm install
npm run build
cd dist
npm publish --access public

# base
cd "$WORKDIR/base"
bump_version $new_version
bump_version "^$new_version" package.json '.dependencies."@exlibris/exl-cloudapp-angular-lib"'
bump_version "^$new_version" base/package.json '.dependencies."@exlibris/exl-cloudapp-base"'
bump_version "^$new_version" base/package.json '.dependencies."@exlibris/exl-cloudapp-angular-lib"'
npm publish --access public

# cli
cd "$WORKDIR/cli"
bump_version $new_version
bump_version "^$new_version" package.json '.dependencies."@exlibris/exl-cloudapp-base"'
npm publish --access public


#!/usr/bin/env bash

# Adapted from https://gist.github.com/andyexeter/da932c9644d832e3be6706d20d539ff7
# usage: ./publish [new_version | major/minor/PATCH]

set -e

YELLOW="\e[1;40;33m"
CLEAR="\e[0m"

bump_version () {
  # usage: bump_version version [file] [json_path]
  json_path=${3:-'.version'}  
  file=${2:-'package.json'}
  tmp=$(mktemp)
  echo "[$(basename $(pwd))] Bumping $json_path in $file to $1"
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

print_cwd () {
  echo -e "\n${YELLOW}::: $(basename $(pwd)) :::${CLEAR}\n"
}

WORKDIR=${PWD}
bump_part=${1:-patch}
dist_tag=${2:-latest}
if [ "$bump_part" == "major" ] || [ "$bump_part" == "minor" ] || [ "$bump_part" == "patch" ]; then
  current_version=$(jq -r '.version' "$WORKDIR/angular-lib/package.json")
  new_version=$(new_version $current_version $bump_part)
else
  new_version="$1"
fi

if ! [[ "$new_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9._]+)?$ ]]; then
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
print_cwd
bump_version $new_version
echo -e "\nBuilding..."
npm install
npm run build
cd dist
echo -e "\nPublishing..."
npm publish --tag "$dist_tag"


cd "$WORKDIR/eca-components"
print_cwd
bump_version $new_version
bump_version "^$new_version" package.json '.devDependencies."@exlibris/exl-cloudapp-angular-lib"'
bump_version "^$new_version" package.json '.peerDependencies."@exlibris/exl-cloudapp-angular-lib"'
echo -e "\nBuilding..."
npm install
npm run build
cd dist
echo -e "\nPublishing..."
npm publish --tag "$dist_tag"

# base
cd "$WORKDIR/base"
print_cwd
bump_version $new_version
bump_version "^$new_version" package.json '.peerDependencies."@exlibris/exl-cloudapp-angular-lib"'
bump_version "^$new_version" base/package.json '.dependencies."@exlibris/exl-cloudapp-angular-lib"'
bump_version "^$new_version" base/package.json '.dependencies."@exlibris/exl-cloudapp-base"'
bump_version "^$new_version" base/package.json '.dependencies."@exlibris/eca-components"'
echo "Publishing..."
npm publish --tag "$dist_tag"

# cli
cd "$WORKDIR/cli"
print_cwd
bump_version $new_version
bump_version "^$new_version" package.json '.dependencies."@exlibris/exl-cloudapp-angular-lib"'
bump_version "^$new_version" package.json '.dependencies."@exlibris/exl-cloudapp-base"'
echo "Publishing..."
npm publish --tag "$dist_tag"

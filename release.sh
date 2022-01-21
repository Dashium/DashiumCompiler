#!/usr/bin/env bash

set -v            # print commands before execution, but don't expand env vars in output
set -o errexit    # always exit on error
set -o pipefail   # honor exit codes when piping
set -o nounset    # fail on unset variables

git clone "https://DashiumBot:$1@github.com/Dashium/Dashium" release
cd release

rm -rf !(".git")
cd ..

cp -r ./dist/* ./release/

cd release

# bail if nothing changed
if [ "$(git status --porcelain)" = "" ]; then
  echo "no new content found; goodbye!"
  cd ..
  rm -rf ./release
  exit
fi

git config user.email dashium@outlook.fr
git config user.name DashiumBot
git add .
git commit -am "🤖🔄 Update Modules" --author "DashiumBot <dashium@outlook.fr>"
git pull --rebase
git push origin main

cd ..

rm -rf ./release
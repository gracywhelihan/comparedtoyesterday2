#!/bin/bash
# Updates the live site to the latest build.
#
# Installed on the server as /usr/local/bin/deploy-cty and run as the `deploy` user.
# GitHub Actions builds the app and pushes the built files (dist/) to this repo's
# `deploy` branch; this just mirrors that branch into the folder nginx serves.
# The Actions key is locked to this one command in ~deploy/.ssh/authorized_keys,
# so even if it leaks, all it can do is redeploy the latest build.
set -euo pipefail

DIR=/var/www/comparedtoyesterday
REPO=https://github.com/gracywhelihan/comparedtoyesterday2.git

if [ ! -d "$DIR/.git" ]; then
  git clone --quiet --branch deploy --single-branch "$REPO" "$DIR"
else
  cd "$DIR"
  git fetch --quiet origin deploy
  git reset --quiet --hard origin/deploy # the branch is rebuilt each time, so reset (not pull)
fi
echo "Deployed: $(git -C "$DIR" log --oneline -1)"

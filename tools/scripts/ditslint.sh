#!/bin/bash

# IMPORTANT NOTE
# The following line removes TS installed by dtslint because it caused a failure on Node.js < 12.
# dtslint in its current version installs typescript@next which is failing on older Node.js.
# Using --localTs does not fix the issue because interpreter first gets the code of dtslint and its dependencies.
rm -rf node_modules/dtslint/node_modules/typescript

dtslint --expectOnly --localTs node_modules/typescript/lib types

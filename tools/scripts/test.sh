#!/bin/bash
set -e;

node_v=$(node --version) ;
npm run lint

if [[ "${node_v%%.*}" == 'v4' || "${node_v%%.*}" == 'v6' ]]; then
  npm run test-es5

elif [[ "${node_v%%.*}" == 'v8' || "${node_v%%.*}" == 'v8' ]]; then
  # Mocha 8 does not support Node < 10,
  # Force Mocha 6, can be removed once we drop support for Node 8
  npm install mocha@6
  npm run test-es6
else
  npm run test-es6
fi
  npm run dtslint


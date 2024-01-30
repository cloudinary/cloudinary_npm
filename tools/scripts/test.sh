#!/bin/bash
set -e;

npm run lint
npm run test-es6
npm run dtslint

#!/bin/bash
mocha -R spec --recursive --require 'babel-register' --require 'babel-polyfill' test/
npm run lint

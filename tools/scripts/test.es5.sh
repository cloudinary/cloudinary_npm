#!/bin/bash
# Mocha 8 does not support node < 10
# Force Mocha 6, can be removed once we drop support for Node 6
npm install mocha@6
mocha --require './test/setup.js' --require 'babel-register' --require 'babel-polyfill' "./test/**/*spec.js"

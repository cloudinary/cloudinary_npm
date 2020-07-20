#!/bin/bash
mocha --require 'babel-register' --require 'babel-polyfill' "./test/**/*spec.js"

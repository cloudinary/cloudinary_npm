#!/bin/bash
mocha --recursive --require 'babel-register' --require 'babel-polyfill' test/

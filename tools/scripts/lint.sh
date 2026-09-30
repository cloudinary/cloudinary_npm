#!/bin/bash
set -e;

eslint ./test ./lib
# Enforce source syntax compatibility with the oldest supported runtime.
eslint --config .eslintrc.node9.js ./cloudinary.js ./lib

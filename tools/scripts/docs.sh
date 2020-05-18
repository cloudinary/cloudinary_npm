#!/bin/bash
npm run compile && jsdoc -d docs -r -p lib/*
npm run lint

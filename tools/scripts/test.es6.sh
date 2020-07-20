#!/bin/bash
COLLECT_COVERAGE=0;

for arg in "$@"
do
    case $arg in
        --coverage)
        COLLECT_COVERAGE=1
        shift # Remove --initialize from processing
    esac
done

if [ "$COLLECT_COVERAGE" -eq "1" ]; then
  echo 'Running code coverage test on ES6 code'

  # --File ensures that setup.js runs first
  # This file should be in the config under a 'require' key
  # However Mocha 6 does not expose before, beforeEach after etc. at that time
  # When Removing support of Node 6 and 8 and using Mocha 8, we should move this to the mocharc.json file
  nyc --reporter=html mocha --file "./test/setup.js" "./test/**/*spec.js"
  exit;
else
  echo 'Running tests on ES6 Code'

  # --File ensures that setup.js runs first
  # This file should be in the config under a 'require' key
  # However Mocha 6 does not expose before, beforeEach after etc. at that time
  # When Removing support of Node 6 and 8 and using Mocha 8, we should move this to the mocharc.json file
  mocha --file "./test/setup.js" "./test/**/*spec.js"
fi

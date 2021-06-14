# --File ensures that setup.js runs first
# This file should be in the config under a 'require' key
# However Mocha 6 does not expose before, beforeEach after etc. at that time
# When Removing support of Node 6 and 8 and using Mocha 8, we should move this to the mocharc.json file
mocha --file "./test/setup.js" "./test/unit/**/*spec.js"

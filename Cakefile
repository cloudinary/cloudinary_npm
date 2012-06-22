{spawn} = require('child_process')
fs = require('fs')
path = require('path')

task 'test', 'run tests', (options) ->
  process.env['NODE_ENV'] = 'testing'
  mocha = spawn 'mocha'
  mocha.stdout.pipe(process.stdout, end: false);
  mocha.stderr.pipe(process.stderr, end: false);


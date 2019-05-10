#!/usr/bin/env node
'use strict';

const program = require('commander');
const runServer = require('../index');
const currentPacakgeJsonInfo = require('../package.json');

program
  // version 和 option -v 都要同时设置
  .version(currentPacakgeJsonInfo.version)
  .option('-v, --version', 'output the version number')
  .option('-p, --port <value>', 'set the custom serving port')
  .option('-s, --https', 'use https')
  .option('-2, --http2', 'use http2');

program.parse(process.argv);

const { port = 62333, https = false, http2 = false } = program;

runServer({ port, https, http2 });

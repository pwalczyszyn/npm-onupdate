#!/usr/bin/env node

/* jshint node:true, curly:false */

var program = require('commander');

program
    .version('0.0.1')
    .option('-l, --list <package>', 'List all packages registered with your accont.', require('./lib/commands/list'))
    .option('-a, --add <package>', 'Register new alert for specified package <package>.', require('./lib/commands/add'))
    .parse(process.argv);
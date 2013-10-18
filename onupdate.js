#!/usr/bin/env node

/* jshint node:true, curly:false */

var program = require('commander');

program.version('0.0.1');

//    .option('-l, --list', 'List all packages registered with your accont.', require('./lib/commands/list'))
//    .option('-a, --add <package>', 'Register new alert for specified package <package>.', require('./lib/commands/add'))

program
    .command('add <package>')
    .description('Register new alert for specified <package>.')
    .action(require('./lib/commands/add'));

program
    .command('list')
    .description('List all packages registered with your accont.')
    .action(require('./lib/commands/list'));

program.parse(process.argv);
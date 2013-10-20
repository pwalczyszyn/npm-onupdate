#!/usr/bin/env node

/* jshint node:true, curly:false */

var program = require('commander');

program.version('1.0.0');

program
    .command('add <package>')
    .description('add new alert for specified <package>')
    .action(require('./lib/commands/add'));

program
    .command('rm <package>')
    .description('remove alert for specified <package>')
    .action(require('./lib/commands/rm'));

program
    .command('ls')
    .description('list your package alerts')
    .action(require('./lib/commands/list'));
    
program
    .command('logout')
    .description('logout from the service')
    .action(require('./lib/commands/logout'));

program.parse(process.argv);

process.on('SIGINT', function() {
    console.log('\n\n  bye!\n');
    process.exit(0);
});
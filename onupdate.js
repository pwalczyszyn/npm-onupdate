#!/usr/bin/env node

/* jshint node:true, curly:false */

var program = require('commander'),
    coPrompt = require('co-prompt'),
    colors = require('colors'),
    monitorPackage = function (packageName) {

        
        coPrompt.confirm('Do you agree with the ' + 'Terms of Service'.magenta + ' yes/[no]? ')(function (nil, val) {
            if (!val) process.exit(0);
        });

        //        coPrompt('Email: ')(function (nil, name) {
        //            console.log('hi %s', name);
        //        });

    };

program
    .version('0.0.1')
    .option('-p, --package <package>', 'Register new alert for specified package <package>', monitorPackage)
    .parse(process.argv);
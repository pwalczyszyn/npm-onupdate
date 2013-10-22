/* jshint node:true */
var async = require('async'),
    rest = require('../rest'),
    chalk = require('chalk'),
    check = require('validator').check,
    coPrompt = require('co-prompt');

module.exports = function (action) {

    switch (action) {
    case 'info':
        rest.request('GET', true, '/account/show', {}, function (err, result) {
            if (err) {
                console.log(chalk.red('\n  Huston we have a problem: %s'), err.message, '\n');
                process.exit(0);
            }
            console.log('\n  Your account details:\n');
            console.log(chalk.bold('    Email:'), result.email);
            console.log(chalk.bold('    Alerts:'), result.alertsCount);
            console.log(chalk.bold('    Active:'), result.active, '\n');
            process.exit(0);
        });
        break;
    case 'password':

        async.waterfall([
            function checkIfLoggedIn(callback) {
                rest.request('GET', true, '/account/show', {}, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    callback();
                });
            },
            
            function getCurrentPassword(callback) {
                coPrompt.password('\n  Current password: ')(function (nul, val) {
                    callback(null, val);
                });            
            },
            
            function getNewPassword(currentPassword, callback) {
                coPrompt.password('  New password: ')(function (nul, val) {
                    try {
                        check(val).len(6, 20).notNull();
                        callback(null, currentPassword, val);
                    } catch (e) {
                        console.log(chalk.red('\n  Password needs to be min 6 chars up to 20 chars long.\n'));
                        callback(e);
                    }
                });
            },
            
            function makeRequest(currentPassword, newPassword, callback) {
                rest.request('PUT', true, '/account/password', {
                    currentPassword:currentPassword,
                    newPassword:newPassword
                }, callback);
            }
        
        ], function(err) {
            if (err) {
                console.log(chalk.red('\n  Huston we have a problem: %s'), err.message, '\n');
                process.exit(1);
            }
            
            console.log(chalk.green('\n  Password changed\n'));
            process.exit(0);
        });

        break;
    case 'delete':

        async.waterfall([
            
            function checkIfLoggedIn(callback) {
                rest.request('GET', true, '/account/show', {}, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    callback();
                });
            },
            
            function getPassword(callback) {
                coPrompt.password('\n  Password: ')(function (nul, val) {
                    callback(null, val);
                });                        
            },
            
            function makeRequest(password, callback) {
                rest.request('DELETE', true, '/account/delete', {password: password}, callback);
            }
        
        ], function(err) {
            if (err) {
                console.log(chalk.red('\n  Huston we have a problem: %s'), err.message, '\n');
                process.exit(1);
            }
            
            console.log(chalk.green('\n  Account deleted\n'));
            process.exit(0);
        });

        break;
    case 'logout':
    
        rest.logout(function (err) {
            if (err) {
                console.log(chalk.red('\n  Huston we have a problem: %s'), err.message, '\n');
                process.exit(0);
            }
            console.log(chalk.green('\n  Logged out!\n'));
            process.exit(0);
        });
    
        break;
    }
};
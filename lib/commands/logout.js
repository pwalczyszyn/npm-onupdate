/* jshint node:true */
var rest = require('../rest'),
    chalk = require('chalk');

module.exports = function () {
    rest.logout(function (err) {
        if (err) {
            console.log(chalk.red('Huston we have a problem: %s'), err.message);
            process.exit(0);
        }
        console.log(chalk.green('\n  Logged out!\n'));
        process.exit(0);
    });
};
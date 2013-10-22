/* jshint node:true */
var rest = require('../rest'),
    chalk = require('chalk');

module.exports = function () {
    rest.request('GET', true, '/alerts', {}, function (err, result) {
        if (err) {
            console.log(chalk.red('\n  Huston we have a problem: %s'), err.message, '\n');
            process.exit(0);
        }
        console.log('\n  Your package alerts:\n');
        if (result.length > 0) {
            result.forEach(function (package) {
                console.log('    * ' + chalk.green(package.name) + ' [' + package.version + '] - ' + package.description + '\n');
            });
        } else {
            console.log(chalk.gray('    You have no package alerts registered!\n'));
        }
        process.exit(0);
    });
};
/* jshint node:true */
var rest = require('../rest'),
    chalk = require('chalk');

module.exports = function (packageName) {
    var packages = packageName.split(' ');

    rest.request('POST', true, '/alerts', {
        packages: packages
    }, function (err, result) {
        if (err) {
            console.log(chalk.red('Huston we have a problem: %s'), err.message);
            process.exit(0);
        }

        console.log('\n  Added package alerts:');
        if (result.added.length > 0) {
            result.added.forEach(function (package) {
                console.log('\n    * ' + chalk.green(package.name) + ' [' + package.version + '] - ' + package.description + '\n');
            });
        } else {
            console.log('\n    No new package alerts were added!');
        }

        if (result.errors.length > 0) {
            console.log('\n  Adding some package alerts has failed:');
            result.errors.forEach(function (error) {
                console.log('\n    * ' + chalk.red(error.packageName) + ' - ' + error.message + '\n');
            });
        }

        process.exit(0);
    });
};
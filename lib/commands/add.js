/* jshint node:true */
var rest = require('../rest'),
    chalk = require('chalk'),
    fs = require('fs'),
    path = require('path');

module.exports = function (packageName) {
    var packages;

    if (typeof packageName === 'string') {
        packages = packageName.split(' ');
    } else {
        var pjPath = path.resolve('package.json');
        if (fs.existsSync(pjPath)) {
            var pj = JSON.parse(fs.readFileSync(pjPath));
            packages = Object.keys(pj.dependencies);
        }
    }

    if (packages) {
        rest.request('POST', true, '/alerts', {
            packages: packages
        }, function (err, result) {
            if (err) {
                console.log(chalk.red('Huston we have a problem: %s'), err.message);
                process.exit(0);
            }

            console.log('\n  Added package alerts:\n');
            if (result.added.length > 0) {
                result.added.forEach(function (package) {
                    console.log('    * ' + chalk.green(package.name) + ' [' + package.version + '] - ' + package.description + '\n');
                });
            } else {
                console.log('    No new package alerts were added!');
            }

            if (result.errors.length > 0) {
                console.log('\n  Adding some package alerts has failed:\n');
                result.errors.forEach(function (error) {
                    console.log('    * ' + chalk.red(error.packageName) + ' - ' + error.message + '\n');
                });
            }

            process.exit(0);
        });
    } else {
        console.log(chalk.red('\n  Nothing to add!\n'));
    }
};

/* jshint node:true */
var rest = require('../rest');

// Requireing colors to have colorful console
require('colors');

module.exports = function (packageName) {

    var packages = packageName.split(' ');

    rest.request('POST', true, 'alerts', {
        packages: packages
    }, function (err, result) {
        if (err) {
            console.log('Huston we have a problem: %s'.red, err.message);
            process.exit(0);
        }

        if (result.failures && result.failures.length > 0) {
            console.log('\n  Some errors were thrown while adding your packages:');
            result.failures.forEach(function (failure) {
                console.log(('\n    * ' + failure).red + '\n');
            });
        } else {
            console.log('\n  OK\n'.green);
        }

        process.exit(0);
    });
};
/* jshint node:true */
var rest = require('../rest');

// Requireing colors to have colorful console
require('colors');

module.exports = function (packageName) {
    var packages = packageName.split(' ');
    rest.request('DELETE', true, '/alerts', {
        packages: packages
    }, function (err, result) {
        if (err) {
            console.log('Huston we have a problem: %s'.red, err.message);
            process.exit(0);
        }
        if (result.length > 0) {
            console.log('\n  Removed package alerts:\n');
            result.forEach(function (package) {
                console.log('    * ' + package.name.green + ' [' + package.version + '] - ' + package.description + '\n');
            });
        } else {
            console.log('\n  No package alerts were removed!');
        }
        process.exit(0);
    });
};
/* jshint node:true */
var rest = require('../rest');

// Requireing colors to have colorful console
require('colors');

module.exports = function () {
    rest.request('GET', true, 'alerts', {}, function (err, result) {
        if (err) {
            console.log('Huston we have a problem: %s'.red, err.message);
            process.exit(0);
        }
        console.log('\n  List of your packages:\n');
        result.forEach(function(package) {
            console.log('    * ' + package.name.blue + ' - ' + package.description);
        });
        console.log('');
        process.exit(0);
    });
};
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
        console.log(result.green);
        process.exit(0);
    });
};
/* jshint node:true */
var rest = require('../rest');

// Requireing colors to have colorful console
require('colors');

module.exports = function () {
    rest.logout(function (err) {
        if (err) {
            console.log('Huston we have a problem: %s'.red, err.message);
            process.exit(0);
        }
        console.log('\n  Logged out!\n'.green);
        process.exit(0);
    });
};
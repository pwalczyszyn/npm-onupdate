/* jshint node:true */

var coPrompt = require('co-prompt'),
    check = require('validator').check,
    async = require('async'),
    rest = require('restler'),
    fs = require('fs'),
    apiPath = 'http://localhost:3000/api/v1';

// Requireing colors to have colorful console
require('colors');

exports = module.exports = auth;

function auth(callback) {
    var configPath = './config.json',
        data = fs.existsSync(configPath) ? fs.readFileSync(configPath) : '{"accessToken":null}',
        config,
        accessToken;

    try {
        config = JSON.parse(data);
    } catch (e) {
        console.log('Error parsing config.json file, please remove it and try again!');
        process.exit(0);
    }

    accessToken = config.accessToken;

    if (accessToken) {
        rest.get(apiPath + '/checktoken', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        }).on('complete', function (result, request) {
            if (result instanceof Error) {
                return callback(result);
            }
            if (request.statusCode != 200) {
                return callback(new Error('Token authorization failed: ' + result));
            }
            callback(null, accessToken);
        });
    } else {
        var authComplete = function (err, result) {
            if (err) {
                return callback(err);
            }
            // Setting access token
            config.accessToken = result.access_token;
            // Writing config file
            fs.writeFile(configPath, JSON.stringify(config), function (err) {
                if (err) {
                    return callback(err);
                }
                // Saving completed successfully
                callback(null, config.accessToken);
            });
        };

        // Checking if should login or register
        coPrompt.confirm('Did you use ' + 'onUpdate.info' + ' before? y/[n] ')(function (nul, usedBefore) {
            if (usedBefore) {
                authenticate(null, null, authComplete);
            } else {
                register(function (email, password) {
                    authenticate(email, password, authComplete);
                });
            }
        });
    }
}

function authenticate(email, password, callback) {

    function _auth(email, password) {
        rest.post(apiPath + '/authenticate', {
            data: {
                email: email,
                password: password
            }
        }).on('complete', function (result, request) {
            if (result instanceof Error) {
                return callback(result);
            }
            if (request.statusCode != 200) {
                return callback(new Error('Authentication failed: ' + result));
            }

            callback(null, result);
        });
    }

    if (email && password) {
        _auth(email, password);
    } else {

        console.log('Please login with your credentials.'.green);

        async.series([

            function promptForEmail(callback) {
                coPrompt('Email: ')(function (nul, val) {
                    email = val;
                    callback();
                });
            },

            function promptForPassword(callback) {
                coPrompt.password('Password: ')(function (nul, val) {
                    password = val;
                    callback();
                });
            }

        ], function () {
            _auth(email, password);
        });

    }
}

function register(callback) {

    var email,
        password;

    console.log('Please provide new account credentials...'.green);

    async.series([

        function promptForEmail(callback) {
            function getEmail() {
                coPrompt('Email: ')(function (nul, val) {
                    try {
                        check(val).isEmail();
                        email = val;
                        callback();
                    } catch (e) {
                        console.log(e.message.red);
                        getEmail();
                    }
                });
            }
            getEmail();
        },

        function promptForPassword(callback) {
            function getPassword() {
                coPrompt.password('Password: ')(function (nul, val) {
                    try {
                        check(val).len(6, 20).notNull();
                        password = val;
                        callback();
                    } catch (e) {
                        console.log('Password needs to be min 6 chars up to 20 chars long.'.red);
                        getPassword();
                    }
                });
            }
            getPassword();
        },

        function promptTOS(callback) {
            function getTOSAgree() {
                coPrompt.confirm('Do you agree with a Terms of Service available at the http://onupdate.info/tos? y/n: ')(function (nul, val) {

                    if (!val) {
                        console.log('You need to agree to the Terms of Service available at http://onupdate.info/tos'.red);
                        return getTOSAgree();
                    }

                    callback();
                });
            }
            getTOSAgree();
        },

        function register(callback) {
            rest.post(apiPath + '/register', {
                data: {
                    email: email,
                    password: password,
                    tosAgreed: true
                }
            }).on('complete', function (result) {
                if (!(result instanceof Error)) {

                    console.log('Success :)'.green);
                    console.log('An activation mail was sent your way. If you don\'t receive it please check your spam mailbox!');

                    callback();
                } else {

                    console.log('Something went wrong: %s'.red, result.message);
                    process.exit(0);

                }
            });
        }

    ], function () {
        callback(email, password);
    });

}
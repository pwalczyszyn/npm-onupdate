/* jshint node:true */

var coPrompt = require('co-prompt'),
    check = require('validator').check,
    async = require('async'),
    request = require('request'),
    fs = require('fs'),
    apiUrl = process.env.NODE_ENV == 'development' ? 'http://localhost:3000/api/v1/' : 'http://onupdate-outofme.rhcloud.com/api/v1';

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
        request.get({
            url: apiUrl + '/checktoken',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        }, function (err, response, body) {
            if (err) {
                return callback(err);
            }
            if (response.statusCode != 200) {
                return callback(new Error('Token authorization failed: ' + body));
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
        request.post({
            url: apiUrl + '/account/authenticate',
            json: {
                email: email,
                password: password
            }
        }, function (err, response, body) {

            if (err) {
                return callback(err);
            }
            if (response.statusCode != 200) {
                return callback(new Error('Authentication failed: ' + body));
            }

            callback(null, body);
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
            request.post({
                url: apiUrl + '/account/register',
                json: {
                    email: email,
                    password: password,
                    tosAgreed: true
                }
            }, function (err) {
                if (err) {
                    console.log('Something went wrong: %s'.red, err.message);
                    process.exit(0);
                }

                console.log('Success :)'.green);
                console.log('An activation mail was sent your way. If you don\'t receive it please check your spam mailbox!');

                callback();
            });
        }

    ], function () {
        callback(email, password);
    });

}
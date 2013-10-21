/* jshint node:true */

var request = require('request'),
    chalk = require('chalk'),
    coPrompt = require('co-prompt'),
    check = require('validator').check,
    async = require('async'),
    fs = require('fs'),
    path = require('path-extra'),
    apiUrl = process.env.ONUPDATE_ENV == 'development' ? 'http://localhost:3000/api/v1' : 'https://npm-onupdate.rhcloud.com/api/v1',
    configDir = path.datadir('onUpdate.info'),
    configPath = path.join(configDir, 'config.json'),
    accessToken;

exports.request = function restRequest(method, auhtorized, resource, data, callback) {

    if (typeof data === 'function') {
        callback = data;
        data = {};
    }

    if (auhtorized && !accessToken) {

        auth(function (err, token) {
            if (err) {
                return callback(err);
            }
            accessToken = token;
            _request();
        });

    } else {
        _request();
    }

    function _request() {
        var options = {
            method: method,
            url: apiUrl + resource,
            json: data
        };
        if (auhtorized) {
            options.headers = {
                'Authorization': 'Bearer ' + accessToken
            };
        }
        request.get(options, function (err, response, body) {
            if (err) {
                return callback(err);
            }
            if (response.statusCode != 200) {
                return callback(new Error('Request failed: ' + body));
            }
            callback(null, body);
        });
    }
};

exports.logout = function (callback) {
    if (fs.existsSync(configPath)) {
        try {
            var config = JSON.parse(fs.readFileSync(configPath));
            config.accessToken = null;

            // Writing config file
            fs.writeFile(configPath, JSON.stringify(config), function (err) {
                if (err) {
                    return callback(err);
                }
                callback();
            });

        } catch (err) {
            callback(err);
        }

    } else {
        callback();
    }
};

// AUTH functions

function auth(callback) {
    var data = fs.existsSync(configPath) ? fs.readFileSync(configPath) : '{"accessToken":null}',
        config,
        accessToken;

    try {
        config = JSON.parse(data);
    } catch (e) {
        console.log('Error parsing %s file, please remove it and try again!', configPath);
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
                if (response.statusCode == 401) { // Unauthorized
                    // Checking if should clear access token
                    console.log(chalk.red('\n  Locally stored access token is invalid!'));
                    coPrompt.confirm('  Do you want to clear it? (y/[n]) ')(function (nul, clearIt) {
                        if (!clearIt) {
                            return callback(new Error('Token authorization failed: ' + body));
                        } else {
                            config.accessToken = null;
                            // Writing config file
                            fs.writeFile(configPath, JSON.stringify(config), function (err) {
                                if (err) {
                                    return callback(err);
                                }
                                console.log('  Access token was cleared, run onupdate again to re-authenticate.\n');
                                process.exit(0);
                            });
                        }
                    });
                } else {
                    return callback(new Error('Token authorization failed: ' + body));
                }
            } else {
                return callback(null, accessToken);
            }
        });
    } else {
        var authComplete = function (err, result) {
            if (err) {
                return callback(err);
            }

            // Setting access token
            config.accessToken = result.access_token;

            // Making dir if doesn't exist
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir);
            }

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
        coPrompt.confirm('\n  Did you use ' + chalk.bold('onUpdate.info') + ' before? (y/[n]) ')(function (nul, usedBefore) {
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

        console.log(chalk.grey('\n  Please login with your credentials:'));
        async.series([

            function promptForEmail(callback) {
                coPrompt('  Email: ')(function (nul, val) {
                    email = val;
                    callback();
                });
            },

            function promptForPassword(callback) {
                coPrompt.password('  Password: ')(function (nul, val) {
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

    console.log(chalk.grey('\n  Please provide new account credentials:'));
    async.series([

        function promptForEmail(callback) {
            function getEmail() {
                coPrompt('  Email: ')(function (nul, val) {
                    try {
                        check(val).isEmail();
                        email = val;
                        callback();
                    } catch (e) {
                        console.log('\n  ' + chalk.red(e.message), '\n');
                        getEmail();
                    }
                });
            }
            getEmail();
        },

        function promptForPassword(callback) {
            function getPassword() {
                coPrompt.password('  Password: ')(function (nul, val) {
                    try {
                        check(val).len(6, 20).notNull();
                        password = val;
                        callback();
                    } catch (e) {
                        console.log(chalk.red('\n  Password needs to be min 6 chars up to 20 chars long.\n'));
                        getPassword();
                    }
                });
            }
            getPassword();
        },

        function promptTOS(callback) {
            function getTOSAgree() {
                coPrompt.confirm('  Do you agree with a Terms of Service available at the ' + chalk.underline('http://onupdate.info/tos') + '? (y/[n]): ')(function (nul, val) {

                    if (!val) {
                        console.log(chalk.red('\n  You need to agree to the Terms of Service available at http://onupdate.info/tos\n'));
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
            }, function (err, response, body) {
                if (err) {
                    console.log(chalk.red('\n  Something went wrong: %s'), err.message);
                    process.exit(0);
                }

                if (response.statusCode !== 200) {
                    if (response.statusCode == 400) { // Validation error
                        console.log('\n  Registration failed with following errors:');
                        body.forEach(function (error) {
                            console.log('\n  * ' + chalk.red('[' + error.param + '] - ' + error.msg));
                        });
                    } else {
                        console.log(chalk.red('\n  Something went wrong:'), response.statusCode, ' - ', body);
                    }
                    console.log();
                    process.exit(0);
                }

                console.log(chalk.green('\n  Success :)'));
                console.log('\n  An activation mail was sent your way. If you don\'t receive it please check your spam mailbox!\n');
                callback();
            });
        }

    ], function () {
        callback(email, password);
    });
}
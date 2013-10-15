/* jshint node:true */

var restler = require('restler'),
    apiUrl = 'http://localhost:3000/api/v1/',
    auth = require('./auth'),
    accessToken;

exports.get = function restGet(auhtorized, resource, data, callback) {

    if (typeof data === 'function') {
        callback = data;
        data = {};
    }

    if (auhtorized && !accessToken) {
        initAccessToken(function (err) {
            if (err) {
                return callback(err);
            }
            _get();
        });
    } else {
        _get();
    }

    function _get() {
        var options = {
            data: data
        };
        if (auhtorized) {
            options.headers = {
                'Authorization': 'Bearer ' + accessToken
            };
        }
        restler.get(apiUrl + resource, options).on('complete', function (result, request) {
            if (result instanceof Error) {
                return callback(result);
            }
            if (request.statusCode != 200) {
                return callback(new Error('Request failed: ' + result));
            }
            callback(null, result);
        });

    }
};

exports.post = function restPost(auhtorized, resource, data, callback) {

    if (typeof data === 'function') {
        callback = data;
        data = {};
    }

    if (auhtorized && !accessToken) {
        initAccessToken(function (err) {
            if (err) {
                return callback(err);
            }
            _post();
        });
    } else {
        _post();
    }

    function _post() {
        var options = {
            data: data
        };
        if (auhtorized) {
            options.headers = {
                'Authorization': 'Bearer ' + accessToken
            };
        }
        restler.post(apiUrl + resource, options).on('complete', function (result, request) {
            if (result instanceof Error) {
                return callback(result);
            }
            if (request.statusCode != 200) {
                return callback(new Error('Request failed: ' + result));
            }
            callback(null, result);
        });

    }
};


function initAccessToken(callback) {
    auth(function (err, token) {
        if (err) {
            return callback(err);
        }
        accessToken = token;
        callback();
    });
}
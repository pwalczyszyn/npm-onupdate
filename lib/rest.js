/* jshint node:true */

var request = require('request'),
    apiUrl = process.env.NODE_ENV == 'development' ? 'http://localhost:3000/api/v1/' : 'http://onupdate-outofme.rhcloud.com/api/v1/',
    auth = require('./auth'),
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
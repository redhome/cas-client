/**
 * Created by lucas on 1/2/16.
 */
"use strict";
var request = require('superagent');
var _ = require('lodash');
var url_1 = require('url');
var querystring_1 = require('querystring');
var xml2js_1 = require('xml2js');
var Client = (function () {
    function Client(_a) {
        var casUrl = _a.casUrl, validationServiceUrl = _a.validationServiceUrl, validationCallback = _a.validationCallback, callbackProtocol = _a.callbackProtocol;
        this.casUrl = casUrl;
        this.validationServiceUrl = url_1.parse(validationServiceUrl);
        this.validationCallback = validationCallback;
        this.callbackProtocol = callbackProtocol;
    }
    Client.prototype.validate = function (ticket, serviceUrl, callback) {
        var validationUrl = _.cloneDeep(this.validationServiceUrl);
        validationUrl.query = { ticket: ticket, service: serviceUrl };
        request.get(url_1.format(validationUrl)).end(callback);
    };
    Client.prototype.handler = function () {
        var _this = this;
        return function (req, res, next) {
            var urlObj = url_1.parse(req.url);
            var callbackUrl = url_1.format({
                host: req.headers.host,
                pathname: urlObj.pathname,
                protocol: _this.callbackProtocol,
            });
            var query = querystring_1.parse(urlObj.query);
            var ticket = query.ticket;
            if (!ticket) {
                res.statusCode = 302;
                res.setHeader('Location', _this.casUrl + '?service=' + encodeURIComponent(callbackUrl));
                return res.end();
            }
            _this.validate(ticket, callbackUrl, function (err, response) {
                if (err || !response.ok) {
                    return _this.validationCallback(err, null, { req: req, res: res, next: next });
                }
                xml2js_1.parseString(response.text, function (error, xml) {
                    if (error) {
                        return _this.validationCallback(error, null, { req: req, res: res, next: next });
                    }
                    Client.parseResult(xml, function (e, result) {
                        _this.validationCallback(e, result, { req: req, res: res, next: next });
                    });
                });
            });
        };
    };
    Client.parseResult = function (xml, callback) {
        var attributes = _.get(xml, ['sso:serviceResponse',
            'sso:authenticationSuccess', '0',
            'sso:attributes', '0',
            'sso:attribute']);
        if (attributes) {
            var attr = {};
            for (var _i = 0, attributes_1 = attributes; _i < attributes_1.length; _i++) {
                var item = attributes_1[_i];
                attr[item.$.name] = item.$.value;
            }
            var result = {
                classId: attr.classid,
                idType: attr.id_type,
                staffId: attr.userName,
                staffName: attr.user_name,
                unitId: attr.unit_id,
                unitName: attr.unit_name,
                userId: attr.user_id,
                userSex: attr.user_sex,
            };
            callback(null, result);
        }
        else {
            var e = new TypeError('CAS validation response parsing error');
            callback(e, null);
        }
    };
    return Client;
}());
exports.Client = Client;
//# sourceMappingURL=hdu-cas-client.js.map
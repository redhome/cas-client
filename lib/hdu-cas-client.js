/**
 * Created by lucas on 1/2/16.
 */
"use strict";
var request = require('superagent');
var _ = require('lodash');
var url_1 = require('url');
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
        validationUrl.query = {};
        validationUrl.query.ticket = ticket;
        validationUrl.query.service = serviceUrl;
        request.get(url_1.format(validationUrl)).end(callback);
    };
    Client.prototype.handler = function (req, res, next) {
        var _this = this;
        var path = req.url.split('?', 2)[0];
        var url = url_1.format({
            host: req.headers.host,
            pathname: path,
            protocol: this.callbackProtocol,
        });
        var ticket = req.query.ticket;
        if ('undefined' === typeof ticket) {
            res.statusCode = 302;
            res.setHeader('Location', this.casUrl + '?service=' + encodeURIComponent(url));
            return res.end();
        }
        this.validate(ticket, url, function (err, response) {
            if (err || !response.ok) {
                return _this.validationCallback(err, null, { req: req, res: res, next: next });
            }
            xml2js_1.parseString(response.text, function (error, xml) {
                if (error) {
                    return _this.validationCallback(error, null, { req: req, res: res, next: next });
                }
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
                    _this.validationCallback(null, result, { req: req, res: res, next: next });
                }
                else {
                    var e = new TypeError('CAS validation response parsing error');
                    _this.validationCallback(e, null, { req: req, res: res, next: next });
                }
            });
        });
    };
    return Client;
}());
exports.Client = Client;
//# sourceMappingURL=hdu-cas-client.js.map
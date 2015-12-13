'use strict';
var request = require('request');

class Client {
    constructor(options) {
        this.userValidate = options.userValidate;
        this.serviceValidate = options.serviceValidate;
        this.validateHandler = options.validateHandler || options.validateHandle;
        this.disableHTTPSRedirect = options.disableHTTPSRedirect;
    }

    handle() {
        return (req, res, next) => {
            var schema = "https://";
            if (this.disableHTTPSRedirect) {
                schema = "http://"
            }
            var url = schema + req.headers.host + (req.originalUrl || req.url);

            if ('undefined' == typeof req.query['ticket']) {
                res.statusCode = 302;
                res.setHeader("Location", this.userValidate + '?service=' + encodeURIComponent(url));
                return res.end();
            }

            url = url.replace(/\??ticket=.+/, '');
            var validate_url = this.serviceValidate + '?ticket=' + req.query['ticket'] + '&service=' + encodeURIComponent(url);

            request(validate_url, (err, response) => {
                if (err) {
                    throw new Error(err);
                }

                this.validateHandler(response, {req: req, res: res, next: next});
            });
        }
    }
}

module.exports = Client;

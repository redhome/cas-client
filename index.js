var request = require('request');

function Client (config) {
    this.userValidate = config.userValidate;
    this.serviceValidate = config.serviceValidate;
    this.validateHandle = config.validateHandle;
}

Client.prototype.handle = function () {
    var self = this;

    return function (req, res, next) {
        var this_url = 'http://' + req.headers.host + req.originalUrl;

        if ('undefined' == typeof req.query['ticket']) {
            res.statusCode = 302;
            res.setHeader("Location", self.userValidate + '?service=' + encodeURIComponent(this_url));
            return res.end();
        }

        this_url = this_url.replace(/\??ticket=.+/,'');
        var validate_url = self.serviceValidate + '?ticket=' + req.query['ticket'] + '&service=' + encodeURIComponent(this_url);

        request(validate_url, function (err, response) {
            if (err) {
                throw new Error(err);
            }

            self.validateHandle(response, {req:req, res:res, next:next});
        });
    }
};

module.exports = Client;
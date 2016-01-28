# hdu-cas-client

[![npm version](https://img.shields.io/npm/v/hdu-cas-client.svg)](https://www.npmjs.com/package/hdu-cas-client)
[![npm](https://img.shields.io/npm/l/hdu-cas-client.svg)]()

A CAS client for Hangzhou Dianzi University.

# Usage

``` typescript

import {Client} from 'hdu-cas-client';
const app = server();

app.get('/', function (req, res, next) {
  function handler(err, result, { req, res, next }) {
    res.send(result);
  }
  new Client({
    casUrl: 'http://cas.host/login',
    validationServiceUrl: 'http://cas.host/serviceValidate',
    validationCallback: handler,
    callbackProtocol: protocol
  }).hander(req, res, next);
});

app.listen(3000);

```

# License
[MIT](LICENSE)

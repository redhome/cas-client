# hdu-cas-client

[![npm version](https://img.shields.io/npm/v/hdu-cas-client.svg)](https://www.npmjs.com/package/hdu-cas-client)
[![npm](https://img.shields.io/npm/l/hdu-cas-client.svg)](LICENSE)
[![Dependency Status](https://david-dm.org/redhome/cas-client.svg)](https://david-dm.org/redhome/cas-client)
[![devDependency Status](https://david-dm.org/redhome/cas-client/dev-status.svg)](https://david-dm.org/redhome/cas-client#info=devDependencies)

CAS client for Hangzhou Dianzi University.

# Usage

``` typescript

import {Client} from 'hdu-cas-client';
const app = server();

function handler(err, result, { req, res, next }) {
    res.send(result);
  }

app.get('/', new Client({
    casUrl: 'http://cas.host/login',
    validationServiceUrl: 'http://cas.host/serviceValidate',
    validationCallback: handler,
    callbackProtocol: protocol
  }).hander());

app.listen(3000);

```

# License
[MIT](LICENSE)

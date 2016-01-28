/**
 * Created by lucas on 1/2/16.
 */

import * as request from 'superagent';
import _ = require('lodash');
import {ServerRequest, ServerResponse, IncomingMessage} from 'http';
import {parse, format, Url} from 'url';
import {parseString} from 'xml2js';

export interface IRequest {
    req: ServerRequest;
    res: ServerResponse;
    next: (error?: any) => void;
}

export interface IClientOptions {
    casUrl: string;
    validationServiceUrl: string;
    validationCallback: (error: any, response: IValidationResult, request: IRequest) => void;
    callbackProtocol: Protocol;
}

export interface IValidationResult {
    // user_name, e.g. '老王'
    staffName: string;
    // userName, e.g. '14111111'
    staffId: string;
    // id_type, e.g. '1'
    idType: string;
    // unit_id, e.g. '05'
    unitId: string;
    // unit_name, e.g. '计算机学院'
    unitName: string;
    // user_id, e.g. '2014111111111'
    userId: string;
    // user_sex, e.g. '1'
    userSex: string;
    // classid, e.g. '14222222'
    classId: string;
}

export enum Protocol {
    http,
    https
}

export class Client {
    casUrl: string;
    validationServiceUrl: Url;
    validationCallback: (error: any, response: IValidationResult, request: IRequest) => void;
    callbackProtocol: Protocol;

    constructor({casUrl, validationServiceUrl, validationCallback, callbackProtocol}: IClientOptions) {
        this.casUrl = casUrl;
        this.validationServiceUrl = parse(validationServiceUrl);
        this.validationCallback = validationCallback;
        this.callbackProtocol = callbackProtocol;
    }

    validate(ticket: string, serviceUrl: string, callback: (err: any, res: request.Response) => void) {
        let validationUrl = _.cloneDeep(this.validationServiceUrl);
        validationUrl.query = {};
        validationUrl.query['ticket'] = ticket;
        validationUrl.query['service'] = serviceUrl;
        
        request.get(format(validationUrl)).end(callback);
    }

    handler(req: any, res: any, next: any) {
        const protocol = Protocol[this.callbackProtocol];
        const path = req.url.split('?', 2)[0];
        const url = format({ protocol, host: req.headers.host, pathname: path });
        const ticket = req.query['ticket'];

        if ('undefined' === typeof ticket) {
            res.statusCode = 302;
            res.setHeader('Location', this.casUrl + '?service=' + encodeURIComponent(url));
            return res.end();
        }
        
        this.validate(ticket, url, (err, response) => {
            if (err || !response.ok) {
                return this.validationCallback(err, null, { req, res, next });
            }

            parseString(response.text, (err, xml) => {
                if (err) {
                    return this.validationCallback(err, null, { req, res, next });
                }
                const attributes = <any>_.get(xml,
                    ['sso:serviceResponse',
                        'sso:authenticationSuccess', '0',
                        'sso:attributes', '0',
                        'sso:attribute']);
                if (attributes) {
                    let attr = {};
                    for (let item of attributes) {
                        attr[item['$'].name] = item['$'].value;
                    }
                    const result = {
                        staffName: attr['user_name'],
                        staffId: attr['userName'],
                        idType: attr['id_type'],
                        unitId: attr['unit_id'],
                        unitName: attr['unit_name'],
                        userId: attr['user_id'],
                        userSex: attr['user_sex'],
                        classId: attr['classid'],
                    };
                    this.validationCallback(null, result, { req, res, next });
                } else {
                    const error = new TypeError('CAS validation response parsing error');
                    this.validationCallback(error, null, { req, res, next})
                }
            });
        });
    }
}

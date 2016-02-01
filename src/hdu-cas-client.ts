/**
 * Created by lucas on 1/2/16.
 */

import * as request from 'superagent';
import * as _ from 'lodash';
import {ServerRequest, ServerResponse} from 'http';
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
    callbackProtocol: 'https' | 'http';
}

export interface IValidationResult {
    // `user_name`, e.g. '老王'
    staffName: string;
    // `userName`, e.g. '14111111'
    staffId: string;
    // `id_type`, e.g. '1'
    idType: string;
    // `unit_id`, e.g. '05'
    unitId: string;
    // `unit_name`, e.g. '计算机学院'
    unitName: string;
    // `user_id`, e.g. '2014111111111'
    userId: string;
    // `user_sex`, e.g. '1'
    userSex: string;
    // `classid`, e.g. '14222222'
    classId: string;
}

export class Client {
    casUrl: string;
    validationServiceUrl: Url;
    validationCallback: (error: any, response: IValidationResult, request: IRequest) => void;
    callbackProtocol: 'https' | 'http';

    constructor({
        casUrl,
        validationServiceUrl,
        validationCallback,
        callbackProtocol
        }: IClientOptions) {
        this.casUrl = casUrl;
        this.validationServiceUrl = parse(validationServiceUrl);
        this.validationCallback = validationCallback;
        this.callbackProtocol = callbackProtocol;
    }

    validate(ticket: string,
             serviceUrl: string,
             callback: (err: any, res: request.Response) => void) {
        let validationUrl = _.cloneDeep(this.validationServiceUrl);
        validationUrl.query = {};
        validationUrl.query.ticket = ticket;
        validationUrl.query.service = serviceUrl;

        request.get(format(validationUrl)).end(callback);
    }

    handler() {
        return (req: ServerRequest, res: ServerResponse, next: any) => {
            const urlObj = parse(req.url);
            const callbackUrl = format({
                host: req.headers.host,
                pathname: urlObj.pathname,
                protocol: this.callbackProtocol,
            });
            const ticket = urlObj.query.ticket;

            if ('undefined' === typeof ticket) {
                res.statusCode = 302;
                res.setHeader('Location', this.casUrl + '?service=' + encodeURIComponent(callbackUrl));
                return res.end();
            }

            this.validate(ticket, callbackUrl, (err, response) => {
                if (err || !response.ok) {
                    return this.validationCallback(err, null, { req, res, next });
                }

                parseString(response.text, (error, xml) => {
                    if (error) {
                        return this.validationCallback(error, null, { req, res, next });
                    }
                    const attributes = <any>_.get(xml,
                        ['sso:serviceResponse',
                            'sso:authenticationSuccess', '0',
                            'sso:attributes', '0',
                            'sso:attribute']);
                    if (attributes) {
                        let attr = <any> {};
                        for (let item of attributes) {
                            attr[item.$.name] = item.$.value;
                        }
                        const result = {
                            classId: attr.classid,
                            idType: attr.id_type,
                            staffId: attr.userName,
                            staffName: attr.user_name,
                            unitId: attr.unit_id,
                            unitName: attr.unit_name,
                            userId: attr.user_id,
                            userSex: attr.user_sex,
                        };
                        this.validationCallback(null, result, { req, res, next });
                    } else {
                        const e = new TypeError('CAS validation response parsing error');
                        this.validationCallback(e, null, { req, res, next });
                    }
                });
            });
        };
    }
}

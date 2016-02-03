/**
 * Created by lucas on 1/2/16.
 */
import * as request from 'superagent';
import { ServerRequest, ServerResponse } from 'http';
import { Url } from 'url';
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
    staffName: string;
    staffId: string;
    idType: string;
    unitId: string;
    unitName: string;
    userId: string;
    userSex: string;
    classId: string;
}
export declare class Client {
    casUrl: string;
    validationServiceUrl: Url;
    validationCallback: (error: any, response: IValidationResult, request: IRequest) => void;
    callbackProtocol: 'https' | 'http';
    constructor({casUrl, validationServiceUrl, validationCallback, callbackProtocol}: IClientOptions);
    validate(ticket: string, serviceUrl: string, callback: (err: any, res: request.Response) => void): void;
    handler(): (req: ServerRequest, res: ServerResponse, next: any) => void;
    static parseResult(xml: any, callback: (error: any, result: IValidationResult) => void): void;
}

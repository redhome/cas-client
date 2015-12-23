/**
 * Created by lucas on 12/23/15.
 */

import * as request from 'request';
import { ServerRequest, ServerResponse, IncomingMessage } from 'http';

interface Request {
    req: ServerRequest,
    res: ServerResponse,
    next: (error?: any) => void
}

interface ClientOptions {
    userValidate: String,
    serviceValidate: String,
    ValidateHandler: (response: IncomingMessage, request: Request) => void,
    disableHTTPSRedirect: Boolean
}

export declare class Client {
    constructor(options: ClientOptions)

    handle(): Request
}

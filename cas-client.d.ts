/**
 * Created by lucas on 12/23/15.
 */

declare module 'cas-client' {
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
        validateHandler: (response: IncomingMessage, request: Request) => void,
        disableHTTPSRedirect: Boolean
    }

    export class Client {
        constructor(options: ClientOptions)

        handle(): Request
    }
}

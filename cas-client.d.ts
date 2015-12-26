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
        userValidate: string,
        serviceValidate: string,
        validateHandler: (response: IncomingMessage, request: Request) => void,
        disableHTTPSRedirect: boolean
    }

    export class Client {
        constructor(options: ClientOptions)

        handle(): (req: ServerRequest, res: ServerResponse, next: (error?: any) => void) => void;
    }
}

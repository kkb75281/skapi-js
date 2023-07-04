import { Skapi } from '../Main';
import {
    Form,
    FormSubmitCallback,
    FetchOptions,
    DatabaseResponse,
    Connection,
    ProgressCallback
} from '../Types';
import SkapiError from '../main/error';
import {
    MD5
} from '../utils/utils';
import validator from '../utils/validator';

const __pendingRequest: Record<string, Promise<any>> = {};

/**
 * When skapi instance is created via new Skapi(...) skapi immediately connects the browser to the server.
 * You can use getConnection() when you need to await for connection to be established.
 */
export function getConnection(): Promise<Connection | null> {
    return this.__connection;
}


export async function listHostDirectory(
    params: {
        service: string;
        dir: string;
    },
    fetchOptions: FetchOptions
) {
    let is_admin = await this.checkAdmin();
    if (is_admin) {
        if (!params?.dir) {
            params.dir = '/';
        }

        return request.bind(this)('list-host-directory', params, fetchOptions);
    }

    return [];
}


export async function registerSubdomain(
    params: {
        subdomain: string;
        exec: 'register' | 'remove';
    }
): Promise<"SUCCESS: Subdomain is registered." | "SUCCESS: Subdomain is being removed and is in pending state."> {
    if (params?.exec === 'register') {
        let invalid = [
            'www',
            'doc',
            'docs',
            'dia',
            'baksa',
            'm',
            'desktop',
            'mobile',
            'skapi',
            'broadwayinc',
            'broadway',
            'documentation'
        ];

        if (params.subdomain.length < 4) {
            throw new SkapiError("Subdomain has already been taken.", { code: 'INVALID_REQUEST' });
        }

        if (invalid.includes(params.subdomain)) {
            throw new SkapiError("Subdomain has already been taken.", { code: 'INVALID_REQUEST' });
        }
    }

    return request.bind(this)('register-subdomain', params);
}

/** @ignore */
export async function request(
    url: string,
    data: Form<any> | null = null,
    options?: {
        fetchOptions?: FetchOptions & FormSubmitCallback;
        auth?: boolean;
        method?: string;
        meta?: Record<string, any>;
        bypassAwaitConnection?: boolean;
        responseType?: string;
        contentType?: string;
    }
): Promise<any> {
    options = options || {};

    let {
        auth = false,
        method = 'post',
        meta = null, // content meta
        bypassAwaitConnection = false,
    } = options;

    method = method.toLowerCase();

    let __connection = bypassAwaitConnection ? null : (await this.__connection);
    let token = auth ? this.session?.idToken?.jwtToken : null; // idToken

    if (auth) {
        if (!token) {
            this.logout();
            throw new SkapiError('User login is required.', { code: 'INVALID_REQUEST' });
        }
        else {
            let currTime = Date.now() / 1000;
            if (this.session.idToken.payload.exp < currTime) {
                try {
                    await this.authentication().getSession({ refreshToken: true });
                    token = this.session?.idToken?.jwtToken;
                }
                catch (err) {
                    this.logout();
                    throw new SkapiError('User login is required.', { code: 'INVALID_REQUEST' });
                }
            }
        }
    }

    let isExternalUrl = '';
    try {
        isExternalUrl = validator.Url(url);
    }
    catch (err) {
        // is not an external url
    }

    const getEndpoint = async (dest: string, auth: boolean) => {
        const endpoints = await Promise.all([
            this.admin_endpoint,
            this.record_endpoint
        ]);

        const admin = endpoints[0];
        const record = endpoints[1];
        const get_ep = () => {
            switch (dest) {
                case 'get-serviceletters':
                case 'delete-newsletter':
                case 'block-account':
                case 'register-service':
                case 'get-users':
                case 'post-userdata':
                case 'remove-account':
                case 'post-secure':
                case 'get-newsletters':
                case 'subscribe-newsletter':
                case 'signup':
                case 'confirm-signup':
                case 'recover-account':
                case 'mock':
                case 'get-services':
                case 'service':
                case 'grant-access':
                case 'last-verified-email':
                case 'get-newsletter-subscription':
                case 'request-username-change':
                case 'register-subdomain':
                case 'list-host-directory':
                    return {
                        public: admin.admin_public,
                        private: admin.admin_private
                    };

                case 'post-record':
                case 'get-records':
                case 'subscription':
                case 'get-subscription':
                case 'del-records':
                case 'get-table':
                case 'get-tag':
                case 'get-index':
                case 'storage-info':
                case 'get-signed-url':
                case 'grant-private-access':
                case 'request-private-access-key':
                    return {
                        private: record.record_private,
                        public: record.record_public
                    };
            }
        };

        return get_ep()[auth ? 'private' : 'public'] + dest;
    };

    let endpoint = isExternalUrl || (await getEndpoint(url, !!auth));
    let service = this.session?.attributes?.['custom:service'] || __connection?.service || this.service;
    let owner = this.session?.attributes?.['custom:owner'] || __connection?.owner || this.owner;

    if (meta) {
        if (typeof meta === 'object' && !Array.isArray(meta)) {
            meta = JSON.parse(JSON.stringify(meta));
        }
        else {
            throw new SkapiError('Invalid meta data.', { code: 'INVALID_REQUEST' });
        }
    }

    if (Array.isArray(data) || data && typeof data !== 'object') {
        throw new SkapiError('Request data should be a JSON Object | FormData | HTMLFormElement.', { code: 'INVALID_REQUEST' });
    }

    /* compose meta to send */
    let required = options?.responseType !== 'blob' ? { service, owner } : {};
    // set fetch options
    let fetchOptions = {};
    let { fetchMore = false, progress } = options?.fetchOptions || {};

    if (options?.fetchOptions && Object.keys(options.fetchOptions).length) {
        // record fetch options
        let fetOpt = validator.Params(
            {
                limit: options.fetchOptions?.limit || 50,
                startKey: options.fetchOptions?.startKey || null,
                ascending: typeof options.fetchOptions?.ascending === 'boolean' ? options.fetchOptions.ascending : true
            },
            {
                limit: ['number', () => 50],
                startKey: null,
                ascending: ['boolean', () => true]
            }
        );

        if (fetOpt.hasOwnProperty('limit') && typeof fetOpt.limit === 'number') {
            if (fetOpt.limit > 1000) {
                throw new SkapiError('Fetch limit should be below 1000.', { code: 'INVALID_REQUEST' });
            }
            Object.assign(fetchOptions, { limit: fetOpt.limit });
        }

        if (fetOpt.hasOwnProperty('startKey') && typeof fetOpt.startKey === 'object' && fetOpt.startKey && Object.keys(fetOpt.startKey)) {
            Object.assign(fetchOptions, { startKey: fetOpt.startKey });
        }

        if (fetOpt.hasOwnProperty('ascending') && typeof fetOpt.ascending === 'boolean') {
            Object.assign(fetchOptions, { ascending: fetOpt.ascending });
        }
    }

    Object.assign(required, fetchOptions);

    let isForm = false;

    if (data instanceof SubmitEvent) {
        data = data?.target;
    }

    if (data instanceof HTMLFormElement) {
        data = new FormData(data);
    }

    if (data instanceof FormData) {
        isForm = true;
    }

    if (meta) {
        // add required to meta
        meta = Object.assign(required, meta);
    }

    else {
        if (!data) {
            // set data to required parameter
            data = required;
        }
        else if (isForm) {
            for (let k in required) {
                // add required to from
                if (required[k] !== undefined) {
                    data.set(k, new Blob([JSON.stringify(required[k])], {
                        type: 'application/json'
                    }));
                }
            }
        }
        else {
            // add required to data
            data = Object.assign(required, data);
        }
    }

    // formdata callback
    if (isForm && typeof options?.fetchOptions?.formData === 'function') {
        let cb = options.fetchOptions.formData((data as FormData));
        if (cb instanceof Promise) {
            cb = await cb;
        }

        if (cb instanceof FormData) {
            data = cb;
        }

        if (data instanceof FormData) {
            let totalFileSize = 0;

            for (let pair of data.entries()) {
                let v: any = pair[1];

                if (v instanceof File) {
                    totalFileSize += v.size;
                }

                else if (v instanceof FileList) {
                    if (v && v.length > 0) {
                        for (let idx = 0; idx <= v.length - 1; idx++) {
                            totalFileSize += v.item(idx).size;
                        }
                    }
                }
            }

            if (totalFileSize > 4200000) {
                throw new SkapiError('Files cannot exceed 4MB. Use skapi.uploadFiles(...) instead.', { code: 'INVALID_REQUEST' });
            }
        }

        else {
            throw new SkapiError('Callback for extractFormData() should return FormData', { code: 'INVALID_PARAMETER' });
        }
    }

    let requestKey = load_startKey_keys.bind(this)({
        params: data,
        url: isExternalUrl || url,
        fetchMore: isForm ? false : fetchMore // should not use startKey when post is a form
    }); // returns requrestKey | cached data

    if (requestKey && typeof requestKey === 'object') {
        return requestKey;
    }

    if (typeof requestKey === 'string') {
        if (!(__pendingRequest[requestKey] instanceof Promise)) {
            // new request

            let headers: Record<string, any> = {
                'Accept': '*/*'
            };

            if (token) {
                headers.Authorization = token;
            }

            if (meta) {
                headers["Content-Meta"] = window.btoa(encodeURIComponent(typeof meta === 'string' ? meta : JSON.stringify(meta)));
            }

            if (options.hasOwnProperty('contentType')) {
                if (options?.contentType) {
                    headers["Content-Type"] = options.contentType;
                }
            }

            else if (!(data instanceof FormData)) {
                headers["Content-Type"] = 'application/json';
            }

            let opt: RequestInit & { responseType?: string | null, headers: Record<string, any>; } = { headers };
            if (options?.responseType) {
                opt.responseType = options.responseType;
            }


            // pending call request
            // this prevents recursive calls
            if (method === 'post') {
                __pendingRequest[requestKey] = _post.bind(this)(endpoint, data, opt, progress);
            }
            else if (method === 'get') {
                __pendingRequest[requestKey] = _get.bind(this)(endpoint, data, opt, progress);
            }
        }

        try {
            let response = await __pendingRequest[requestKey];

            // should not use startKey when post is a form (is a post)
            if (isForm) {
                return response;
            }

            else {
                return await update_startKey_keys.bind(this)({
                    hashedParam: requestKey,
                    url,
                    response
                });
            }

        } catch (err) {
            throw err;
        } finally {
            // remove promise
            if (requestKey && __pendingRequest.hasOwnProperty(requestKey)) {
                delete __pendingRequest[requestKey];
            }
        }
    }
};

function load_startKey_keys(option: {
    params: Record<string, any>;
    url: string;
    fetchMore?: boolean;
}): string | DatabaseResponse<any> {
    let { params = {}, url, fetchMore = false } = option || {};
    if (params.hasOwnProperty('startKey') && params.startKey) {
        if (
            typeof params.startKey !== 'object' && !Object.keys(params.startKey).length &&
            params.startKey !== 'start' && params.startKey !== 'end'
        ) {
            throw new SkapiError(`"${params.startKey}" is invalid startKey key.`, { code: 'INVALID_PARAMETER' });
        }

        switch (params.startKey) {
            case 'start':
                // deletes referenced object key
                fetchMore = false;
                delete params.startKey;
        }
    }

    let hashedParams = (() => {
        if (params && typeof params === 'object' && Object.keys(params).length) {
            // hash request parameters
            function orderObjectKeys(obj: Record<string, any>) {
                function sortObject(obj: Record<string, any>): Record<string, any> {
                    if (typeof obj === 'object' && obj) {
                        return Object.keys(obj).sort().reduce((res, key) => ((res as any)[key] = obj[key], res), {});
                    }
                    return obj;
                };

                let _obj = sortObject(obj);
                if (_obj.hasOwnProperty('limit')) {
                    delete _obj.limit;
                }

                for (let k in _obj) {
                    if (_obj[k] && typeof _obj[k] === 'object') {
                        _obj[k] = sortObject(obj[k]);
                    }
                }

                return _obj;
            }

            return MD5.hash(url + '/' + JSON.stringify(orderObjectKeys(params)));
        }

        return MD5.hash(url + '/' + this.service);
    })();

    if (!fetchMore && this.__startKeyHistory?.[url]?.[hashedParams]) {
        // init cache, init startKey

        if (this.__cached_requests?.[url] && this.__cached_requests?.[url]?.[hashedParams]) {
            // delete cached data start
            delete this.__cached_requests[url][hashedParams];
        }

        if (Array.isArray(this.__startKeyHistory[url][hashedParams]) && this.__startKeyHistory[url][hashedParams].length) {
            // delete cache of all startkeys
            for (let p of this.__startKeyHistory[url][hashedParams]) {
                let hashedParams_cached = hashedParams + '/' + MD5.hash(JSON.stringify(p));
                if (this.__cached_requests?.[url] && this.__cached_requests?.[url]?.[hashedParams_cached]) {
                    delete this.__cached_requests[url][hashedParams_cached];
                }
            }
        }

        // delete start key lists
        delete this.__startKeyHistory[url][hashedParams];

        return hashedParams;
    }

    if (!Array.isArray(this.__startKeyHistory?.[url]?.[hashedParams])) {
        // startkey does not exists
        return hashedParams;
    }

    // hashed params exists
    let list_of_startKeys = this.__startKeyHistory[url][hashedParams]; // [{<startKey key>}, ...'end']
    let last_startKey_key = list_of_startKeys[list_of_startKeys.length - 1];
    let cache_hashedParams = hashedParams;
    if (last_startKey_key) {
        // use last start key

        if (last_startKey_key === 'end') { // cached startKeys are stringified
            return {
                list: [],
                startKey: 'end',
                endOfList: true,
                startKeyHistory: this.__startKeyHistory[url][hashedParams]
            };
        }

        else {
            cache_hashedParams += MD5.hash(last_startKey_key);
            params.startKey = JSON.parse(last_startKey_key);
        }
    }

    if (this.__cached_requests?.[url]?.[cache_hashedParams]) {
        // return data if there is cache
        return this.__cached_requests[url][cache_hashedParams];
    }

    return hashedParams;
};

async function update_startKey_keys(option: Record<string, any>) {
    let { hashedParam, url, response } = option;
    let fetched = null;

    if (response instanceof Promise) {
        fetched = await response;
    }

    else {
        fetched = response;
    }

    if (
        !fetched ||
        typeof fetched !== 'object' ||
        !fetched.hasOwnProperty('startKey') ||
        !hashedParam ||
        !url
    ) {
        // no startkey no caching
        return fetched;
    }

    // has start key
    // startkey is key for next fetch

    // this.__startKeyHistory[url] = {
    //     [hashedParam]: ['{<startKey key>}', ...'end'],
    //     ...
    // }

    // this.__cached_requests[url][hashsedParams + '/' + md5(JSON.stringify(startKey))] = {
    //     data
    //     ...
    // }

    if (!this.__startKeyHistory.hasOwnProperty(url)) {
        // create url key to store startKey key list if it doesnt exists
        this.__startKeyHistory[url] = {};
    }

    if (!this.__cached_requests?.[url]) {
        this.__cached_requests[url] = {};
    }

    this.__cached_requests[url][hashedParam] = fetched;

    if (!this.__startKeyHistory[url].hasOwnProperty(hashedParam)) {
        this.__startKeyHistory[url][hashedParam] = [];
    }

    let startKey_string = fetched.startKey === 'end' ? 'end' : JSON.stringify(fetched.startKey);
    if (!this.__startKeyHistory[url][hashedParam].includes(startKey_string)) {
        this.__startKeyHistory[url][hashedParam].push(startKey_string);
    }

    this.__cached_requests[url][hashedParam] = fetched;

    return Object.assign({ startKeyHistory: this.__startKeyHistory[url][hashedParam] }, fetched);
};

async function _fetch(url: string, opt: any, progress?: ProgressCallback) {
    let fetchProgress = (
        url: string,
        opts: { headers?: Record<string, any>; body: FormData; responseType: string; },
        progress?: ProgressCallback
    ) => {
        return new Promise(
            (res, rej) => {
                let xhr = new XMLHttpRequest();

                // 0: UNSENT - The request is not initialized.
                // 1: OPENED - The request has been set up.
                // 2: HEADERS_RECEIVED - The request has sent, and the headers and status are available.
                // 3: LOADING - The response's body is being received.
                // 4: DONE - The data transfer has been completed or an error has occurred during the 

                // xhr.onreadystatechange = function () {
                //     if (xhr.readyState === 4) {   //if complete
                //         if (xhr.status >= 200 || xhr.status <= 299) {  //check if "OK" (200)
                //             //success
                //         } else {
                //             rej(xhr.status); //otherwise, some other code was returned
                //         }
                //     }
                // };

                xhr.open((opt.method || 'GET').toUpperCase(), url);

                for (var k in opts.headers || {}) {
                    xhr.setRequestHeader(k, opts.headers[k]);
                }

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // Status codes in the 2xx range mean success
                        if (opts.responseType == 'json' || opts.responseType == 'blob') {
                            res(xhr.response);
                        }
                        else {
                            let result = xhr.responseText;
                            try {
                                result = JSON.parse(result);
                            }
                            catch (err) { }
                            res(result);
                        }
                    } else {
                        // Status codes outside the 2xx range indicate errors
                        let status = xhr.status;
                        let errCode = [
                            'INVALID_CORS',
                            'INVALID_REQUEST',
                            'SERVICE_DISABLED',
                            'INVALID_PARAMETER',
                            'ERROR',
                            'EXISTS',
                            'NOT_EXISTS'
                        ];

                        let result: any = xhr.responseText;
                        try {
                            result = JSON.parse(result);
                        }
                        catch (err) { }

                        if (typeof result === 'string') {
                            let errMsg = xhr.response.split(':');
                            let code = errMsg.splice(0, 1)[0].trim();
                            rej(new SkapiError(errMsg.join('').trim(), { code: (errCode.includes(code) ? code : 'ERROR') }));
                        }

                        else if (typeof result === 'object' && result?.message) {
                            let code = (result?.code || (status ? status.toString() : null) || 'ERROR');
                            rej(new SkapiError(result?.message, { code: code }));
                        }
                    }
                };

                xhr.onerror = () => rej('Network error');
                xhr.onabort = () => rej('Aborted');
                xhr.ontimeout = () => rej('Timeout');

                if (xhr.upload && typeof progress === 'function') {
                    xhr.upload.onprogress = (p: ProgressEvent) => {
                        progress(
                            {
                                progress: p.loaded / p.total * 100,
                                loaded: p.loaded,
                                total: p.total,
                                abort: () => xhr.abort()
                            }
                        );
                    };
                }

                xhr.send(opts.body);
            }
        );
    };

    let received: Record<string, any> = await fetchProgress(
        url,
        {
            headers: opt?.headers,
            body: (opt.body as FormData),
            responseType: opt?.responseType
        },
        progress
    );

    if (typeof received === 'object' && opt.method === 'GET' && received.hasOwnProperty('body')) {
        try {
            received = JSON.parse(received.body);
        } catch (err) { }
    }

    return received;
};

async function _post(
    url: string,
    params: Record<string, any>,
    option: RequestInit & {
        responseType?: string | null;
        headers: Record<string, any>;
    },
    progress?: (ev: ProgressEvent) => void
) {
    let opt = Object.assign(
        {
            method: 'POST'
        },
        option,
        {
            body: params instanceof FormData ? params : JSON.stringify(params)
        }
    );

    return _fetch.bind(this)(url, opt, progress);
};

async function _get(
    url: string,
    params: Record<string, any>,
    option: RequestInit & {
        responseType?: string | null;
        headers: Record<string, any>;
    },
    progress?: (ev: ProgressEvent) => void
) {
    if (params && typeof params === 'object' && Object.keys(params).length) {
        if (url.substring(url.length - 1) !== '?') {
            url = url + '?';
        }

        let query = Object.keys(params)
            .map(k => {
                let value = params[k];
                if (typeof value !== 'string') {
                    value = JSON.stringify(value);
                }
                return encodeURIComponent(k) + '=' + encodeURIComponent(value);
            })
            .join('&');

        url += query;
    }

    let opt = Object.assign(
        {
            method: 'GET'
        },
        option
    );

    return _fetch.bind(this)(url, opt, progress);
};


/**
 * Sends post request to your custom server using Skapi's secure API layer.</br>
 * You must set your secret API key from the Skapi's admin page.</br>
 * On your server side, you must verify your secret API key.<br>
 * Skapi API layer can process your requests both synchronously and asynchronously.<br>
 * You can request multiple process using arrays.<br>
 * Skapi will process your requests in order.</br>
 * The sync process will be chained in order during process.<br>
 * Refer: <a href='www.google.com'>Setting secret api key</a>
 *
 * <h6>Example</h6>
 * 
 * ```
 * let call = await skapi.secureRequest(
 *     url: 'http://my.website.com/myapi',
 *     data: {
 *         some_data: 'Hello'
 *     }
 * )
 * 
 * console.log(call)
 * // {
 * //     response: <any>
 * //     statusCode: <number>
 * //     url: 'http://my.website.com/myapi'
 * // }
 * ```
 *
 * 
 * <h6>Nodejs Example</h6>
 * 
 * ```
 * const http = require('http');
 * http.createServer(function (request, response) {
 * if (request.url === '/myapi') {
 *     if (request.method === 'POST') {
 *         let body = '';
 * 
 *         request.on('data', function (data) {
 *             body += data;
 *         });
 * 
 *         request.on('end', function () {
 *             body = JSON.parse(body);
 *             console.log(body);
 *             // {
 *             //     user: {
 *             //         user_id: '',
 *             //         address: '',
 *             //         phone_number: '',
 *             //         email: '',
 *             //         name: '',
 *             //         locale: '',
 *             //         request_locale: ''
 *             //     },
 *             //     data: {
 *             //         some_data: 'Hello',
 *             //     },
 *             //     api_key: 'your api secret key'
 *             // }
 * 
 *             if (body.api_key && body.api_key === 'your api secret key') {
 *                 response.writeHead(200, {'Content-Type': 'text/html'});
 *                 // do something
 *                 response.end('success');
 *             } else {
 *                 response.writeHead(401, {'Content-Type': 'text/html'});
 *                 response.end("api key mismatch");
 *             }
 *         });
 *     }
 * }
 * }).listen(3000);
 * ```
 *
 * 
 * <h6>Python Example</h6>
 * 
 * ```
 * from http.server import BaseHTTPRequestHandler, HTTPServer
 * import json
 * 
 * class MyServer(BaseHTTPRequestHandler):
 * def do_request(self):
 *     if self.path == '/myapi':
 *         content_length = int(self.headers['Content-Length'])
 *         body = json.loads(self.rfile.read(content_length).decode('utf-8'))
 *         print(body)
 *         # {
 *         #     'user': {
 *         #         'user_id': '',
 *         #         'address': '',
 *         #         'phone_number': '',
 *         #         'email': '',
 *         #         'name': '',
 *         #         'locale': '',
 *         #         'request_locale': ''
 *         #     },
 *         #     'data': {
 *         #         'some_data': 'Hello',
 *         #     },
 *         #     'api_key': 'your api secret key'
 *         # }
 * 
 *         if 'api_key' in body and body['api_key'] == 'your api secret key':
 *             self.send_response(200)
 *             self.send_header("Content-type", "text/html")
 *             self.end_headers()
 *             self.wfile.write(b'\n success')
 *         else:
 *             self.send_response(401)
 *             self.send_header("Content-type", "text/html")
 *             self.end_headers()
 *             self.wfile.write(b'api key mismatch')
 * 
 * 
 * myServer = HTTPServer(("", 3000), MyServer)
 * 
 * try:
 *      myServer.serve_forever()
 * except KeyboardInterrupt:
 *      myServer.server_close()
 * ```
 */
export async function secureRequest<RequestParams = {
    /** Request url */
    url: string;
    /** Request data */
    data?: any;
    /** requests are sync when true */
    sync?: boolean;
}>(params: RequestParams | RequestParams[]): Promise<any> {
    let paramsStruct = {
        url: (v: string) => {
            return validator.Url(v);
        },
        data: null,
        sync: ['boolean', () => true]
    };

    if (Array.isArray(params)) {
        for (let r of params) {
            r = validator.Params(r, paramsStruct);
        }
    }

    else {
        params = validator.Params(params, paramsStruct);
    }

    return await request.bind(this)('post-secure', params, { auth: true });
};

export async function mock(data: Form<any | {
    raise?: 'ERR_INVALID_REQUEST' | 'ERR_INVALID_PARAMETER' | 'SOMETHING_WENT_WRONG' | 'ERR_EXISTS' | 'ERR_NOT_EXISTS';
}>,
    formCallback?: FormSubmitCallback,
    options?: {
        auth?: boolean;
        method?: string;
        meta?: Record<string, any>;
        bypassAwaitConnection?: boolean;
        responseType?: string;
        contentType?: string;
    }): Promise<{ mockResponse: Record<string, any>; }> {
    options = options || {};
    if (formCallback && formCallback?.formData && typeof formCallback.formData === 'function') {
        let fetchOptions = {
            formData: formCallback.formData
        };

        Object.assign(options, fetchOptions);
    }
    return request.bind(this)('mock', data, options);
};

export async function getFormResponse(): Promise<any> {
    await this.__connection;
    let responseKey = `${this.service}:${MD5.hash(window.location.href.split('?')[0])}`;
    let stored = window.sessionStorage.getItem(responseKey);
    if (stored !== null) {
        try {
            stored = JSON.parse(stored);
        } catch (err) { }

        return stored;
    }

    throw new SkapiError("Form response doesn't exist.", { code: 'NOT_EXISTS' });
};

const pendPromise: Record<string, Promise<any> | null> = {};

/** @ignore */
export function formHandler(options?: { preventMultipleCalls: boolean; }) {
    let { preventMultipleCalls = false } = options || {};

    // wraps methods that requires form handling
    return function (target: object, propertyKey: string, descriptor: any) {
        const fn = descriptor.value;

        descriptor.value = function (...arg: any[]) {
            let form: Form<any> = arg[0];
            let option: FormSubmitCallback = arg?.[1] || {};
            let routeWithDataKey = true;
            let formEl = null;
            let actionDestination = '';
            if (form instanceof SubmitEvent) {
                form.preventDefault();

                let currentUrl = window.location.href;
                formEl = form.target as HTMLFormElement;
                let href = new URL(formEl.action);
                actionDestination = href.href;
                if (!formEl.action || href.href === currentUrl) {
                    routeWithDataKey = false;
                }
            }

            const handleResponse = (response: any) => {
                if (option?.response) {
                    if (typeof option.response === 'function')
                        return option.response(response);
                    else
                        throw new SkapiError('Callback "response" should be type: function.', { code: 'INVALID_PARAMETER' });
                }

                if (formEl) {
                    if (routeWithDataKey) {
                        window.sessionStorage.setItem(`${this.service}:${MD5.hash(actionDestination)}`, JSON.stringify(response));
                        window.location.href = actionDestination;
                    }
                }

                // return if is not form element
                return response;
            };

            let response: any;
            function handleError(err: any) {
                let is_err = err instanceof Error ? err : new SkapiError(err);
                if (option?.onerror) {
                    if (typeof option.onerror === 'function')
                        return option.onerror(is_err);
                    else
                        throw new SkapiError('Callback "onerror" should be type: function.', { code: 'INVALID_PARAMETER' });
                }

                throw is_err;
            }

            const executeMethod = () => {
                try {
                    // execute
                    response = fn.bind(this)(...arg);
                }
                catch (err) {
                    let is_err = handleError(err);
                    if (is_err instanceof Error) {
                        throw is_err;
                    }

                    return is_err;
                }

                if (response instanceof Promise) {
                    // handle promise
                    return (async () => {
                        try {
                            let resolved = await response;
                            return handleResponse(resolved);
                        }
                        catch (err) {
                            return handleError(err);
                        }
                    })();
                }
            };

            if (preventMultipleCalls) {
                return (async () => {
                    if (pendPromise?.[propertyKey] instanceof Promise) {
                        let res = await pendPromise[propertyKey];
                        pendPromise[propertyKey] = null;
                        return res;
                    }
                    else {
                        pendPromise[propertyKey] = executeMethod().finally(() => {
                            pendPromise[propertyKey] = null;
                        });
                        return pendPromise[propertyKey];
                    }
                })();
            }

            return executeMethod();
        };
    };
};
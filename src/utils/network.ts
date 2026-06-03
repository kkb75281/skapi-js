<<<<<<< HEAD
import SkapiError from "../main/error";
import {
    Form,
    FetchOptions,
    DatabaseResponse,
    ProgressCallback,
} from "../Types";
import validator from "./validator";
import { MD5, generateRandom, extractFormData } from "./utils";
// import { authentication, getJwtToken } from '../methods/user';
import { getJwtToken } from "../methods/user";

// Global counters for round-robin
let privateCounter_admin = 0;
let publicCounter_admin = 0;
let privateCounter_record = 0;
let publicCounter_record = 0;
=======

import SkapiError from '../main/error';
import { Form, FetchOptions, DatabaseResponse, ProgressCallback } from '../Types';
import validator from './validator';
import { MD5, generateRandom, extractFormData, isBrowserRuntime } from './utils';
// import { authentication, getJwtToken } from '../methods/user';
import { getJwtToken } from '../methods/user';
import Qpass from "qpass";

let requestQueue = null;
const hasSubmitEvent = typeof SubmitEvent !== 'undefined';
const hasHTMLFormElement = typeof HTMLFormElement !== 'undefined';
const isBrowser = isBrowserRuntime();
// Global counters for round-robin
let request_counter = 0;

function getRetryDelayMs(retryAfter: string | null): number | null {
    if (!retryAfter) {
        return null;
    }

    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) {
        return Math.max(0, seconds * 1000);
    }

    const dateMs = Date.parse(retryAfter);
    if (!Number.isNaN(dateMs)) {
        return Math.max(0, dateMs - Date.now());
    }

    return null;
}

function toPercent(loaded: number, total: number): number {
    return total > 0 ? (loaded / total) * 100 : 0;
}

let selectGateway = (params: { auth: boolean, type: string, endpoints: {[key:string]: string}[] }) => {
    const { auth, type, endpoints } = params;

    const admin = endpoints[0];
    // {
    //     "admin_public": "https://nty2bxrol1.execute-api.eu-west-1.amazonaws.com/api/",
    //     "admin_private": "https://4250a1g3bd.execute-api.eu-west-1.amazonaws.com/api/",
    //     "admin_public_2": "https://of8ur90ix1.execute-api.eu-west-1.amazonaws.com/api/",
    //     "admin_private_2": "https://gge4qiyqv2.execute-api.eu-west-1.amazonaws.com/api/",
    //     "get_users_private": "https://eztrfvyq49.execute-api.eu-west-1.amazonaws.com/api/",
    //     "service_public": "https://pg695jr002.execute-api.eu-west-1.amazonaws.com/api/",
    //     "extra_public": "https://8zpb401kr3.execute-api.eu-west-1.amazonaws.com/api/",
    //     "extra_private": "https://o5vqmktoa4.execute-api.eu-west-1.amazonaws.com/api/",
    //     "extra_public_2": "https://u3c0pt5v7a.execute-api.eu-west-1.amazonaws.com/api/",
    //     "extra_private_2": "https://dr6glk4kz8.execute-api.eu-west-1.amazonaws.com/api/",
    //     "userpool_id": "eu-west-1_vq4rt05un",
    //     "userpool_client": "76uku0vqmkko2os1s8sh8dmpar"
    // }
    const record = endpoints[1];
    // {
    //     "record_public": "https://9zxjxkrczi.execute-api.ap-northeast-1.amazonaws.com/api/",
    //     "record_private": "https://luvgxcgpwd.execute-api.ap-northeast-1.amazonaws.com/api/",
    //     "record_public_2": "https://ekhpyuchg6.execute-api.ap-northeast-1.amazonaws.com/api/",
    //     "record_private_2": "https://nprhgj1xkj.execute-api.ap-northeast-1.amazonaws.com/api/",
    //     "post_public": "https://cbzajunw33.execute-api.ap-northeast-1.amazonaws.com/api/",
    //     "post_private": "https://j51bbrnqb7.execute-api.ap-northeast-1.amazonaws.com/api/",
    //     "get_public": "https://nmnczc41wg.execute-api.ap-northeast-1.amazonaws.com/api/",
    //     "get_private": "https://0zpwltd5yh.execute-api.ap-northeast-1.amazonaws.com/api/",
    //     "del_private": "https://w7grra2h6k.execute-api.ap-northeast-1.amazonaws.com/api/",
    //     "websocket_private": "wss://t47k8wdn19.execute-api.ap-northeast-1.amazonaws.com/api"
    // }

    request_counter++;

    if (type === 'admin') {
        const gateways_admin_round_robin = Object.entries(admin)
            .filter(([k, v]) => k.includes(auth ? '_private' : '_public') && k !== 'get_users_private' && k !== 'service_public' && typeof v === 'string')
            .map(([, v]) => v);

        if (!gateways_admin_round_robin.length) {
            throw new SkapiError('No available admin gateways.', { code: 'INVALID_REQUEST' });
        }

        return gateways_admin_round_robin[request_counter % gateways_admin_round_robin.length];
    }
    if (type === 'record') {
        const gateways_record_round_robin = Object.entries(record)
            .filter(([k, v]) => k.includes(auth ? 'record_private' : 'record_public') && typeof v === 'string')
            .map(([, v]) => v);

        if (!gateways_record_round_robin.length) {
            throw new SkapiError('No available record gateways.', { code: 'INVALID_REQUEST' });
        }

        return gateways_record_round_robin[request_counter % gateways_record_round_robin.length];
    }

    throw new SkapiError('Invalid gateway type.', { code: 'INVALID_REQUEST' });
}
>>>>>>> upstream/main

async function getEndpoint(dest: string, auth: boolean) {
    const endpoints = await Promise.all([
        this.admin_endpoint,
<<<<<<< HEAD
        this.record_endpoint,
=======
        this.record_endpoint
>>>>>>> upstream/main
    ]);

    const admin = endpoints[0];
    const record = endpoints[1];

<<<<<<< HEAD
    let params = dest.split("?");
    let query = params.length > 1 ? "?" + params[1] : "";
    dest = params[0];

    switch (dest) {
        case "get-users": ////
            return admin.get_users_private + dest + query;
        case "service": ////
            return admin.service_public + dest + query;
        case "get-newsletters": //
        case "get-public-newsletters": //
        // case 'post-userdata': //
        case "subscribe-newsletter": //
        case "subscribe-public-newsletter": //
        case "signupkey": //
        case "admin-newsletter-request":
            return (
                (auth ? admin.extra_private : admin.extra_public) + dest + query
            );
        case "admin-signup": //
        case "confirm-signup": //
        case "client-secret-request": //
        case "client-secret-request-public": //
        case "openid-logger": //
            return (
                (auth ? admin.extra_private_2 : admin.extra_public_2) +
                dest +
                query
            );
        case "block-account":
        case "admin-edit-profile":
            return admin.admin_private + dest + query;
        case "remove-account":
        case "post-secure":
        case "recover-account":
        case "mock":
        case "grant-access":
        case "last-verified-email":
        case "ticket":
        case "register-ticket":
        case "get-newsletter-subscription":
        case "request-username-change":
        // case 'jwt-login':
        case "send-inquiry":
        case "register-newsletter-group":
        case "newsletter-group-endpoint":
        case "invitation-list":
            // case 'register-sender-email':
            const gateways_admin = auth
                ? [admin.admin_private, admin.admin_private_2]
                : [admin.admin_public, admin.admin_public_2];

            const counter_admin = auth
                ? privateCounter_admin
                : publicCounter_admin;
            const selectedGateway_admin =
                gateways_admin[counter_admin % gateways_admin.length];

            if (auth) {
                privateCounter_admin++;
            } else {
                publicCounter_admin++;
            }

            return selectedGateway_admin + dest + query;

        // Records
        case "post-record": ////
            // Dedicated gateway api for post-record
            return (
                (auth ? record.post_private : record.post_public) + dest + query
            );

        case "get-records": ////
            // Dedicated gateway api for get-record
            return (
                (auth ? record.get_private : record.get_public) + dest + query
            );

        case "del-files": //
        case "del-records": //
            // Dedicated gateway api for del-records and del-files
            return record.del_private + dest + query;
        case "store-subscription":
        case "get-vapid-public-key":
        case "push-notification":
        case "delete-subscription":
        case "subscription":
        case "get-subscription":
        case "get-table":
        case "get-tag":
        case "get-uniqueid":
        case "get-index":
        case "get-signed-url":
        case "grant-private-access":
        case "request-private-access-key":
        case "get-ws-group":
        case "check-schema":
        case "get-feed":
        // From viviplayground
        case "castspell":
        case "dopamine":
        case "getspell":
            // Round-robin
            const gateways_record = auth
                ? [record.record_private, record.record_private_2]
                : [record.record_public, record.record_public_2];

            const counter_record = auth
                ? privateCounter_record
                : publicCounter_record;
            const selectedGateway_record =
                gateways_record[counter_record % gateways_record.length];

            if (auth) {
                privateCounter_record++;
            } else {
                publicCounter_record++;
            }

            return selectedGateway_record + dest + query;
=======
    let params = dest.split('?');
    let query = params.length > 1 ? '?' + params[1] : '';
    dest = params[0];

    switch (dest) {
        case 'get-users': ////
            return admin.get_users_private + dest + query;
        case 'service': ////
            return admin.service_public + dest + query;
        case 'get-newsletters':
        case 'get-public-newsletters':
        case 'subscribe-newsletter':
        case 'subscribe-public-newsletter':
        case 'signupkey':
        case 'admin-newsletter-request':
        case 'admin-signup':
        case 'confirm-signup':
        case 'openid-logger':
        case 'block-account':
        case 'admin-edit-profile':
        case 'remove-account':
        case 'post-secure':
        case 'recover-account':
        case 'mock':
        case 'grant-access':
        case 'last-verified-email':
        case 'ticket':
        case 'register-ticket':
        case 'get-newsletter-subscription':
        case 'request-username-change':
        case 'send-inquiry':
        case 'register-newsletter-group':
        case 'newsletter-group-endpoint':
        case 'invitation-list':
        case 'csr':
        case 'csr-poll':
            return selectGateway.bind(this)({ auth, type: 'admin', endpoints }) + dest + query;

        // Records
        case 'post-record': ////
            // Dedicated gateway api for post-record
            return (auth ? record.post_private : record.post_public) + dest + query;

        case 'get-records': ////
            // Dedicated gateway api for get-record
            return (auth ? record.get_private : record.get_public) + dest + query;

        case 'del-files': //
        case 'del-records': //
            // Dedicated gateway api for del-records and del-files
            return record.del_private + dest + query;
        case 'store-subscription':
        case 'get-vapid-public-key':
        case 'push-notification':
        case 'delete-subscription':
        case 'subscription':
        case 'get-subscription':
        case 'get-table':
        case 'get-tag':
        case 'get-uniqueid':
        case 'get-index':
        case 'get-signed-url':
        case 'grant-private-access':
        case 'request-private-access-key':
        case 'get-ws-group':
        case 'check-schema':
        case 'get-feed':
        // From viviplayground
        case 'castspell':
        case 'dopamine':
        case 'getspell':
            return selectGateway.bind(this)({ auth, type: 'record', endpoints }) + dest + query;
>>>>>>> upstream/main

        default:
            return validator.Url(dest) + query;
    }
}

const __pendingRequest: Record<string, Promise<any>> = {};

<<<<<<< HEAD
=======
export function terminatePendingRequests() {
    if (requestQueue) {
        requestQueue.terminate();
        requestQueue = null;
    }
}

>>>>>>> upstream/main
export async function request(
    url: string,
    data: Form<any> = null,
    options?: {
        fetchOptions?: FetchOptions;
        auth?: boolean;
        method?: string;
        bypassAwaitConnection?: boolean;
<<<<<<< HEAD
        responseType?:
            | "json"
            | "blob"
            | "text"
            | "arrayBuffer"
            | "formData"
            | "document";
        contentType?: string;
=======
        responseType?: 'json' | 'blob' | 'text' | 'arrayBuffer' | 'formData' | 'document';
        contentType?: string;
        tokenHeaders?: {
            accessToken?: boolean | string;
            idToken?: boolean | string;
        };
>>>>>>> upstream/main
    },
    _etc?: {
        ignoreService: boolean;
    }
): Promise<any> {
<<<<<<< HEAD
    this.log("request", { url, data, options, _etc: _etc || {} });
=======
    this.log('request', { url, data, options, _etc: _etc || {} });
>>>>>>> upstream/main

    options = options || {};

    let {
        auth = false,
<<<<<<< HEAD
        method = "post",
=======
        method = 'post',
>>>>>>> upstream/main
        bypassAwaitConnection = false,
    } = options;

    method = method.toUpperCase();

    let __connection = null;
<<<<<<< HEAD
    let service = this.service;
    let owner = this.owner;
=======
    let service = data?.service || this.service;
    let owner = data?.owner || this.owner;
>>>>>>> upstream/main
    let token = null; // idToken
    let endpoint = await getEndpoint.bind(this)(url, !!auth);

    if (!bypassAwaitConnection) {
        __connection = await this.__connection;
        if (!__connection) {
<<<<<<< HEAD
            throw new SkapiError(
                "Invalid connection. The service could have been disabled, or has a restricted CORS.",
                { code: "INVALID_REQUEST" }
            );
        }
    }

    if (auth) {
        token = await getJwtToken.bind(this)();
        // if (this.session) {
        //     const currentTime = Math.floor(Date.now() / 1000);
        //     const idToken = this.session.getIdToken();
        //     const idTokenExp = idToken.getExpiration();
        //     this.log('request:tokens', {
        //         exp: this.session.idToken.payload.exp,
        //         currentTime,
        //         expiresIn: idTokenExp - currentTime,
        //         token: this.session.accessToken.jwtToken,
        //         refreshToken: this.session.refreshToken.token
        //     });

        //     if (idTokenExp < currentTime) {
        //         this.log('request:requesting new token', null);
        //         try {
        //             await authentication.bind(this)().getSession({ refreshToken: true });
        //             this.log('request:received new tokens', {
        //                 exp: this.session.idToken.payload.exp,
        //                 currentTime,
        //                 expiresIn: idTokenExp - currentTime,
        //                 token: this.session.accessToken.jwtToken,
        //                 refreshToken: this.session.refreshToken.token
        //             });
        //         }
        //         catch (err) {
        //             this.log('request:new token error', err);
        //             throw new SkapiError('User login is required.', { code: 'INVALID_REQUEST' });
        //         }
        //     }

        //     token = this.session?.idToken?.jwtToken;
        // }
        // else {
        //     this.log('request:no session', null);
        //     throw new SkapiError('User login is required.', { code: 'INVALID_REQUEST' });
        // }
=======
            throw new SkapiError('Invalid connection. The service could have been disabled, or has a restricted CORS.', { code: 'INVALID_REQUEST' });
        }
    }

    const wantsIdTokenHeader = options?.tokenHeaders?.idToken === true;

    if (auth || wantsIdTokenHeader) {
        token = await getJwtToken.bind(this)();
>>>>>>> upstream/main
    }

    let fetchOptions = {}; // record fetch options
    let { fetchMore = false, progress } = options?.fetchOptions || {};

    if (options?.fetchOptions && Object.keys(options.fetchOptions).length) {
<<<<<<< HEAD
        for (let k of ["limit", "startKey", "ascending"]) {
            if (options.fetchOptions.hasOwnProperty(k)) {
=======
        for (let k of ['limit', 'startKey', 'ascending']) {
            if (options.fetchOptions.hasOwnProperty(k)) {
                if (k === 'startKey' && options.fetchOptions[k] === null) {
                    continue;
                }
>>>>>>> upstream/main
                fetchOptions[k] = options.fetchOptions[k];
            }
        }

<<<<<<< HEAD
        fetchOptions = validator.Params(fetchOptions, {
            limit: (v) => {
                if (typeof v !== "number") {
                    throw new SkapiError("Fetch limit should be a number.", {
                        code: "INVALID_REQUEST",
                    });
                }
                if (v > 1000) {
                    throw new SkapiError("Fetch limit should be below 1000.", {
                        code: "INVALID_REQUEST",
                    });
                }
                return v;
            },
            startKey: (v) => v,
            ascending: "boolean",
        });
=======
        fetchOptions = validator.Params(
            fetchOptions,
            {
                limit: v => {
                    if (typeof v !== 'number') {
                        throw new SkapiError('Fetch limit should be a number.', { code: 'INVALID_REQUEST' });
                    }
                    if (v > 1000) {
                        throw new SkapiError('Fetch limit should be below 1000.', { code: 'INVALID_REQUEST' });
                    }
                    return v;
                },
                startKey: v => v,
                ascending: 'boolean'
            }
        );
>>>>>>> upstream/main
    }

    let required = _etc?.ignoreService ? {} : { service, owner };
    Object.assign(required, fetchOptions);

    data = extractFormData(data).data;

    if (!data) {
        // set data to required parameter
        data = required;
<<<<<<< HEAD
    } else if (data && typeof data === "object") {
=======
    }
    else if (data && typeof data === 'object') {
>>>>>>> upstream/main
        // add required to data
        data = Object.assign(required, data);
    }

<<<<<<< HEAD
    let hashedParams = (() => {
        if (
            data &&
            typeof data === "object" &&
            Object.keys(data).length &&
            !(data instanceof FormData)
        ) {
            // hash request parameters
            function sortObject(obj: Record<string, any>): Record<string, any> {
                if (typeof obj === "object" && obj !== null) {
                    return Object.keys(obj)
                        .sort()
                        .reduce((res, key) => {
                            if (
                                typeof obj[key] === "object" &&
                                obj[key] !== null
                            ) {
=======
    let requestFingerprint = `${method}:${auth ? 'auth' : 'public'}:${url}`;

    let hashedParams = (() => {
        if (data && typeof data === 'object' && Object.keys(data).length && !(isBrowser && data instanceof FormData)) {
            // hash request parameters
            function sortObject(obj: Record<string, any>): Record<string, any> {
                if (typeof obj === 'object' && obj !== null) {
                    return Object.keys(obj)
                        .sort()
                        .reduce((res, key) => {
                            if (typeof obj[key] === 'object' && obj[key] !== null) {
>>>>>>> upstream/main
                                // If the value is an object, sort it recursively
                                res[key] = sortObject(obj[key]);
                            } else {
                                res[key] = obj[key];
                            }
                            return res;
                        }, {});
                }
                return obj;
<<<<<<< HEAD
            }

            return MD5.hash(url + "/" + JSON.stringify(sortObject(data)));
        }

        return MD5.hash(url + "/" + this.service);
    })();

    let requestKey = load_startKey_keys.bind(this)({
        params: data,
        url,
        fetchMore,
        hashedParams,
    }); // returns requrestKey | cached data

    this.log("requestKey", requestKey);

    if (!requestKey || (requestKey && typeof requestKey === "object")) {
        // cahced data can be falsy data or object
        return requestKey;
    }

    // prevent duplicate request
    if (
        typeof requestKey === "string" &&
        __pendingRequest[requestKey] instanceof Promise
    ) {
        this.log("request:returning pending", requestKey);
        return __pendingRequest[requestKey as string];
=======
            };

            return MD5.hash(requestFingerprint + '/' + JSON.stringify(sortObject(data)));
        }

        return MD5.hash(requestFingerprint + '/' + service);
    })();

    let { requestKey, requestKeyWithStartKey } = load_startKey_keys.bind(this)({
        params: data,
        url,
        fetchMore,
        hashedParams
    }); // returns requrestKey | cached data

    if (!requestKey || requestKey && typeof requestKey === 'object') {
        // cached data can be falsy data or object
        return requestKey;
    }

    this.log('requestKey', requestKeyWithStartKey);

    // prevent duplicate request
    if (typeof requestKeyWithStartKey === 'string' && __pendingRequest[requestKeyWithStartKey] instanceof Promise) {
        this.log('request:returning pending', requestKeyWithStartKey);
        return __pendingRequest[requestKeyWithStartKey as string];
>>>>>>> upstream/main
    }

    // new request
    let headers: Record<string, any> = {
<<<<<<< HEAD
        Accept: "*/*",
        "Content-Type": options.hasOwnProperty("contentType")
            ? options.contentType === null
                ? "application/x-www-form-urlencoded"
                : options.contentType || "application/json"
            : "application/json",
    };
=======
        'Accept': '*/*'
    };

    const hasCustomContentType = Object.prototype.hasOwnProperty.call(options, 'contentType') && options.contentType !== undefined;
    if (hasCustomContentType) {
        const configuredContentType = options.contentType === null ? 'application/x-www-form-urlencoded' : options.contentType;
        if (configuredContentType) {
            headers['Content-Type'] = configuredContentType;
        }
    }
    else if (isBrowser && !(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    else {
        headers['Content-Type'] = 'application/json';
    }

>>>>>>> upstream/main
    if (token) {
        headers.Authorization = token;
    }

<<<<<<< HEAD
    if (headers["Content-Type"] !== "application/json") {
        // add service and owner to headers if content type is not json
        headers["Content-Meta"] = JSON.stringify({ service, owner });
    }

    let opt: RequestInit & {
        responseType?: string | null;
        headers: Record<string, any>;
    } = { headers }; // request options
=======
    if (options?.tokenHeaders) {
        const resolveTokenValue = (configuredValue: boolean | string | undefined, fallbackValue: string | null) => {
            if (typeof configuredValue === 'string') {
                return configuredValue;
            }

            if (configuredValue === true) {
                return fallbackValue;
            }

            return null;
        };

        const accessToken = resolveTokenValue(options.tokenHeaders.accessToken, this.session?.accessToken?.jwtToken || null);
        const idToken = resolveTokenValue(options.tokenHeaders.idToken, this.bearerToken || this.session?.idToken?.jwtToken || token || null);

        if (accessToken) {
            headers['X-Access-Token'] = accessToken;
        }

        if (idToken) {
            headers['X-Id-Token'] = idToken;
        }
    }

    let meta = {
        public_identifier: this.__public_identifier,
        service,
        owner
    };

    headers['Content-Meta'] = JSON.stringify(meta);

    // if (headers['Content-Type'] !== 'application/json') {
    //     // add service and owner to headers if content type is not json
    //     headers['Content-Meta'] = JSON.stringify(meta);
    // }

    let opt: RequestInit & { responseType?: string | null, headers: Record<string, any>; } = { headers }; // request options
>>>>>>> upstream/main
    if (options?.responseType) {
        opt.responseType = options.responseType;
    }

<<<<<<< HEAD
    if (method === "GET") {
        if (data) {
            let query = [];
            if (data instanceof FormData) {
                for (let [name, value] of data.entries()) {
                    if (typeof value === "string") {
                        value = encodeURIComponent(value);
                        query.push(`&${name}=${value}`);
                    }
                }
            } else {
                query = Object.keys(data).map((k) => {
                    let value = data[k];
                    if (typeof value !== "string") {
                        value = JSON.stringify(value);
                    }
                    return (
                        encodeURIComponent(k) + "=" + encodeURIComponent(value)
                    );
                });
            }
            if (query.length) {
                if (endpoint.substring(endpoint.length - 1) !== "?") {
                    endpoint = endpoint + "?";
                }
                endpoint += query.join("&");
            }
        }
        opt.body = null;
    } else {
        opt.body = data ? JSON.stringify(data) : null;
    }

    opt.method = method;
    let promise = _fetch.bind(this)(endpoint, opt, progress);
    __pendingRequest[requestKey as string] = promise.finally(() => {
        delete __pendingRequest[requestKey as string];
    });

    try {
        let result = update_startKey_keys.bind(this)({
            hashedParam: requestKey,
            url,
            fetched: await promise,
        });

        this.log("request:end", result);

        return result;
    } catch (err) {
        this.log("request:err", err);
        throw err;
    }
=======
    if (method === 'GET') {
        if (data) {
            let query = [];
            if (isBrowser && data instanceof FormData) {
                query = Array.from(data.entries()).map(([k, value]) => {
                    const stringValue = typeof value === 'string' ? value : value.name;
                    return encodeURIComponent(k) + '=' + encodeURIComponent(stringValue);
                });
            }
            else {
                query = Object.keys(data)
                    .map(k => {
                        let value = data[k];
                        if (typeof value !== 'string') {
                            value = JSON.stringify(value);
                        }
                        return encodeURIComponent(k) + '=' + encodeURIComponent(value);
                    });
            }

            if (query.length) {
                const separator = endpoint.includes('?')
                    ? (endpoint.endsWith('?') || endpoint.endsWith('&') ? '' : '&')
                    : '?';
                endpoint += separator + query.join('&');
            }
        }
        opt.body = null;
    }
    else {
        if (isBrowser && data instanceof FormData) {
            opt.body = data;
        }
        else if (headers['Content-Type'] === 'application/x-www-form-urlencoded' && data && typeof data === 'object') {
            const encoded = new URLSearchParams();
            for (let key of Object.keys(data)) {
                const value = data[key];
                encoded.append(key, typeof value === 'string' ? value : JSON.stringify(value));
            }
            opt.body = encoded.toString();
        }
        else if (typeof data === 'string') {
            opt.body = data;
        }
        else {
            opt.body = data ? JSON.stringify(data) : null;
        }
    }

    opt.method = method;

    if (requestQueue === null) {
        let config = {
            batchSize: this.requestBatchSize,
            breakWhenError: false,
            onProgress: (progress) => {
                // for(let key in __pendingRequest) {
                //     delete __pendingRequest[key];
                // }
                this.onBatchProcess.forEach((cb) => cb(progress));
            }
        };

        requestQueue = new Qpass(config);
    }

    this.log('request-opt', opt);

    return new Promise((res, rej) => {
        requestQueue.add([async () => {
            let promise = _fetch.bind(this)(endpoint, opt, progress);
            __pendingRequest[requestKeyWithStartKey as string] = promise;

            try {
                let result = update_startKey_keys.bind(this)({
                    hashedParam: requestKey,
                    requestKeyWithStartKey,
                    url,
                    fetched: await promise
                });
                delete __pendingRequest[requestKeyWithStartKey];
                this.log('request:end', result);
                res(result);
                return result;
            }
            catch (err) {
                delete __pendingRequest[requestKeyWithStartKey];
                this.log('request:err', err);
                rej(err);
                throw err;
            }
        }]);
    });
>>>>>>> upstream/main
}

function load_startKey_keys(option: {
    params: Record<string, any>;
    url: string;
    fetchMore: boolean;
    hashedParams: string;
<<<<<<< HEAD
}): string | DatabaseResponse<any> {
=======
}): { requestKeyWithStartKey: string, requestKey: string | DatabaseResponse<any> } {
>>>>>>> upstream/main
    let { params = {}, url, fetchMore = false, hashedParams } = option || {};

    if (params.startKey) {
        if (
<<<<<<< HEAD
            !(
                typeof params.startKey === "object" &&
                Object.keys(params.startKey).length
            ) &&
            params.startKey !== "start" &&
            params.startKey !== "end"
        ) {
            throw new SkapiError(
                `"${params.startKey}" is invalid startKey key.`,
                { code: "INVALID_PARAMETER" }
            );
        }

        if (params.startKey === "start") {
=======
            !(typeof params.startKey === 'object' && Object.keys(params.startKey).length) &&
            params.startKey !== 'start' && params.startKey !== 'end'
        ) {
            throw new SkapiError(`"${params.startKey}" is invalid startKey key.`, { code: 'INVALID_PARAMETER' });
        }

        if (params.startKey === 'start') {
>>>>>>> upstream/main
            // deletes referenced object key
            fetchMore = false;
            delete params.startKey;
        }
    }

    if (!fetchMore) {
        // init cache, init startKey

        if (this.__cached_requests?.[url]?.[hashedParams]) {
            // delete cached data start
            delete this.__cached_requests[url][hashedParams];
        }

        if (this.__startKeyHistory?.[url]?.[hashedParams]) {
<<<<<<< HEAD
            if (
                Array.isArray(this.__startKeyHistory[url][hashedParams]) &&
                this.__startKeyHistory[url][hashedParams].length
            ) {
                // delete cache of all startkeys
                for (let p of this.__startKeyHistory[url][hashedParams]) {
                    let hashedParams_cached = hashedParams + MD5.hash(p);
                    if (
                        this.__cached_requests?.[url] &&
                        this.__cached_requests?.[url]?.[hashedParams_cached]
                    ) {
=======
            if (Array.isArray(this.__startKeyHistory[url][hashedParams]) && this.__startKeyHistory[url][hashedParams].length) {
                // delete cache of all startkeys
                for (let p of this.__startKeyHistory[url][hashedParams]) {
                    let hashedParams_cached = hashedParams + MD5.hash(p);
                    if (this.__cached_requests?.[url] && this.__cached_requests?.[url]?.[hashedParams_cached]) {
>>>>>>> upstream/main
                        delete this.__cached_requests[url][hashedParams_cached];
                    }
                }
            }

            // delete start key lists
            delete this.__startKeyHistory[url][hashedParams];
        }

<<<<<<< HEAD
        return hashedParams;
=======
        return { requestKeyWithStartKey: hashedParams, requestKey: hashedParams };
>>>>>>> upstream/main
    }

    if (!Array.isArray(this.__startKeyHistory?.[url]?.[hashedParams])) {
        // startkey does not exists
<<<<<<< HEAD
        return hashedParams;
    }

    // hashed params exists
    let list_of_startKeys = this.__startKeyHistory[url][hashedParams]; // [{<startKey key>}, ...'end']
    let last_startKey_key = list_of_startKeys[list_of_startKeys.length - 1];
    let cache_hashedParams = hashedParams;
    if (last_startKey_key) {
        // use last start key

        if (last_startKey_key === "end") {
            // cached startKeys are stringified
            return {
                list: [],
                startKey: "end",
                endOfList: true,
                startKeyHistory: list_of_startKeys,
            };
        } else {
            cache_hashedParams += MD5.hash(last_startKey_key);
            params.startKey = JSON.parse(last_startKey_key);
        }
    }

    if (this.__cached_requests?.[url]?.[cache_hashedParams]) {
        // return data if there is cache
        return this.__cached_requests[url][cache_hashedParams];
    }

    return hashedParams;
}

function _fetch(url: string, opt: any, progress?: ProgressCallback) {
    return new Promise((res, rej) => {
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

        xhr.open(opt.method || "GET", url);

        for (var k in opt.headers || {}) {
            xhr.setRequestHeader(k, opt.headers[k]);
        }

        if (opt.responseType) {
            xhr.responseType = opt.responseType;
        }

        xhr.onload = () => {
            if (xhr.status < 400) {
                // Status codes in the 2xx range mean success
                if (opt.responseType == "json" || opt.responseType == "blob") {
                    res(xhr.response);
                } else {
                    let result = xhr.responseText;
                    try {
                        result = JSON.parse(result);
                    } catch (err) {}
                    res(result);
                }
            } else if (xhr.status === 429) {
                // too many requests
                let retryAfter = xhr.getResponseHeader("Retry-After");
                if (retryAfter) {
                    setTimeout(() => {
                        _fetch(url, opt, progress).then(res, rej);
                    }, parseInt(retryAfter) * 1000);
                } else {
                    rej("Too many requests");
                }
            } else {
                // Status codes outside the 2xx range indicate errors
                let status = xhr.status;
                let errCode = [
                    "INVALID_CORS",
                    "INVALID_REQUEST",
                    "SERVICE_DISABLED",
                    "INVALID_PARAMETER",
                    "ERROR",
                    "EXISTS",
                    "NOT_EXISTS",
                ];

                let result: any =
                    opt.responseType == "blob"
                        ? xhr.response
                        : xhr.responseText;
                try {
                    result = JSON.parse(result);
                } catch (err) {}

                if (typeof result === "string") {
                    let errMsg = xhr.response.split(":");
                    let code = errMsg.splice(0, 1)[0].trim();
                    rej(
                        new SkapiError(errMsg.join(":").trim(), {
                            code: errCode.includes(code) ? code : "ERROR",
                        })
                    );
                } else if (typeof result === "object" && result?.message) {
                    let code =
                        result?.code ||
                        (status ? status.toString() : null) ||
                        "ERROR";
                    let message = result.message;
                    let cause = result?.cause;
                    if (typeof message === "string") {
                        message = message.trim();
                    }
                    rej(new SkapiError(message, { cause, code }));
                } else {
                    rej(result);
                }
            }
        };

        xhr.onerror = () => rej("Network error");
        xhr.onabort = () => rej("Aborted");
        xhr.ontimeout = () => rej("Timeout");

        if (typeof progress === "function") {
            xhr.onprogress = (p: ProgressEvent) => {
                progress({
                    status: "download",
                    progress: (p.loaded / p.total) * 100,
                    loaded: p.loaded,
                    total: p.total,
                    abort: () => xhr.abort(),
                });
            };
            if (xhr.upload) {
                xhr.upload.onprogress = (p: ProgressEvent) => {
                    progress({
                        status: "upload",
                        progress: (p.loaded / p.total) * 100,
                        loaded: p.loaded,
                        total: p.total,
                        abort: () => xhr.abort(),
                    });
                };
            }
        }

        xhr.send(opt.body);
    });
}

function update_startKey_keys(option: Record<string, any>) {
    let { hashedParam, url, fetched } = option;
=======
        return { requestKeyWithStartKey: hashedParams, requestKey: hashedParams };
    }

    // hashed params exists
    let list_of_startKeys = this.__startKeyHistory[url][hashedParams]; // ["{<startKey key>}", ...'end']
    let last_startKey_key = list_of_startKeys[list_of_startKeys.length - 1];
    let requestKeyWithStartKey = hashedParams;

    if (last_startKey_key) {
        // use last start key
        // requestKeyWithStartKey += MD5.hash(last_startKey_key);

        if (last_startKey_key === 'end') { // cached startKeys are stringified
            return {
                requestKey: {
                    list: [],
                    startKey: 'end',
                    endOfList: true,
                    startKeyHistory: list_of_startKeys
                },
                requestKeyWithStartKey
            }
        }

        // else {
        requestKeyWithStartKey += MD5.hash(last_startKey_key);
        params.startKey = JSON.parse(last_startKey_key);
        // }
    }

    if (this.__cached_requests?.[url]?.[requestKeyWithStartKey]) {
        // return data if there is cache
        return { requestKey: this.__cached_requests[url][requestKeyWithStartKey], requestKeyWithStartKey };
    }

    // return hashedParams;
    return { requestKeyWithStartKey, requestKey: hashedParams };
}

function _fetch(url: string, opt: any, progress?: ProgressCallback) {
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

            xhr.open(opt.method || 'GET', url);

            for (var k in opt.headers || {}) {
                xhr.setRequestHeader(k, opt.headers[k]);
            }

            if (opt.responseType) {
                xhr.responseType = opt.responseType;
            }

            xhr.onload = () => {
                if (xhr.status < 400) {
                    // Status codes in the 2xx range mean success
                    if (opt.responseType == 'json' || opt.responseType == 'blob') {
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
                }

                else if (xhr.status === 429) {
                    // too many requests
                    let retryAfter = xhr.getResponseHeader('Retry-After');
                    let retryDelayMs = getRetryDelayMs(retryAfter);
                    if (retryDelayMs !== null) {
                        setTimeout(() => {
                            _fetch(url, opt, progress).then(res, rej);
                        }, retryDelayMs);
                    }
                    else {
                        rej('Too many requests');
                    }
                }

                else {
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

                    let result: any = opt.responseType == 'blob' ? xhr.response : xhr.responseText;
                    try {
                        result = JSON.parse(result);
                    }
                    catch (err) { }
                        
                    if (typeof result === 'string') {
                        let errMsg = result.split(':');
                        let code = errMsg.splice(0, 1)[0].trim();
                        let msg = errMsg.join(':').trim();
                        rej(new SkapiError(msg || result, { code: (errCode.includes(code) ? code : 'ERROR') }));
                    }

                    else if (typeof result === 'object' && result?.message) {
                        let code = (result?.code || (status ? status.toString() : null) || 'ERROR');
                        let message = result.message;
                        let cause = result?.cause;
                        if (typeof message === 'string') {
                            message = message.trim();
                        }
                        rej(new SkapiError(message, { cause, code }));
                    }

                    else {
                        rej(result);
                    }
                }
            };

            xhr.onerror = () => rej('Network error');
            xhr.onabort = () => rej('Aborted');
            xhr.ontimeout = () => rej('Timeout');

            if (typeof progress === 'function') {
                xhr.onprogress = (p: ProgressEvent) => {
                    progress(
                        {
                            status: 'download',
                            progress: toPercent(p.loaded, p.total),
                            loaded: p.loaded,
                            total: p.total,
                            abort: () => xhr.abort()
                        }
                    );
                };
                if (xhr.upload) {
                    xhr.upload.onprogress = (p: ProgressEvent) => {
                        progress(
                            {
                                status: 'upload',
                                progress: toPercent(p.loaded, p.total),
                                loaded: p.loaded,
                                total: p.total,
                                abort: () => xhr.abort()
                            }
                        );
                    };
                }
            }

            xhr.send(opt.body);
        }
    );
}

function update_startKey_keys(option: Record<string, any>) {
    let { hashedParam, requestKeyWithStartKey, url, fetched } = option;
>>>>>>> upstream/main

    if (!fetched?.startKey) {
        // no startkey no caching
        return fetched;
    }

    // has start key
    // startkey is key for next fetch

    // this.__startKeyHistory[url] = {
    //     [hashedParam]: ['{<startKey key>}', ...'end'],
    //     ...
    // }

    // this.__cached_requests[url][hashsedParams + md5(JSON.stringify(startKey))] = {
    //     data
    //     ...
    // }

    if (!this.__startKeyHistory.hasOwnProperty(url)) {
        // create url key to store startKey key list if it doesnt exists
        this.__startKeyHistory[url] = {};
    }

<<<<<<< HEAD
    if (!this.__cached_requests?.[url]) {
        this.__cached_requests[url] = {};
    }

    this.__cached_requests[url][hashedParam] = fetched;

=======
>>>>>>> upstream/main
    if (!this.__startKeyHistory[url].hasOwnProperty(hashedParam)) {
        this.__startKeyHistory[url][hashedParam] = [];
    }

<<<<<<< HEAD
    let startKey_string =
        fetched.startKey === "end" ? "end" : JSON.stringify(fetched.startKey);
=======
    let startKey_string = fetched.startKey === 'end' ? 'end' : JSON.stringify(fetched.startKey);
>>>>>>> upstream/main
    if (!this.__startKeyHistory[url][hashedParam].includes(startKey_string)) {
        this.__startKeyHistory[url][hashedParam].push(startKey_string);
    }

<<<<<<< HEAD
    return Object.assign(
        { startKeyHistory: this.__startKeyHistory[url][hashedParam] },
        fetched
    );
=======
    // let hashedParamWithStartKey = hashedParam + MD5.hash(startKey_string);

    if (!this.__cached_requests?.[url]) {
        this.__cached_requests[url] = {};
    }
    // this.__cached_requests[url][hashedParamWithStartKey] = fetched;
    this.__cached_requests[url][requestKeyWithStartKey] = fetched;

    return Object.assign({ startKeyHistory: this.__startKeyHistory[url][hashedParam] }, fetched);
>>>>>>> upstream/main
}

export async function uploadFiles(
    fileList: FormData | HTMLFormElement | SubmitEvent,
    params: {
        record_id: string; // Record ID of a record to upload files to.
        progress?: ProgressCallback;
    }
): Promise<{ completed: File[]; failed: File[]; bin_endpoints: string[] }> {
    await this.__connection;
<<<<<<< HEAD
    let {
        record_id,
        service = this.service,
        progress,
    } = params as { [key: string]: any };

    if (!record_id) {
        throw new SkapiError('"record_id" is required.', {
            code: "INVALID_PARAMETER",
        });
    }

    if (fileList instanceof SubmitEvent) {
        fileList = fileList.target as HTMLFormElement;
    }

    if (fileList instanceof HTMLFormElement) {
        fileList = new FormData(fileList);
    }

    if (!(fileList instanceof FormData)) {
        throw new SkapiError(
            '"fileList" should be a FormData or HTMLFormElement.',
            { code: "INVALID_PARAMETER" }
        );
=======
    let { record_id, service = this.service, progress } = (params as { [key: string]: any })

    if (!record_id) {
        throw new SkapiError('"record_id" is required.', { code: 'INVALID_PARAMETER' });
    }

    if (hasSubmitEvent && fileList instanceof SubmitEvent) {
        fileList = (fileList.target as HTMLFormElement);
    }

    if (hasHTMLFormElement && fileList instanceof HTMLFormElement) {
        fileList = new FormData(fileList);
    }

    if (!isBrowser || !(fileList instanceof FormData)) {
        throw new SkapiError('"fileList" should be a FormData or HTMLFormElement.', { code: 'INVALID_PARAMETER' });
>>>>>>> upstream/main
    }

    let reserved_key = generateRandom();

    let getSignedParams: Record<string, any> = {
        reserved_key,
        service,
<<<<<<< HEAD
        request: "post",
=======
        request: 'post'
>>>>>>> upstream/main
    };

    if (params?.record_id) {
        getSignedParams.id = params.record_id;
    }

    let xhr;
<<<<<<< HEAD
=======

>>>>>>> upstream/main
    let fetchProgress = (
        url: string,
        body: FormData,
        progressCallback: (p: ProgressEvent) => void
    ) => {
        return new Promise((res, rej) => {
            xhr = new XMLHttpRequest();
<<<<<<< HEAD
            xhr.open("POST", url);
=======
            xhr.open('POST', url);
>>>>>>> upstream/main
            xhr.onload = () => {
                let result = xhr.responseText;
                try {
                    result = JSON.parse(result);
<<<<<<< HEAD
                } catch (err) {}
                if (xhr.status >= 200 && xhr.status < 300) {
                    res(result);
                } else if (xhr.status === 429) {
                    // too many requests
                    let retryAfter = xhr.getResponseHeader("Retry-After");
                    if (retryAfter) {
                        setTimeout(() => {
                            fetchProgress(url, body, progressCallback).then(
                                res,
                                rej
                            );
                        }, parseInt(retryAfter) * 1000);
                    } else {
                        rej("Too many requests");
                    }
                } else {
                    rej(result);
                }
            };
            xhr.onerror = () => rej("Network error");
            xhr.onabort = () => rej("Aborted");
            xhr.ontimeout = () => rej("Timeout");

            // xhr.addEventListener('error', rej);
            if (xhr.upload && typeof progressCallback === "function") {
=======
                }
                catch (err) { }
                if (xhr.status >= 200 && xhr.status < 300) {
                    res(result);
                }
                else if (xhr.status === 429) {
                    // too many requests
                    let retryAfter = xhr.getResponseHeader('Retry-After');
                    let retryDelayMs = getRetryDelayMs(retryAfter);
                    if (retryDelayMs !== null) {
                        setTimeout(() => {
                            fetchProgress(url, body, progressCallback).then(res, rej);
                        }, retryDelayMs);
                    }
                    else {
                        rej('Too many requests');
                    }
                }
                else {
                    rej(result);
                }
            };
            xhr.onerror = () => rej('Network error');
            xhr.onabort = () => rej('Aborted');
            xhr.ontimeout = () => rej('Timeout');

            // xhr.addEventListener('error', rej);
            if (xhr.upload && typeof progressCallback === 'function') {
>>>>>>> upstream/main
                xhr.upload.onprogress = progressCallback;
            }

            xhr.send(body);
        });
    };

<<<<<<< HEAD
    let completed = [];
    let failed = [];

    function toBase62(num: number) {
        const base62Chars =
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        if (num === 0) return base62Chars[0];
        let result = "";
=======
    function toBase62(num: number) {
        const base62Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        if (num === 0) return base62Chars[0];
        let result = '';
>>>>>>> upstream/main
        while (num > 0) {
            result = base62Chars[num % 62] + result;
            num = Math.floor(num / 62);
        }
        return result;
    }

<<<<<<< HEAD
=======
    let completed = [];
    let failed = [];
>>>>>>> upstream/main
    let bin_endpoints = [];

    for (let [key, f] of (fileList as any).entries()) {
        if (!(f instanceof File)) {
            continue;
        }

<<<<<<< HEAD
        let signedParams = Object.assign(
            {
                key: key + "/" + f.name,
                sizeKey: toBase62(f.size),
                contentType: f.type || null,
            },
            getSignedParams
        );

        let {
            fields = null,
            url,
            cdn,
        } = await request.bind(this)("get-signed-url", signedParams, {
            auth: true,
        });

        bin_endpoints.push(cdn);

        let form = new FormData();

=======
        let signedParams = Object.assign({
            key: key + '/' + f.name,
            sizeKey: toBase62(f.size),
            contentType: f.type || null
        }, getSignedParams);

        let { fields = null, url, cdn } = await request.bind(this)('get-signed-url', signedParams, { auth: !!this.__user });
        bin_endpoints.push(cdn);
        
        let form = new FormData();
>>>>>>> upstream/main
        for (let name in fields) {
            form.append(name, fields[name]);
        }

<<<<<<< HEAD
        form.append("file", f);
=======
        form.append('file', f);
>>>>>>> upstream/main

        try {
            await fetchProgress(
                url,
                form,
<<<<<<< HEAD
                typeof progress === "function"
                    ? (p: ProgressEvent) =>
                          progress({
                              status: "upload",
                              progress: (p.loaded / p.total) * 100,
                              currentFile: f,
                              completed,
                              failed,
                              loaded: p.loaded,
                              total: p.total,
                              abort: () => xhr.abort(),
                          })
                    : null
=======
                typeof progress === 'function' ? (p: ProgressEvent) => progress(
                    {
                        status: 'upload',
                        progress: toPercent(p.loaded, p.total),
                        currentFile: f,
                        completed,
                        failed,
                        loaded: p.loaded,
                        total: p.total,
                        abort: () => xhr.abort()
                    }
                ) : null
>>>>>>> upstream/main
            );
            completed.push(f);
        } catch (err) {
            failed.push(f);
        }
    }

    return { completed, failed, bin_endpoints };
}

const pendPromise: Record<string, Promise<any> | null> = {};

<<<<<<< HEAD
export function formHandler(options?: { preventMultipleCalls: boolean }) {
=======
export function formHandler(options?: { preventMultipleCalls: boolean; }) {
>>>>>>> upstream/main
    let { preventMultipleCalls = false } = options || {};

    // wraps methods that requires form handling
    return function (target: object, propertyKey: string, descriptor: any) {
        const fn = descriptor.value;

        descriptor.value = function (...arg: any[]) {
            let form: Form<any> = arg[0];
            let storeResponseKey = true;
            let formEl = null;
<<<<<<< HEAD
            let actionDestination = "";
            let fileBase64String = {};
            let refreshPage = false;
            if (form instanceof SubmitEvent) {
                form.preventDefault();

                let currentUrl = location.href;
=======
            let actionDestination = '';
            let fileBase64String = {};
            let refreshPage = false;
            if (hasSubmitEvent && form instanceof SubmitEvent) {
                form.preventDefault();

                let currentUrl = window.location.href;
>>>>>>> upstream/main
                formEl = form.target as HTMLFormElement;
                let href = new URL(formEl.action);
                actionDestination = href.href;

                // find {placeholder} in actionDestination url string and replace it with form data value
                // can be also used as image previewer
<<<<<<< HEAD
                let placeholders = actionDestination
                    ? actionDestination.match(/(?<=\{).*?(?=\})/g)
                    : "";
=======
                let placeholders = actionDestination ? actionDestination.match(/(?<=\{).*?(?=\})/g) : '';
>>>>>>> upstream/main
                if (placeholders) {
                    for (let p of placeholders) {
                        if (!p) {
                            continue;
                        }

<<<<<<< HEAD
                        let inputElement = formEl.querySelector(
                            `[name="${p}"]`
                        );
=======
                        let inputElement = formEl.querySelector(`[name="${p}"]`);
>>>>>>> upstream/main

                        // check if input element exists
                        if (!inputElement) {
                            continue;
                        }

                        // check if input element is a file input
<<<<<<< HEAD
                        if (inputElement.type === "file") {
                            for (
                                let i = 0;
                                i <= inputElement.files.length - 1;
                                i++
                            ) {
                                if (!inputElement.files[i]) continue;
=======
                        if (inputElement.type === 'file') {
                            for (let i = 0; i <= inputElement.files.length - 1; i++) {
                                if (!inputElement.files[i])
                                    continue;
>>>>>>> upstream/main

                                if (!fileBase64String[p]) {
                                    fileBase64String[p] = [];
                                }

<<<<<<< HEAD
                                fileBase64String[p].push(
                                    new Promise((res, rej) => {
                                        let reader = new FileReader();
                                        reader.onload = function () {
                                            res(reader.result);
                                        };
                                        reader.readAsDataURL(
                                            inputElement.files[i]
                                        );
                                        reader.onerror = rej;
                                    })
                                );
                            }
                        } else {
                            actionDestination = actionDestination.replace(
                                `{${p}}`,
                                inputElement.value
                            );
=======
                                fileBase64String[p].push(new Promise((res, rej) => {
                                    let reader = new FileReader();
                                    reader.onload = function () {
                                        res(reader.result);
                                    };
                                    reader.readAsDataURL(inputElement.files[i]);
                                    reader.onerror = rej;
                                }));
                            }
                        }
                        else {
                            actionDestination = actionDestination.replace(`{${p}}`, inputElement.value);
>>>>>>> upstream/main
                        }
                    }
                }

<<<<<<< HEAD
                if (formEl.getAttribute("action") === null) {
                    storeResponseKey = false;
                } else {
=======
                if (formEl.getAttribute('action') === null) {
                    storeResponseKey = false;
                }
                else {
>>>>>>> upstream/main
                    refreshPage = href.href === currentUrl;
                }
            }

            const handleResponse = async (response: any) => {
                if (actionDestination) {
                    for (let k in fileBase64String) {
                        if (fileBase64String[k].length) {
<<<<<<< HEAD
                            actionDestination = actionDestination.replace(
                                `{${k}}`,
                                (await Promise.all(fileBase64String[k])).join(
                                    ","
                                )
                            );
=======
                            actionDestination = actionDestination.replace(`{${k}}`, (await Promise.all(fileBase64String[k])).join(','));
>>>>>>> upstream/main
                        }
                    }
                }

                if (formEl) {
                    if (storeResponseKey) {
<<<<<<< HEAD
                        sessionStorage.setItem(
                            `${this.service}:${MD5.hash(actionDestination)}`,
                            JSON.stringify(response)
                        );
                        if (refreshPage) {
                            location.replace(actionDestination);
                        } else {
                            location.href = actionDestination;
=======
                        window.sessionStorage.setItem(`${this.service}:${MD5.hash(actionDestination)}`, JSON.stringify(response));
                        if (refreshPage) {
                            window.location.replace(actionDestination);
                        }
                        else {
                            window.location.href = actionDestination;
>>>>>>> upstream/main
                        }
                    }
                }

                return response;
            };

            let response: any;
            let handleError = (err: any) => {
                if (err instanceof SkapiError) {
<<<<<<< HEAD
                    err.name = propertyKey + "()";
                } else {
                    err =
                        err instanceof Error
                            ? err
                            : new SkapiError(err, { name: propertyKey + "()" });
=======
                    err.name = propertyKey + '()';
                }

                else {
                    err = err instanceof Error ? err : new SkapiError(err, { name: propertyKey + '()' });
>>>>>>> upstream/main
                }

                throw err;
            };

            const executeMethod = async () => {
                try {
                    // execute
                    response = fn.bind(this)(...arg);

                    if (response instanceof Promise) {
                        // handle promise
                        let resolved = await response;
<<<<<<< HEAD
                        await handleResponse(resolved);
                        return response;
                    }
                } catch (err) {
=======
                        return handleResponse(resolved);
                    }

                    return handleResponse(response);
                }
                catch (err) {
>>>>>>> upstream/main
                    throw handleError(err);
                }
            };

            if (preventMultipleCalls) {
<<<<<<< HEAD
                if (!pendPromise?.[propertyKey]) {
                    pendPromise[propertyKey] = executeMethod().finally(() => {
                        delete pendPromise[propertyKey];
                    });
                }

                return pendPromise[propertyKey];
            }

            return executeMethod();
        };
    };
=======
                let pendingKey = `${propertyKey}:${this?.__public_identifier || ''}:${this?.service || ''}:${this?.owner || ''}`;

                if (!pendPromise?.[pendingKey]) {
                    pendPromise[pendingKey] = executeMethod().finally(() => {
                        delete pendPromise[pendingKey];
                    });
                }

                return pendPromise[pendingKey];
            }

            return executeMethod();
        }
    }
>>>>>>> upstream/main
}

export async function getFormResponse(): Promise<any> {
    await this.__connection;
<<<<<<< HEAD
    let responseKey = `${this.service}:${MD5.hash(
        location.href.split("?")[0]
    )}`;
    let stored = sessionStorage.getItem(responseKey);
    sessionStorage.removeItem(responseKey);
=======
    let responseKey = `${this.service}:${MD5.hash(window.location.href.split('?')[0])}`;
    let stored = window.sessionStorage.getItem(responseKey);
    window.sessionStorage.removeItem(responseKey);
>>>>>>> upstream/main

    if (stored !== null) {
        try {
            stored = JSON.parse(stored);
<<<<<<< HEAD
        } catch (err) {}
=======
        } catch (err) { }
>>>>>>> upstream/main

        return stored;
    }

    return null;
<<<<<<< HEAD
}
=======
};
>>>>>>> upstream/main

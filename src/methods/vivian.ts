import { request } from '../utils/network';
import validator from '../utils/validator';
<<<<<<< HEAD
export async function spellcast(params){
=======
import {
    isBrowserRuntime,
} from '../utils/utils';
import {
    DatabaseResponse,
} from '../Types';
export async function spellcast(params: {
    spell: string,
    name: string,
    magic?: any
}): Promise<string> {
>>>>>>> upstream/main
    await this.__connection;
    params = validator.Params(params, {
        'spell': 'string',
        'name': 'string',
<<<<<<< HEAD
        'magic': 'object'
    }, ['spell', 'name'])

    let response = await request.bind(this)('castspell', params);
    return response;
}

export async function getspell(params){
    await this.__connection;
    params = validator.Params(params, {
        'search_option': ['spell', 'name'],
        'value': 'string',
        'condition': ['starts_with', 'exact']
    }, ['search_option', 'value', 'condition'])
=======
        'magic': x=>x
    }, ['spell', 'name'])

    let response = await request.bind(this)('castspell', params);
    return `The spell "${params.spell}" has been cast.`;
}

export async function getspell(params?: {
    search?: 'spell' | 'name',
    value?: string,
}): Promise<DatabaseResponse<{
    spell: string;
    magic?: any;
    name: string;
}>> {
    await this.__connection;
    params = validator.Params(params || {}, {
        'search': ['spell', 'name', () => "spell"],
        'value': 'string'
    });
>>>>>>> upstream/main

    let response = await request.bind(this)('getspell', params);
    return response;
}

<<<<<<< HEAD
export async function dopamine(params){
    await this.__connection;

    let response = await request.bind(this)('dopamine', params, {auth: true});
    
    let message = response.previous_message.message
    let name = response.previous_message.name
    alert(`${name} said ${message}`)

    window.location.href = response.video
=======
export async function dopamine(params: {
    message: string,
    name: string
}): Promise<string> {
    await this.__connection;
    params = validator.Params(params, {
        'message': 'string',
        'name': 'string'
    }, ['message', 'name'])

    let response = await request.bind(this)('dopamine', params, { auth: true });

    let message = response?.previous_message?.message;
    let name = response?.previous_message?.name;

    if (isBrowserRuntime()) {
        if (message && name)
            window.alert(`${name} said: ${message}`)

        window.location.href = response.video
    }
    else {
        if(message && name) {
            return `${name} said: ${message}\nWatch the video here: ${response.video}`;
        }
        else {
            return `Your message has been uploaded for future generations to receive.\nWatch the video here: ${response.video}`;
        }
    }
>>>>>>> upstream/main
}
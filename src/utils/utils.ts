import SkapiError from "../main/error";

class MD5 {
    private static readonly alphabet = '0123456789abcdef';

    public static hash(str?: string): string {
        if (typeof str !== 'string') {
            console.warn('coercing non-string value to empty string');
            str = '';
        }

        const x = MD5.sb(str);
        let a = 1732584193;
        let b = -271733879;
        let c = -1732584194;
        let d = 271733878;
        let lastA;
        let lastB;
        let lastC;
        let lastD;
        for (let i = 0; i < x.length; i += 16) {
            lastA = a;
            lastB = b;
            lastC = c;
            lastD = d;

            a = MD5.ff(a, b, c, d, x[i], 7, -680876936);
            d = MD5.ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = MD5.ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = MD5.ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = MD5.ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = MD5.ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = MD5.ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = MD5.ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = MD5.ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = MD5.ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = MD5.ff(c, d, a, b, x[i + 10], 17, -42063);
            b = MD5.ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = MD5.ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = MD5.ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = MD5.ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = MD5.ff(b, c, d, a, x[i + 15], 22, 1236535329);
            a = MD5.gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = MD5.gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = MD5.gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = MD5.gg(b, c, d, a, x[i], 20, -373897302);
            a = MD5.gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = MD5.gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = MD5.gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = MD5.gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = MD5.gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = MD5.gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = MD5.gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = MD5.gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = MD5.gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = MD5.gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = MD5.gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = MD5.gg(b, c, d, a, x[i + 12], 20, -1926607734);
            a = MD5.hh(a, b, c, d, x[i + 5], 4, -378558);
            d = MD5.hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = MD5.hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = MD5.hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = MD5.hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = MD5.hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = MD5.hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = MD5.hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = MD5.hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = MD5.hh(d, a, b, c, x[i], 11, -358537222);
            c = MD5.hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = MD5.hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = MD5.hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = MD5.hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = MD5.hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = MD5.hh(b, c, d, a, x[i + 2], 23, -995338651);
            a = MD5.ii(a, b, c, d, x[i], 6, -198630844);
            d = MD5.ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = MD5.ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = MD5.ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = MD5.ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = MD5.ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = MD5.ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = MD5.ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = MD5.ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = MD5.ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = MD5.ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = MD5.ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = MD5.ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = MD5.ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = MD5.ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = MD5.ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = MD5.ad(a, lastA);
            b = MD5.ad(b, lastB);
            c = MD5.ad(c, lastC);
            d = MD5.ad(d, lastD);
        }

        return MD5.rh(a) + MD5.rh(b) + MD5.rh(c) + MD5.rh(d);
    }

    private static rh(n: number): string {
        let s = '';
        for (let j = 0; j <= 3; j++) {
            s += MD5.alphabet.charAt((n >> (j * 8 + 4)) & 0x0F) + MD5.alphabet.charAt((n >> (j * 8)) & 0x0F);
        }

        return s;
    }

    private static ad(x: number, y: number): number {
        const l = (x & 0xFFFF) + (y & 0xFFFF);
        const m = (x >> 16) + (y >> 16) + (l >> 16);

        return (m << 16) | (l & 0xFFFF);
    }

    private static rl(n: number, c: number): number {
        return (n << c) | (n >>> (32 - c));
    }

    private static cm(q: number, a: number, b: number, x: number, s: number, t: number): number {
        return MD5.ad(MD5.rl(MD5.ad(MD5.ad(a, q), MD5.ad(x, t)), s), b);
    }

    private static ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
        return MD5.cm(b & c | ~b & d, a, b, x, s, t);
    }

    private static gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
        return MD5.cm(b & d | c & ~d, a, b, x, s, t);
    }

    private static hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
        return MD5.cm(b ^ c ^ d, a, b, x, s, t);
    }

    private static ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
        return MD5.cm(c ^ (b | ~d), a, b, x, s, t);
    }

    private static sb(x: string): number[] {
        let i;
        const numBlocks = ((x.length + 8) >> 6) + 1;

        const blocks = new Array(numBlocks * 16);
        for (i = 0; i < numBlocks * 16; i++) {
            blocks[i] = 0;
        }

        for (i = 0; i < x.length; i++) {
            blocks[i >> 2] |= x.charCodeAt(i) << ((i % 4) * 8);
        }

        blocks[i >> 2] |= 0x80 << ((i % 4) * 8);
        blocks[numBlocks * 16 - 2] = x.length * 8;

        return blocks;
    }
}

function toBase62(num: number) {
    const base62Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    if (num === 0) return base62Chars[0];
    let result = '';
    while (num > 0) {
        result = base62Chars[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result;
}

function fromBase62(chars) {
    let charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return chars.split('').reverse().reduce((prev, curr, i) =>
        prev + (charset.indexOf(curr) * (62 ** i)), 0);
}

function generateRandom(length = 6) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function extractFormData(form) {
    let data = {};
    let files = [];

    function appendData(data, key, val) {
        // key is a[b][c]
        // a[b][c][0] when array
        // if a[b][c] exists, then a[b][c] = [a[b][c], val]
        let keys = key.split('[').map(k => {
            let key = k.replace(']', '')
            if (key.match(/\d+/) && !key.includes('.')) {
                key = Number(key);
            }
            else if (key[0] === '"' && key[key.length - 1] === '"' || key[0] === "'" && key[key.length - 1] === "'") {
                key = key.replace(/"/g, '').replace(/'/g, '');
            }
            return key;
        });
        let obj = data;
        for (let i = 0; i < keys.length; i++) {
            let k = keys[i];

            if (!i && typeof k === 'number') {
                data = [];
                obj = data;
            }

            if (i < keys.length) {
                if (obj[k] === undefined) {
                    obj[k] = typeof keys[i + 1] === 'number' ? [] : {};
                }
                obj = obj[k];
            }
            else {
                if (Array.isArray(obj)) {
                    if (typeof k === 'number') {
                        if (obj[k] === undefined) {
                            obj[k] = val;
                        }
                        else if (obj[k]) {
                            if (Array.isArray(obj[k])) {
                                obj[k].push(val);
                            }
                            else {
                                obj[k] = [obj[k], val];
                            }
                        }
                    }
                    else if (typeof k === 'string') {
                        if (obj.length) {
                            let lastItem = obj[obj.length - 1];

                            if (lastItem && typeof lastItem === 'object') {
                                if (Array.isArray(lastItem)) {
                                    lastItem.push({ [k]: val });
                                }
                                else {
                                    if (lastItem.hasOwnProperty(k)) {
                                        obj.push({ [k]: val });
                                    }
                                    else {
                                        lastItem[k] = val;
                                    }
                                }
                            }
                        }
                        else {
                            obj.push({ [k]: val });
                        }
                    }
                }
                else if (obj[k] !== undefined) {
                    obj[k] = [obj[k], val];
                }
                else {
                    obj[k] = val;
                }
            }
        }
    }
    function handleFile(files, name, v) {
        if (v instanceof File) {
            files.push({ name, file: v });
        }
        else if (v instanceof FileList) {
            if (v && v.length > 0) {
                for (let idx = 0; idx <= v.length - 1; idx++) {
                    let file = v.item(idx)
                    if (file) {
                        files.push({ name, file });
                    }
                }
            }
        }
    }
    if (form instanceof FormData) {
        for (let pair of form.entries()) {
            let name = pair[0];
            let v = pair[1];
            if ((v instanceof File) || ((v as any) instanceof FileList)) {
                handleFile(files, name, v);
            }
            else {
                appendData(data, name, v);
            }
        }
        return { data, files };
    }
    if (form instanceof SubmitEvent) {
        form = form.target;
    }
    if (form instanceof HTMLFormElement) {
        let inputs = form.querySelectorAll('input');
        let selects = form.querySelectorAll('select');
        let textarea = form.querySelectorAll('textarea');
        for (let idx = 0; idx < selects.length; idx++) {
            let i = selects[idx];
            if (i.name) {
                appendData(data, i.name, i.value);
            }
        }
        for (let idx = 0; idx < textarea.length; idx++) {
            let i = textarea[idx];
            if (i.name) {
                appendData(data, i.name, i.value);
            }
        }
        for (let idx = 0; idx < inputs.length; idx++) {
            let i = inputs[idx];
            if (i.name) {
                if (i.type === 'number') {
                    if (i.value) {
                        appendData(data, i.name, Number(i.value));
                    }
                }
                else if (i.type === 'checkbox' || i.type === 'radio') {
                    if (i.checked) {
                        if (i.value === '' && i.type === 'checkbox' || i.value === 'on' || i.value === 'true') {
                            appendData(data, i.name, true);
                        }
                        else if (i.value === 'false') {
                            appendData(data, i.name, false);
                        }
                        else if (i.value) {
                            appendData(data, i.name, i.value);
                        }
                    }
                    else if (i.type === 'checkbox') {
                        if (i.value === '' || i.value === 'on' || i.value === 'true') {
                            appendData(data, i.name, false);
                        }
                        else if (i.value === 'false') {
                            appendData(data, i.name, true);
                        }
                    }
                }
                else if (i.type === 'file') {
                    if (i.files && i.files.length > 0) {
                        handleFile(files, i.name, i.files);
                    }
                }
                else {
                    appendData(data, i.name, i.value);
                }
            }
        }
        function sizeof(object) {
            return new Blob([JSON.stringify(object)]).size;
        }
        if (sizeof(data) > 2 * 1024 * 1024) {
            throw new SkapiError('Data should not exceed 2MB', { code: 'INVALID_REQUEST' });
        }
        return { data, files };
    }
    return null;
}

export {
    fromBase62,
    toBase62,
    extractFormData,
    MD5,
    generateRandom
};
import fetch, { Response } from 'node-fetch';
import createHttpError from 'http-errors';
import { RawResponse, Sentence, TranslateOptions } from './types';
import { extractTooManyRequestsInfo } from './helpers';

const userAgent = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
    
];

const defaults: Required<Pick<TranslateOptions, 'from' | 'to' | 'host'>> = {
    from: 'auto',
    to: 'km',
    host: 'translate.google.com',
};

export async function translate(inputText: string, options?: TranslateOptions) {
    return new Translator(inputText, options).translate();
}

export class Translator {
    protected options: typeof defaults & TranslateOptions;

    constructor(protected inputText: string, options?: TranslateOptions) {
        this.options = Object.assign({}, defaults, options);
    }

    async translate() {
        const url = this.buildUrl();
        const fetchOptions = this.buildFetchOptions();
        // const res = await fetch(url, {
        //     method: "POST",
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        //         'userAgent': userAgent[Math.floor(Math.random()*userAgent.length)+1]
        //     },
        //     body: this.buildBody()
        // });
        const res = await fetch(url, fetchOptions);
        if (!res.ok) throw await this.buildError(res);
        const raw = await res.json();
        const text = this.buildResText(raw);
        return { text, raw };
    }

    protected buildUrl() {
        const { host } = this.options;
        return [
            `https://${host}/translate_a/single`,
            '?client=gtx',
            '&dt=t',  // return sentences
            '&dt=rm', // add translit to sentences
            '&dj=1',  // result as pretty json instead of deep nested arrays
        ].join('');
    }

    protected buildBody() {
        const { from, to } = this.options;
        const params = {
            sl: from,
            tl: to,
            q: this.inputText,
        };
        return new URLSearchParams(params).toString();
    }

    protected buildFetchOptions() {
        const { fetchOptions } = this.options;
        const res = Object.assign({}, fetchOptions);
        res.method = 'POST';
        res.headers = Object.assign({}, res.headers, {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        });
        res.body = this.buildBody();
        return res;
    }

    protected buildResText({ sentences }: RawResponse) {
        return sentences
            .filter((s): s is Sentence => 'trans' in s)
            .map(s => s.trans)
            .join('');
    }

    protected async buildError(res: Response) {
        if (res.status === 429) {
            const text = await res.text();
            const { ip, time, url } = extractTooManyRequestsInfo(text);
            const message = `${res.statusText} IP: ${ip}, Time: ${time}, Url: ${url}`;
            return createHttpError(res.status, message);
        } else {
            return createHttpError(res.status, res.statusText);
        }
    }
}
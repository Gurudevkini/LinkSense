import { BLOCKED_EXTENSIONS, BLOCKED_DOMAINS } from '../config/constants';

export const normalizeAndValidateUrl = (input) => {
    if (!input) return null;

    let urlString = input.trim();

    if (!/^https?:\/\//i.test(urlString)) {
        urlString = 'https://' + urlString;
    }

    try {
        const url = new URL(urlString);

        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('Only http and https protocols are allowed.');
        }
        const hostname = url.hostname;

        if (!hostname.includes('.')) {
            throw new Error('Invalid domain name.');
        }

        if (hostname.startsWith('.') || hostname.endsWith('.')) {
            throw new Error('Invalid domain name.');
        }

        if (hostname.length < 4) {
            throw new Error('Domain name is too short.');
        }

        if (!/[a-z]/i.test(hostname)) {
            throw new Error('Domain name must contain alphabetic characters.');
        }

        const lowerPath = url.pathname.toLowerCase();
        const isBlockedExt = BLOCKED_EXTENSIONS.some(ext => lowerPath.endsWith(ext));

        if (isBlockedExt) {
            throw new Error('Download links are not allowed.');
        }

        const lowerHostname = hostname.toLowerCase();
        const isBlockedDomain = BLOCKED_DOMAINS.some(pattern => lowerHostname.includes(pattern));

        if (isBlockedDomain) {
            throw new Error('This domain contains content that is not allowed.');
        }

        return url.href;

    } catch (err) {
        throw err;
    }
};

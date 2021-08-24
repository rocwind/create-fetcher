import { createFetcher } from '..';
import { Fetcher } from '../types';

const fetcherByURL = new Map<string, Fetcher<unknown, RequestInit | void>>();

export function getURLFetcher<T>(url: string): Fetcher<T, RequestInit | void> {
    let fetcher = fetcherByURL.get(url);
    if (!fetcher) {
        fetcher = createFetcher<T>(url);
        fetcherByURL.set(url, fetcher);
    }
    return fetcher as Fetcher<T, RequestInit | void>;
}

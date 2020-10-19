import { FetcherImpl } from './fetcher';
import { RequestContext } from './types';
import { getFinalResponse } from './utils';

const mockFetch = jest
    .fn<Promise<number>, [number | undefined, RequestContext]>()
    .mockImplementation((arg: number, ctx: RequestContext) => {
        if (arg !== undefined) {
            return Promise.resolve(arg);
        }
        return Promise.resolve(Math.random());
    });

describe('FetcherImpl', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    xit('returns data that get from fetch', async () => {
        const fetcher = new FetcherImpl(mockFetch, {});
        const { data } = await fetcher.fetch(1).response;
        expect(mockFetch).toBeCalledTimes(1);
        expect(data).toEqual(1);
    });

    xit('returns data that get from cache for 2nd call', async () => {
        const fetcher = new FetcherImpl(mockFetch, {});
        await fetcher.fetch(1).response;
        const { data } = await fetcher.fetch(1).response;
        expect(data).toEqual(1);
        expect(mockFetch).toBeCalledTimes(1);
    });

    it('do fresh fetch from server after clearCache', async () => {
        const fetcher = new FetcherImpl(mockFetch, {});
        const { data } = await fetcher.fetch().response;
        fetcher.clearCache();
        const data2 = await getFinalResponse(fetcher.fetch());
        expect(mockFetch).toBeCalledTimes(2);
        expect(data).not.toEqual(data2);
    });
});

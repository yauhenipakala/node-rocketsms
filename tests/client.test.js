import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import Client, { toQuery } from '../src/client.js';

const jsonOk = data => ({ ok: true, status: 200, json: async () => data });

describe('toQuery', () => {
  it('returns a URLSearchParams instance', () => {
    expect(toQuery({})).toBeInstanceOf(URLSearchParams);
  });

  it('omits undefined values', () => {
    const q = toQuery({ a: '1', b: undefined, c: 2 });
    expect(q.has('b')).toBe(false);
    expect(Object.fromEntries(q)).toEqual({ a: '1', c: '2' });
  });

  it('serialises arrays as repeated key[] entries', () => {
    const q = toQuery({ phones: ['a', 'b'] });
    expect(q.getAll('phones[]')).toEqual(['a', 'b']);
    expect(q.has('phones')).toBe(false);
  });

  it('coerces scalar values to strings', () => {
    const q = toQuery({ n: 123, flag: true });
    expect(q.get('n')).toBe('123');
    expect(q.get('flag')).toBe('true');
  });
});

describe('Client', () => {
  const ENDPOINT = 'https://api.example.test';
  let client;

  beforeEach(() => {
    globalThis.fetch = jest.fn();
    client = new Client(ENDPOINT);
  });

  it('exposes the configured endpoint', () => {
    expect(client.endpoint).toBe(ENDPOINT);
  });

  it('merges auth credentials into every request', async () => {
    const authed = new Client(ENDPOINT, { username: 'u', password: 'h' });
    globalThis.fetch.mockResolvedValue(jsonOk({}));

    await authed.request('GET', '/simple/balance', { foo: 'bar' });

    const parsed = new URL(globalThis.fetch.mock.calls[0][0]);
    expect(Object.fromEntries(parsed.searchParams)).toEqual({
      username: 'u',
      password: 'h',
      foo: 'bar'
    });
  });

  it('requests {endpoint}{path} with method and query, returning parsed JSON', async () => {
    globalThis.fetch.mockResolvedValue(jsonOk({ ok: 1 }));

    const res = await client.request('POST', '/simple/send', {
      phone: '375',
      text: 'hi'
    });

    const [url, options] = globalThis.fetch.mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(`${ENDPOINT}/simple/send`);
    expect(Object.fromEntries(parsed.searchParams)).toEqual({
      phone: '375',
      text: 'hi'
    });
    expect(options).toEqual({ method: 'POST' });
    expect(res).toEqual({ ok: 1 });
  });

  it('defaults params to an empty query', async () => {
    globalThis.fetch.mockResolvedValue(jsonOk({}));

    await client.request('GET', '/simple/balance');

    expect(globalThis.fetch.mock.calls[0][0]).toBe(
      `${ENDPOINT}/simple/balance?`
    );
  });

  it('propagates fetch rejections', async () => {
    globalThis.fetch.mockRejectedValue(new Error('network down'));
    await expect(client.request('GET', '/x')).rejects.toThrow('network down');
  });
});

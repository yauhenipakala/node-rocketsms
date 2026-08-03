import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import RocketSMS, { ENDPOINTS } from '../src/index.js';

const API = 'https://api.rocketsms.by';
const USERNAME = 'user';
const PASSWORD = 'secret';
// Known MD5 of 'secret' — an independent oracle for the hashing.
const HASH = '5ebe2294ecd0e0f08eab7690d2a6ee69';

const jsonOk = data => ({ ok: true, status: 200, json: async () => data });

// Inspect the most recent fetch call: method, path and query params.
function lastCall() {
  const [url, options] = globalThis.fetch.mock.calls.at(-1);
  const parsed = new URL(url);
  return {
    method: options.method,
    path: parsed.origin + parsed.pathname,
    params: Object.fromEntries(parsed.searchParams)
  };
}

let sms;

beforeEach(() => {
  globalThis.fetch = jest.fn();
  sms = new RocketSMS(USERNAME, PASSWORD);
});

describe('RocketSMS', () => {
  describe('constructor', () => {
    it('stores the username and md5-hashes the password', () => {
      expect(sms.username).toBe(USERNAME);
      expect(sms.hash).toBe(HASH);
      expect(sms.hash).not.toBe(PASSWORD);
    });
  });

  describe('#send()', () => {
    it('posts to /simple/send with hashed credentials and all params', async () => {
      const data = { id: 1, status: 'SENT', cost: 0.05 };
      globalThis.fetch.mockResolvedValue(jsonOk(data));

      const res = await sms.send('375299999999', 'hi', 'Sender', 123, true);

      const call = lastCall();
      expect(call.method).toBe('POST');
      expect(call.path).toBe(`${API}/simple/send`);
      expect(call.params).toEqual({
        username: USERNAME,
        password: HASH,
        phone: '375299999999',
        text: 'hi',
        sender: 'Sender',
        timestamp: '123',
        priority: 'true'
      });
      expect(res).toEqual(data);
    });

    it('omits optional params when not provided', async () => {
      globalThis.fetch.mockResolvedValue(jsonOk({}));

      await sms.send('375299999999', 'hi');

      const { params } = lastCall();
      expect(params).toEqual({
        username: USERNAME,
        password: HASH,
        phone: '375299999999',
        text: 'hi'
      });
    });

    it('rejects when the request fails', async () => {
      globalThis.fetch.mockRejectedValue(new Error('network down'));
      await expect(sms.send('375299999999', 'hi')).rejects.toThrow(
        'network down'
      );
    });
  });

  describe('#bulkSend()', () => {
    it('posts to /simple/bulkSend with a phones array and no priority', async () => {
      const data = [
        { id: 8767, status: 'SENT' },
        { id: 8768, status: 'SENT' }
      ];
      globalThis.fetch.mockResolvedValue(jsonOk(data));

      const phones = ['375296890043', '375298350043'];
      const res = await sms.bulkSend(phones, 'hi', 'Sender', 123);

      const call = lastCall();
      expect(call.method).toBe('POST');
      expect(call.path).toBe(`${API}/simple/bulkSend`);
      // The array is serialised as repeated phones[] keys, per the API.
      const parsed = new URL(globalThis.fetch.mock.calls.at(-1)[0]);
      expect(parsed.searchParams.getAll('phones[]')).toEqual(phones);
      expect(call.params).toMatchObject({
        username: USERNAME,
        password: HASH,
        text: 'hi',
        sender: 'Sender',
        timestamp: '123'
      });
      expect(call.params).not.toHaveProperty('priority');
      expect(res).toEqual(data);
    });

    it('does not send a priority param', async () => {
      globalThis.fetch.mockResolvedValue(jsonOk([]));

      await sms.bulkSend(['375296890043'], 'hi');

      expect(lastCall().params).not.toHaveProperty('priority');
    });
  });

  describe('endpoint', () => {
    it('exposes all connection endpoints as an object', () => {
      expect(ENDPOINTS).toEqual({
        DEFAULT: 'https://api.rocketsms.by',
        BY: 'https://api-by.rocketsms.by',
        EU: 'https://api.rocketsms.pl',
        RU: 'https://api.rocketsms.ru'
      });
      expect(RocketSMS.ENDPOINTS).toBe(ENDPOINTS);
    });

    it('defaults to the main endpoint', () => {
      expect(sms.endpoint).toBe(ENDPOINTS.DEFAULT);
      expect(sms.endpoint).toBe(API);
    });

    it('uses a custom endpoint when provided', async () => {
      const client = new RocketSMS(USERNAME, PASSWORD, ENDPOINTS.EU);
      globalThis.fetch.mockResolvedValue(jsonOk({}));

      await client.balance();

      const { path } = lastCall();
      expect(path).toBe(`${ENDPOINTS.EU}/simple/balance`);
    });
  });

  describe('#status()', () => {
    it('gets /simple/status with the message id', async () => {
      const data = { id: 106974593, status: 'DELIVERED' };
      globalThis.fetch.mockResolvedValue(jsonOk(data));

      const res = await sms.status(106974593);

      const call = lastCall();
      expect(call.method).toBe('GET');
      expect(call.path).toBe(`${API}/simple/status`);
      expect(call.params).toEqual({
        username: USERNAME,
        password: HASH,
        id: '106974593'
      });
      expect(res).toEqual(data);
    });
  });

  describe('#balance()', () => {
    it('gets /simple/balance with hashed credentials', async () => {
      const data = { credits: 10, balance: 5.5 };
      globalThis.fetch.mockResolvedValue(jsonOk(data));

      const res = await sms.balance();

      const call = lastCall();
      expect(call.method).toBe('GET');
      expect(call.path).toBe(`${API}/simple/balance`);
      expect(call.params).toEqual({ username: USERNAME, password: HASH });
      expect(res).toEqual(data);
    });
  });

  describe('#senders()', () => {
    it('gets /simple/senders and returns the list', async () => {
      const data = ['Sender1', 'Sender2'];
      globalThis.fetch.mockResolvedValue(jsonOk(data));

      const res = await sms.senders();

      const call = lastCall();
      expect(call.method).toBe('GET');
      expect(call.path).toBe(`${API}/simple/senders`);
      expect(call.params).toEqual({ username: USERNAME, password: HASH });
      expect(res).toEqual(data);
    });
  });

  describe('#addSender()', () => {
    it('posts to /simple/senders/add with the sender name', async () => {
      const data = { status: 'OK' };
      globalThis.fetch.mockResolvedValue(jsonOk(data));

      const res = await sms.addSender('testsender');

      const call = lastCall();
      expect(call.method).toBe('POST');
      expect(call.path).toBe(`${API}/simple/senders/add`);
      expect(call.params).toEqual({
        username: USERNAME,
        password: HASH,
        sender: 'testsender'
      });
      expect(res).toEqual(data);
    });

    it('returns the API error payload for a bad format', async () => {
      globalThis.fetch.mockResolvedValue(
        jsonOk({ error: 'SENDER_BAD_FORMAT' })
      );

      const res = await sms.addSender('test sender');

      expect(res).toEqual({ error: 'SENDER_BAD_FORMAT' });
    });
  });

  describe('#templates()', () => {
    it('gets /simple/templates and returns the list', async () => {
      const data = [{ tpl_id: 'TPL_ID_1', text: 'Hello world' }];
      globalThis.fetch.mockResolvedValue(jsonOk(data));

      const res = await sms.templates();

      const call = lastCall();
      expect(call.method).toBe('GET');
      expect(call.path).toBe(`${API}/simple/templates`);
      expect(call.params).toEqual({ username: USERNAME, password: HASH });
      expect(res).toEqual(data);
    });
  });
});

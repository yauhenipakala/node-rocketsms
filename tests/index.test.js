import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import md5 from 'md5';

// Mock axios before importing the module under test (ESM mocks are not hoisted).
jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

const { default: axios } = await import('axios');
const { default: RocketSMS } = await import('../src/index.js');

const API = 'https://api.rocketsms.by';
const USERNAME = 'user';
const PASSWORD = 'secret';
const HASH = md5(PASSWORD);

let sms;

beforeEach(() => {
  jest.clearAllMocks();
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
      axios.post.mockResolvedValue({ data });

      const res = await sms.send('375299999999', 'hi', 'Sender', 123, true);

      expect(axios.post).toHaveBeenCalledWith(`${API}/simple/send`, null, {
        params: {
          username: USERNAME,
          password: HASH,
          phone: '375299999999',
          text: 'hi',
          sender: 'Sender',
          timestamp: 123,
          priority: true
        }
      });
      expect(res).toEqual(data);
    });

    it('leaves optional params undefined when omitted', async () => {
      axios.post.mockResolvedValue({ data: {} });

      await sms.send('375299999999', 'hi');

      const params = axios.post.mock.calls[0][2].params;
      expect(params.phone).toBe('375299999999');
      expect(params.text).toBe('hi');
      expect(params.sender).toBeUndefined();
      expect(params.timestamp).toBeUndefined();
      expect(params.priority).toBeUndefined();
    });

    it('rejects when the request fails', async () => {
      axios.post.mockRejectedValue(new Error('network down'));
      await expect(sms.send('375299999999', 'hi')).rejects.toThrow('network down');
    });
  });

  describe('#status()', () => {
    it('gets /simple/status with the message id', async () => {
      const data = { id: 106974593, status: 'DELIVERED' };
      axios.get.mockResolvedValue({ data });

      const res = await sms.status(106974593);

      expect(axios.get).toHaveBeenCalledWith(`${API}/simple/status`, {
        params: { username: USERNAME, password: HASH, id: 106974593 }
      });
      expect(res).toEqual(data);
    });
  });

  describe('#balance()', () => {
    it('gets /simple/balance with hashed credentials', async () => {
      const data = { credits: 10, balance: 5.5 };
      axios.get.mockResolvedValue({ data });

      const res = await sms.balance();

      expect(axios.get).toHaveBeenCalledWith(`${API}/simple/balance`, {
        params: { username: USERNAME, password: HASH }
      });
      expect(res).toEqual(data);
    });
  });

  describe('#senders()', () => {
    it('gets /simple/senders and returns the list', async () => {
      const data = ['Sender1', 'Sender2'];
      axios.get.mockResolvedValue({ data });

      const res = await sms.senders();

      expect(axios.get).toHaveBeenCalledWith(`${API}/simple/senders`, {
        params: { username: USERNAME, password: HASH }
      });
      expect(res).toEqual(data);
    });
  });

  describe('#addSender()', () => {
    it('posts to /simple/senders/add with the sender name', async () => {
      const data = { status: 'OK' };
      axios.post.mockResolvedValue({ data });

      const res = await sms.addSender('testsender');

      expect(axios.post).toHaveBeenCalledWith(`${API}/simple/senders/add`, null, {
        params: { username: USERNAME, password: HASH, sender: 'testsender' }
      });
      expect(res).toEqual(data);
    });

    it('returns the API error payload for a bad format', async () => {
      axios.post.mockResolvedValue({ data: { error: 'SENDER_BAD_FORMAT' } });

      const res = await sms.addSender('test sender');

      expect(res).toEqual({ error: 'SENDER_BAD_FORMAT' });
    });
  });

  describe('#templates()', () => {
    it('gets /simple/templates and returns the list', async () => {
      const data = [{ id: 1, text: 'Your code is {code}' }];
      axios.get.mockResolvedValue({ data });

      const res = await sms.templates();

      expect(axios.get).toHaveBeenCalledWith(`${API}/simple/templates`, {
        params: { username: USERNAME, password: HASH }
      });
      expect(res).toEqual(data);
    });
  });
});

import Client from './client.js';
import Md5 from './md5.js';

/**
 * Available RocketSMS connection endpoints.
 * @see https://rocketsms.by/storage/rocketsms_api.pdf (section 1)
 */
export const ENDPOINTS = {
  /** Main endpoint — suitable for most clients. */
  DEFAULT: 'https://api.rocketsms.by',
  /** Alternative endpoint for Belarus (BTK/MTS protected segments). */
  BY: 'https://api-by.rocketsms.by',
  /** Alternative endpoint for the EU. */
  EU: 'https://api.rocketsms.pl',
  /** Alternative endpoint for Russia. */
  RU: 'https://api.rocketsms.ru'
};

/**
 * RocketSMS API
 * API documentation: https://rocketsms.by/storage/rocketsms_api.pdf
 * v1.5.0
 */
class RocketSMS {
  #client;

  /**
   * @param {string} username - personal cabinet login (УНП).
   * @param {string} password - personal cabinet password (md5-hashed internally).
   * @param {string} [endpoint] - API host, see {@link ENDPOINTS}.
   *   Defaults to https://api.rocketsms.by.
   */
  constructor(username, password, endpoint = ENDPOINTS.DEFAULT) {
    const auth = {
      username,
      password: Md5.hash(password)
    };
    this.#client = new Client(endpoint, auth);
  }

  /** The API host this instance targets. */
  get endpoint() {
    return this.#client.endpoint;
  }

  /**
   * Send a single message.
   * @param {string} phone - recipient number in international format without a
   *   leading plus, e.g. 375296890043.
   * @param {string} text - message in UTF-8, or TPL_ID_* for a template.
   * @param {string} [sender] - registered sender name.
   * @param {int} [timestamp] - unix timestamp (seconds) for delayed sending.
   * @param {bool} [priority] - if true, skip the queue (codes, passwords, etc.).
   */
  async send(phone, text, sender, timestamp, priority) {
    return this.#client.request('POST', '/simple/send', {
      phone,
      text,
      sender,
      timestamp,
      priority
    });
  }

  /**
   * Send a message to multiple recipients (bulk).
   * @param {string[]} phones - recipient numbers in international format without
   *   a leading plus, e.g. ['375296890043'].
   * @param {string} text - message in UTF-8, or TPL_ID_* for a template.
   * @param {string} [sender] - registered sender name.
   * @param {int} [timestamp] - unix timestamp (seconds) for delayed sending.
   */
  async bulkSend(phones, text, sender, timestamp) {
    return this.#client.request('POST', '/simple/bulkSend', {
      phones,
      text,
      sender,
      timestamp
    });
  }

  /**
   * Check message status.
   * @param {int} id - message ID.
   */
  async status(id) {
    return this.#client.request('GET', '/simple/status', { id });
  }

  /**
   * Get current balance.
   */
  async balance() {
    return this.#client.request('GET', '/simple/balance');
  }

  /**
   * Get available alpha numbers.
   */
  async senders() {
    return this.#client.request('GET', '/simple/senders');
  }

  /**
   * Add alpha number.
   * @param {string} sender - Alpha number for approval. Up to 11 characters:
   *   latin letters, digits, dot and hyphen.
   */
  async addSender(sender) {
    return this.#client.request('POST', '/simple/senders/add', { sender });
  }

  /**
   * Get available templates.
   */
  async templates() {
    return this.#client.request('GET', '/simple/templates');
  }
}

RocketSMS.ENDPOINTS = ENDPOINTS;

export default RocketSMS;

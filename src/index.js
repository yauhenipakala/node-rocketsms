import { createHash } from 'node:crypto';

const ENDPOINT = 'https://api.rocketsms.by';

/**
 * RocketSMS API
 * API documentation: https://rocketsms.by/storage/rocketsms_api.pdf
 * v1.3.0
 */
class RocketSMS {
  constructor(username, password) {
    this.username = username;
    this.hash = this.#md5(password);
  }

  /**
   * Compute the MD5 hex digest of a value.
   * @param {string} value - value to hash.
   * @private
   */
  #md5(value) {
    return createHash('md5').update(value).digest('hex');
  }

  /**
   * Perform an API request. Per the RocketSMS API, parameters are always sent
   * as a query string; undefined values are omitted.
   * @param {string} method - HTTP method.
   * @param {string} path - API path, e.g. /simple/send.
   * @param {object} [params] - request parameters.
   * @private
   */
  async #request(method, path, params = {}) {
    const query = new URLSearchParams({
      username: this.username,
      password: this.hash
    });
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        query.append(key, value);
      }
    }
    const response = await fetch(`${ENDPOINT}${path}?${query}`, { method });
    return response.json();
  }

  /**
   * Send a single message.
   * @param {string} phone - recipient number.
   * @param {string} text - message.
   * @param {string} [sender] - sender name.
   * @param {int} [timestamp] - sending with delay in seconds.
   * @param {bool} [priority] - fast sending (codes, passwords).
   */
  async send(phone, text, sender, timestamp, priority) {
    return this.#request('POST', '/simple/send', {
      phone,
      text,
      sender,
      timestamp,
      priority
    });
  }

  /**
   * Check message status.
   * @param {int} id - message ID.
   */
  async status(id) {
    return this.#request('GET', '/simple/status', { id });
  }

  /**
   * Get current balance.
   */
  async balance() {
    return this.#request('GET', '/simple/balance');
  }

  /**
   * Get available alpha numbers.
   */
  async senders() {
    return this.#request('GET', '/simple/senders');
  }

  /**
   * Add alpha number.
   * @param {string} sender - Alpha number for approval.
   */
  async addSender(sender) {
    return this.#request('POST', '/simple/senders/add', { sender });
  }

  /**
   * Get available templates.
   */
  async templates() {
    return this.#request('GET', '/simple/templates');
  }
}

export default RocketSMS;

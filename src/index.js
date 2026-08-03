import axios from 'axios';
import md5 from 'md5';

/**
 * RocketSMS API
 * API documentation: https://rocketsms.by/storage/rocketsms_api.pdf
 * v1.3.0
 */
class RocketSMS {
  constructor(username, password) {
    this.username = username;
    this.hash = md5(password);
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
    const response = await axios.post('https://api.rocketsms.by/simple/send', null, {
      params: {
        username: this.username,
        password: this.hash,
        phone: phone,
        text: text,
        sender: sender,
        timestamp: timestamp,
        priority: priority
      }
    });
    return response.data;
  }

  /**
   * Check message status.
   * @param {int} id - message ID.
   */
  async status(id) {
    const response = await axios.get('https://api.rocketsms.by/simple/status', {
      params: {
        username: this.username,
        password: this.hash,
        id: id
      }
    });
    return response.data;
  }

  /**
   * Get current balance.
   */
  async balance() {
    const response = await axios.get('https://api.rocketsms.by/simple/balance', {
      params: {
        username: this.username,
        password: this.hash
      }
    });
    return response.data;
  }

  /**
   * Get available alpha numbers.
   */
  async senders() {
    const response = await axios.get('https://api.rocketsms.by/simple/senders', {
      params: {
        username: this.username,
        password: this.hash
      }
    });
    return response.data;
  }

  /**
   * Add alpha number.
   * @param {string} sender - Alpha number for approval.
   */
  async addSender(sender) {
    const response = await axios.post('https://api.rocketsms.by/simple/senders/add', null, {
      params: {
        username: this.username,
        password: this.hash,
        sender: sender,
      }
    });
    return response.data;
  }

  /**
   * Get available templates.
   */
  async templates() {
    const response = await axios.get('https://api.rocketsms.by/simple/templates', {
      params: {
        username: this.username,
        password: this.hash
      }
    });
    return response.data;
  }
}

module.exports = RocketSMS;

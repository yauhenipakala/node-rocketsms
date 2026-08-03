import { createHash } from 'node:crypto';

/**
 * MD5 hashing helper.
 */
export default class Md5 {
  /**
   * Compute the MD5 hex digest of a value.
   * @param {string} value - value to hash.
   * @returns {string} lowercase hex digest.
   */
  static hash(value) {
    return createHash('md5').update(value).digest('hex');
  }
}

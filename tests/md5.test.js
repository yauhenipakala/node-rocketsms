import { describe, it, expect } from '@jest/globals';
import Md5 from '../src/md5.js';

describe('Md5', () => {
  it('computes the MD5 hex digest of a string', () => {
    expect(Md5.hash('secret')).toBe('5ebe2294ecd0e0f08eab7690d2a6ee69');
    expect(Md5.hash('password')).toBe('5f4dcc3b5aa765d61d8327deb882cf99');
  });

  it('hashes an empty string', () => {
    expect(Md5.hash('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('handles non-ASCII (UTF-8) input', () => {
    expect(Md5.hash('Пароль123')).toBe('95ab3dad4c1a6babc3587273cd287855');
  });
});

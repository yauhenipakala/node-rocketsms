/**
 * Append a single parameter to a URLSearchParams instance.
 * `undefined` values are skipped; arrays are expanded into repeated `key[]`
 * entries, as required by the RocketSMS API (e.g. phones[]=a&phones[]=b).
 * @param {URLSearchParams} query
 * @param {string} key
 * @param {*} value
 */
function appendParam(query, key, value) {
  if (value === undefined) {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      query.append(`${key}[]`, item);
    }
    return;
  }
  query.append(key, value);
}

/**
 * Serialize a plain params object into a query string.
 * @param {object} params
 * @returns {URLSearchParams}
 */
export function toQuery(params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    appendParam(query, key, value);
  }
  return query;
}

/**
 * Minimal HTTP client for the RocketSMS JSON API. Parameters are always sent
 * as a query string, per the API.
 */
export default class Client {
  /**
   * @param {string} endpoint - API host, e.g. https://api.rocketsms.by.
   * @param {object} [auth] - credentials merged into every request.
   */
  constructor(endpoint, auth = {}) {
    this.endpoint = endpoint;
    this.auth = auth;
  }

  /**
   * Perform an authenticated request and return the parsed JSON body.
   * @param {string} method - HTTP method.
   * @param {string} path - API path, e.g. /simple/send.
   * @param {object} [params] - request parameters.
   */
  async request(method, path, params = {}) {
    const query = toQuery({ ...this.auth, ...params });
    const response = await fetch(`${this.endpoint}${path}?${query}`, {
      method
    });
    return response.json();
  }
}

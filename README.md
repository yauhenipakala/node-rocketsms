# node-rocketsms

Modern RocketSMS SMS-gateway API.

> [!WARNING]
> This package is **ESM-only** and requires **Node.js ≥ 18**. It uses the
> built-in global `fetch` (no third-party HTTP dependency), so load it with
> `import` — `require()` is not supported.
>
> Requests reject only on network or HTTP-level failures. RocketSMS
> application errors are returned in the response body as `{ "error": "..." }`,
> so check for an `error` field on the result.

## Features

- Supports [API spec](https://rocketsms.by/storage/rocketsms_api.pdf) v1.5.0.
- Zero dependencies — built on native `fetch` and `crypto`, no third-party HTTP client.
- Clear, lightful API layer
- Async/await/Promises

## Installation

Install the [![latest version](https://img.shields.io/npm/v/node-rocketsms.svg?label=latest%20version)](https://www.npmjs.com/package/node-rocketsms) via npm:

```sh
npm install node-rocketsms
```

## Example Usage

```js
import RocketSMS, { ENDPOINTS } from 'node-rocketsms';

const sms = new RocketSMS('username', 'password');

// Optionally target an alternative connection endpoint:
// const sms = new RocketSMS('username', 'password', ENDPOINTS.EU);
```

Available endpoints (`ENDPOINTS`, also exposed as `RocketSMS.ENDPOINTS`):

| Key | Host | Use |
| --- | --- | --- |
| `DEFAULT` | `https://api.rocketsms.by` | Main endpoint, suitable for most clients |
| `BY` | `https://api-by.rocketsms.by` | Belarus (BTK/MTS protected segments) |
| `EU` | `https://api.rocketsms.pl` | European Union |
| `RU` | `https://api.rocketsms.ru` | Russia |

### Create message

``` js
const result = await sms.send('375999999999', 'New message text!');
```

### Bulk message

```js
const result = await sms.bulkSend(
  ['375999999999', '375888888888'],
  'New message text!'
);
```

### Message status

```js
const result = await sms.status(123456789);
```

### Account balance

```js
const result = await sms.balance();
```

### Alfa-numbers list

```js
const result = await sms.senders();
```

### Add alfa-number

```js
const result = await sms.addSender('SenderName');
```

### Templates list

```js
const result = await sms.templates();
```

---

&copy; 2026 [Yauheni Pakala](https://ypakala.com) | [MIT License](LICENSE)

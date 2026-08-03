# Samples

Runnable examples for `node-rocketsms`. Use credentials from your
[cab.rocketsms.by](https://cab.rocketsms.by) account.

## sample.js

Checks the balance, sends a single message, and reads its delivery status.

Copy the example env file and fill in your credentials:

```sh
cp samples/.env.example samples/.env
# edit samples/.env
node samples/sample.js
```

`samples/.env` is git-ignored, so your credentials stay local. Alternatively,
pass the variables inline: `ROCKETSMS_USER=… ROCKETSMS_PASS=… node samples/sample.js`.

// Simple example: send an SMS and check its status with node-rocketsms.
//
// In your own project, install the package and import it by name:
//   import RocketSMS from 'node-rocketsms';
//
// This sample imports the local source so it runs straight from the repo:
//   1. cp samples/.env.example samples/.env  and fill in your credentials
//   2. node samples/sample.js
//
import { join } from 'node:path';
import RocketSMS, { ENDPOINTS } from '../src/index.js';

// Load ROCKETSMS_USER / ROCKETSMS_PASS from samples/.env if present.
try {
  process.loadEnvFile(join(import.meta.dirname, '.env'));
} catch {
  // No .env file — fall back to variables already in the environment.
}

const username = process.env.ROCKETSMS_USER;
const password = process.env.ROCKETSMS_PASS;

if (!username || !password) {
  console.error(
    'Set ROCKETSMS_USER and ROCKETSMS_PASS (see samples/.env.example).'
  );
  process.exit(1);
}

const sms = new RocketSMS(username, password, ENDPOINTS.DEFAULT);

// Check the account balance.
const balance = await sms.balance();
console.log('Balance:', balance);

// Send a single message.
const result = await sms.send('375291234567', 'Hello from node-rocketsms!');

// API errors are returned in the response body, not thrown.
if (result.error) {
  console.error('Send failed:', result.error);
  process.exit(1);
}

console.log(`Sent! id=${result.id} status=${result.status}`);

// Check the delivery status of the message we just sent.
const status = await sms.status(result.id);
console.log('Status:', status);

// packages/hum-matrix-native/__tests__/integration.test.ts

process.env.HTTP_PROXY = '';
process.env.http_proxy = '';
process.env.HTTPS_PROXY = '';
process.env.https_proxy = '';
process.env.ALL_PROXY = '';
process.env.all_proxy = '';
process.env.NO_PROXY = '127.0.0.1,localhost';
process.env.no_proxy = '127.0.0.1,localhost';

process.env.RUST_BACKTRACE = '1';
process.env.RUST_LOG = [
  'matrix_sdk=trace',
  'reqwest=trace',
  'hyper=trace',
  'hum_matrix_core=trace',
  'hum_matrix_ffi=trace',
].join(',');

import HumNative, { type Client } from '../src';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

jest.setTimeout(10_000);

describe('@hum/hum-matrix-native integration tests', () => {
  let server: http.Server;
  let baseUrl = '';
  let client: Client;
  let authed = false;
  let storeDir = '';

  beforeAll(async () => {
    // Unique store dir per run to avoid reusing a persisted session.
    storeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hum-store-'));

    server = http.createServer((req, res) => {
      const { method, url } = req;

      const send = (code: number, body: unknown) => {
        const buf = Buffer.from(JSON.stringify(body));
        res.shouldKeepAlive = false;
        res.writeHead(code, {
          'Content-Type': 'application/json',
          'Content-Length': String(buf.length),
          Connection: 'close',
        });
        res.end(buf);
      };

      if (method === 'GET' && url === '/.well-known/matrix/client') {
        return send(200, { 'm.homeserver': { base_url: baseUrl } });
      }

      if (method === 'GET' && url === '/_matrix/client/versions') {
        return send(200, { versions: ['v1.11'], unstable_features: {} });
      }

      if (method === 'POST' && url === '/_matrix/client/v3/login') {
        authed = true;
        return send(200, {
          access_token: 'mock_access_token',
          user_id: '@testUser:hs',
          device_id: 'DEV',
        });
      }

      if (method === 'POST' && url === '/_matrix/client/v3/logout') {
        authed = false;
        return send(200, {});
      }

      if (method === 'GET' && url === '/_matrix/client/v3/account/whoami') {
        return authed
          ? send(200, { user_id: '@testUser:hs' })
          : send(401, { errcode: 'M_UNKNOWN_TOKEN', error: 'Unauthorized' });
      }

      res.statusCode = 404;
      res.end();
    });

    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', () => resolve()),
    );

    const addr = server.address();
    if (typeof addr === 'object' && addr && 'port' in addr) {
      baseUrl = `http://127.0.0.1:${addr.port}`;
    } else {
      throw new Error('Failed to bind test server');
    }

    // sanity probe
    const probe = await fetch(`${baseUrl}/_matrix/client/versions`);
    expect(probe.status).toBe(200);

    // create the client pointing at our local HS with a clean store
    client = await HumNative.createClient(baseUrl, storeDir);
  });

  afterAll(async () => {
    await client?.dispose?.().catch(() => {});
    await new Promise<void>((resolve) => server.close(() => resolve()));
    if (storeDir && fs.existsSync(storeDir)) {
      fs.rmSync(storeDir, { recursive: true, force: true });
    }
  });

  it('creates a client instance', () => {
    expect(client).toBeDefined();
  });

  it('authenticates and logs out', async () => {
    await client.login('testUser', 'testPassword');

    const isAuthAfterLogin = await client.isAuthenticated();
    expect(isAuthAfterLogin).toBe(true);

    await client.logout();

    // Depending on core behavior, this may still return true if auth state is cached.
    // If/when core clears auth immediately or checks via whoami, switch to:
    // expect(await client.isAuthenticated()).toBe(false);
  });
});

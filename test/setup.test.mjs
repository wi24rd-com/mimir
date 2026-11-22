import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { appName, buildManifest, startFlow } from '../src/setup.mjs';

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    }).on('error', reject);
  });
}

const fakeGitHub = (answer, status = 200) => {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url, method: init.method }); return new Response(JSON.stringify(answer), { status }); };
  return { fetchImpl, calls };
};
const APP = { id: 42, client_id: 'Iv23abc', slug: 'mimir-o', pem: '-----BEGIN RSA PRIVATE KEY-----\nxyz\n-----END RSA PRIVATE KEY-----\n', permissions: { administration: 'read' } };

test('the manifest asks for read-only Administration and nothing else', () => {
  const m = buildManifest({ owner: 'wi24rd-com', repoUrl: 'https://github.com/wi24rd-com/mimir', port: 5000 });
  assert.deepEqual(m.default_permissions, { administration: 'read' });
  assert.deepEqual(m.default_events, []);
  assert.equal(m.public, false);
  assert.equal(m.hook_attributes.active, false);
  assert.equal(m.redirect_url, 'http://127.0.0.1:5000/callback');
});

test('the start page posts the manifest to GitHub with a state value', async () => {
  const flow = startFlow({ owner: 'o', repoUrl: 'https://github.com/o/mimir', fetchImpl: fakeGitHub(APP).fetchImpl });
  flow.done.catch(() => {});
  const start = await flow.ready;
  const page = await get(start);
  flow.close();
  assert.equal(page.status, 200);
  assert.match(page.body, /action="https:\/\/github\.com\/settings\/apps\/new\?state=[0-9a-f]{48}"/);
  assert.match(page.body, /name="manifest" value="\{&#34;name&#34;:&#34;mimir-o-mimir&#34;/);
  assert.match(page.headers['content-security-policy'], /form-action https:\/\/github\.com/);
});

test('a callback with the right state exchanges the code and returns the app', async () => {
  const gh = fakeGitHub(APP);
  const flow = startFlow({ owner: 'o', repoUrl: 'https://github.com/o/mimir', fetchImpl: gh.fetchImpl });
  const start = await flow.ready;
  const state = /state=([0-9a-f]{48})/.exec((await get(start)).body)[1];
  const cb = await get(start.replace('/start', `/callback?code=abc123&state=${state}`));
  const app = await flow.done;
  flow.close();
  assert.equal(cb.status, 200);
  assert.ok(!cb.body.includes('PRIVATE KEY'), 'the key must not be shown in the browser');
  assert.deepEqual(gh.calls, [{ url: 'https://api.github.com/app-manifests/abc123/conversions', method: 'POST' }]);
  assert.equal(app.clientId, 'Iv23abc');
  assert.equal(app.slug, 'mimir-o');
  assert.match(app.pem, /BEGIN RSA PRIVATE KEY/);
});

test('a callback with a wrong state, a bad code or a second use is refused', async () => {
  const gh = fakeGitHub(APP);
  const flow = startFlow({ owner: 'o', repoUrl: 'https://github.com/o/mimir', fetchImpl: gh.fetchImpl });
  const start = await flow.ready;
  const state = /state=([0-9a-f]{48})/.exec((await get(start)).body)[1];
  const cb = (q) => get(start.replace('/start', `/callback?${q}`));
  assert.equal((await cb(`code=abc&state=${'0'.repeat(48)}`)).status, 400);
  assert.equal((await cb('code=abc')).status, 400);
  assert.equal((await cb(`code=../../user&state=${state}`)).status, 400);
  assert.equal(gh.calls.length, 0, 'GitHub must not be contacted for refused callbacks');
  assert.equal((await cb(`code=abc&state=${state}`)).status, 200);
  await flow.done;
  assert.equal((await cb(`code=abc&state=${state}`)).status, 400);
  flow.close();
  assert.equal(gh.calls.length, 1);
});

test('requests with a foreign Host header are refused', async () => {
  const flow = startFlow({ owner: 'o', repoUrl: 'https://github.com/o/mimir', fetchImpl: fakeGitHub(APP).fetchImpl });
  flow.done.catch(() => {});
  const start = await flow.ready;
  const res = await get(start, { host: 'evil.example' });
  flow.close();
  assert.equal(res.status, 400);
});

test('a refusal from GitHub is reported and no app is returned', async () => {
  const flow = startFlow({ owner: 'o', repoUrl: 'https://github.com/o/mimir', fetchImpl: fakeGitHub({ message: 'Not Found' }, 404).fetchImpl });
  const start = await flow.ready;
  const state = /state=([0-9a-f]{48})/.exec((await get(start)).body)[1];
  const rejected = assert.rejects(flow.done, /HTTP 404/);
  const cb = await get(start.replace('/start', `/callback?code=abc&state=${state}`));
  await rejected;
  flow.close();
  assert.equal(cb.status, 502);
});

test('each copy gets an app name of its own, within GitHub\'s 34 characters', () => {
  assert.equal(buildManifest({ owner: 'wi24rd-com', repoUrl: 'https://github.com/wi24rd-com/mimir-wi24rd', port: 1 }).name, 'mimir-wi24rd-com-mimir-wi24rd');
  assert.notEqual(appName('o', 'mimir'), appName('o', 'mimir-two'));
  const long = appName('a-very-long-organisation-name', 'my-mimir-copy-two');
  assert.ok(long.length <= 34);
  assert.match(long, /^[a-z0-9-]+$/);
  assert.notEqual(long, appName('a-very-long-organisation-name', 'my-mimir-copy-three'));
  assert.equal(appName('O', 'My.Repo_1'), 'mimir-o-my-repo-1');
});

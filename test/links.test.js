'use strict';
const test = require('node:test');
const assert = require('node:assert');
require('../shared/links.js');
const L = globalThis.QLLinks;

test('assess refuses links that act on a single visit', () => {
  for (const url of [
    'https://example.com/logout',
    'https://example.com/account/sign-out?next=/',
    'https://news.example.com/unsubscribe?u=1',
    'https://example.com/account/delete',
    'https://example.com/settings?action=delete',
    'https://example.com/auth/magic-link/a8F3k29dLq0Zx7YbP4mN1',
    'https://example.com/form'
  ]) assert.strictEqual(L.assess(url, url.endsWith('/form') ? { method: 'post' } : {}).ok, false, url);
  assert.strictEqual(L.assess('https://example.com/a', { text: 'Sign out' }).ok, false);
});

test('assess allows ordinary pages', () => {
  for (const url of [
    'https://example.com/',
    'https://blog.example.com/how-to-delete-your-facebook-account',
    'https://example.com/search?q=delete'
  ]) assert.strictEqual(L.assess(url).ok, true, url);
});

test('unwrap sees through redirectors', () => {
  assert.strictEqual(L.unwrap('https://www.google.com/url?q=https%3A%2F%2Fsite.com%2Fa&sa=D'), 'https://site.com/a');
  assert.strictEqual(L.unwrap('https://duckduckgo.com/l/?uddg=https%3A%2F%2Fsite.com%2Fb'), 'https://site.com/b');
  const b64 = Buffer.from('https://site.com/c').toString('base64url');
  assert.strictEqual(L.unwrap('https://www.bing.com/ck/a?u=a1' + b64), 'https://site.com/c');
  assert.strictEqual(L.unwrap('https://www.google.com/url?q=javascript%3Aalert(1)'), 'https://www.google.com/url?q=javascript%3Aalert(1)');
  assert.strictEqual(L.unwrap('https://site.com/plain'), 'https://site.com/plain');
});

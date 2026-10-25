import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { photoIdentificationsHTML } from '../src/photo-identifications.js';
const root = new URL('../../', import.meta.url);
const source = JSON.parse(await readFile(new URL('component-bank/owner-photo-identifications.json', root)));

test('owner evidence has nine genuine source photos, ten records and no fake passing tests', async () => {
  assert.equal(source.photos.length, 9);
  assert.equal(source.items.length, 10);
  assert.equal(new Set(source.items.map(x => x.id)).size, 10);
  for (const photo of source.photos) {
    const bytes = await readFile(new URL(photo.path, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), photo.sha256);
    assert.equal(bytes.readUInt16BE(0), 0xffd8);
  }
  const paths = new Set(source.photos.map(p => p.path));
  for (const item of source.items) {
    assert.equal(item.verification, 'Not electrically tested');
    assert.equal(item.test.result, 'Not tested');
    assert.ok(item.photos.every(p => paths.has(p)));
  }
  assert.equal(source.items.find(p => p.partNumber === '2N4403').quantity, 'At least 1');
  assert.equal(source.items.find(p => p.id === 'PHOTO-010').quantity, '1 holder');
  assert.equal(source.items.find(p => p.id === 'PHOTO-010').photos.length, 2);
});

test('gallery filters markings, shows uncertainty, and rejects injected photo URLs', () => {
  const html = photoIdentificationsHTML(source, 'L7805CV');
  assert.match(html, /IMG_9285.jpeg/);
  assert.doesNotMatch(html, /IMG_9283.jpeg/);
  assert.match(photoIdentificationsHTML(source, '', 'Power'), /3 × 1.5 V AAA/);
  assert.doesNotMatch(photoIdentificationsHTML(source, '', 'Power'), /2N4401/);
  const item = {...source.items[0], name:'<script>bad</script>', photos:['javascript:alert(1)']};
  const escaped = photoIdentificationsHTML({items:[item],date:source.date,disclaimer:''});
  assert.match(escaped, /&lt;script&gt;/);
  assert.doesNotMatch(escaped, /javascript:|<script>/);
  assert.match(photoIdentificationsHTML(source, 'no-such-part'), /No photo identifications/);
});

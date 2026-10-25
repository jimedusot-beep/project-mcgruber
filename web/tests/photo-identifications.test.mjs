import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { photoIdentificationsHTML } from '../src/photo-identifications.js';
const root = new URL('../../', import.meta.url);
const source = JSON.parse(await readFile(new URL('component-bank/owner-photo-identifications.json', root)));

test('owner evidence has 35 source photos, 16 records and no fake passing tests', async () => {
  assert.equal(source.photos.length, 35);
  assert.equal(source.items.length, 16);
  assert.equal(new Set(source.items.map(x => x.id)).size, 16);
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
  assert.equal(source.photos.find(p => p.filename === 'IMG_9299.jpeg').sourceUploads.length, 2);
  assert.equal(source.items.find(p => p.id === 'PHOTO-008').partNumber, 'PIC16F57-E/SP');
  assert.ok(source.photos.every(p => p.title && p.annotations.length > 0));
  assert.doesNotMatch(html, /IMG_9283.jpeg/);
  assert.match(photoIdentificationsHTML(source, '', 'Power'), /3 × 1.5 V AAA/);
  assert.doesNotMatch(photoIdentificationsHTML(source, '', 'Power'), /2N4401/);
  const item = {...source.items[0], name:'<script>bad</script>', photos:['javascript:alert(1)']};
  const escaped = photoIdentificationsHTML({items:[item],date:source.date,disclaimer:''});
  assert.match(escaped, /&lt;script&gt;/);
  assert.doesNotMatch(escaped, /javascript:|<script>/);
  assert.match(photoIdentificationsHTML(source, 'no-such-part'), /No photo identifications/);
});

test('Unverified filter retains the electrically untested photo inventory', () => {
  const html = photoIdentificationsHTML(source, '', 'Unverified');
  assert.equal([...html.matchAll(/class="panel component photo-identification"/g)].length, 16);
  assert.equal([...html.matchAll(/class="panel source-photo"/g)].length, 35);
  assert.doesNotMatch(html, /No photo identifications match/);
});

test('searching an inventory record ID includes its annotated source photo', () => {
  const html = photoIdentificationsHTML(source, 'PHOTO-003');
  assert.equal([...html.matchAll(/class="panel component photo-identification"/g)].length, 1);
  assert.equal([...html.matchAll(/class="panel source-photo"/g)].length, 1);
  assert.match(html, /IMG_9285_annotated\.svg/);
  assert.doesNotMatch(html, /IMG_9283_annotated\.svg/);
  const excluded = photoIdentificationsHTML(source, 'PHOTO-003', 'Wiring');
  assert.doesNotMatch(excluded, /IMG_9285_annotated\.svg/);
});


test('every annotation embeds the exact source photograph and keeps valid marker references', async () => {
  const outputs = new Set();
  for (const photo of source.photos) {
    assert.ok(photo.annotatedPath.endsWith('_annotated.svg'));
    assert.ok(!outputs.has(photo.annotatedPath));
    outputs.add(photo.annotatedPath);
    const svg = await readFile(new URL(photo.annotatedPath, root), 'utf8');
    assert.equal(createHash('sha256').update(svg).digest('hex'), photo.annotatedSha256);
    const embedded = svg.match(/href="data:image\/jpeg;base64,([A-Za-z0-9+/=]+)"/);
    assert.ok(embedded, photo.filename);
    assert.equal(createHash('sha256').update(Buffer.from(embedded[1], 'base64')).digest('hex'), photo.sha256);
    assert.ok(svg.includes(photo.filename));
    for (const marker of photo.markers) {
      assert.ok(marker.x >= 0 && marker.x <= 1 && marker.y >= 0 && marker.y <= 1);
      assert.ok(marker.labelIndex > 0 && marker.labelIndex <= photo.annotations.length);
    }
  }
  assert.equal(outputs.size, 35);
});

import {test,expect} from '@playwright/test';

test('owner can find regulator photo and open source evidence', async ({page}) => {
  await page.goto('/#/components');
  await page.locator('#component-view').selectOption('photos');
  await expect(page.locator('.photo-identification')).toHaveCount(10);
  await page.locator('#component-search').fill('L7805CV');
  const card = page.locator('.photo-identification');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('Not electrically tested');
  const link = card.locator('a').first();
  const response = await page.request.get(await link.getAttribute('href'));
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('image/jpeg');
  const image = card.locator('img');
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
  await page.locator('#component-search').fill('');
  await page.locator('#component-filter').selectOption('Power');
  await expect(page.locator('.photo-identification')).toHaveCount(2);
});

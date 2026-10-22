import { test, expect } from '@playwright/test';
import { accounts } from './fixtures';

test('admin signs in, accesses management and signs out', async ({ page }) => {
  const fixture = accounts();
  await page.goto('/login?mode=admin', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email / nomor HP admin').fill(fixture.admin.email);
  await page.locator('input[name="password"]').fill(fixture.password);
  await page.getByRole('button', { name: 'Masuk sebagai admin', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  const response = await page.request.get('/api/v1/admin/customer-accounts');
  expect(response.status()).toBe(200);
  await page.getByRole('button', { name: /keluar/i }).click();
  await expect(page).toHaveURL(/\/login/);
  expect((await page.request.get('/api/v1/auth/me')).status()).toBe(401);
});

test('customer session cannot access admin endpoints or admin page', async ({ page, context, baseURL }) => {
  const fixture = accounts();
  await context.addCookies([{ name: 'solarsync_session', value: fixture.customer.token,
    url: new URL('/api/v1', baseURL).href, httpOnly: true, sameSite: 'Strict' }]);
  expect((await page.request.get('/api/v1/admin/customer-accounts')).status()).toBe(403);
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Akses terbatas' })).toBeVisible();
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: /ajukan survei/i }).first()).toBeVisible();
});

test('calculator keeps the result after reloading', async ({ page }) => {
  await page.goto('/calculator', { waitUntil: 'domcontentloaded' });
  for (let index = 0; index < 3; index++) await page.getByRole('button', { name: 'Langkah Selanjutnya' }).click();
  await page.getByRole('button', { name: /Lihat Rekomendasi Sistem/ }).click();
  await expect(page).toHaveURL(/\/calculator\/result/);
  const summary = await page.getByText(/^Sistem berkapasitas/).innerText();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText(summary, { exact: true }).first()).toBeVisible();
});

test('customer submission stores a ticket and checks attachment ownership', async ({ page, context, baseURL }) => {
  const fixture = accounts();
  await context.addCookies([{ name: 'solarsync_session', value: fixture.customer.token,
    url: new URL('/api/v1', baseURL).href, httpOnly: true, sameSite: 'Strict' }]);
  // Exercise the actual multipart API with a synthetic image, not an external document.
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4a8AAAAASUVORK5CYII=', 'base64');
  const created = await page.request.post('/api/v1/requests/with-documents', {
    headers: { Origin: new URL(baseURL!).origin },
    multipart: {
      data: JSON.stringify({ fullName: 'QA Browser customer', phoneNumber: '081234567890', email: fixture.customer.email,
        address: 'Alamat sintetis untuk tes otomatis', city: 'Jakarta', propertyType: 'household', plnPowerVa: 2200,
        monthlyBillIdr: 500000, roofAreaSqM: 40, consent: true }),
      roof_photo: { name: 'atap-uji.png', mimeType: 'image/png', buffer: png },
    },
  });
  expect(created.status(), await created.text()).toBe(200);
  const body = await created.json();
  await page.goto('/dashboard/installation', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(body.ticketNumber || body.id, { exact: false }).first()).toBeVisible();
  const requests = await (await page.request.get('/api/v1/requests')).json();
  const ticket = requests.find((item: { id: string }) => item.id === body.id);
  expect(ticket.documents).toHaveLength(1);
  const attachment = ticket.documents[0].downloadUrl;
  expect((await page.request.get(attachment)).status()).toBe(200);
  await context.clearCookies();
  expect((await page.request.get(attachment)).status()).toBe(401);
});

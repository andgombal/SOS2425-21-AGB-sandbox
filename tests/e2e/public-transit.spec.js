// @ts-check
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => { await page.goto('localhost:16078');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/API_GRUPO_21/);
});

test('get public-transit-stats link', async ({ page }) => {
  await page.goto('localhost:16078');

  // Click the emigration link.
  await page.getByRole('link', { name: 'API Viajes Autobús Urbano' }).click();

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Public Transit Manager/);
});

test('create and delete transit trip', async ({ page }) => {
  const testProvince = "__TEST_PROVINCE__";
  const testYear = "2099";
  const testPrice = "1.99";
  const testTrips = "99999";
  const testLength = "123.45";

  await page.goto('localhost:16078');

  // Llenar el formulario de creación
  await page.getByRole('link', { name: 'API Viajes Autobús Urbano' }).click();

  await page.locator('#Province').nth(0).fill(testProvince);     // Provincia
  await page.locator('#Year').nth(1).fill(testYear);         // Año
  await page.locator('#Price').nth(2).fill(testPrice);        // Precio
  await page.locator('#Trips').nth(3).fill(testTrips);        // Viajes
  await page.locator('#Length').nth(4).fill(testLength);       // Longitud

  // Crear el viaje
  await page.getByRole('button', { name: "Create" }).click();

  // Verifica que la fila ha sido creada
  const newRow = page.locator('tr', { hasText: testProvince });
  await expect(newRow).toContainText(testYear);
  await expect(newRow).toContainText(testPrice);
  await expect(newRow).toContainText(testTrips);
  await expect(newRow).toContainText(testLength);

  // Eliminar la fila
  const deleteButton = newRow.getByRole('button', { name: "Delete" });
  await deleteButton.click();

  // Verifica que ya no exista
  await expect(newRow).toHaveCount(0);
});

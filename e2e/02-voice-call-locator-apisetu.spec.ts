import { test, expect } from '@playwright/test';
import { attachE2eApiFixtures } from './support/apiFixtures';

test.describe('Saathi Live Voice Call, API Setu Readiness Suite & 26-District Service Locator', () => {
  test.beforeEach(async ({ page }) => {
    await attachE2eApiFixtures(page);
  });

  test('runs Saathi Live Voice Call conversation, scrubs PII, picks scheme, and opens API Setu checklist', async ({
    page,
  }) => {
    await page.goto('/voice-call');

    await expect(
      page.getByRole('heading', { name: /Talk Directly with Saathi to Pick Your Scheme/i })
    ).toBeVisible();

    // Verify PII scrubbing inside voice call turn
    const turnInput = page.getByPlaceholder(/Or type what you want to tell Saathi/i);
    await turnInput.fill('My phone is 9876543210 and I am a farmer with 2 acres in Guntur');
    await page.getByRole('button', { name: /Send reply/i }).click();

    await expect(page.getByText(/Privacy note:/i)).toBeVisible();
    await expect(page.locator('main')).not.toContainText('9876543210');

    // Answer White Rice Card quick reply to get scheme recommendations
    const whiteCardChip = page.getByRole('button', { name: /Yes, White Rice Card/i });
    if (await whiteCardChip.isVisible()) {
      await whiteCardChip.click();
    }

    await expect(page.getByText(/Saathi’s Likely-Eligible Suggestions/i)).toBeVisible();

    // Pick #1 and proceed directly into application guide
    await page.getByRole('button', { name: /Pick & Proceed/i }).first().click();
    await expect(page).toHaveURL(/\/schemes\/.*\/apply/);

    // Switch to Documents tab and verify API Setu 3-Module Readiness Suite
    await page.getByRole('tab', { name: /Documents Checklist/i }).click();
    await expect(page).toHaveURL(/\/schemes\/.*\/documents/);
    await expect(page.getByText(/API Setu & DigiLocker Pre-Submission Readiness Suite/i)).toBeVisible();

    // Module 1: Check expired INCER certificate
    await page.locator('#apisetu-doctype-select').selectOption('INCER');
    await page.locator('#apisetu-issue-year').selectOption('2020');
    await expect(page.getByText(/Expired \(2024-/i)).toBeVisible();

    // Module 2: PIN-to-IPPB NPCI DBT Seeding Desk Finder
    await page.getByRole('button', { name: /Find Desk/i }).click();
    await expect(page.getByText(/Guntur Head Post Office & IPPB Seeding Counter/i)).toBeVisible();
  });

  test('renders 26-district Sachivalayam, MeeSeva & E-Seva Locator with Leaflet map & helplines', async ({
    page,
  }) => {
    await page.goto('/centres');

    await expect(
      page.getByRole('heading', { name: /Local Grama\/Ward Sachivalayam, MeeSeva & E-Seva Locator/i })
    ).toBeVisible();

    // Verify all 4 official AP toll-free helplines
    await expect(page.getByText('1902').first()).toBeVisible();
    await expect(page.getByText('1100').first()).toBeVisible();
    await expect(page.getByText('155251').first()).toBeVisible();
    await expect(page.getByText('104').first()).toBeVisible();

    // Verify Leaflet map rendered
    await expect(
      page.getByLabel('OpenStreetMap of Andhra Pradesh Citizen Service Centres')
    ).toBeVisible();

    // Switch district to Visakhapatnam and confirm filtered centres + URL sync
    await page.locator('#locator-district-select').selectOption('Visakhapatnam');
    await expect(page).toHaveURL(/district=Visakhapatnam/);
    await expect(
      page.getByText(/Visakhapatnam Nodal Ward \/ Grama Sachivalayam Complex/i)
    ).toBeVisible();
  });
});

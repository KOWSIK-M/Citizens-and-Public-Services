import { test, expect } from '@playwright/test';
import { attachE2eApiFixtures } from './support/apiFixtures';

test.describe('Lifecycle Follow-Ups, Claim Doctor, Local Community Chat & 10-Vote Escalation', () => {
  test.beforeEach(async ({ page }) => {
    await attachE2eApiFixtures(page);
  });

  test('tracks a scheme, marks availed & troubleshoots rejection via Claim Doctor on /my-schemes', async ({
    page,
  }) => {
    // Track Annadata Sukhibhava from /schemes detail page
    await page.goto('/schemes/ap-sch-003');
    await page.getByRole('button', { name: /Track Application/i }).click();

    await page.goto('/my-schemes');
    await expect(page.getByText(/Annadata Sukhibhava/i).first()).toBeVisible();

    // Open Claim Doctor modal and inspect 6 AP rejection reasons & printable 1902 Grievance Slip
    await page.getByRole('button', { name: /Got Rejected \/ Payment Failed/i }).click();
    await expect(page.getByText(/Claim Doctor • Rejection & DBT Troubleshooter/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Bank Account Not Seeded on NPCI DBT Mapper/i })
    ).toBeVisible();
    await expect(page.getByText(/GSWS-DBT-NPCI-RETRIGGER/i).first()).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    // Mark as Availed Properly and confirm Sector Coverage Visualization reflects 1 Availed sector
    await page.getByRole('button', { name: /Yes, Availed Properly/i }).click();
    await expect(page.getByText(/Download Annual Renewal Reminder/i)).toBeVisible();
    await expect(page.getByText(/Sectors & Schemes You Actually Availed \(1\)/i)).toBeVisible();
  });

  test('upvotes 9/10 proposal to unlock 10-vote Escalation Dossier, blocks PII in chat, and posts clean tip on /community', async ({
    page,
  }) => {
    await page.goto('/community');

    await expect(
      page.getByRole('heading', { name: /Local Citizen Community & New Scheme Escalation Board/i })
    ).toBeVisible();

    // Click +1 Vote on 9/10 proposal to cross the 10-vote escalation threshold
    await page.getByRole('button', { name: /\+1 Vote to Escalate \(9\)/i }).click();
    await expect(page.getByText(/Threshold Reached \(10 Votes\)!/i)).toBeVisible();

    // Open Official Government (1902 / Collectorate) & NGO Escalation Dossier
    await page.getByRole('button', { name: /Open Escalation Dossier/i }).first().click();
    await expect(
      page.getByText(/Official Government \(1902 \/ Collectorate\) & NGO Escalation Dossier/i)
    ).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    // Switch to Local Citizen Chat tab and verify live PII Shield blocks Aadhaar digits
    await page.getByRole('tab', { name: /Local Citizen Chat/i }).click();
    const chatBox = page.locator('#chat-message-box');
    await chatBox.fill('My Aadhaar is 4567 8901 2345 please check my pension');
    await expect(page.getByText(/Blocked: Sensitive Aadhaar/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Post to Community/i })).toBeDisabled();

    // Replace with safe non-PII message and post
    await chatBox.fill('Ward 4 Sachivalayam helped complete Iris e-KYC in 5 minutes!');
    await expect(page.getByRole('button', { name: /Post to Community/i })).toBeEnabled();
    await page.getByRole('button', { name: /Post to Community/i }).click();
    await expect(
      page.locator('p').filter({ hasText: /Ward 4 Sachivalayam helped complete Iris e-KYC in 5 minutes!/i })
    ).toBeVisible();
  });
});

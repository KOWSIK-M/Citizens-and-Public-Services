import { test, expect } from '@playwright/test';
import { attachE2eApiFixtures } from './support/apiFixtures';

test.describe('Home, Multilingual Parity, Responsive Zero-Overflow & 3-Step Eligibility Flow', () => {
  test.beforeEach(async ({ page }) => {
    await attachE2eApiFixtures(page);
  });

  test('renders Home cleanly in EN / TE / HI with zero horizontal overflow across desktop and 360px mobile', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /Claim What’s Yours in Plain Language/i })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Talk to Saathi/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Find Local Sachivalayam/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Recent Govt Schemes & Gmail Alerts/i })).toBeVisible();

    // Verify 0px horizontal overflow on current viewport (covers both 1280px and 360x780!)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);

    // Switch to Telugu and verify `<html lang="te">` + Telugu hero title
    await page.getByRole('button', { name: /Switch to Telugu/i }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'te');
    await expect(page.getByRole('heading', { name: /మీ హక్కులను సరళమైన భాషలో పొందండి/i })).toBeVisible();

    // Switch to Hindi and verify `<html lang="hi">`
    await page.getByRole('button', { name: /Switch to Hindi/i }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');

    // Back to English
    await page.getByRole('button', { name: /Switch language to English/i }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('intercepts PII on /describe, completes 3-step assessment, and enforces "likely eligible" wording', async ({
    page,
  }) => {
    await page.goto('/describe');

    // 1. Verify Indic & ASCII PII interception on intake textarea
    const textarea = page.locator('textarea').first();
    await textarea.fill('My Aadhaar is 4567 8901 2345 and phone 9876543210, I am a farmer in Guntur');
    await expect(page.getByRole('alert')).toBeVisible();

    // 2. Load Synthetic Scenario C (Smallholder Farmer) and run complete 3-step flow
    await page.getByRole('button', { name: /Smallholder Farmer Family/i }).click();
    await page.getByRole('button', { name: /Understand My Situation/i }).click();

    await expect(page).toHaveURL(/\/confirm-profile/);
    await page.getByRole('button', { name: /Confirm Details & Check Eligibility/i }).click();

    await expect(page).toHaveURL(/\/results/);
    await expect(page.getByRole('heading', { name: /Your Welfare Eligibility Results/i })).toBeVisible();
    await expect(page.getByText(/Annadata Sukhibhava/i).first()).toBeVisible();

    // Guardrail check: body text must say "likely eligible", never promise "100% approved" or "guaranteed"
    const bodyText = (await page.locator('main').innerText()).toLowerCase();
    expect(bodyText).toContain('likely eligible');
    expect(bodyText).not.toContain('100% approved');
    expect(bodyText).not.toContain('guaranteed approval');
  });
});

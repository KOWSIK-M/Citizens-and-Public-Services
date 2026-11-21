import { test, expect } from '@playwright/test';
import { attachE2eApiFixtures } from './support/apiFixtures';

test.describe('JWT Authentication, RBAC, Personalised Profile, Sector Visualization & Gmail SMTP Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await attachE2eApiFixtures(page);
  });

  test('registers citizen via JWT, saves personalised profile, checks Sector Coverage Visualization & blocks /admin RBAC', async ({
    page,
  }) => {
    await page.goto('/login');

    // Switch to Create Account tab
    await page.getByRole('tab', { name: /Create Account/i }).click();
    await page.locator('#reg-name').fill('Lakshmi Devi');
    await page.locator('#reg-email').fill('lakshmi.ap@gmail.com');
    await page.locator('#reg-pass').fill('SecurePass2026!');
    await page.getByRole('button', { name: /Create Personalised Account/i }).click();

    // Redirects to Personalised Dashboard (/profile)
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByText(/Lakshmi Devi’s Welfare Dashboard/i)).toBeVisible();

    // Verify Interactive Sector Coverage Visualization renders with filters
    await expect(
      page.getByText(/Welfare Sector Coverage: Availed vs\. Still Likely Eligible/i)
    ).toBeVisible();
    await expect(page.locator('#viz-level')).toBeVisible();
    await expect(page.locator('#viz-sector')).toBeVisible();
    await expect(page.locator('#viz-status')).toBeVisible();

    // Test filtering by State level and Still Likely Eligible status
    await page.locator('#viz-level').selectOption('state');
    await page.locator('#viz-status').selectOption('still_eligible');
    await expect(page.getByText(/Other Sectors You Are Still Likely Eligible For/i)).toBeVisible();

    // Save personalised profile tab
    await page.getByRole('tab', { name: /Personalised Profile/i }).click();
    await page.locator('#prof-district').selectOption('Kurnool');
    await page.getByRole('button', { name: /Save Personalised Profile/i }).click();
    await expect(
      page.getByText(/Personalised profile & Gmail alert settings saved to Neon/i)
    ).toBeVisible();

    // Verify Citizen RBAC blocks /admin
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: /Admin Authorization Required/i })).toBeVisible();
  });

  test('allows Admin JWT account into /admin Governance Studio & verifies Notifications + Gmail SMTP Mailer', async ({
    page,
  }) => {
    // 1. Admin RBAC Sign-In
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@ap.gov.in');
    await page.locator('#login-pass').fill('AdminPassword2026!');
    await page.getByRole('button', { name: /Sign In Securely/i }).click();
    await expect(page).toHaveURL(/\/profile/);

    await page.goto('/admin');
    await expect(
      page.getByRole('heading', { name: /Admin Scheme & Rule Governance Studio/i })
    ).toBeVisible();
    await expect(page.getByText(/Admin JWT: GSWS Policy Verifier/i)).toBeVisible();

    // 2. Visit /notifications: Recent Government Schemes, Start/End Dates & Direct Gmail SMTP Mailer
    await page.goto('/notifications');
    await expect(
      page.getByRole('heading', { name: /Recent Government Schemes, Start Dates & Deadline Alerts/i })
    ).toBeVisible();
    await expect(page.getByText(/Talliki Vandanam/i).first()).toBeVisible();
    await expect(page.getByText(/Deepam 2\.0/i).first()).toBeVisible();

    // Send Gmail Deadline Digest via SMTP
    const gmailBox = page.getByLabel(/Your Gmail address for scheme alerts/i);
    await gmailBox.fill('citizen.alerts@gmail.com');
    await page.getByRole('button', { name: /Mail Deadlines to My Gmail/i }).click();
    await expect(
      page.getByText(/Deadline & scheme alerts emailed successfully to citizen\.alerts@gmail\.com/i)
    ).toBeVisible();
    await expect(page.locator('iframe[title="Gmail SMTP Digest Preview"]')).toBeVisible();
  });
});

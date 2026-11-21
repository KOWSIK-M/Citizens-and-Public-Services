import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { CitizenFlowLayout } from '@/layouts/CitizenFlowLayout';
import { HomePage } from '@/pages/public/HomePage';
import { AboutPage } from '@/pages/public/AboutPage';
import { DisclaimerPage } from '@/pages/public/DisclaimerPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { DescribePage } from '@/pages/citizen/DescribePage';
import { ConfirmProfilePage } from '@/pages/citizen/ConfirmProfilePage';
import { ResultsPage } from '@/pages/citizen/ResultsPage';
import { SchemeDetailPage } from '@/pages/citizen/SchemeDetailPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { ROUTES } from '@/config/routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Public and Detail Routes wrapped in RootLayout */}
        <Route element={<RootLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={ROUTES.DISCLAIMER} element={<DisclaimerPage />} />
          <Route path="/schemes/:schemeId" element={<SchemeDetailPage />} />
          <Route path="/schemes/:schemeId/documents" element={<SchemeDetailPage />} />
          <Route path="/schemes/:schemeId/apply" element={<SchemeDetailPage />} />
          <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />

          {/* Citizen Assessment Stepper Flow */}
          <Route element={<CitizenFlowLayout />}>
            <Route path={ROUTES.DESCRIBE} element={<DescribePage />} />
            <Route path={ROUTES.CONFIRM_PROFILE} element={<ConfirmProfilePage />} />
            <Route path={ROUTES.RESULTS} element={<ResultsPage />} />
          </Route>

          {/* Catch-all 404 */}
          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

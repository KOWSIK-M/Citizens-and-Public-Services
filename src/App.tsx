import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RootLayout } from '@/layouts/RootLayout';
import { CitizenFlowLayout } from '@/layouts/CitizenFlowLayout';
import { SchemeCatalogLayout } from '@/layouts/SchemeCatalogLayout';
import { HomePage } from '@/pages/public/HomePage';
import { DescribePage } from '@/pages/citizen/DescribePage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { hydrateAuthSession } from '@/store/useAuthStore';
import { syncApplicationsFromNeon } from '@/store/useTrackerStore';
import { refreshNotificationsFromNeon } from '@/store/useNotificationsStore';
import { ROUTES } from '@/config/routes';

const AboutPage = lazy(() =>
  import('@/pages/public/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const DisclaimerPage = lazy(() =>
  import('@/pages/public/DisclaimerPage').then((m) => ({ default: m.DisclaimerPage }))
);
const BrowseSchemesPage = lazy(() =>
  import('@/pages/public/BrowseSchemesPage').then((m) => ({ default: m.BrowseSchemesPage }))
);
const AuthPage = lazy(() =>
  import('@/pages/public/AuthPage').then((m) => ({ default: m.AuthPage }))
);
const NotificationsPage = lazy(() =>
  import('@/pages/public/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const ConfirmProfilePage = lazy(() =>
  import('@/pages/citizen/ConfirmProfilePage').then((m) => ({ default: m.ConfirmProfilePage }))
);
const ResultsPage = lazy(() =>
  import('@/pages/citizen/ResultsPage').then((m) => ({ default: m.ResultsPage }))
);
const SchemeDetailPage = lazy(() =>
  import('@/pages/citizen/SchemeDetailPage').then((m) => ({ default: m.SchemeDetailPage }))
);
const MySchemesPage = lazy(() =>
  import('@/pages/citizen/MySchemesPage').then((m) => ({ default: m.MySchemesPage }))
);
const ProfileDashboardPage = lazy(() =>
  import('@/pages/citizen/ProfileDashboardPage').then((m) => ({ default: m.ProfileDashboardPage }))
);
const VoiceCallPage = lazy(() =>
  import('@/pages/citizen/VoiceCallPage').then((m) => ({ default: m.VoiceCallPage }))
);
const ServiceCentresPage = lazy(() =>
  import('@/pages/public/ServiceCentresPage').then((m) => ({ default: m.ServiceCentresPage }))
);
const CommunityHubPage = lazy(() =>
  import('@/pages/public/CommunityHubPage').then((m) => ({ default: m.CommunityHubPage }))
);
const NotAuthorizedPage = lazy(() =>
  import('@/pages/admin/NotAuthorizedPage').then((m) => ({ default: m.NotAuthorizedPage }))
);
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

const RouteLoadingFallback: React.FC = () => (
  <div
    role="status"
    aria-live="polite"
    className="max-w-4xl mx-auto py-16 px-4 text-center text-sm font-medium text-muted"
  >
    Loading…
  </div>
);

export const App: React.FC = () => {
  useEffect(() => {
    void hydrateAuthSession().then(() => {
      void Promise.all([syncApplicationsFromNeon(), refreshNotificationsFromNeon()]);
    });
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.ABOUT} element={<AboutPage />} />
              <Route path={ROUTES.DISCLAIMER} element={<DisclaimerPage />} />
              <Route path={ROUTES.AUTH} element={<AuthPage />} />
              <Route path={ROUTES.SERVICE_CENTRES} element={<ServiceCentresPage />} />
              <Route path={ROUTES.COMMUNITY} element={<CommunityHubPage />} />
              <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />

              <Route element={<SchemeCatalogLayout />}>
                <Route path={ROUTES.SCHEMES_BROWSE} element={<BrowseSchemesPage />} />
                <Route path={ROUTES.SCHEME_DETAIL()} element={<SchemeDetailPage />} />
                <Route path={ROUTES.DOCUMENT_CHECKLIST()} element={<SchemeDetailPage />} />
                <Route path={ROUTES.APPLICATION_GUIDE()} element={<SchemeDetailPage />} />
                <Route path={ROUTES.MY_SCHEMES} element={<MySchemesPage />} />
                <Route path={ROUTES.PROFILE} element={<ProfileDashboardPage />} />
                <Route path={ROUTES.VOICE_CALL} element={<VoiceCallPage />} />
                <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
                <Route path={ROUTES.ADMIN_AUDIT_LOG} element={<AdminDashboardPage />} />
              </Route>

              <Route path={ROUTES.NOT_AUTHORIZED} element={<NotAuthorizedPage />} />

              {/* Citizen 3-Step Assessment Flow */}
              <Route element={<CitizenFlowLayout />}>
                <Route path={ROUTES.DESCRIBE} element={<DescribePage />} />
                <Route element={<SchemeCatalogLayout />}>
                  <Route path={ROUTES.CONFIRM_PROFILE} element={<ConfirmProfilePage />} />
                  <Route path={ROUTES.RESULTS} element={<ResultsPage />} />
                </Route>
              </Route>

              <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './context/I18nContext';
import { Header } from './shared/layouts/Header';
import { Footer } from './shared/layouts/Footer';
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ConsultationPage = lazy(() => import('./features/consultation/pages/ConsultationPage').then((m) => ({ default: m.ConsultationPage })));
const ConsultationRequestPage = lazy(() => import('./features/consultation/pages/ConsultationRequestPage').then((m) => ({ default: m.ConsultationRequestPage })));

const ConstructionPage = lazy(() => import('./features/construction/pages/ConstructionPage').then((m) => ({ default: m.ConstructionPage })));
const RealEstatePage = lazy(() => import('./features/real-estate/pages/RealEstatePage').then((m) => ({ default: m.RealEstatePage })));
const RealEstateDetailPage = lazy(() => import('./features/real-estate/pages/RealEstateDetailPage').then((m) => ({ default: m.RealEstateDetailPage })));
const RentalDetailPage = lazy(() => import('./features/rental/pages/RentalDetailPage').then((m) => ({ default: m.RentalDetailPage })));
const HotelDetailPage = lazy(() => import('./features/hotels/pages/HotelDetailPage').then((m) => ({ default: m.HotelDetailPage })));

const RentalPage = lazy(() => import('./features/rental/pages/RentalPage').then((m) => ({ default: m.RentalPage })));
const HotelsPage = lazy(() => import('./features/hotels/pages/HotelsPage').then((m) => ({ default: m.HotelsPage })));
const PortfolioPage = lazy(() => import('./features/portfolio/pages/PortfolioPage').then((m) => ({ default: m.PortfolioPage })));
const SampleDetailPage = lazy(() => import('./features/portfolio/pages/SampleDetailPage').then((m) => ({ default: m.SampleDetailPage })));

const BlogPage = lazy(() => import('./features/blog/pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const DashboardLayout = lazy(() => import('./features/dashboard/layouts/DashboardLayout').then((m) => ({ default: m.DashboardLayout })));
const ClientDashboard = lazy(() => import('./features/dashboard/pages/ClientDashboard').then((m) => ({ default: m.ClientDashboard })));
const PartnerDashboard = lazy(() => import('./features/dashboard/pages/PartnerDashboard').then((m) => ({ default: m.PartnerDashboard })));
const AdminDashboard = lazy(() => import('./features/dashboard/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const StaffDashboard = lazy(() => import('./features/dashboard/pages/StaffDashboard').then((m) => ({ default: m.StaffDashboard })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
import { useAuth } from './context/AuthContext';
import { ROUTES } from './shared/constants';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary-bg">
        <div className="loading-spinner" role="status" aria-label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<LoginPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<LoginPage />} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<LoginPage />} />
      <Route path={ROUTES.CONSULTATION} element={<ConsultationPage />} />
      <Route path={ROUTES.CONSULTATION_REQUEST} element={<ConsultationRequestPage />} />
      <Route path={ROUTES.CONSULTATION_MY_REQUESTS} element={<ConsultationPage />} />
      <Route path={ROUTES.CONSULTATION_DETAIL} element={<ConsultationPage />} />
      <Route path={ROUTES.CONSTRUCTION} element={<ConstructionPage />} />
      <Route path={ROUTES.CONSTRUCTION_MATERIALS} element={<ConstructionPage />} />
      <Route path={ROUTES.CONSTRUCTION_MATERIAL_DETAIL} element={<ConstructionPage />} />
      <Route path={ROUTES.CONSTRUCTION_LABOUR} element={<ConstructionPage />} />
      <Route path={ROUTES.CONSTRUCTION_LABOUR_DETAIL} element={<ConstructionPage />} />
      <Route path={ROUTES.CONSTRUCTION_MY_ORDERS} element={<ConstructionPage />} />
      <Route path={ROUTES.CONSTRUCTION_POST_JOB} element={<ConstructionPage />} />
      <Route path={ROUTES.REAL_ESTATE} element={<RealEstatePage />} />
      <Route path="/real-estate/properties" element={<RealEstatePage />} />
      <Route path="/real-estate/development" element={<RealEstatePage />} />
      <Route path={ROUTES.REAL_ESTATE_LISTINGS} element={<RealEstatePage />} />
      <Route path={ROUTES.REAL_ESTATE_DETAIL} element={<RealEstateDetailPage />} />
      <Route path="/real-estate/properties/:id" element={<RealEstateDetailPage />} />
      <Route path={ROUTES.REAL_ESTATE_MY_LISTINGS} element={<RealEstatePage />} />
      <Route path={ROUTES.REAL_ESTATE_ADD} element={<RealEstatePage />} />
      <Route path={ROUTES.RENTAL} element={<RentalPage />} />
      <Route path="/rental-housing" element={<RentalPage />} />
      <Route path="/rental-housing/:id" element={<RentalDetailPage />} />
      <Route path={ROUTES.RENTAL_LISTINGS} element={<RentalPage />} />
      <Route path={ROUTES.RENTAL_DETAIL} element={<RentalPage />} />
      <Route path={ROUTES.RENTAL_MY_LISTINGS} element={<RentalPage />} />
      <Route path={ROUTES.RENTAL_ADD} element={<RentalPage />} />
      <Route path={ROUTES.HOTELS} element={<HotelsPage />} />
      <Route path="/hotels-airbnb" element={<HotelsPage />} />
      <Route path="/hotels-airbnb/:id" element={<HotelDetailPage />} />
      <Route path={ROUTES.HOTELS_LISTINGS} element={<HotelsPage />} />
      <Route path={ROUTES.HOTELS_DETAIL} element={<HotelsPage />} />
      <Route path={ROUTES.HOTELS_MY_LISTINGS} element={<HotelsPage />} />
      <Route path={ROUTES.HOTELS_ADD} element={<HotelsPage />} />
      <Route path={ROUTES.HOTELS_BOOKING} element={<HotelsPage />} />
      <Route path={ROUTES.PORTFOLIO} element={<PortfolioPage />} />
      <Route path="/projects" element={<PortfolioPage />} />
      <Route path={ROUTES.PORTFOLIO_DETAIL} element={<PortfolioPage />} />
      <Route path="/projects/:id" element={<PortfolioPage />} />
      <Route path="/portfolio/sample" element={<SampleDetailPage />} />
      <Route path={ROUTES.BLOG} element={<BlogPage />} />
      <Route path={ROUTES.BLOG_DETAIL} element={<BlogPage />} />
      <Route path={ROUTES.ABOUT} element={<AboutPage />} />
      <Route path={ROUTES.CONTACT} element={<ContactPage />} />
      <Route path={ROUTES.CAREERS} element={<ContactPage />} />
      <Route path="/faq" element={<ContactPage />} />
      <Route path="/privacy" element={<ContactPage />} />
      <Route path="/terms" element={<ContactPage />} />
      <Route path="/cookies" element={<ContactPage />} />
      <Route path="/partner" element={<Navigate to={ROUTES.DASHBOARD_PARTNER} replace />} />
      <Route path="/admin" element={<Navigate to={ROUTES.DASHBOARD_ADMIN} replace />} />

      {/* Protected Routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={['client', 'partner', 'company', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.DASHBOARD_CLIENT} replace />} />
        <Route path="client" element={<ClientDashboard />} />
        <Route path="partner" element={<PartnerDashboard />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="staff" element={<StaffDashboard />} />
        <Route path="client/*" element={<ClientDashboard />} />
        <Route path="partner/*" element={<PartnerDashboard />} />
        <Route path="admin/*" element={<AdminDashboard />} />
        <Route path="consultations" element={<ClientDashboard />} />
        <Route path="consultations/:id" element={<ClientDashboard />} />
        <Route path="orders" element={<ClientDashboard />} />
        <Route path="orders/:id" element={<ClientDashboard />} />
        <Route path="bookings" element={<ClientDashboard />} />
        <Route path="bookings/:id" element={<ClientDashboard />} />
        <Route path="documents" element={<ClientDashboard />} />
      </Route>

      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS}
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path={ROUTES.MESSAGES} element={<ProtectedRoute allowedRoles={['client', 'partner', 'company', 'admin']}><ClientDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.NOTIFICATIONS} element={<ProtectedRoute allowedRoles={['client', 'partner', 'company', 'admin']}><ClientDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.PAYMENTS} element={<ProtectedRoute allowedRoles={['client', 'partner', 'company', 'admin']}><ClientDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/messages" element={<ClientDashboard />} />
      <Route path="/dashboard/notifications" element={<ClientDashboard />} />
      <Route path="/dashboard/settings" element={<SettingsPage />} />
      <Route path="/dashboard/profile" element={<ProfilePage />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App = () => {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center gradient-primary-bg">
                    <div className="loading-spinner" role="status" aria-label="Loading..." />
                  </div>
                }
              >
                <AppRoutes />
              </Suspense>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
};

export default App;
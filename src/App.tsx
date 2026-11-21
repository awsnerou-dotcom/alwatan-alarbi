import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { I18nProvider } from './context/I18nContext';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { QuoteEstimatorDrawer } from './components/QuoteEstimatorDrawer';
import { WhatsAppFloating } from './components/WhatsAppFloating';
import { FactoryChatbot } from './components/FactoryChatbot';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { PortfolioCategoryPage } from './pages/PortfolioCategoryPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { VisitsPage } from './pages/VisitsPage';
import { KataraPage } from './pages/KataraPage';
import { GalleryPage } from './pages/GalleryPage';
import { VideosPage } from './pages/VideosPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './components/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminQuotes } from './pages/admin/AdminQuotes';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminVisits } from './pages/admin/AdminVisits';
import { AdminGallery } from './pages/admin/AdminGallery';
import { AdminVideos } from './pages/admin/AdminVideos';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminRequestRequirements } from './pages/admin/AdminRequestRequirements';

function PublicShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <WhatsAppFloating />
      <FactoryChatbot />
      <QuoteEstimatorDrawer />
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="font-mono-tabular text-6xl font-bold text-[#B5945B]">404</div>
      <h1 className="font-display mt-3 text-2xl font-bold text-slate-900">الصفحة غير موجودة</h1>
      <p className="mt-2 text-sm text-slate-600">
        عذراً، لم يتم العثور على الصفحة المطلوبة في منصة مصنع الوطن العربي.
      </p>
      <a
        href="/"
        className="mt-6 rounded-lg bg-[#09090B] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#8A6D3B]"
      >
        العودة إلى الرئيسية
      </a>
    </div>
  );
}

// Always start a newly opened page from the top (unless the link targets a #section).
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  React.useLayoutEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <SiteProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route element={<PublicShell />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/portfolio/:categorySlug" element={<PortfolioCategoryPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                <Route path="/visits" element={<VisitsPage />} />
                <Route path="/katara" element={<KataraPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<LoginPage />} />
              </Route>

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminOverview />} />
                <Route path="quotes" element={<AdminQuotes />} />
                <Route path="request-requirements" element={<AdminRequestRequirements />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="visits" element={<AdminVisits />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="videos" element={<AdminVideos />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </SiteProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

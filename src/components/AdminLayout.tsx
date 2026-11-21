import React, { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  Calendar,
  ExternalLink,
  FileSpreadsheet,
  FolderKanban,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  SlidersHorizontal,
  Tags,
  Users,
  Video,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { AdminDataProvider } from '../context/AdminDataContext';

export function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const { pick, t } = useI18n();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-600">
        {pick('Verifying admin session...', 'جاري التحقق من الجلسة...')}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navLinks = [
    { to: '/admin/dashboard', label: t('admin.overview'), icon: LayoutDashboard },
    { to: '/admin/quotes', label: t('admin.quotes'), icon: FileSpreadsheet },
    { to: '/admin/request-requirements', label: pick('Request Requirements', 'متطلبات طلب التصميم'), icon: SlidersHorizontal },
    { to: '/admin/projects', label: t('admin.projects'), icon: FolderKanban },
    { to: '/admin/visits', label: t('admin.visits'), icon: Calendar },
    { to: '/admin/gallery', label: t('admin.gallery'), icon: Image },
    { to: '/admin/videos', label: t('admin.videos'), icon: Video },
    { to: '/admin/categories', label: t('admin.categories'), icon: Tags },
    { to: '/admin/users', label: t('admin.users'), icon: Users },
    { to: '/admin/settings', label: t('admin.settings'), icon: Settings },
  ];

  const activeNav = navLinks.find((n) => location.pathname.startsWith(n.to)) || navLinks[0];

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#09090B] text-zinc-300">
      <div>
        <div className="border-b border-zinc-800 px-6 py-5">
          <div className="font-display text-base font-bold text-white">
            {pick('Al Watan Admin', 'إدارة مصنع الوطن')}
          </div>
          <div dir="ltr" className="mt-0.5 truncate text-xs text-zinc-400">
            {user.email}
          </div>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[3px] px-3.5 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#09090B]'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                  }`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2 border-t border-zinc-800 p-4">
        <Link
          to="/"
          className="flex items-center justify-between rounded-[3px] border border-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
        >
          <span>{t('admin.viewSite')}</span>
          <ExternalLink size={14} />
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-between rounded-[3px] px-3.5 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-red-400 cursor-pointer"
        >
          <span>{t('admin.logout')}</span>
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <AdminDataProvider>
      <div className="flex min-h-screen bg-zinc-50 text-[#09090B]">
        <aside className="hidden w-[260px] shrink-0 lg:block">{SidebarContent}</aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="w-64">{SidebarContent}</div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex-1 bg-black/60"
              aria-label="Close sidebar"
            />
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen((p) => !p)}
                className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-zinc-200 text-[#09090B] lg:hidden"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
              <div className="flex items-center gap-2 truncate text-xs text-zinc-500">
                <span>{pick('Operations', 'العمليات')}</span>
                <span aria-hidden="true">/</span>
                <span className="truncate font-semibold text-[#09090B]">{activeNav.label}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <span className="hidden text-xs font-medium text-zinc-600 sm:inline whitespace-nowrap">
                {pick(user.name, user.nameAr)}
              </span>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminDataProvider>
  );
}

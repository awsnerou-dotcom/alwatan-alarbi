import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, SlidersHorizontal, X } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';

export function Navbar() {
  const { pick, t } = useI18n();
  const { user } = useAuth();
  const { settings, openQuoteDrawer } = useSite();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoSrc = settings?.hero.logoUrl || '/logo.jpeg';

  const desktopNav = [
    { to: '/', label: pick('Home', 'الرئيسية'), end: true },
    { to: '/about', label: t('nav.about') },
    { to: '/portfolio', label: t('nav.portfolio') },
    { to: '/projects', label: t('nav.projects') },
    { to: '/visits', label: pick('Visits', 'الزيارات') },
    { to: '/katara', label: t('nav.katara') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/videos', label: t('nav.videos') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#B5945B]/30 bg-[#09090B]/95 text-white shadow-[0_12px_32px_-16px_rgba(0,0,0,0.8)] backdrop-blur-md">
      <div
        aria-hidden="true"
        className="h-[2px] w-full bg-gradient-to-r from-[#8A6D3B] via-[#EAD4A5] to-[#8A6D3B]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-r from-[#B5945B]/[0.06] via-transparent to-[#B5945B]/[0.06]"
      />

      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="group flex shrink-0 items-center rounded-[4px] border border-[#B5945B]/45 bg-white px-2.5 py-1 shadow-[0_2px_14px_rgba(181,148,91,0.18)] transition-all duration-200 hover:border-[#EAD4A5] hover:shadow-[0_4px_20px_rgba(234,212,165,0.28)]"
        >
          <img
            src={logoSrc}
            alt={pick('Al Watan Al Arabi Factory', 'مصنع الوطن العربي')}
            referrerPolicy="no-referrer"
            className="h-10 w-auto object-contain md:h-11"
          />
        </Link>

        <nav
          aria-label={pick('Main sections', 'أقسام الموقع')}
          className="hidden xl:flex items-center gap-1 rounded-[4px] border border-zinc-800/90 bg-[#121216]/90 px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          {desktopNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group relative rounded-[3px] px-3 py-2 text-[13px] font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-b from-[#B5945B]/20 to-[#B5945B]/5 text-[#EAD4A5] shadow-[inset_0_0_0_1px_rgba(181,148,91,0.38)]'
                    : 'text-zinc-300 hover:bg-white/[0.04] hover:text-[#EAD4A5]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  <span
                    className={`absolute inset-x-2.5 bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B] transition-transform duration-200 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => openQuoteDrawer()}
            className="hidden md:inline-flex h-10 items-center gap-1.5 rounded-[3px] bg-gradient-to-r from-[#B5945B] via-[#DFC38C] to-[#B5945B] px-3.5 text-xs font-bold text-[#09090B] shadow-[0_6px_20px_-8px_rgba(234,212,165,0.65)] transition-all duration-200 hover:brightness-110 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>{t('home.hero.ctaPrimary')}</span>
          </button>

          {user ? (
            <Link
              to="/admin/dashboard"
              className="hidden sm:inline-flex h-10 items-center rounded-[3px] border border-[#B5945B]/55 bg-[#B5945B]/15 px-3.5 text-xs font-semibold text-[#EAD4A5] transition-colors hover:bg-[#B5945B]/25 whitespace-nowrap shrink-0"
            >
              {t('nav.admin')}
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex h-10 items-center rounded-[3px] border border-zinc-700/90 bg-[#141418] px-3.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-[#B5945B] hover:text-[#EAD4A5] whitespace-nowrap shrink-0"
            >
              {t('nav.login')}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle Menu"
            className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-zinc-700/90 bg-[#141418] text-[#EAD4A5] transition-colors hover:border-[#B5945B] xl:hidden cursor-pointer"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#B5945B]/25 bg-[#0B0B0E]/98 px-4 py-4 shadow-2xl xl:hidden">
          <nav className="grid grid-cols-2 gap-2">
            {desktopNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-[4px] border px-3 py-2.5 text-sm font-semibold transition-all whitespace-nowrap truncate ${
                    isActive
                      ? 'border-[#B5945B]/60 bg-[#B5945B]/15 text-[#EAD4A5] shadow-[0_0_18px_-8px_rgba(181,148,91,0.5)]'
                      : 'border-zinc-800/90 bg-[#141418]/90 text-zinc-300 hover:border-[#B5945B]/40 hover:text-[#EAD4A5]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-1 gap-2 border-t border-zinc-800 pt-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openQuoteDrawer();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[3px] bg-gradient-to-r from-[#B5945B] via-[#DFC38C] to-[#B5945B] px-4 py-2.5 text-sm font-bold text-[#09090B] cursor-pointer"
            >
              <SlidersHorizontal size={15} />
              <span>{t('home.hero.ctaPrimary')}</span>
            </button>
            <Link
              to={user ? '/admin/dashboard' : '/login'}
              onClick={() => setMobileOpen(false)}
              className="block w-full rounded-[3px] border border-[#B5945B]/45 bg-[#141418] px-4 py-2.5 text-center text-sm font-semibold text-[#EAD4A5] transition-colors hover:border-[#EAD4A5]"
            >
              {user ? t('nav.admin') : t('nav.login')}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

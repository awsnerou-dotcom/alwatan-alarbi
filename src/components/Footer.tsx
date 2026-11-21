import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';

export function Footer() {
  const { pick, t } = useI18n();
  const { settings, openQuoteDrawer } = useSite();

  const quickLinks = [
    { to: '/', label: pick('Home', 'الرئيسية') },
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
    <footer className="border-t border-zinc-800 bg-[#09090B] text-zinc-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <img
              src="/logoFooter.png"
              alt={pick('Al Watan Al Arabi Factory', 'مصنع الوطن العربي')}
              referrerPolicy="no-referrer"
              className="mb-5 h-20 w-auto object-contain md:h-24"
            />
            <p className="text-sm leading-relaxed text-zinc-400">
              {settings
                ? pick(settings.seo.siteDescEn, settings.seo.siteDescAr)
                : t('home.capabilities.subtitle')}
            </p>
            <button
              type="button"
              onClick={() => openQuoteDrawer()}
              className="mt-6 rounded-[3px] border border-zinc-700 bg-white px-5 py-2.5 text-xs font-semibold text-[#09090B] transition-colors hover:bg-zinc-200 whitespace-nowrap cursor-pointer"
            >
              {pick('Configure Custom Build', 'صمّم مشروعك واطلب تسعيرة')}
            </button>
          </div>

          <div>
            <h4 className="font-display mb-4 text-sm font-bold text-white">{pick('Navigation', 'التصفح السريع')}</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-zinc-400 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-4 text-sm font-bold text-white">{pick('Divisions', 'الأقسام الرئيسية')}</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              {(settings?.iconsRow || []).slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link to={s.link} className="transition-colors hover:text-white">
                    {pick(s.titleEn, s.titleAr)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-4 text-sm font-bold text-white">{pick('Contact', 'تواصل معنا')}</h4>
            <div className="space-y-3.5 text-sm text-zinc-400">
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="shrink-0 text-[#B5945B]" />
                <span dir="ltr" className="font-mono-tabular text-zinc-200">
                  {settings?.contact.phone || '+974 5559 8944'}
                </span>
              </div>
              {settings?.contact.email ? (
                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="shrink-0 text-[#B5945B]" />
                  <span dir="ltr" className="text-zinc-200">{settings.contact.email}</span>
                </div>
              ) : null}
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-1 shrink-0 text-[#B5945B]" />
                <span>
                  {settings
                    ? pick(settings.contact.addressEn, settings.contact.addressAr)
                    : pick('Street 34, Industrial Area, Doha', 'شارع 34، المنطقة الصناعية، الدوحة')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-6 text-xs text-zinc-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} {pick('Al Watan Al Arabi Factory', 'مصنع الوطن العربي')}.{' '}
            {pick('All rights reserved.', 'جميع الحقوق محفوظة.')}
          </p>
          <p dir="ltr" className="text-center font-medium tracking-wide text-zinc-400">
            Powered by <span className="font-semibold text-[#B5945B]">nerou technology services trading</span>
          </p>
          <Link to="/login" className="text-zinc-400 transition-colors hover:text-white">
            {t('nav.login')}
          </Link>
        </div>
      </div>
    </footer>
  );
}

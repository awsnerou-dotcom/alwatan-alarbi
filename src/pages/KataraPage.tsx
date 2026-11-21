import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { MediaFrame, PhotoMatteFrame } from '../components/MediaFrame';

export function KataraPage() {
  const { pick, t } = useI18n();
  const { visits, openQuoteDrawer } = useSite();

  const kataraRecords = visits.filter((v) => v.isKataraFeatured);

  return (
    <main className="min-h-screen bg-white pb-24">
      <section className="border-b border-zinc-800 bg-[#09090B] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="text-xs font-semibold text-[#B5945B]">{t('katara.eyebrow')}</p>
              <h1 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {t('katara.title')}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-zinc-300">{t('katara.subtitle')}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    openQuoteDrawer({
                      categorySlug: 'suhail-exhibition-participation',
                      projectTitle: pick('Katara Exhibition Edition', 'نسخة معرض سهيل بكتارا'),
                    })
                  }
                  className="h-11 rounded-[3px] bg-white px-5 text-xs font-semibold text-[#09090B] transition-colors hover:bg-zinc-200 whitespace-nowrap cursor-pointer"
                >
                  {pick('Commission Exhibition Edition', 'اطلب نسخة المعارض')}
                </button>
                <Link
                  to="/gallery"
                  className="inline-flex h-11 items-center rounded-[3px] border border-zinc-700 px-5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-900 whitespace-nowrap"
                >
                  {pick('View Photo Archive', 'أرشيف الصور')}
                </Link>
              </div>
            </div>
            <div className="group lg:col-span-6">
              <PhotoMatteFrame variant="dark" className="h-full" zoomOnHover={false}>
                <MediaFrame
                  imageUrl="/bannerpc1.png"
                  visualKey="katara-pavilion"
                  alt="Katara Cultural Village Exhibition Pavilion"
                  aspectClass="h-full min-h-[240px]"
                  label={pick(
                    'Katara Cultural Village · Suhail International Hunting & Falcons Exhibition',
                    'الحي الثقافي كتارا · معرض سهيل الدولي للصيد والصقور',
                  )}
                />
              </PhotoMatteFrame>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {kataraRecords.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-600">
              {pick('No Katara exhibition entries published yet.', 'لا توجد سجلات منشورة لمعرض كتارا حالياً.')}
            </div>
          ) : (
            kataraRecords.map((rec) => (
              <div
                key={rec.id}
                className="group relative grid grid-cols-1 gap-8 overflow-hidden rounded-[4px] border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B5945B]/70 hover:shadow-[0_14px_34px_-14px_rgba(181,148,91,0.3)] lg:grid-cols-12 lg:items-center"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 start-0 h-[2px] w-0 bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B] transition-all duration-500 group-hover:w-full"
                />
                <div className="lg:col-span-5">
                  <PhotoMatteFrame>
                    <MediaFrame
                      imageUrl={rec.images[0] || '/bannerpc2.png'}
                      visualKey={rec.visualKey}
                      alt={pick(rec.titleEn, rec.titleAr)}
                      aspectClass="aspect-[16/10]"
                    />
                  </PhotoMatteFrame>
                </div>
                <div className="lg:col-span-7">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span className="font-semibold text-[#8A6D3B]">
                      {rec.type === 'exhibition'
                        ? pick('Exhibition', 'معرض')
                        : pick('VIP Visit', 'زيارة رسمية')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{rec.eventDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{pick(rec.locationEn, rec.locationAr)}</span>
                  </div>
                  <h2 className="font-display mt-2 text-2xl font-bold text-[#09090B] transition-colors group-hover:text-[#8A6D3B]">
                    {pick(rec.titleEn, rec.titleAr)}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                    {pick(rec.descriptionEn, rec.descriptionAr)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

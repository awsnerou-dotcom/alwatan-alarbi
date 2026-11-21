import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { MediaFrame, PhotoMatteFrame } from '../components/MediaFrame';
import type { VisitType } from '../shared/types';

export function VisitsPage() {
  const { pick, t } = useI18n();
  const { visits, loading } = useSite();
  const [filter, setFilter] = useState<'all' | VisitType>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return visits;
    return visits.filter((v) => v.type === filter);
  }, [visits, filter]);

  const filterOptions: { key: 'all' | VisitType; label: string }[] = [
    { key: 'all', label: pick('All Events', 'الكل') },
    { key: 'exhibition', label: pick('Exhibitions', 'المعارض') },
    { key: 'visit', label: pick('VIP Visits', 'زيارات كبار الشخصيات') },
    { key: 'achievement', label: pick('Achievements', 'الإنجازات') },
  ];

  return (
    <main className="min-h-screen bg-white pb-24">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B] sm:text-4xl">
                {t('visits.title')}
              </h1>
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-zinc-600">{t('visits.subtitle')}</p>
            </div>
            <Link
              to="/katara"
              className="inline-flex h-10 items-center rounded-[3px] border border-zinc-300 bg-white px-4 text-xs font-semibold text-[#09090B] hover:border-[#09090B] whitespace-nowrap shrink-0"
            >
              {pick('Katara Exhibition Portfolio', 'ملف معرض كتارا')}
            </Link>
          </div>

          <div className="-mb-px mt-8 flex gap-6 overflow-x-auto">
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                className={`border-b-2 py-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === opt.key
                    ? 'border-[#09090B] text-[#09090B]'
                    : 'border-transparent text-zinc-500 hover:text-[#09090B]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse bg-zinc-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-zinc-200 bg-zinc-50 p-12 text-center text-sm text-zinc-600">
            {pick('No records match this filter.', 'لا توجد سجلات مطابقة لهذا التصنيف.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="group relative overflow-hidden rounded-[5px] border border-zinc-200/90 bg-white p-4 shadow-[0_2px_12px_-4px_rgba(9,9,11,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#B5945B]/75 hover:shadow-[0_18px_36px_-14px_rgba(181,148,91,0.28)]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 start-0 h-[2px] w-0 bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B] transition-all duration-500 group-hover:w-full"
                />
                <PhotoMatteFrame>
                  <MediaFrame
                    imageUrl={item.images[0] || '/bannerpc1.png'}
                    visualKey={item.visualKey}
                    alt={pick(item.titleEn, item.titleAr)}
                    aspectClass="aspect-[16/9]"
                  />
                </PhotoMatteFrame>
                <div className="px-1 pt-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span className="font-semibold text-[#8A6D3B]">
                      {item.type === 'exhibition'
                        ? pick('Exhibition', 'معرض')
                        : item.type === 'visit'
                          ? pick('VIP Visit', 'زيارة رسمية')
                          : pick('Achievement', 'إنجاز')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{item.eventDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{pick(item.locationEn, item.locationAr)}</span>
                  </div>
                  <h2 className="font-display mt-2 text-xl font-bold text-[#09090B] transition-colors group-hover:text-[#8A6D3B]">
                    {pick(item.titleEn, item.titleAr)}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    {pick(item.descriptionEn, item.descriptionAr)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

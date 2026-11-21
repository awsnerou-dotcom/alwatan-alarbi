import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { MediaFrame, PhotoMatteFrame } from '../components/MediaFrame';
import type { GalleryCategory, GalleryItem } from '../shared/types';

const GALLERY_CATS: Array<{ key: 'All' | GalleryCategory; labelEn: string; labelAr: string }> = [
  { key: 'All', labelEn: 'All', labelAr: 'الكل' },
  { key: 'Projects', labelEn: 'Projects', labelAr: 'المشاريع' },
  { key: 'Factory', labelEn: 'Factory', labelAr: 'المصنع' },
  { key: 'Exhibitions', labelEn: 'Exhibitions', labelAr: 'المعارض' },
  { key: 'VIP Visits', labelEn: 'VIP Visits', labelAr: 'زيارات كبار الشخصيات' },
  { key: 'Products', labelEn: 'Products', labelAr: 'المنتجات' },
];

const GALLERY_CAT_AR: Record<string, string> = {
  Projects: 'المشاريع',
  Factory: 'المصنع',
  Exhibitions: 'المعارض',
  'VIP Visits': 'زيارات كبار الشخصيات',
  Products: 'المنتجات',
};

export function GalleryPage() {
  const { pick, t } = useI18n();
  const { gallery, loading } = useSite();
  const [selectedCat, setSelectedCat] = useState<'All' | GalleryCategory>('All');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const items = useMemo(() => {
    if (selectedCat === 'All') return gallery;
    return gallery.filter((g) => g.category === selectedCat);
  }, [gallery, selectedCat]);

  return (
    <main className="min-h-screen bg-white pb-24">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B] sm:text-4xl">
            {t('gallery.title')}
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm text-zinc-600">{t('gallery.subtitle')}</p>

          <div className="-mb-px mt-8 flex gap-6 overflow-x-auto">
            {GALLERY_CATS.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCat(cat.key)}
                className={`border-b-2 py-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCat === cat.key
                    ? 'border-[#09090B] text-[#09090B]'
                    : 'border-transparent text-zinc-500 hover:text-[#09090B]'
                }`}
              >
                {pick(cat.labelEn, cat.labelAr)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse bg-zinc-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="border border-zinc-200 bg-zinc-50 p-12 text-center text-sm text-zinc-600">
            {pick('No photos in this album yet.', 'لا توجد صور في هذا التصنيف حالياً.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightboxItem(item)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[5px] border border-zinc-200/90 bg-white p-3.5 text-start shadow-[0_2px_12px_-4px_rgba(9,9,11,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#B5945B]/75 hover:shadow-[0_18px_36px_-14px_rgba(181,148,91,0.28)] cursor-pointer"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 start-0 h-[2px] w-0 bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B] transition-all duration-500 group-hover:w-full"
                />
                <PhotoMatteFrame>
                  <MediaFrame
                    imageUrl={item.mediaUrl || '/bannerpc1.png'}
                    visualKey={item.visualKey}
                    alt={item.altText}
                    aspectClass="aspect-[4/3]"
                  />
                </PhotoMatteFrame>
                <div className="px-1 pt-3.5">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-semibold text-[#8A6D3B]">
                      {GALLERY_CAT_AR[item.category] || item.category}
                    </span>
                    <span>{item.album}</span>
                  </div>
                  <h2 className="font-display mt-1.5 text-base font-bold text-[#09090B] transition-colors group-hover:text-[#8A6D3B]">
                    {pick(item.titleEn, item.titleAr)}
                  </h2>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {lightboxItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-[3px] border border-zinc-800 bg-[#09090B]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5 text-white">
              <div>
                <p className="text-xs text-zinc-400">
                  {GALLERY_CAT_AR[lightboxItem.category] || lightboxItem.category} · {lightboxItem.album}
                </p>
                <h3 className="font-display text-base font-bold">
                  {pick(lightboxItem.titleEn, lightboxItem.titleAr)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                aria-label="إغلاق المعرض"
                className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-zinc-700 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <MediaFrame
              imageUrl={lightboxItem.mediaUrl}
              visualKey={lightboxItem.visualKey}
              alt={lightboxItem.altText}
              aspectClass="aspect-[16/10]"
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}

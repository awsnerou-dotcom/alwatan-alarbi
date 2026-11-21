import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { MediaFrame, PhotoMatteFrame } from '../components/MediaFrame';

export function PortfolioPage() {
  const { pick, isRtl } = useI18n();
  const { categories, projects, loading } = useSite();
  const DirectionalArrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <main className="min-h-screen bg-white pb-24">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B] sm:text-4xl">
            {pick('Vehicle Conversions, Caravans & Exhibitions', 'معرض أعمال مصنع الوطن العربي')}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-600">
            {pick(
              'Explore our eight specialized manufacturing divisions across Qatar and the GCC. Select any category to view complete project cards, image galleries, and request a custom quote.',
              'استعرض جميع أقسام التصنيع والتجهيز الثمانية في مصنع الوطن العربي. اختر القسم المطلوب لاستعراض المشاريع المنفذة ومعارض الصور وطلب عرض سعر.',
            )}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 animate-pulse bg-zinc-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => {
              const catProjects = projects.filter((p) => p.categorySlug === cat.slug);
              const coverImg = cat.imageUrl || catProjects[0]?.images?.[0] || '/bannerpc1.png';
              const visualKey = cat.visualKey || catProjects[0]?.visualKey || 'aluminum-caravan';

              return (
                <Link
                  key={cat.id}
                  to={`/portfolio/${cat.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-[4px] border border-zinc-200 bg-white p-4 pb-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#B5945B]/70 hover:shadow-[0_14px_34px_-14px_rgba(181,148,91,0.35)]"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 start-0 h-[2px] w-0 bg-gradient-to-r from-[#B5945B] via-[#E5CFA0] to-[#B5945B] transition-all duration-500 group-hover:w-full"
                  />

                  <PhotoMatteFrame>
                    <MediaFrame
                      imageUrl={coverImg}
                      visualKey={visualKey}
                      alt={pick(cat.nameEn, cat.nameAr)}
                      aspectClass="aspect-[16/10]"
                    />
                  </PhotoMatteFrame>

                  <div className="mt-5 flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-mono-tabular font-semibold text-[#8A6D3B]">
                      0{index + 1} · {catProjects.length} {pick('Projects', 'مشاريع')}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#09090B] transition-colors group-hover:text-[#8A6D3B]">
                      <span>{pick('Explore', 'عرض القسم')}</span>
                      <DirectionalArrow
                        size={14}
                        className={`transition-transform duration-300 ${
                          isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                        }`}
                      />
                    </span>
                  </div>

                  <h2 className="font-display mt-2 text-xl font-bold text-[#09090B] transition-colors group-hover:text-[#8A6D3B]">
                    {pick(cat.nameEn, cat.nameAr)}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                    {pick(cat.descriptionEn, cat.descriptionAr)}
                  </p>

                  {catProjects.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                      {catProjects.slice(0, 3).map((p, idx) => (
                        <span key={p.id}>
                          {idx > 0 ? '· ' : ''}
                          {pick(p.titleEn, p.titleAr)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

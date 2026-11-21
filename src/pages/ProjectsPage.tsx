import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { MediaFrame, PhotoMatteFrame } from '../components/MediaFrame';

export function ProjectsPage() {
  const { pick, isRtl, t } = useI18n();
  const { projects, categories, loading, openQuoteDrawer } = useSite();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [query, setQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const catOk = selectedCategory === 'all' || p.categorySlug === selectedCategory;
      const q = query.trim().toLowerCase();
      const searchOk =
        !q ||
        p.titleEn.toLowerCase().includes(q) ||
        p.titleAr.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.dimensions.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [projects, selectedCategory, query]);

  function handleSelectCategory(slug: string) {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  }

  const DirectionalArrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <main className="min-h-screen bg-white pb-24">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B] sm:text-4xl">
                {t('projects.title')}
              </h1>
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-zinc-600">{t('projects.subtitle')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-full sm:w-64">
                <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('projects.searchPlaceholder')}
                  className="h-10 w-full rounded-[3px] border border-zinc-200 bg-zinc-50 ps-9 pe-3 text-sm text-[#09090B] focus:border-[#09090B] focus:bg-white focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => openQuoteDrawer()}
                className="h-10 rounded-[3px] bg-[#09090B] px-5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t('home.hero.ctaPrimary')}
              </button>
            </div>
          </div>

          {/* Cohesive Obsidian & Champagne-Gold Category Bar */}
          <div className="mt-8 flex gap-1.5 overflow-x-auto rounded-[5px] border border-zinc-800 bg-[#0B0B0E] p-1.5 shadow-[0_12px_28px_-16px_rgba(9,9,11,0.65)]">
            <button
              type="button"
              onClick={() => handleSelectCategory('all')}
              className={`relative rounded-[3px] px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-b from-[#B5945B]/25 to-[#B5945B]/10 text-[#EAD4A5] shadow-[inset_0_0_0_1px_rgba(181,148,91,0.45)]'
                  : 'text-zinc-300 hover:bg-white/[0.04] hover:text-[#EAD4A5]'
              }`}
            >
              <span>{t('projects.allCategories')}</span>
              {selectedCategory === 'all' ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-2 bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B]"
                />
              ) : null}
            </button>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`relative rounded-[3px] px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-b from-[#B5945B]/25 to-[#B5945B]/10 text-[#EAD4A5] shadow-[inset_0_0_0_1px_rgba(181,148,91,0.45)]'
                      : 'text-zinc-300 hover:bg-white/[0.04] hover:text-[#EAD4A5]'
                  }`}
                >
                  <span>{pick(cat.nameEn, cat.nameAr)}</span>
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-2 bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B]"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse bg-zinc-100" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="border border-zinc-200 bg-zinc-50 p-12 text-center">
            <p className="text-sm text-zinc-600">{t('projects.empty')}</p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                handleSelectCategory('all');
              }}
              className="mt-4 rounded-[3px] border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-[#09090B] hover:border-[#09090B] cursor-pointer"
            >
              {pick('Reset Filters', 'إعادة ضبط الفلتر')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, idx) => {
              const cat = categories.find((c) => c.slug === project.categorySlug);
              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[5px] border border-zinc-200/90 bg-white p-4 shadow-[0_2px_12px_-4px_rgba(9,9,11,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#B5945B]/75 hover:shadow-[0_18px_38px_-14px_rgba(181,148,91,0.28)]"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 start-0 h-[2px] w-0 bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B] transition-all duration-500 group-hover:w-full"
                  />

                  <div>
                    <PhotoMatteFrame>
                      <MediaFrame
                        imageUrl={project.images[0] || '/bannerpc1.png'}
                        visualKey={project.visualKey}
                        alt={pick(project.titleEn, project.titleAr)}
                        aspectClass="aspect-[16/10]"
                      />
                    </PhotoMatteFrame>
                    <div className="px-1 pt-4">
                      <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                        <span className="font-semibold text-[#8A6D3B]">
                          {cat ? pick(cat.nameEn, cat.nameAr) : project.categorySlug}
                        </span>
                        <span className="font-mono-tabular rounded-[2px] bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h2 className="font-display mt-2 text-lg font-bold text-[#09090B] transition-colors group-hover:text-[#8A6D3B]">
                        {pick(project.titleEn, project.titleAr)}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                        {pick(project.descriptionEn, project.descriptionAr)}
                      </p>
                    </div>
                  </div>

                  <div className="mx-1 mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs transition-colors group-hover:border-[#B5945B]/25">
                    <span className="font-mono-tabular text-zinc-500">{project.dimensions}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#09090B] transition-colors group-hover:text-[#8A6D3B]">
                      <span>{pick('View Specifications', 'عرض المواصفات')}</span>
                      <DirectionalArrow
                        size={14}
                        className={`transition-transform duration-300 ${
                          isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                        }`}
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

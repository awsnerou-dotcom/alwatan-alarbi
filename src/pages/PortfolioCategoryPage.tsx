import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Images,
  MessageCircle,
  Play,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { MediaFrame, PhotoMatteFrame } from '../components/MediaFrame';
import type { Project } from '../shared/types';

export function PortfolioCategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { pick, isRtl } = useI18n();
  const { categories, projects, settings, openQuoteDrawer, loading } = useSite();

  const [galleryModal, setGalleryModal] = useState<{ project: Project; index: number } | null>(null);
  const [videoModal, setVideoModal] = useState<Project | null>(null);

  const category = categories.find((c) => c.slug === categorySlug);
  const categoryProjects = projects
    .filter((p) => p.categorySlug === categorySlug)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const whatsappNum = settings?.contact.whatsapp || '97455123456';

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse bg-zinc-100" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-[#09090B]">
          {pick('Category not found', 'القسم غير موجود')}
        </h1>
        <Link
          to="/portfolio"
          className="mt-6 inline-flex items-center gap-2 rounded-[3px] bg-[#09090B] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <span>{pick('Back to Portfolio', 'العودة إلى أعمالنا')}</span>
        </Link>
      </div>
    );
  }

  const catTitle = pick(category.nameEn, category.nameAr);
  const catDesc = pick(category.descriptionEn, category.descriptionAr);

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Category Hero Band */}
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-0 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <Link to="/portfolio" className="inline-flex items-center gap-1 font-semibold text-[#09090B] hover:text-[#8A6D3B]">
              {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
              <span>{pick('Portfolio', 'معرض الأعمال')}</span>
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-zinc-600">{catTitle}</span>
          </div>

          <div className="mt-6 grid grid-cols-1 items-center gap-10 pb-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="font-mono-tabular text-xs font-semibold text-[#8A6D3B]">
                {categoryProjects.length} {pick('Models & Builds', 'مشروع وتجهيز')}
              </p>
              <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-[#09090B] sm:text-4xl">
                {catTitle}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-zinc-600">{catDesc}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    openQuoteDrawer({
                      categorySlug: category.slug,
                      projectTitle: catTitle,
                    })
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-[#09090B] px-5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
                >
                  <SlidersHorizontal size={15} />
                  <span>{pick('Request a Quote', 'طلب عرض سعر')}</span>
                </button>
                <a
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                    pick(
                      `Hello, I would like to inquire about ${category.nameEn}`,
                      `مرحباً مصنع الوطن العربي، أرغب بالاستفسار عن قسم: ${category.nameAr}`,
                    ),
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-[#128C7E] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#0E7468] whitespace-nowrap"
                >
                  <MessageCircle size={15} />
                  <span>{pick('WhatsApp Inquiry', 'تواصل عبر الواتساب')}</span>
                </a>
              </div>
            </div>

            <div className="group lg:col-span-5">
              <div className="rounded-[5px] border border-zinc-200/90 bg-white p-2.5 shadow-[0_2px_12px_-4px_rgba(9,9,11,0.06)]">
                <PhotoMatteFrame zoomOnHover={false}>
                  <MediaFrame
                    imageUrl={category.imageUrl || categoryProjects[0]?.images?.[0] || '/bannerpc1.png'}
                    visualKey={category.visualKey || 'aluminum-caravan'}
                    alt={catTitle}
                    aspectClass="aspect-[16/10]"
                  />
                </PhotoMatteFrame>
              </div>
            </div>
          </div>

          {/* Cohesive Obsidian & Champagne-Gold Category Bar */}
          <nav className="mt-8 flex gap-1.5 overflow-x-auto rounded-[5px] border border-zinc-800 bg-[#0B0B0E] p-1.5 shadow-[0_12px_28px_-16px_rgba(9,9,11,0.65)]">
            {categories.map((c) => {
              const isActive = c.slug === category.slug;
              return (
                <Link
                  key={c.id}
                  to={`/portfolio/${c.slug}`}
                  className={`relative rounded-[3px] px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-b from-[#B5945B]/25 to-[#B5945B]/10 text-[#EAD4A5] shadow-[inset_0_0_0_1px_rgba(181,148,91,0.45)]'
                      : 'text-zinc-300 hover:bg-white/[0.04] hover:text-[#EAD4A5]'
                  }`}
                >
                  <span>{pick(c.nameEn, c.nameAr)}</span>
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-2 bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B]"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      {/* Project Showroom Grid */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {categoryProjects.length === 0 ? (
          <div className="border border-zinc-200 bg-zinc-50 p-12 text-center text-sm text-zinc-600">
            {pick('No projects published in this category yet.', 'لا توجد مشاريع منشورة في هذا القسم حالياً.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {categoryProjects.map((project) => {
              const title = pick(project.titleEn, project.titleAr);
              const desc = pick(project.descriptionEn, project.descriptionAr);
              const galleryImgs = project.images.length > 0 ? project.images : ['/bannerpc1.png'];
              const waHref = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                pick(
                  `Hello Al Watan Factory, I would like a quote for: ${project.titleEn}`,
                  `مرحباً مصنع الوطن العربي، أرغب بطلب عرض سعر لمشروع: ${project.titleAr}`,
                ),
              )}`;

              return (
                <article
                  key={project.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[5px] border border-zinc-200/90 bg-white p-4 shadow-[0_2px_12px_-4px_rgba(9,9,11,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#B5945B]/75 hover:shadow-[0_18px_38px_-14px_rgba(181,148,91,0.28)]"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 start-0 h-[2px] w-0 bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B] transition-all duration-500 group-hover:w-full"
                  />

                  <div>
                    {/* Featured Image */}
                    <button
                      type="button"
                      onClick={() => setGalleryModal({ project, index: 0 })}
                      className="block w-full text-start cursor-pointer"
                    >
                      <PhotoMatteFrame>
                        <MediaFrame
                          imageUrl={galleryImgs[0]}
                          visualKey={project.visualKey}
                          alt={title}
                          aspectClass="aspect-[16/10]"
                        />
                      </PhotoMatteFrame>
                    </button>

                    {/* Title & Short Description */}
                    <div className="px-1 pt-4">
                      <h2 className="font-display text-xl font-bold text-[#09090B] transition-colors group-hover:text-[#8A6D3B]">
                        {title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600">{desc}</p>
                    </div>

                    {/* Clean Gallery & Video Triggers */}
                    <div className="mt-4 flex flex-wrap items-center gap-4 px-1 text-xs font-semibold text-zinc-600">
                      <button
                        type="button"
                        onClick={() => setGalleryModal({ project, index: 0 })}
                        className="inline-flex items-center gap-1.5 text-[#09090B] hover:text-[#8A6D3B] cursor-pointer whitespace-nowrap"
                      >
                        <Images size={14} />
                        <span>
                          {pick('Gallery', 'معرض الصور')} ({galleryImgs.length})
                        </span>
                      </button>

                      {project.videoUrl ? (
                        <>
                          <span aria-hidden="true" className="text-zinc-300">
                            |
                          </span>
                          <button
                            type="button"
                            onClick={() => setVideoModal(project)}
                            className="inline-flex items-center gap-1.5 text-[#8A6D3B] hover:text-[#09090B] cursor-pointer whitespace-nowrap"
                          >
                            <Play size={14} />
                            <span>{pick('Watch Video', 'مشاهدة الفيديو')}</span>
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Clean Action Pair: Request Quote + WhatsApp */}
                  <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-zinc-100 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        openQuoteDrawer({
                          categorySlug: project.categorySlug,
                          projectTitle: project.titleAr || project.titleEn,
                        })
                      }
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[3px] bg-[#09090B] px-3 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
                    >
                      <SlidersHorizontal size={13} />
                      <span>{pick('Request a Quote', 'طلب عرض سعر')}</span>
                    </button>

                    <a
                      href={waHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[3px] bg-[#128C7E] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#0E7468] whitespace-nowrap"
                    >
                      <MessageCircle size={13} />
                      <span>{pick('WhatsApp', 'واتساب')}</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Multi-Image Gallery Lightbox Modal */}
      {galleryModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setGalleryModal(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-[3px] border border-zinc-800 bg-[#09090B]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5 text-white">
              <div>
                <h3 className="font-display text-base font-bold">
                  {pick(galleryModal.project.titleEn, galleryModal.project.titleAr)}
                </h3>
                <p className="font-mono-tabular text-xs text-zinc-400">
                  {galleryModal.index + 1} / {Math.max(1, galleryModal.project.images.length)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGalleryModal(null)}
                aria-label="Close gallery"
                className="rounded-[3px] border border-zinc-700 p-1.5 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative bg-black" dir="ltr">
              <MediaFrame
                imageUrl={galleryModal.project.images[galleryModal.index]}
                visualKey={galleryModal.project.visualKey}
                alt={pick(galleryModal.project.titleEn, galleryModal.project.titleAr)}
                aspectClass="aspect-[16/10]"
              />
              {galleryModal.project.images.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() =>
                      setGalleryModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              index:
                                (prev.index - 1 + prev.project.images.length) %
                                prev.project.images.length,
                            }
                          : null,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-[3px] bg-black/80 p-2 text-white hover:bg-black cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() =>
                      setGalleryModal((prev) =>
                        prev
                          ? { ...prev, index: (prev.index + 1) % prev.project.images.length }
                          : null,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[3px] bg-black/80 p-2 text-white hover:bg-black cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              ) : null}
            </div>

            {galleryModal.project.images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto bg-black p-3">
                {galleryModal.project.images.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGalleryModal({ ...galleryModal, index: idx })}
                    className={`h-14 w-20 shrink-0 overflow-hidden border-2 cursor-pointer ${
                      idx === galleryModal.index ? 'border-[#B5945B]' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Optional Video Modal */}
      {videoModal && videoModal.videoUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setVideoModal(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-[3px] border border-zinc-800 bg-[#09090B]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5 text-white">
              <h3 className="font-display text-base font-bold">
                {pick(videoModal.titleEn, videoModal.titleAr)}
              </h3>
              <button
                type="button"
                onClick={() => setVideoModal(null)}
                aria-label="Close video"
                className="rounded-[3px] border border-zinc-700 p-1.5 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {videoModal.videoUrl.includes('youtube.com') || videoModal.videoUrl.includes('youtu.be') ? (
                <iframe
                  title={videoModal.titleEn}
                  src={videoModal.videoUrl}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={videoModal.videoUrl} controls autoPlay className="h-full w-full" />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

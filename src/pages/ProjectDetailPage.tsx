import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { MediaFrame, PhotoMatteFrame } from '../components/MediaFrame';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { pick, isRtl, t } = useI18n();
  const { projects, categories, settings, openQuoteDrawer, loading } = useSite();

  const project = projects.find((p) => p.slug === slug);
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="h-96 animate-pulse bg-zinc-100" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-[#09090B]">
          {pick('Project not found', 'المشروع غير موجود')}
        </h1>
        <Link
          to="/portfolio"
          className="mt-6 inline-flex items-center gap-2 rounded-[3px] bg-[#09090B] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <BackArrow size={16} />
          <span>{pick('Back to Portfolio', 'العودة إلى أعمالنا')}</span>
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.slug === project.categorySlug);
  const specs = pick(project.specs, project.specsAr.length ? project.specsAr : project.specs);

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <Link
          to={`/portfolio/${project.categorySlug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-[#09090B]"
        >
          <BackArrow size={14} />
          <span>{category ? pick(category.nameEn, category.nameAr) : pick('All Projects', 'جميع المشاريع')}</span>
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="group rounded-[5px] border border-zinc-200/90 bg-white p-3 shadow-[0_2px_12px_-4px_rgba(9,9,11,0.06)]">
              <PhotoMatteFrame zoomOnHover={false}>
                <MediaFrame
                  imageUrl={project.images[0] || '/bannerpc1.png'}
                  visualKey={project.visualKey}
                  alt={pick(project.titleEn, project.titleAr)}
                  aspectClass="aspect-[16/10]"
                />
              </PhotoMatteFrame>
            </div>

            {project.images.length > 1 ? (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {project.images.slice(1).map((img, i) => (
                  <div key={i} className="group">
                    <PhotoMatteFrame>
                      <MediaFrame imageUrl={img} visualKey={project.visualKey} alt="" aspectClass="aspect-[4/3]" />
                    </PhotoMatteFrame>
                  </div>
                ))}
              </div>
            ) : null}

            {project.videoUrl ? (
              <div className="mt-4 overflow-hidden rounded-[3px] border border-zinc-200 bg-[#09090B] p-2">
                {project.videoUrl.includes('youtube.com') || project.videoUrl.includes('youtu.be') ? (
                  <iframe
                    title={project.titleEn}
                    src={project.videoUrl}
                    className="aspect-video w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={project.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full bg-black"
                  />
                )}
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-5">
            <div className="border-t-2 border-[#09090B] pt-5">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-semibold text-[#8A6D3B]">
                  {category ? pick(category.nameEn, category.nameAr) : project.categorySlug}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{project.completionDate}</span>
              </div>
              <h1 className="font-display mt-2 text-2xl font-bold text-[#09090B] sm:text-3xl">
                {pick(project.titleEn, project.titleAr)}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                {pick(project.descriptionEn, project.descriptionAr)}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 border-y border-zinc-200 py-4">
                <div>
                  <div className="text-xs text-zinc-500">{pick('Dimensions', 'الأبعاد')}</div>
                  <div className="font-mono-tabular mt-1 text-base font-bold text-[#09090B]">
                    {project.dimensions}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">{pick('Production Lead Time', 'مدة التصنيع')}</div>
                  <div className="font-mono-tabular mt-1 text-base font-bold text-[#8A6D3B]">
                    {project.leadTimeWeeks} {pick('Weeks', 'أسابيع')}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-xs font-semibold text-zinc-500">
                  {pick('Technical Specifications', 'المواصفات الفنية')}
                </h2>
                <ul className="mt-3 divide-y divide-zinc-200 text-sm text-zinc-700">
                  {specs.map((line, i) => (
                    <li key={i} className="py-2.5">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    openQuoteDrawer({
                      categorySlug: project.categorySlug,
                      projectTitle: pick(project.titleEn, project.titleAr),
                    })
                  }
                  className="h-11 flex-1 rounded-[3px] bg-[#09090B] px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
                >
                  {t('projects.requestSimilar')}
                </button>
                <a
                  href={`https://wa.me/${settings?.contact.whatsapp || '97455123456'}?text=${encodeURIComponent(
                    pick(
                      `Hello Al Watan Al Arabi, I would like to inquire about: ${project.titleEn}`,
                      `مرحباً مصنع الوطن العربي، أود الاستفسار عن مشروع: ${project.titleAr}`,
                    ),
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[3px] bg-[#128C7E] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0E7468] whitespace-nowrap"
                >
                  <MessageCircle size={16} />
                  <span>{pick('WhatsApp', 'واتساب')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

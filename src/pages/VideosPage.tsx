import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { MediaFrame, PhotoMatteFrame } from '../components/MediaFrame';
import type { VideoItem } from '../shared/types';

const VIDEO_CAT_AR: Record<string, string> = {
  Factory: 'جولات المصنع',
  Testing: 'اختبارات ميدانية',
  Projects: 'المشاريع',
  Exhibitions: 'المعارض',
};

export function VideosPage() {
  const { pick, t } = useI18n();
  const { videos, loading } = useSite();
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  return (
    <main className="min-h-screen bg-[#09090B] pb-24 text-white">
      <section className="border-b border-zinc-800 bg-[#09090B]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('videos.title')}
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm text-zinc-400">{t('videos.subtitle')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse bg-zinc-900" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((vid, idx) => (
              <div
                key={vid.id}
                className="group relative flex flex-col overflow-hidden rounded-[5px] border border-zinc-800/90 bg-gradient-to-b from-[#16161B] to-[#111115] p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#B5945B]/60 hover:shadow-[0_12px_36px_-12px_rgba(181,148,91,0.35)]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 start-0 h-[2px] w-0 bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B] transition-all duration-500 group-hover:w-full"
                />
                <div className="relative">
                  <PhotoMatteFrame variant="dark">
                    <MediaFrame
                      imageUrl={idx % 2 === 0 ? '/seed/caravan-4.jpg' : '/bannerpc1.png'}
                      visualKey={vid.visualKey}
                      alt={pick(vid.titleEn, vid.titleAr)}
                      aspectClass="aspect-[16/9]"
                    />
                  </PhotoMatteFrame>
                  <button
                    type="button"
                    onClick={() => setActiveVideo(vid)}
                    aria-label={`تشغيل ${vid.titleAr}`}
                    className="absolute inset-1.5 flex items-center justify-center bg-black/35 transition-colors hover:bg-black/55 cursor-pointer"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-[3px] bg-white text-[#09090B] shadow-lg transition-transform duration-200 group-hover:scale-105">
                      <Play size={18} />
                    </span>
                  </button>
                </div>
                <div className="px-1 pt-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-semibold text-[#B5945B]">
                      {VIDEO_CAT_AR[vid.category] || vid.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{vid.duration}</span>
                  </div>
                  <h2 className="font-display mt-1.5 text-lg font-bold text-white transition-colors group-hover:text-[#EAD4A5]">
                    {pick(vid.titleEn, vid.titleAr)}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {pick(vid.descriptionEn, vid.descriptionAr)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {activeVideo ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-[3px] border border-zinc-800 bg-[#09090B]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5 text-white">
              <h3 className="font-display text-base font-bold">
                {pick(activeVideo.titleEn, activeVideo.titleAr)}
              </h3>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                aria-label="إغلاق مشغل الفيديو"
                className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-zinc-700 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {activeVideo.sourceType === 'youtube' ? (
                <iframe
                  title={activeVideo.titleEn}
                  src={activeVideo.videoUrl}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={activeVideo.videoUrl} controls autoPlay className="h-full w-full" />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { MediaFrame, PhotoMatteFrame } from '../components/MediaFrame';

export function HomePage() {
  const { pick, isRtl, t } = useI18n();
  const { settings, projects, categories, visits, gallery, openQuoteDrawer, loading } = useSite();

  const featuredProjects = projects.filter((p) => p.featured).slice(0, 6);
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 6);
  const kataraEvents = visits.slice(0, 4);
  const recentGallery = gallery.slice(0, 8);

  const heroDesktopImg = settings?.hero.imageUrl || '/bannerpc1.png';
  const heroMobileImg = settings?.hero.mobileImageUrl || '/bannermobile1.jpeg';
  const heroLogo = settings?.hero.logoUrl || '/logo.jpeg';
  const heroBrandName = settings
    ? pick(settings.hero.brandNameEn, settings.hero.brandNameAr)
    : pick('Al Watan Al Arabi Factory', 'مصنع الوطن العربي');

  const [typedChars, setTypedChars] = useState(heroBrandName.length);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setTypedChars(0);
    setIsDeleting(false);
  }, [heroBrandName]);

  useEffect(() => {
    const fullLen = heroBrandName.length;
    if (fullLen === 0) return;

    let timer: ReturnType<typeof setTimeout>;
    if (!isDeleting && typedChars < fullLen) {
      timer = setTimeout(() => setTypedChars((c) => c + 1), 95);
    } else if (!isDeleting && typedChars >= fullLen) {
      timer = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && typedChars > 0) {
      timer = setTimeout(() => setTypedChars((c) => c - 1), 45);
    } else {
      timer = setTimeout(() => setIsDeleting(false), 450);
    }

    return () => clearTimeout(timer);
  }, [typedChars, isDeleting, heroBrandName]);

  const animatedHeadline = heroBrandName.slice(0, typedChars);

  const secondImg = settings?.secondBanner.image || '/bannerpc2.png';
  const secondTitle = settings
    ? pick(settings.secondBanner.titleEn, settings.secondBanner.titleAr)
    : pick('Built for Every Journey', 'مصنوعة لكل رحلة');
  const secondText = settings
    ? pick(settings.secondBanner.textEn, settings.secondBanner.textAr)
    : t('home.capabilities.subtitle');

  const whatsappNum = settings?.contact.whatsapp || '97455598944';
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    pick('Hello Al Watan Al Arabi Factory', 'مرحباً مصنع الوطن العربي'),
  )}`;

  const engineeringStandards = [
    {
      index: '01',
      title: pick('Marine-Grade Aluminum Fabrication', 'هياكل ألمنيوم بحري مقاوم للتآكل'),
      desc: pick(
        'Precision CNC laser-cut 5083 aluminum panels and TIG-welded subframes engineered for desert endurance.',
        'ألواح ألمنيوم بحري مقصوصة بالليزر مع لحام TIG احترافي يتحمل قسوة الطرق الصحراوية.',
      ),
    },
    {
      index: '02',
      title: pick('GCC Thermal & Dust Sealing', 'عزل حراري محكم لمناخ الخليج'),
      desc: pick(
        'Multi-layer thermal core insulation and double-gasket door sealing built for peak summer temperatures.',
        'عزل حراري متعدد الطبقات وإغلاق مزدوج للأبواب والنوافذ لمنع تسرب الغبار والحرارة.',
      ),
    },
    {
      index: '03',
      title: pick('Bespoke Chassis Integration', 'تفصيل هندسي حسب نوع المركبة'),
      desc: pick(
        'Tailored fitment across GMC, Land Cruiser GXR, Hilux, Nissan Patrol, pickup fleets, and vans.',
        'تجهيز مخصص لسيارات الجموس، GXR، الهايلكس، النيسان، الفان، والكرفانات حسب طلب العميل.',
      ),
    },
    {
      index: '04',
      title: pick('Integrated Water, Fuel & Solar Systems', 'أنظمة متكاملة للمياه والطاقة'),
      desc: pick(
        'Food-grade stainless water tanks, baffled auxiliary diesel tanks, and off-grid solar electrical boards.',
        'خزانات مياه ستانلس ستيل ووقود معزولة، ولوحات طاقة شمسية متكاملة للرحلات الطويلة.',
      ),
    },
    {
      index: '05',
      title: pick('Turnkey Commercial & Coffee Builds', 'تجهيز مشاريع القهوة والمطاعم المتنقلة'),
      desc: pick(
        'Complete electrical, water, stainless counter, and awning setups compliant with municipal standards.',
        'تجهيز كامل لسيارات مشروع كوفي بمطابخ ستانلس ومظلات جانبية وتمديدات كهربائية آمنة.',
      ),
    },
    {
      index: '06',
      title: pick('Doha After-Sales & Warranty Support', 'متابعة فنية وضمان في مقرنا بالدوحة'),
      desc: pick(
        'Direct maintenance, hinge and seal servicing, and upgrades inside Industrial Area Street 34.',
        'صيانة مباشرة وخدمة ما بعد البيع وتحديثات مستمرة داخل مصنعنا بالمنطقة الصناعية بالدوحة.',
      ),
    },
  ];

  const DirectionalArrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="bg-white text-[#09090B]">
      {/* 1. Official Hero Banner */}
      <section className="relative w-full overflow-hidden bg-[#09090B]">
        <img
          src={heroDesktopImg}
          alt={heroBrandName}
          referrerPolicy="no-referrer"
          className="hidden h-auto max-h-[82vh] w-full object-cover md:block"
        />
        <img
          src={heroMobileImg}
          alt={heroBrandName}
          referrerPolicy="no-referrer"
          className="block h-auto max-h-[82vh] w-full object-cover md:hidden"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/60" />

        <div className="absolute top-4 end-4 z-10 rounded-[3px] border border-white/25 bg-white/95 p-2 md:top-6 md:end-6">
          <img
            src={heroLogo}
            alt={heroBrandName}
            referrerPolicy="no-referrer"
            className="h-10 w-auto object-contain md:h-12"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 text-center">
          <div className="max-w-4xl">
            <h1
              aria-label={heroBrandName}
              className="font-display inline-flex min-h-[1.35em] items-center justify-center text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.75)] sm:text-5xl md:text-6xl"
            >
              <span>{animatedHeadline}</span>
            </h1>
          </div>
        </div>
      </section>

      {/* 2. Atelier Spotlight (/bannerpc2.png) */}
      <section className="border-b border-zinc-200 bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="group relative overflow-hidden rounded-[6px] border border-[#B5945B]/40 bg-white p-3 shadow-[0_8px_30px_-10px_rgba(9,9,11,0.12)] transition-all duration-300 hover:border-[#B5945B] hover:shadow-[0_20px_44px_-14px_rgba(181,148,91,0.3)] lg:col-span-6">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 start-0 h-[2px] w-full bg-gradient-to-r from-[#8A6D3B] via-[#EAD4A5] to-[#8A6D3B]"
              />
              <PhotoMatteFrame className="h-full">
                <img
                  src={secondImg}
                  alt={secondTitle}
                  referrerPolicy="no-referrer"
                  className="h-full min-h-[290px] w-full object-cover"
                />
              </PhotoMatteFrame>
            </div>

            <div className="relative flex flex-col justify-center rounded-[6px] border border-zinc-200/80 bg-white p-6 shadow-[0_10px_36px_-18px_rgba(9,9,11,0.12)] sm:p-8 lg:col-span-6">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-6 bottom-6 start-0 w-[3px] rounded-full bg-gradient-to-b from-[#EAD4A5] via-[#B5945B] to-[#8A6D3B]"
              />

              <div>
                <span className="inline-flex items-center gap-2 rounded-[3px] border border-[#B5945B]/45 bg-[#09090B] px-3 py-1 text-[11px] font-bold tracking-wide text-[#EAD4A5] shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#EAD4A5]" />
                  <span>{pick('Doha Industrial Area · Street 34', 'المنطقة الصناعية بالدوحة · شارع 34')}</span>
                </span>
              </div>

              <h2 className="font-editorial mt-4 text-3xl font-bold leading-[1.24] text-[#09090B] sm:text-4xl lg:text-[2.5rem]">
                {secondTitle}
              </h2>
              <div
                aria-hidden="true"
                className="mt-3.5 h-[2px] w-24 rounded-full bg-gradient-to-l from-[#8A6D3B] via-[#B5945B] to-transparent"
              />

              <p className="font-editorial mt-4 text-[15px] font-medium leading-[1.9] text-zinc-600 sm:text-base">
                {secondText}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-2.5 border-t border-zinc-200/80 pt-5 sm:grid-cols-3">
                <div className="rounded-[4px] border border-zinc-200 bg-zinc-50/70 px-3 py-2.5 transition-colors hover:border-[#B5945B]/60">
                  <div className="font-editorial text-xs font-bold text-[#09090B]">ألمنيوم بحري 5083</div>
                  <div className="mt-0.5 text-[11px] text-zinc-500">قص ليزر ولحام TIG</div>
                </div>
                <div className="rounded-[4px] border border-zinc-200 bg-zinc-50/70 px-3 py-2.5 transition-colors hover:border-[#B5945B]/60">
                  <div className="font-editorial text-xs font-bold text-[#09090B]">عزل حراري خليجي</div>
                  <div className="mt-0.5 text-[11px] text-zinc-500">حماية ضد الغبار والحرارة</div>
                </div>
                <div className="rounded-[4px] border border-zinc-200 bg-zinc-50/70 px-3 py-2.5 transition-colors hover:border-[#B5945B]/60">
                  <div className="font-editorial text-xs font-bold text-[#09090B]">تفصيل حسب المركبة</div>
                  <div className="mt-0.5 text-[11px] text-zinc-500">مواصفات هندسية مخصصة</div>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <Link
                  to="/portfolio"
                  className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-[#B5945B]/50 bg-[#09090B] px-5 text-sm font-semibold text-[#EAD4A5] shadow-[0_10px_24px_-12px_rgba(9,9,11,0.55)] transition-all hover:border-[#EAD4A5] hover:bg-[#141418] whitespace-nowrap shrink-0"
                >
                  <span>{pick('View Portfolio', 'تصفح معرض الأعمال')}</span>
                  <DirectionalArrow size={16} />
                </Link>

                <button
                  type="button"
                  onClick={() => openQuoteDrawer()}
                  className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-gradient-to-r from-[#B5945B] via-[#DFC38C] to-[#B5945B] px-5 text-sm font-bold text-[#09090B] shadow-[0_8px_20px_-10px_rgba(181,148,91,0.6)] transition-all hover:brightness-105 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <SlidersHorizontal size={15} />
                  <span>{t('home.hero.ctaPrimary')}</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-[#128C7E] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0E7468] whitespace-nowrap shrink-0"
                >
                  <MessageCircle size={16} />
                  <span>{pick('WhatsApp', 'واتساب')}</span>
                </a>

                <Link
                  to="/contact"
                  className="inline-flex h-11 items-center rounded-[3px] border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:border-[#B5945B] hover:text-[#09090B] whitespace-nowrap shrink-0"
                >
                  <span>{pick('Contact Us', 'اتصل بنا')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Architectural 8-Division Showcase Grid */}
      <section className="relative overflow-hidden border-b border-zinc-800 bg-[#0B0B0E] py-16 text-white lg:py-24">
        {/* Subtle ambient architectural backdrop glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 start-1/2 h-72 w-[720px] -translate-x-1/2 rounded-full bg-[#B5945B]/10 blur-[110px]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#B5945B]">
                {pick('Specialized Engineering Lines', 'خطوط الإنتاج والتفصيل المعتمدة')}
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {pick('Manufacturing Divisions', 'أقسام التصنيع والتجهيز')}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                {pick(
                  'Select any specialized line to explore completed models and request pricing.',
                  'اختر القسم المطلوب لاستعراض المشاريع المنفذة ومواصفات التجهيز.',
                )}
              </p>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E5CFA0] transition-colors hover:text-white whitespace-nowrap shrink-0"
            >
              <span>{pick('View All Divisions', 'استعراض كافة الأقسام')}</span>
              <DirectionalArrow size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, idx) => {
              const count = projects.filter((p) => p.categorySlug === cat.slug).length;
              return (
                <Link
                  key={cat.id}
                  to={`/portfolio/${cat.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[4px] border border-zinc-800/90 bg-gradient-to-b from-[#16161B] to-[#111115] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#B5945B]/60 hover:shadow-[0_12px_36px_-12px_rgba(181,148,91,0.35)]"
                >
                  {/* Top gliding gold accent hairline */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 start-0 h-[2px] w-0 bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B] transition-all duration-500 group-hover:w-full"
                  />

                  {/* Subtle corner radial glow on hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(181,148,91,0.16),transparent_65%)] opacity-35 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono-tabular inline-flex items-center rounded-[2px] border border-[#B5945B]/30 bg-[#B5945B]/10 px-2 py-0.5 font-semibold text-[#E5CFA0]">
                        0{idx + 1}
                      </span>
                      <DirectionalArrow
                        size={15}
                        className={`text-zinc-500 transition-all duration-300 group-hover:text-[#E5CFA0] ${
                          isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                        }`}
                      />
                    </div>
                    <h3 className="font-display mt-5 text-lg font-bold text-white transition-colors duration-200 group-hover:text-[#EAD4A5]">
                      {pick(cat.nameEn, cat.nameAr)}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400 transition-colors duration-200 group-hover:text-zinc-300">
                      {pick(cat.descriptionEn, cat.descriptionAr)}
                    </p>
                  </div>

                  <div className="relative z-10 mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs font-medium text-zinc-400 tabular-nums transition-colors group-hover:border-[#B5945B]/25">
                    <span>
                      {count} {pick('projects', 'مشاريع')}
                    </span>
                    <span className="text-[11px] font-semibold text-[#B5945B] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {pick('Explore', 'عرض')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Selected Workshop Builds */}
      <section className="border-b border-zinc-200 bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#8A6D3B]">
                {pick('Curated Showcase', 'إنتاج ومشاريع مختارة')}
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[#09090B] sm:text-3xl">
                {pick('Selected Workshop Builds', 'نماذج من أحدث التجهيزات')}
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#09090B] transition-colors hover:text-[#8A6D3B] whitespace-nowrap shrink-0"
            >
              <span>{t('home.featured.viewAll')}</span>
              <DirectionalArrow size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-[5px] border border-zinc-200 bg-white" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {displayProjects.map((project, idx) => {
                const cat = categories.find((c) => c.slug === project.categorySlug);
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.slug}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[5px] border border-zinc-200/90 bg-white p-4 shadow-[0_2px_12px_-4px_rgba(9,9,11,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#B5945B]/75 hover:shadow-[0_18px_38px_-14px_rgba(181,148,91,0.28)]"
                  >
                    {/* Top sliding champagne-gold hairline */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 start-0 h-[2px] w-0 bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B] transition-all duration-500 group-hover:w-full"
                    />

                    <div>
                      {/* Architectural matted photo frame */}
                      <div className="relative rounded-[3px] border border-zinc-200/90 bg-zinc-50 p-1.5 transition-colors duration-300 group-hover:border-[#B5945B]/45 group-hover:bg-[#FAF8F4]">
                        {/* Subtle precision corner brackets */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute top-0 start-0 h-2.5 w-2.5 border-t-2 border-s-2 border-[#B5945B]/0 transition-colors duration-300 group-hover:border-[#B5945B]"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-0 end-0 h-2.5 w-2.5 border-b-2 border-e-2 border-[#B5945B]/0 transition-colors duration-300 group-hover:border-[#B5945B]"
                        />
                        <div className="overflow-hidden rounded-[2px] border border-zinc-200/70 bg-zinc-100">
                          <div className="transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                            <MediaFrame
                              imageUrl={project.images[0]}
                              visualKey={project.visualKey}
                              alt={pick(project.titleEn, project.titleAr)}
                              aspectClass="aspect-[16/10]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="px-1 pt-4">
                        <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                          <span className="font-semibold text-[#8A6D3B]">
                            {cat ? pick(cat.nameEn, cat.nameAr) : project.categorySlug}
                          </span>
                          <span className="font-mono-tabular rounded-[2px] bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                            0{idx + 1}
                          </span>
                        </div>

                        <h3 className="font-display mt-2 text-lg font-bold text-[#09090B] transition-colors duration-200 group-hover:text-[#8A6D3B]">
                          {pick(project.titleEn, project.titleAr)}
                        </h3>

                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                          {pick(project.descriptionEn, project.descriptionAr)}
                        </p>
                      </div>
                    </div>

                    <div className="mx-1 mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs transition-colors group-hover:border-[#B5945B]/25">
                      <span className="font-mono-tabular text-zinc-500">{project.dimensions}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#09090B] transition-colors group-hover:text-[#8A6D3B]">
                        <span>{pick('Specifications', 'المواصفات والتفاصيل')}</span>
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
        </div>
      </section>

      {/* 5. Suhail & Regional Exhibitions Chronicle */}
      <section className="relative overflow-hidden border-b border-zinc-800 bg-[#0B0B0E] py-20 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 start-1/2 h-64 w-[680px] -translate-x-1/2 rounded-full bg-[#B5945B]/10 blur-[110px]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#B5945B]">
                {pick('Cultural & Regional Presence', 'الحضور الخليجي والوفود الرسمية')}
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {t('home.exhibitions.title')}
              </h2>
            </div>
            <Link
              to="/katara"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E5CFA0] transition-colors hover:text-white whitespace-nowrap shrink-0"
            >
              <span>{t('home.exhibitions.viewAll')}</span>
              <DirectionalArrow size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {kataraEvents.map((ev, idx) => (
              <Link
                key={ev.id}
                to="/katara"
                className="group relative flex flex-col justify-between overflow-hidden rounded-[4px] border border-zinc-800/90 bg-gradient-to-b from-[#16161B] to-[#111115] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#B5945B]/60 hover:shadow-[0_12px_36px_-12px_rgba(181,148,91,0.35)]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 start-0 h-[2px] w-0 bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B] transition-all duration-500 group-hover:w-full"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(181,148,91,0.16),transparent_65%)] opacity-35 transition-opacity duration-500 group-hover:opacity-100"
                />

                <div className="relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tabular inline-flex items-center rounded-[2px] border border-[#B5945B]/30 bg-[#B5945B]/10 px-2 py-0.5 font-semibold text-[#E5CFA0]">
                        {ev.eventDate}
                      </span>
                      <span className="text-zinc-400">{pick(ev.locationEn, ev.locationAr)}</span>
                    </div>
                    <span className="font-mono-tabular text-[11px] text-zinc-500">0{idx + 1}</span>
                  </div>

                  <h3 className="font-display mt-4 text-lg font-bold text-white transition-colors duration-200 group-hover:text-[#EAD4A5]">
                    {pick(ev.titleEn, ev.titleAr)}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400 transition-colors duration-200 group-hover:text-zinc-300">
                    {pick(ev.descriptionEn, ev.descriptionAr)}
                  </p>
                </div>

                <div className="relative z-10 mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs text-zinc-400 transition-colors group-hover:border-[#B5945B]/25">
                  <span className="text-[#B5945B]">{pick('Katara & Suhail Showcase', 'توثيق المعارض')}</span>
                  <DirectionalArrow
                    size={14}
                    className={`text-zinc-500 transition-all duration-300 group-hover:text-[#E5CFA0] ${
                      isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                    }`}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Recent Workshop Photography */}
      <section className="border-b border-zinc-200 bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#8A6D3B]">
                {pick('Workshop Documentation', 'توثيق خطوط الإنتاج')}
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[#09090B] sm:text-3xl">
                {pick('Recent Workshop Photography', 'أحدث لقطات التصنيع')}
              </h2>
            </div>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#09090B] transition-colors hover:text-[#8A6D3B] whitespace-nowrap shrink-0"
            >
              <span>{pick('Open Archive', 'الأرشيف الكامل')}</span>
              <DirectionalArrow size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentGallery.map((item) => (
              <Link
                key={item.id}
                to="/gallery"
                className="group relative flex flex-col justify-between overflow-hidden rounded-[5px] border border-zinc-200/90 bg-white p-3 shadow-[0_2px_12px_-4px_rgba(9,9,11,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#B5945B]/75 hover:shadow-[0_18px_36px_-14px_rgba(181,148,91,0.28)]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 start-0 h-[2px] w-0 bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B] transition-all duration-500 group-hover:w-full"
                />
                <PhotoMatteFrame>
                  <MediaFrame
                    imageUrl={item.mediaUrl}
                    visualKey={item.visualKey}
                    alt={item.altText}
                    aspectClass="aspect-[4/3]"
                  />
                </PhotoMatteFrame>
                <div className="px-1 pt-3">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="font-semibold text-[#8A6D3B]">{item.category}</span>
                    <span className="truncate">{item.album}</span>
                  </div>
                  <h3 className="font-display mt-1 truncate text-sm font-bold text-[#09090B] transition-colors group-hover:text-[#8A6D3B]">
                    {pick(item.titleEn, item.titleAr)}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Doha Engineering Standards */}
      <section className="relative overflow-hidden bg-[#0E0E12] py-20 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 end-1/4 h-72 w-[560px] rounded-full bg-[#B5945B]/10 blur-[120px]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-xs font-semibold tracking-wider text-[#B5945B]">
                {pick('Quality Assurance', 'جودة التصنيع والاعتماد')}
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {pick('Doha Workshop Standards', 'معايير مصنع الوطن العربي')}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                {pick(
                  'Every caravan, pickup canopy, tank, and commercial vehicle leaves our Industrial Area Street 34 floor built to withstand Gulf summers and off-road operation.',
                  'تخضع كل وحدة كرفان أو شد أو خزان أو سيارة مشروع كوفي لفحص دقيق في مقرنا بالمنطقة الصناعية لضمان المتانة والاعتمادية في أقسى ظروف التشغيل الخليجية.',
                )}
              </p>
              <div className="mt-7">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E5CFA0] transition-colors hover:text-white"
                >
                  <span>{pick('About Doha Facility', 'عن المصنع')}</span>
                  <DirectionalArrow size={15} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
              {engineeringStandards.map((item) => (
                <div
                  key={item.index}
                  className="group relative overflow-hidden rounded-[4px] border border-zinc-800/90 bg-gradient-to-b from-[#16161B] to-[#111115] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#B5945B]/60 hover:shadow-[0_12px_36px_-12px_rgba(181,148,91,0.35)]"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 start-0 h-[2px] w-0 bg-gradient-to-r from-[#B5945B] via-[#EAD4A5] to-[#B5945B] transition-all duration-500 group-hover:w-full"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(181,148,91,0.14),transparent_65%)] opacity-35 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <div className="relative z-10">
                    <span className="font-mono-tabular inline-flex items-center rounded-[2px] border border-[#B5945B]/30 bg-[#B5945B]/10 px-2 py-0.5 text-xs font-semibold text-[#E5CFA0]">
                      {item.index}
                    </span>
                    <h3 className="font-display mt-4 text-base font-bold text-white transition-colors duration-200 group-hover:text-[#EAD4A5]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400 transition-colors duration-200 group-hover:text-zinc-300">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Final Obsidian CTA Band */}
      <section className="border-t border-[#B5945B]/30 bg-[#070709] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display mx-auto max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
            {pick('Ready to Commission Your Custom Build?', 'هل أنت جاهز لتنفيذ مشروعك الخاص؟')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {pick(
              'Share your vehicle model, preferred dimensions, or caravan requirements with our Doha engineering desk.',
              'شاركنا نوع المركبة أو المواصفات المطلوبة وسيقوم فريقنا الهندسي في الدوحة بإعداد التصور والتسعيرة الدقيقة.',
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => openQuoteDrawer()}
              className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-white px-6 text-sm font-semibold text-[#09090B] transition-colors hover:bg-zinc-200 cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal size={15} />
              <span>{t('home.hero.ctaPrimary')}</span>
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-[#128C7E] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0E7468] whitespace-nowrap"
            >
              <MessageCircle size={16} />
              <span>{pick('WhatsApp', 'تواصل عبر الواتساب')}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

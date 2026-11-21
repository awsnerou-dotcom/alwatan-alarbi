import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { MediaFrame } from '../components/MediaFrame';

export function AboutPage() {
  const { pick, t } = useI18n();
  const { settings, openQuoteDrawer } = useSite();

  const values = [
    {
      num: '01',
      title: pick('Structural Quality', 'الجودة الإنشائية'),
      desc: pick(
        'Every weld, seal, and composite laminate is inspected against strict GCC heat and sand exposure criteria.',
        'يخضع كل لحام وعازل لفحص دقيق يضمن التحمل الكامل لحرارة ورمال الخليج.',
      ),
    },
    {
      num: '02',
      title: pick('Tailored Fabrication', 'التفصيل حسب الطلب'),
      desc: pick(
        'Chassis geometry, water/fuel capacities, and interior majlis layouts engineered around your exact expedition profile.',
        'تصميم الأبعاد وسعات الخزانات والتوزيع الداخلي وفق متطلبات العميل بدقة.',
      ),
    },
    {
      num: '03',
      title: pick('Local Doha Craftsmanship', 'صناعة قطرية متقنة'),
      desc: pick(
        'Manufactured end-to-end inside our Industrial Area Street 34 facility with CNC laser cutting and TIG welding bays.',
        'تصنيع متكامل داخل منشأتنا في شارع 34 بالمنطقة الصناعية بالدوحة.',
      ),
    },
    {
      num: '04',
      title: pick('Reliable Turnaround', 'الالتزام بمواعيد التسليم'),
      desc: pick(
        'Structured production schedules with transparent lead times across Qatar, Saudi Arabia, Kuwait, UAE, and Oman.',
        'جداول إنتاج واضحة والتزام تام بمواعيد التسليم في قطر ودول الخليج.',
      ),
    },
  ];

  return (
    <main className="bg-white">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="text-xs font-semibold text-[#8A6D3B]">{t('about.eyebrow')}</p>
              <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-[#09090B] sm:text-4xl">
                {t('about.title')}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-zinc-600">{t('about.subtitle')}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/portfolio"
                  className="inline-flex h-11 items-center rounded-[3px] bg-[#09090B] px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 whitespace-nowrap"
                >
                  {pick('Explore Portfolio', 'تصفح معرض الأعمال')}
                </Link>
                <button
                  type="button"
                  onClick={() => openQuoteDrawer()}
                  className="inline-flex h-11 items-center rounded-[3px] border border-zinc-300 bg-white px-5 text-sm font-semibold text-[#09090B] transition-colors hover:border-[#09090B] whitespace-nowrap cursor-pointer"
                >
                  {pick('Request Custom Quote', 'طلب عرض سعر')}
                </button>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="h-full overflow-hidden rounded-[3px] border border-zinc-200 bg-zinc-100">
                <MediaFrame
                  imageUrl="/seed/caravan-4.jpg"
                  visualKey="factory-cnc"
                  alt="Al Watan Doha Industrial Facility"
                  aspectClass="h-full min-h-[280px]"
                  label={pick('Industrial Area Street 34 · Doha Facility', 'المنطقة الصناعية شارع 34 · الدوحة')}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="border-t-2 border-[#09090B] bg-white p-8">
              <p className="font-mono-tabular text-xs font-semibold text-[#8A6D3B]">{pick('01 · Vision', '01 · الرؤية')}</p>
              <h2 className="font-display mt-2 text-2xl font-bold text-[#09090B]">{t('about.visionTitle')}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">{t('about.visionText')}</p>
            </div>
            <div className="border-t-2 border-[#09090B] bg-white p-8">
              <p className="font-mono-tabular text-xs font-semibold text-[#8A6D3B]">{pick('02 · Mission', '02 · الرسالة')}</p>
              <h2 className="font-display mt-2 text-2xl font-bold text-[#09090B]">{t('about.missionTitle')}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">{t('about.missionText')}</p>
            </div>
          </div>

          <div className="mt-10 divide-y divide-zinc-200 border-y border-zinc-200 bg-white px-6">
            {values.map((val) => (
              <div key={val.num} className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:items-baseline">
                <div className="font-mono-tabular text-xs font-semibold text-[#8A6D3B] sm:col-span-1">
                  {val.num}
                </div>
                <h3 className="font-display text-base font-bold text-[#09090B] sm:col-span-4">{val.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-600 sm:col-span-7">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {settings ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-5">
                <div>
                  <p className="text-xs font-semibold text-[#8A6D3B]">
                    {pick('Visit Doha Showroom', 'زيارة المصنع بالدوحة')}
                  </p>
                  <h2 className="font-display mt-2 text-2xl font-bold text-[#09090B]">
                    {pick('Working Hours & Location', 'ساعات العمل والموقع')}
                  </h2>
                </div>
                <div className="divide-y divide-zinc-200 border-y border-zinc-200 text-sm">
                  <div className="py-4">
                    <div className="text-xs font-semibold text-zinc-500">{pick('Morning Shift', 'الفترة الصباحية')}</div>
                    <div className="mt-1 font-medium text-[#09090B]">{settings.about.morningHours}</div>
                  </div>
                  <div className="py-4">
                    <div className="text-xs font-semibold text-zinc-500">{pick('Evening Shift', 'الفترة المسائية')}</div>
                    <div className="mt-1 font-medium text-[#09090B]">{settings.about.eveningHours}</div>
                  </div>
                  <div className="py-4">
                    <div className="text-xs font-semibold text-zinc-500">{pick('Facility Address', 'عنوان المصنع')}</div>
                    <div className="mt-1 font-medium text-[#09090B]">
                      {pick(settings.about.locationEn, settings.about.locationAr)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="h-80 overflow-hidden rounded-[3px] border border-zinc-200 bg-zinc-100">
                  <iframe
                    title="Al Watan Al Arabi Factory Location"
                    src={settings.about.mapUrl}
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

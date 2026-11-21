import React, { useState } from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useSite } from '../context/SiteContext';
import { apiFetch } from '../lib/api';

export function ContactPage() {
  const { pick, t } = useI18n();
  const { settings, categories } = useSite();

  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [categorySlug, setCategorySlug] = useState('caravan-projects');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch<{ quote: { referenceCode: string } }>('/api/quotes', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          companyName,
          email,
          phone,
          country: 'Qatar',
          categorySlug,
          projectTitle: 'Direct Contact Inquiry',
          notes,
        }),
      });
      setSubmittedCode(res.quote.referenceCode);
      setCustomerName('');
      setCompanyName('');
      setEmail('');
      setPhone('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send inquiry');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white pb-24">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#09090B] sm:text-4xl">
            {t('contact.title')}
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm text-zinc-600">{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="border-t-2 border-[#09090B] pt-6">
              {submittedCode ? (
                <div className="rounded-[3px] border border-emerald-200 bg-emerald-50 p-6">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 size={22} />
                    <h2 className="font-display text-lg font-bold">
                      {pick('Inquiry Logged Successfully', 'تم استلام رسالتك بنجاح')}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-zinc-700">
                    {pick('Reference:', 'رقم المرجع:')}{' '}
                    <span className="font-mono-tabular font-bold">{submittedCode}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedCode(null)}
                    className="mt-4 rounded-[3px] bg-[#09090B] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                  >
                    {pick('Send Another Inquiry', 'إرسال استفسار آخر')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {pick('Full Name *', 'الاسم الكامل *')}
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="mt-1.5 w-full rounded-[3px] border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {pick('Organization / Fleet', 'الشركة / الجهة')}
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="mt-1.5 w-full rounded-[3px] border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {pick('Email *', 'البريد الإلكتروني *')}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5 w-full rounded-[3px] border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">
                        {pick('Phone / WhatsApp *', 'رقم الهاتف / واتساب *')}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1.5 w-full rounded-[3px] border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700">
                      {pick('Department / Product Line', 'القسم المطلوب')}
                    </label>
                    <select
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      className="mt-1.5 w-full rounded-[3px] border border-zinc-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {pick(c.nameEn, c.nameAr)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700">
                      {pick('Project Scope & Dimensions', 'تفاصيل المشروع والمقاسات')}
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1.5 w-full rounded-[3px] border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-[#09090B] focus:outline-none"
                    />
                  </div>

                  {error ? (
                    <div className="rounded-[3px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 rounded-[3px] bg-[#09090B] px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? pick('Sending...', 'جاري الإرسال...') : pick('Submit Inquiry', 'إرسال الطلب')}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            {settings ? (
              <div className="border border-zinc-200 bg-zinc-50 p-7 text-sm">
                <h2 className="font-display text-lg font-bold text-[#09090B]">
                  {pick('Doha Headquarters', 'المقر الرئيسي بالدوحة')}
                </h2>
                <div className="mt-5 divide-y divide-zinc-200">
                  <div className="py-3">
                    <div className="text-xs text-zinc-500">{pick('Address', 'العنوان')}</div>
                    <div className="mt-1 font-medium text-[#09090B]">
                      {pick(settings.contact.addressEn, settings.contact.addressAr)}
                    </div>
                  </div>
                  <div className="py-3">
                    <div className="text-xs text-zinc-500">{pick('Direct Phones', 'أرقام التواصل')}</div>
                    <div dir="ltr" className="font-mono-tabular mt-1 inline-block font-medium text-[#09090B]">
                      {settings.contact.phone} · {settings.contact.phone2}
                    </div>
                  </div>
                  <div className="py-3">
                    <div className="text-xs text-zinc-500">{pick('Emails', 'البريد الإلكتروني')}</div>
                    <div dir="ltr" className="mt-1 inline-block font-medium text-[#09090B]">
                      {settings.contact.email} · {settings.contact.email2}
                    </div>
                  </div>
                  <div className="py-3">
                    <div className="text-xs text-zinc-500">{pick('Factory Hours', 'أوقات الدوام')}</div>
                    <div className="mt-1 text-zinc-700">{settings.about.morningHours}</div>
                    <div className="text-zinc-700">{settings.about.eveningHours}</div>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${settings.contact.whatsapp}?text=${encodeURIComponent(
                    pick('Hello Al Watan Al Arabi Factory', 'مرحباً مصنع الوطن العربي'),
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[3px] bg-[#128C7E] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#0E7468]"
                >
                  <MessageCircle size={15} />
                  <span>{t('home.cta.whatsapp')}</span>
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

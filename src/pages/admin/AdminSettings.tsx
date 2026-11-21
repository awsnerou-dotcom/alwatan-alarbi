import React, { useEffect, useState } from 'react';
import { Check, Plus, Save, Trash2, Upload } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useI18n } from '../../context/I18nContext';
import { apiFetch, fileToDataUrl } from '../../lib/api';
import type { SiteSettings } from '../../shared/types';

export function AdminSettings() {
  const { data, reloadAdmin } = useAdminData();
  const { pick } = useI18n();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    if (data?.settings && !form) {
      setForm(structuredClone(data.settings));
    }
  }, [data, form]);

  if (!form) {
    return <div className="p-6 text-sm text-slate-600">{pick('Loading settings...', 'جاري التحميل...')}</div>;
  }

  async function saveSection(sectionKey: string) {
    if (!form) return;
    setSavingSection(sectionKey);
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      await reloadAdmin();
      setSavedSection(sectionKey);
      setTimeout(() => setSavedSection(null), 2500);
    } finally {
      setSavingSection(null);
    }
  }

  async function uploadAsset(fieldKey: string, file: File | null, onUrl: (url: string) => void) {
    if (!file) return;
    setUploadingField(fieldKey);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await apiFetch<{ url: string }>('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, dataUrl }),
      });
      onUrl(res.url);
    } finally {
      setUploadingField(null);
    }
  }

  function SaveButton({ section }: { section: string }) {
    const isSaving = savingSection === section;
    const isSaved = savedSection === section;
    return (
      <button
        type="button"
        onClick={() => saveSection(section)}
        disabled={isSaving}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
      >
        {isSaved ? <Check size={14} /> : <Save size={14} />}
        <span>{isSaving ? pick('Saving...', 'جاري الحفظ...') : isSaved ? pick('Saved', 'تم الحفظ') : pick('Save Section', 'حفظ القسم')}</span>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          {pick('Site Settings & Live Content', 'إعدادات الموقع والمحتوى المباشر')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {pick(
            'Update hero & spotlight banners, quick division links, Doha working hours, contact info, and SEO.',
            'تعديل البانرات وصف الأيقونات وساعات العمل ومعلومات التواصل.',
          )}
        </p>
      </div>

      {/* 2. Hero Banner */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-bold text-slate-900">
          {pick('Hero Banner & Brand Identity', 'البانر الرئيسي والهوية')}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div>
            <label className="block font-semibold text-slate-700">{pick('Brand Name (EN)', 'اسم المصنع بالإنجليزية')}</label>
            <input
              type="text"
              value={form.hero.brandNameEn}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, brandNameEn: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Brand Name (AR)', 'اسم المصنع بالعربية')}</label>
            <input
              type="text"
              dir="rtl"
              value={form.hero.brandNameAr}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, brandNameAr: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Hero Headline (EN)', 'العنوان الرئيسي بالإنجليزية')}</label>
            <input
              type="text"
              value={form.hero.titleEn}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, titleEn: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Hero Headline (AR)', 'العنوان الرئيسي بالعربية')}</label>
            <input
              type="text"
              dir="rtl"
              value={form.hero.titleAr}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, titleAr: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Hero Subtitle (EN)', 'الوصف الرئيسي بالإنجليزية')}</label>
            <textarea
              rows={2}
              value={form.hero.subtitleEn}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, subtitleEn: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Hero Subtitle (AR)', 'الوصف الرئيسي بالعربية')}</label>
            <textarea
              rows={2}
              dir="rtl"
              value={form.hero.subtitleAr}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, subtitleAr: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="flex flex-wrap gap-4 sm:col-span-2">
            <div>
              <label className="block font-semibold text-slate-700">{pick('Hero Banner (Desktop)', 'صورة البانر (كمبيوتر)')}</label>
              <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-slate-600 hover:border-amber-700">
                <Upload size={14} />
                <span>{uploadingField === 'hero' ? pick('Uploading...', 'جاري الرفع...') : pick('Upload Desktop', 'رفع صورة الكمبيوتر')}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    uploadAsset('hero', e.target.files?.[0] || null, (url) =>
                      setForm((prev) => (prev ? { ...prev, hero: { ...prev.hero, imageUrl: url } } : prev)),
                    )
                  }
                />
              </label>
            </div>
            <div>
              <label className="block font-semibold text-slate-700">{pick('Hero Banner (Mobile)', 'صورة البانر (موبايل)')}</label>
              <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-slate-600 hover:border-amber-700">
                <Upload size={14} />
                <span>{uploadingField === 'heroMobile' ? pick('Uploading...', 'جاري الرفع...') : pick('Upload Mobile', 'رفع صورة الموبايل')}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    uploadAsset('heroMobile', e.target.files?.[0] || null, (url) =>
                      setForm((prev) => (prev ? { ...prev, hero: { ...prev.hero, mobileImageUrl: url } } : prev)),
                    )
                  }
                />
              </label>
            </div>
            <div>
              <label className="block font-semibold text-slate-700">{pick('Header Logo', 'الشعار')}</label>
              <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-slate-600 hover:border-amber-700">
                <Upload size={14} />
                <span>{uploadingField === 'logo' ? pick('Uploading...', 'جاري الرفع...') : pick('Upload Logo', 'رفع الشعار')}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    uploadAsset('logo', e.target.files?.[0] || null, (url) =>
                      setForm((prev) => (prev ? { ...prev, hero: { ...prev.hero, logoUrl: url } } : prev)),
                    )
                  }
                />
              </label>
            </div>
          </div>
        </div>
        <SaveButton section="hero" />
      </section>

      {/* 3. Second Spotlight Banner & Icons Row */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-bold text-slate-900">
          {pick('Spotlight Banner & Quick Division Links', 'القسم التعريفي الثاني وصف الأيقونات')}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700">{pick('Second Banner Image', 'صورة القسم الثاني')}</label>
            <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-slate-600 hover:border-amber-700">
              <Upload size={14} />
              <span>{uploadingField === 'secondBanner' ? pick('Uploading...', 'جاري الرفع...') : pick('Upload Image', 'رفع صورة')}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  uploadAsset('secondBanner', e.target.files?.[0] || null, (url) =>
                    setForm((prev) => (prev ? { ...prev, secondBanner: { ...prev.secondBanner, image: url } } : prev)),
                  )
                }
              />
            </label>
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Spotlight Title (EN)', 'العنوان بالإنجليزية')}</label>
            <input
              type="text"
              value={form.secondBanner.titleEn}
              onChange={(e) => setForm({ ...form, secondBanner: { ...form.secondBanner, titleEn: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Spotlight Title (AR)', 'العنوان بالعربية')}</label>
            <input
              type="text"
              dir="rtl"
              value={form.secondBanner.titleAr}
              onChange={(e) => setForm({ ...form, secondBanner: { ...form.secondBanner, titleAr: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Description (EN)', 'النص بالإنجليزية')}</label>
            <textarea
              rows={2}
              value={form.secondBanner.textEn}
              onChange={(e) => setForm({ ...form, secondBanner: { ...form.secondBanner, textEn: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Description (AR)', 'النص بالعربية')}</label>
            <textarea
              rows={2}
              dir="rtl"
              value={form.secondBanner.textAr}
              onChange={(e) => setForm({ ...form, secondBanner: { ...form.secondBanner, textAr: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">{pick('Services Icons Row', 'صف الأيقونات والخدمات')}</h3>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  iconsRow: [
                    ...form.iconsRow,
                    { id: `ic-${Date.now()}`, icon: '🏕️', titleEn: 'New Service', titleAr: 'خدمة جديدة', link: '/projects' },
                  ],
                })
              }
              className="inline-flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <Plus size={12} />
              <span>{pick('Add Icon', 'إضافة أيقونة')}</span>
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {form.iconsRow.map((row, idx) => (
              <div key={row.id} className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-12 text-xs">
                <input
                  type="text"
                  value={row.icon}
                  onChange={(e) => {
                    const next = [...form.iconsRow];
                    next[idx] = { ...row, icon: e.target.value };
                    setForm({ ...form, iconsRow: next });
                  }}
                  placeholder="🏗️"
                  className="rounded border border-slate-300 px-2 py-1.5 text-center sm:col-span-1"
                />
                <input
                  type="text"
                  value={row.titleEn}
                  onChange={(e) => {
                    const next = [...form.iconsRow];
                    next[idx] = { ...row, titleEn: e.target.value };
                    setForm({ ...form, iconsRow: next });
                  }}
                  placeholder="Title EN"
                  className="rounded border border-slate-300 px-2.5 py-1.5 sm:col-span-4"
                />
                <input
                  type="text"
                  dir="rtl"
                  value={row.titleAr}
                  onChange={(e) => {
                    const next = [...form.iconsRow];
                    next[idx] = { ...row, titleAr: e.target.value };
                    setForm({ ...form, iconsRow: next });
                  }}
                  placeholder="العنوان"
                  className="rounded border border-slate-300 px-2.5 py-1.5 sm:col-span-3"
                />
                <input
                  type="text"
                  value={row.link}
                  onChange={(e) => {
                    const next = [...form.iconsRow];
                    next[idx] = { ...row, link: e.target.value };
                    setForm({ ...form, iconsRow: next });
                  }}
                  placeholder="/projects"
                  className="rounded border border-slate-300 px-2.5 py-1.5 sm:col-span-3"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, iconsRow: form.iconsRow.filter((_, i) => i !== idx) })}
                  className="flex items-center justify-center rounded text-slate-400 hover:text-red-600 sm:col-span-1 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <SaveButton section="secondBanner" />
      </section>

      {/* 4. Contact, Working Hours & SEO */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-bold text-slate-900">
          {pick('Contact Info, Working Hours & SEO', 'بيانات التواصل وساعات العمل و SEO')}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div>
            <label className="block font-semibold text-slate-700">{pick('Primary Phone', 'الهاتف الرئيسي')}</label>
            <input
              type="text"
              value={form.contact.phone}
              onChange={(e) => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })}
              className="font-mono-tabular mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('WhatsApp Number', 'رقم واتساب')}</label>
            <input
              type="text"
              value={form.contact.whatsapp}
              onChange={(e) => setForm({ ...form, contact: { ...form.contact, whatsapp: e.target.value } })}
              className="font-mono-tabular mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Primary Email', 'البريد الرئيسي')}</label>
            <input
              type="email"
              value={form.contact.email}
              onChange={(e) => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Morning Hours', 'الفترة الصباحية')}</label>
            <input
              type="text"
              value={form.about.morningHours}
              onChange={(e) => setForm({ ...form, about: { ...form.about, morningHours: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Evening Hours', 'الفترة المسائية')}</label>
            <input
              type="text"
              value={form.about.eveningHours}
              onChange={(e) => setForm({ ...form, about: { ...form.about, eveningHours: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">{pick('Address (EN)', 'العنوان بالإنجليزية')}</label>
            <input
              type="text"
              value={form.contact.addressEn}
              onChange={(e) => setForm({ ...form, contact: { ...form.contact, addressEn: e.target.value } })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <SaveButton section="contact" />
      </section>
    </div>
  );
}

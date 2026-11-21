import React, { useState } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useI18n } from '../../context/I18nContext';
import { apiFetch, fileToDataUrl } from '../../lib/api';
import type { Visit, VisitType, VisualKey } from '../../shared/types';

export function AdminVisits() {
  const { data, reloadAdmin } = useAdminData();
  const { pick } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    type: 'exhibition' as VisitType,
    locationEn: 'Katara Cultural Village, Doha',
    locationAr: 'الحي الثقافي كتارا، الدوحة',
    eventDate: new Date().toISOString().slice(0, 10),
    visualKey: 'katara-pavilion' as VisualKey,
    images: [] as string[],
    isKataraFeatured: true,
    published: true,
  });

  function openCreate() {
    setEditingId(null);
    setForm({
      titleEn: '',
      titleAr: '',
      descriptionEn: '',
      descriptionAr: '',
      type: 'exhibition',
      locationEn: 'Katara Cultural Village, Doha',
      locationAr: 'الحي الثقافي كتارا، الدوحة',
      eventDate: new Date().toISOString().slice(0, 10),
      visualKey: 'katara-pavilion',
      images: [],
      isKataraFeatured: true,
      published: true,
    });
    setModalOpen(true);
  }

  function openEdit(v: Visit) {
    setEditingId(v.id);
    setForm({
      titleEn: v.titleEn,
      titleAr: v.titleAr,
      descriptionEn: v.descriptionEn,
      descriptionAr: v.descriptionAr,
      type: v.type,
      locationEn: v.locationEn,
      locationAr: v.locationAr,
      eventDate: v.eventDate,
      visualKey: v.visualKey,
      images: v.images,
      isKataraFeatured: v.isKataraFeatured,
      published: v.published,
    });
    setModalOpen(true);
  }

  async function handleUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await apiFetch<{ url: string }>('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, dataUrl }),
      });
      setForm((prev) => ({ ...prev, images: [...prev.images, res.url] }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch(`/api/admin/visits/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch('/api/admin/visits', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      await reloadAdmin();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await apiFetch(`/api/admin/visits/${id}`, { method: 'DELETE' });
    await reloadAdmin();
  }

  const visits = data?.visits || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {pick('Visits, Achievements & Katara Exhibitions', 'الزيارات والإنجازات ومعارض كتارا')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {pick('Record VIP factory visits, Suhail/Katara exhibitions, and manufacturing milestones.', 'إدارة سجل المعارض والوفود الرسمية والإنجازات.')}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 whitespace-nowrap cursor-pointer"
        >
          <Plus size={15} />
          <span>{pick('New Visit / Event', 'إضافة فعالية')}</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">{pick('Event Title', 'العنوان')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Type', 'النوع')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Date', 'التاريخ')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Status', 'الحالة')}</th>
                <th className="px-5 py-3 font-semibold text-right">{pick('Actions', 'إجراءات')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{pick(v.titleEn, v.titleAr)}</div>
                    <div className="text-slate-500">{pick(v.locationEn, v.locationAr)}</div>
                  </td>
                  <td className="px-5 py-3.5 capitalize text-slate-700">{v.type}</td>
                  <td className="font-mono-tabular px-5 py-3.5 text-slate-600">{v.eventDate}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block rounded border px-2 py-0.5 text-[11px] font-semibold ${
                        v.published
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-100 text-slate-600'
                      }`}
                    >
                      {v.published ? pick('Published', 'منشور') : pick('Draft', 'مسودة')}
                    </span>
                    {v.isKataraFeatured ? (
                      <span className="ml-1.5 text-[11px] font-semibold text-amber-800">· Katara</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(v)}
                        className="rounded border border-slate-300 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        {pick('Edit', 'تعديل')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v.id)}
                        className="rounded p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {editingId ? pick('Edit Event', 'تعديل الفعالية') : pick('Add Event / Visit', 'إضافة فعالية جديدة')}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded p-1 text-slate-500 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Title (English) *', 'العنوان بالإنجليزية *')}</label>
                  <input
                    type="text"
                    required
                    value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Title (Arabic)', 'العنوان بالعربية')}</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.titleAr}
                    onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Description (English)', 'الوصف بالإنجليزية')}</label>
                  <textarea
                    rows={3}
                    value={form.descriptionEn}
                    onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Description (Arabic)', 'الوصف بالعربية')}</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={form.descriptionAr}
                    onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Type', 'النوع')}</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as VisitType })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="exhibition">Exhibition</option>
                    <option value="visit">Visit</option>
                    <option value="achievement">Achievement</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Event Date', 'التاريخ')}</label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Upload Image', 'رفع صورة')}</label>
                  <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-slate-600">
                    <Upload size={14} />
                    <span>{uploading ? '...' : pick('Upload', 'رفع')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Location (EN)', 'الموقع بالإنجليزية')}</label>
                  <input
                    type="text"
                    value={form.locationEn}
                    onChange={(e) => setForm({ ...form, locationEn: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Location (AR)', 'الموقع بالعربية')}</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.locationAr}
                    onChange={(e) => setForm({ ...form, locationAr: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isKataraFeatured}
                    onChange={(e) => setForm({ ...form, isKataraFeatured: e.target.checked })}
                    className="accent-amber-700"
                  />
                  <span>{pick('Show in Katara Showcase', 'عرض في صفحة كتارا')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="accent-amber-700"
                  />
                  <span>{pick('Published', 'منشور')}</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 cursor-pointer"
                >
                  {pick('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-amber-800 px-5 py-2 font-semibold text-white hover:bg-amber-700 cursor-pointer"
                >
                  {saving ? pick('Saving...', 'جاري الحفظ...') : pick('Save Record', 'حفظ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

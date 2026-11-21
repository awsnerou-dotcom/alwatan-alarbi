import React, { useState } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useI18n } from '../../context/I18nContext';
import { apiFetch, fileToDataUrl } from '../../lib/api';
import { MediaFrame } from '../../components/MediaFrame';
import type { Category } from '../../shared/types';

export function AdminCategories() {
  const { data, reloadAdmin } = useAdminData();
  const { pick } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    imageUrl: '',
    sortOrder: 1,
  });

  function openCreate() {
    setEditingId(null);
    setForm({
      nameEn: '',
      nameAr: '',
      descriptionEn: '',
      descriptionAr: '',
      imageUrl: '',
      sortOrder: (data?.categories.length || 0) + 1,
    });
    setModalOpen(true);
  }

  function openEdit(c: Category) {
    setEditingId(c.id);
    setForm({
      nameEn: c.nameEn,
      nameAr: c.nameAr,
      descriptionEn: c.descriptionEn,
      descriptionAr: c.descriptionAr,
      imageUrl: c.imageUrl || '',
      sortOrder: c.sortOrder,
    });
    setModalOpen(true);
  }

  async function handleImageUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await apiFetch<{ url: string }>('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, dataUrl }),
      });
      setForm((prev) => ({ ...prev, imageUrl: res.url }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch(`/api/admin/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch('/api/admin/categories', {
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
    await apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    await reloadAdmin();
  }

  const categories = data?.categories || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {pick('Portfolio & Project Categories', 'إدارة أقسام الأعمال')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {pick('Add, edit, reorder, and delete main portfolio categories.', 'إضافة وتعديل وحذف أقسام الأعمال وترتيب ظهورها.')}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 whitespace-nowrap cursor-pointer"
        >
          <Plus size={15} />
          <span>{pick('New Category', 'قسم جديد')}</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">{pick('Order', 'الترتيب')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Category', 'القسم')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Slug', 'المعرف')}</th>
                <th className="px-5 py-3 font-semibold text-right">{pick('Actions', 'إجراءات')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="font-mono-tabular px-5 py-3.5 text-slate-500">{c.sortOrder}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 shrink-0 overflow-hidden rounded border border-slate-200">
                        <MediaFrame
                          imageUrl={c.imageUrl}
                          visualKey={c.visualKey || 'aluminum-caravan'}
                          alt={c.nameAr}
                          aspectClass="h-full w-full"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{pick(c.nameEn, c.nameAr)}</div>
                        <div className="line-clamp-1 max-w-md text-slate-500">
                          {pick(c.descriptionEn, c.descriptionAr)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono-tabular px-5 py-3.5 text-slate-500">{c.slug}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="rounded border border-slate-300 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        {pick('Edit', 'تعديل')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
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
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {editingId ? pick('Edit Category', 'تعديل القسم') : pick('Create Category', 'إنشاء قسم جديد')}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded p-1 text-slate-500 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Arabic Title *', 'العنوان بالعربية *')}</label>
                  <input
                    type="text"
                    dir="rtl"
                    required
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('English Title', 'العنوان بالإنجليزية')}</label>
                  <input
                    type="text"
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Arabic Description', 'الوصف بالعربية')}</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={form.descriptionAr}
                    onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('English Description', 'الوصف بالإنجليزية')}</label>
                  <textarea
                    rows={3}
                    value={form.descriptionEn}
                    onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Cover Image', 'صورة القسم')}</label>
                  <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-slate-600 hover:border-amber-700">
                    <Upload size={14} />
                    <span>{uploading ? pick('Uploading...', 'جاري الرفع...') : pick('Upload Image', 'رفع صورة')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Sort Order', 'الترتيب')}</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="font-mono-tabular mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
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
                  {saving ? pick('Saving...', 'جاري الحفظ...') : pick('Save Category', 'حفظ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

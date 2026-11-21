import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useI18n } from '../../context/I18nContext';
import { apiFetch } from '../../lib/api';
import type { QuoteRequest, QuoteStatus } from '../../shared/types';

const STATUS_OPTIONS: { value: QuoteStatus; label: string; labelAr: string; cls: string }[] = [
  { value: 'new', label: 'New', labelAr: 'جديد', cls: 'border-amber-200 bg-amber-50 text-amber-800' },
  { value: 'reviewing', label: 'Reviewing', labelAr: 'مراجعة', cls: 'border-sky-200 bg-sky-50 text-sky-800' },
  { value: 'quoted', label: 'Quoted', labelAr: 'مسعّر', cls: 'border-indigo-200 bg-indigo-50 text-indigo-800' },
  {
    value: 'in_production',
    label: 'In Production',
    labelAr: 'قيد التصنيع',
    cls: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  { value: 'completed', label: 'Completed', labelAr: 'مكتمل', cls: 'border-slate-200 bg-slate-100 text-slate-700' },
];

export function AdminQuotes() {
  const { data, reloadAdmin } = useAdminData();
  const { pick } = useI18n();
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<QuoteRequest | null>(null);
  const [saving, setSaving] = useState(false);

  const quotes = useMemo(() => {
    const list = data?.quotes || [];
    return list.filter((q) => {
      const statusOk = statusFilter === 'all' || q.status === statusFilter;
      const s = search.trim().toLowerCase();
      const match =
        !s ||
        q.referenceCode.toLowerCase().includes(s) ||
        q.customerName.toLowerCase().includes(s) ||
        q.projectTitle.toLowerCase().includes(s) ||
        q.email.toLowerCase().includes(s);
      return statusOk && match;
    });
  }, [data, statusFilter, search]);

  function exportCsv() {
    const headers = ['Reference', 'Customer', 'Company', 'Country', 'Email', 'Phone', 'Project', 'EstimateQAR', 'Status', 'CreatedAt'];
    const rows = quotes.map((q) => [
      q.referenceCode,
      q.customerName,
      q.companyName,
      q.country,
      q.email,
      q.phone,
      q.projectTitle,
      q.estimatedPriceQar,
      q.status,
      q.createdAt,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `al-watan-rfqs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/quotes/${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: editing.status,
          internalNotes: editing.internalNotes,
          estimatedPriceQar: editing.estimatedPriceQar,
        }),
      });
      await reloadAdmin();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await apiFetch(`/api/admin/quotes/${id}`, { method: 'DELETE' });
    await reloadAdmin();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {pick('Quote Requests & RFQ Pipeline', 'طلبات التسعير والعملاء')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {pick(
              'Review incoming custom build configurations, update production statuses, and export records.',
              'إدارة طلبات التسعير الواردة من حاسبة التصنيع وتحديث حالة الإنتاج.',
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/request-requirements"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-900 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 whitespace-nowrap"
          >
            <SlidersHorizontal size={14} />
            <span>{pick('Configure Form Requirements', 'تعديل متطلبات الطلب')}</span>
          </Link>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap cursor-pointer"
          >
            <Download size={14} />
            <span>{pick('Download CSV', 'تصدير CSV')}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            {pick('All', 'الكل')}
          </button>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                statusFilter === opt.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              {pick(opt.label, opt.labelAr)}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={pick('Search ref or client...', 'بحث بالمرجع أو العميل...')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:border-amber-700 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">{pick('Reference', 'المرجع')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Client & Contact', 'العميل')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Configuration', 'المواصفات')}</th>
                <th className="px-5 py-3 font-semibold text-right">{pick('Estimate (QAR)', 'السعر التقديري')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Status', 'الحالة')}</th>
                <th className="px-5 py-3 font-semibold text-right">{pick('Actions', 'إجراءات')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    {pick('No quote requests match your filter.', 'لا توجد طلبات مطابقة.')}
                  </td>
                </tr>
              ) : (
                quotes.map((q) => {
                  const st = STATUS_OPTIONS.find((o) => o.value === q.status) || STATUS_OPTIONS[0];
                  return (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="font-mono-tabular px-5 py-3.5 font-semibold text-slate-900">
                        {q.referenceCode}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{q.customerName}</div>
                        <div className="text-slate-500">
                          {q.phone} · {q.country}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800">{q.projectTitle}</div>
                        <div className="font-mono-tabular text-slate-500">
                          {q.customSpecs?.vehicleMakeModel ? `${q.customSpecs.vehicleMakeModel} · ` : ''}
                          {q.lengthMeters}m · {q.capacityLiters}L · {q.insulationTier}
                        </div>
                      </td>
                      <td className="font-mono-tabular px-5 py-3.5 text-right font-semibold text-slate-900">
                        {q.estimatedPriceQar > 0 ? q.estimatedPriceQar.toLocaleString() : pick('Pending Quote', 'بانتظار التسعير')}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block rounded border px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>
                          {pick(st.label, st.labelAr)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditing(q)}
                            className="rounded border border-slate-300 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            {pick('Manage', 'إدارة')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(q.id)}
                            aria-label="Delete quote"
                            className="rounded p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="font-mono-tabular text-xs font-semibold text-amber-800">
                  {editing.referenceCode}
                </div>
                <h2 className="font-display text-lg font-bold text-slate-900">{editing.customerName}</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-sm">
              <div className="space-y-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-slate-700">
                {editing.customSpecs ? (
                  <div className="grid grid-cols-2 gap-1.5 border-b border-zinc-200 pb-2">
                    <div>
                      <strong>{pick('Vehicle:', 'المركبة:')}</strong> {editing.customSpecs.vehicleMakeModel || '—'}{' '}
                      {editing.customSpecs.vehicleYear || ''}
                    </div>
                    <div>
                      <strong>{pick('Roof Profile:', 'السقف:')}</strong> {editing.customSpecs.roofHeightProfile || '—'}
                    </div>
                    <div>
                      <strong>{pick('Material:', 'الهيكل:')}</strong> {editing.customSpecs.bodyMaterial || '—'}
                    </div>
                    <div>
                      <strong>{pick('Power / AC:', 'الطاقة والتكييف:')}</strong>{' '}
                      {editing.customSpecs.powerSystem || '—'} / {editing.customSpecs.acSystem || '—'}
                    </div>
                    {editing.customSpecs.selectedFeatures && editing.customSpecs.selectedFeatures.length > 0 ? (
                      <div className="col-span-2">
                        <strong>{pick('Equipment:', 'التجهيزات:')}</strong>{' '}
                        {editing.customSpecs.selectedFeatures.join('، ')}
                      </div>
                    ) : null}
                    {editing.customSpecs.customAnswers && editing.customSpecs.customAnswers.length > 0 ? (
                      <div className="col-span-2 mt-1.5 border-t border-zinc-200 pt-2 space-y-1">
                        <div className="font-semibold text-slate-800">
                          {pick('Custom Section Answers:', 'متطلبات وإجابات السكشنات المخصصة:')}
                        </div>
                        {editing.customSpecs.customAnswers.map((ans, idx) => (
                          <div key={idx}>
                            <span className="text-slate-500">[{ans.sectionTitle}]</span>{' '}
                            <strong>{ans.label}:</strong> {ans.value}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div>
                  <strong>{pick('Client Notes:', 'ملاحظات العميل:')}</strong> {editing.notes || '—'}
                </div>
                <div>
                  <strong>{pick('Contact:', 'التواصل:')}</strong> {editing.email} · {editing.phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    {pick('Workflow Status', 'حالة الطلب')}
                  </label>
                  <select
                    value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as QuoteStatus })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {pick(o.label, o.labelAr)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    {pick('Quoted Price (QAR)', 'السعر المعتمد (ر.ق)')}
                  </label>
                  <input
                    type="number"
                    value={editing.estimatedPriceQar}
                    onChange={(e) => setEditing({ ...editing, estimatedPriceQar: Number(e.target.value) })}
                    className="font-mono-tabular mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  {pick('Internal Engineering Notes', 'ملاحظات الهندسة الداخلية')}
                </label>
                <textarea
                  rows={3}
                  value={editing.internalNotes}
                  onChange={(e) => setEditing({ ...editing, internalNotes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {pick('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 cursor-pointer"
                >
                  {saving ? pick('Saving...', 'جاري الحفظ...') : pick('Save Changes', 'حفظ التغييرات')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

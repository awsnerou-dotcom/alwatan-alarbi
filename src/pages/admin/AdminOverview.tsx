import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useI18n } from '../../context/I18nContext';

const STATUS_BADGE: Record<string, { label: string; labelAr: string; cls: string }> = {
  new: { label: 'New Inquiry', labelAr: 'طلب جديد', cls: 'text-amber-800 bg-amber-50 border-amber-200' },
  reviewing: { label: 'Reviewing', labelAr: 'قيد المراجعة', cls: 'text-sky-800 bg-sky-50 border-sky-200' },
  quoted: { label: 'Quoted', labelAr: 'تم التسعير', cls: 'text-indigo-800 bg-indigo-50 border-indigo-200' },
  in_production: {
    label: 'In Production',
    labelAr: 'قيد التصنيع',
    cls: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  },
  completed: { label: 'Completed', labelAr: 'مكتمل', cls: 'text-slate-700 bg-slate-100 border-slate-200' },
};

export function AdminOverview() {
  const { data, loading, error } = useAdminData();
  const { pick } = useI18n();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || 'Unable to load dashboard metrics.'}
      </div>
    );
  }

  const maxCat = Math.max(1, ...data.categoryBreakdown.map((c) => c.projectsCount + c.quotesCount));

  const kpis = [
    {
      label: pick('Active RFQ Pipeline', 'قيمة الطلبات الجارية'),
      value: `${data.counts.pipelineValueQar.toLocaleString()} ر.ق`,
      sub: `${data.counts.openQuotes} ${pick('open requests', 'طلبات مفتوحة')}`,
    },
    {
      label: pick('Published Projects', 'المشاريع المنشورة'),
      value: `${data.counts.publishedProjects} / ${data.counts.projects}`,
      sub: `${data.counts.categories} ${pick('divisions', 'أقسام')}`,
    },
    {
      label: pick('Exhibitions & Visits', 'المعارض والزيارات'),
      value: String(data.counts.visits),
      sub: `${data.counts.gallery} ${pick('gallery assets', 'ملف بالمعرض')}`,
    },
    {
      label: pick('Team Accounts', 'حسابات الفريق'),
      value: String(data.counts.users),
      sub: `${data.counts.videos} ${pick('showcase videos', 'فيديوهات')}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {pick('Factory Operations Overview', 'نظرة عامة على عمليات المصنع')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {pick(
              'Live inventory across projects, custom quote pipeline, Katara showcases, and site settings.',
              'متابعة مباشرة للمشاريع وطلبات التسعير ومعارض كتارا وإعدادات الموقع.',
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/projects"
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800 whitespace-nowrap"
          >
            {pick('Manage Projects', 'إدارة المشاريع')}
          </Link>
          <Link
            to="/admin/quotes"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            {pick('Review Quotes', 'مراجعة التسعيرات')}
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium text-slate-500">{k.label}</div>
            <div className="font-mono-tabular mt-2 text-2xl font-bold text-slate-900">{k.value}</div>
            <div className="mt-1 text-xs text-slate-500 tabular-nums">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Analytics Row: Division Demand + Quote Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <h2 className="font-display text-base font-bold text-slate-900">
            {pick('Projects & Inquiries by Manufacturing Division', 'توزيع المشاريع والطلبات حسب القسم')}
          </h2>
          <div className="mt-5 space-y-4">
            {data.categoryBreakdown.map((cat) => {
              const total = cat.projectsCount + cat.quotesCount;
              const pct = Math.round((total / maxCat) * 100);
              return (
                <div key={cat.slug}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{pick(cat.nameEn, cat.nameAr)}</span>
                    <span className="font-mono-tabular text-slate-500">
                      {cat.projectsCount} {pick('builds', 'مشاريع')} · {cat.quotesCount}{' '}
                      {pick('RFQs', 'طلبات')}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-700"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <h2 className="font-display text-base font-bold text-slate-900">
            {pick('RFQ Pipeline Breakdown', 'حالة طلبات التسعير')}
          </h2>
          <div className="mt-5 divide-y divide-slate-100">
            {Object.entries(data.quotesByStatus).map(([statusKey, count]) => {
              const info = STATUS_BADGE[statusKey] || STATUS_BADGE.new;
              return (
                <div key={statusKey} className="flex items-center justify-between py-3 text-sm">
                  <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${info.cls}`}>
                    {pick(info.label, info.labelAr)}
                  </span>
                  <span className="font-mono-tabular font-bold text-slate-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Quote Requests Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="font-display text-base font-bold text-slate-900">
            {pick('Recent Custom Quote Requests', 'أحدث طلبات التسعير')}
          </h2>
          <Link
            to="/admin/quotes"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:underline"
          >
            <span>{pick('Open Full Inbox', 'عرض الكل')}</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">{pick('Ref', 'المرجع')}</th>
                <th className="px-6 py-3 font-semibold">{pick('Client', 'العميل')}</th>
                <th className="px-6 py-3 font-semibold">{pick('Build Requested', 'المشروع المطلوب')}</th>
                <th className="px-6 py-3 font-semibold text-end">{pick('Estimate (QAR)', 'التقدير')}</th>
                <th className="px-6 py-3 font-semibold">{pick('Status', 'الحالة')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentQuotes.map((q) => {
                const badge = STATUS_BADGE[q.status] || STATUS_BADGE.new;
                return (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="font-mono-tabular px-6 py-3 font-semibold text-slate-900">
                      {q.referenceCode}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900">{q.customerName}</div>
                      <div className="text-slate-500">{q.country}</div>
                    </td>
                    <td className="px-6 py-3 text-slate-700">{q.projectTitle}</td>
                    <td className="font-mono-tabular px-6 py-3 text-end font-semibold text-slate-900">
                      {q.estimatedPriceQar > 0 ? `${q.estimatedPriceQar.toLocaleString()} ر.ق` : 'بانتظار التسعير'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block rounded border px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
                        {pick(badge.label, badge.labelAr)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

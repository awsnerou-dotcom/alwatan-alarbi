import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { apiFetch } from '../../lib/api';
import type { UserRecord } from '../../shared/types';

export function AdminUsers() {
  const { data, reloadAdmin } = useAdminData();
  const { user: currentUser } = useAuth();
  const { pick } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    nameAr: '',
    email: '',
    role: 'editor' as UserRecord['role'],
    status: 'active' as UserRecord['status'],
    password: '',
  });

  function openCreate() {
    setEditingId(null);
    setError(null);
    setForm({ name: '', nameAr: '', email: '', role: 'editor', status: 'active', password: '' });
    setModalOpen(true);
  }

  function openEdit(u: UserRecord) {
    setEditingId(u.id);
    setError(null);
    setForm({
      name: u.name,
      nameAr: u.nameAr,
      email: u.email,
      role: u.role,
      status: u.status,
      password: '',
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch(`/api/admin/users/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      await reloadAdmin();
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    await reloadAdmin();
  }

  const users = data?.users || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {pick('Team & Access Accounts', 'فريق العمل وصلاحيات الإدارة')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {pick('Manage operations managers, sales coordinators, and dashboard roles.', 'إدارة حسابات الموظفين والأدوار.')}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 whitespace-nowrap cursor-pointer"
        >
          <Plus size={15} />
          <span>{pick('Invite Team Member', 'إضافة عضو')}</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">{pick('Name & Email', 'الاسم والبريد')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Role', 'الدور')}</th>
                <th className="px-5 py-3 font-semibold">{pick('Status', 'الحالة')}</th>
                <th className="px-5 py-3 font-semibold text-right">{pick('Actions', 'إجراءات')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{pick(u.name, u.nameAr)}</div>
                    <div className="font-mono-tabular text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-5 py-3.5 capitalize text-slate-700">{u.role.replace('_', ' ')}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block rounded border px-2 py-0.5 text-[11px] font-semibold ${
                        u.status === 'active'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.status === 'active' ? pick('Active', 'نشط') : pick('Inactive', 'معطل')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="rounded border border-slate-300 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        {pick('Edit', 'تعديل')}
                      </button>
                      {currentUser?.id !== u.id ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id)}
                          className="rounded p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : null}
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
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {editingId ? pick('Edit Team User', 'تعديل المستخدم') : pick('Create Team User', 'إنشاء مستخدم')}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded p-1 text-slate-500 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Name (EN) *', 'الاسم بالإنجليزية *')}</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Name (AR)', 'الاسم بالعربية')}</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700">{pick('Email *', 'البريد الإلكتروني *')}</label>
                <input
                  type="email"
                  required
                  disabled={Boolean(editingId)}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Role', 'الدور')}</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRecord['role'] })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="operations_manager">Operations Manager</option>
                    <option value="sales_lead">Sales Lead</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">{pick('Status', 'الحالة')}</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as UserRecord['status'] })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700">
                  {editingId
                    ? pick('New Password (leave blank to keep current)', 'كلمة المرور الجديدة (اتركها فارغة للإبقاء)')
                    : pick('Password *', 'كلمة المرور *')}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>
              ) : null}
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
                  {saving ? pick('Saving...', 'جاري الحفظ...') : pick('Save User', 'حفظ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

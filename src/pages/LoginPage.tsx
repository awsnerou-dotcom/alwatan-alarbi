import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { t } = useI18n();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تسجيل الدخول، يرجى التحقق من البيانات');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="relative w-full max-w-md overflow-hidden rounded-[6px] border border-zinc-200 bg-white p-8 shadow-[0_16px_40px_-20px_rgba(9,9,11,0.2)]">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#8A6D3B] via-[#EAD4A5] to-[#8A6D3B]"
        />

        <div className="flex items-center gap-2 text-xs font-semibold text-[#8A6D3B]">
          <Lock size={14} />
          <span>{t('login.eyebrow')}</span>
        </div>
        <h1 className="font-display mt-2 text-2xl font-bold text-[#09090B]">
          {t('login.title')}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">{t('login.subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700">{t('login.email')}</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@alwatan.qa"
              dir="ltr"
              className="mt-1.5 w-full rounded-[3px] border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-[#B5945B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700">{t('login.password')}</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              dir="ltr"
              className="mt-1.5 w-full rounded-[3px] border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-[#B5945B] focus:outline-none"
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
            className="h-11 w-full rounded-[3px] bg-[#09090B] px-5 text-sm font-semibold text-[#EAD4A5] transition-colors hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'جاري التحقق...' : t('login.submit')}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-end border-t border-zinc-200 pt-4 text-xs text-zinc-600">
          <Link to="/" className="font-medium hover:text-[#09090B]">
            العودة إلى الموقع
          </Link>
        </div>
      </div>
    </main>
  );
}

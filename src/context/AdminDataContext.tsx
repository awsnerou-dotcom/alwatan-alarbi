import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from './AuthContext';
import { useSite } from './SiteContext';
import type {
  Category,
  GalleryItem,
  Project,
  QuoteRequest,
  SiteSettings,
  UserRecord,
  VideoItem,
  Visit,
} from '../shared/types';

export interface AdminOverviewData {
  counts: {
    projects: number;
    publishedProjects: number;
    visits: number;
    gallery: number;
    videos: number;
    categories: number;
    users: number;
    quotes: number;
    openQuotes: number;
    pipelineValueQar: number;
  };
  quotesByStatus: Record<QuoteRequest['status'], number>;
  categoryBreakdown: {
    slug: string;
    nameEn: string;
    nameAr: string;
    projectsCount: number;
    quotesCount: number;
  }[];
  recentQuotes: QuoteRequest[];
  projects: Project[];
  visits: Visit[];
  gallery: GalleryItem[];
  videos: VideoItem[];
  categories: Category[];
  users: UserRecord[];
  quotes: QuoteRequest[];
  settings: SiteSettings;
}

interface AdminDataContextValue {
  data: AdminOverviewData | null;
  loading: boolean;
  error: string | null;
  reloadAdmin: () => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { refreshData } = useSite();
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadAdmin = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const res = await apiFetch<AdminOverviewData>('/api/admin/overview');
      setData(res);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, refreshData]);

  useEffect(() => {
    if (user) {
      reloadAdmin();
    } else {
      setLoading(false);
    }
  }, [user, reloadAdmin]);

  return (
    <AdminDataContext.Provider value={{ data, loading, error, reloadAdmin }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used inside AdminDataProvider');
  return ctx;
}

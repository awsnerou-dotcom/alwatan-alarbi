import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import type {
  Category,
  GalleryItem,
  Project,
  SiteSettings,
  VideoItem,
  Visit,
} from '../shared/types';

export interface QuotePreset {
  categorySlug?: string;
  projectTitle?: string;
  lengthMeters?: number;
  capacityLiters?: number;
}

interface SiteContextValue {
  categories: Category[];
  projects: Project[];
  visits: Visit[];
  gallery: GalleryItem[];
  videos: VideoItem[];
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  quoteDrawerOpen: boolean;
  quotePreset: QuotePreset | null;
  openQuoteDrawer: (preset?: QuotePreset) => void;
  closeQuoteDrawer: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteDrawerOpen, setQuoteDrawerOpen] = useState(false);
  const [quotePreset, setQuotePreset] = useState<QuotePreset | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const data = await apiFetch<{
        categories: Category[];
        projects: Project[];
        visits: Visit[];
        gallery: GalleryItem[];
        videos: VideoItem[];
        settings: SiteSettings;
      }>('/api/bootstrap');
      setCategories(data.categories);
      setProjects(data.projects);
      setVisits(data.visits);
      setGallery(data.gallery);
      setVideos(data.videos);
      setSettings(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load factory catalog');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const openQuoteDrawer = useCallback((preset?: QuotePreset) => {
    setQuotePreset(preset || null);
    setQuoteDrawerOpen(true);
  }, []);

  const closeQuoteDrawer = useCallback(() => {
    setQuoteDrawerOpen(false);
  }, []);

  return (
    <SiteContext.Provider
      value={{
        categories,
        projects,
        visits,
        gallery,
        videos,
        settings,
        loading,
        error,
        refreshData,
        quoteDrawerOpen,
        quotePreset,
        openQuoteDrawer,
        closeQuoteDrawer,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside SiteProvider');
  return ctx;
}

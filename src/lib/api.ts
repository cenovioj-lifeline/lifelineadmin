const BASE = '/api';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface PipelineStatus {
  episodes: { total: number; complete: number };
  persons: number;
  extractions: { total: number; by_status: Record<string, number>; today: number };
  last_episode: { title: string; air_date: string; created_at: string } | null;
  last_run: { file?: string; date?: string; content?: string; source?: string; last_lines?: string[] } | null;
}

export interface DailySummary {
  date: string;
  extractions: number;
  available: number;
  rejected: number;
  episodes: number;
}

export interface Episode {
  id: string;
  title: string;
  air_date: string;
  processing_status: string;
  created_at: string;
  podcast_name: string;
  extraction_count: number;
  available_count: number;
}

export interface EpisodeDetail {
  episode: Record<string, any>;
  extractions: ExtractionItem[];
  transcript_available: boolean;
}

export interface Person {
  id: string;
  name: string;
  lp_profile_id: string | null;
  total_extractions: number;
  available: number;
  used: number;
  rejected: number;
}

export interface ExtractionItem {
  id: string;
  title: string;
  extraction_type: string;
  quality_score: number;
  status: string;
  content: string;
  time_period: string | null;
  emotional_tone: string | null;
  created_at: string;
  person_names: string | null;
  episode_title?: string;
  used_in_lifeline?: number;
  lifeline_entry_id?: string;
}

export interface ExtractionListResponse {
  items: ExtractionItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface FunnelData {
  person: string;
  funnel: { stage: string; count: number | string }[];
  quality_distribution: Record<string, number>;
  extraction_types: { extraction_type: string; cnt: number }[];
  passing_samples: ExtractionItem[];
  filtered_samples: ExtractionItem[];
}

export interface MaintenanceLogEntry {
  id: string;
  run_date: string;
  action: string;
  collection_id: string;
  collection_slug: string;
  lifeline_id: string;
  lifeline_title: string;
  entry_id: string;
  entry_title: string;
  person_name: string;
  extraction_id: string;
  extraction_type: string;
  quality_score: number;
  notes: string;
  created_at: string;
}

export interface DailyReport {
  file: string;
  date: string;
  size: number;
}

export const api = {
  status: () => fetchJson<PipelineStatus>('/status'),
  dailySummary: (days = 7) => fetchJson<DailySummary[]>(`/daily-summary?days=${days}`),
  episodes: (days = 7) => fetchJson<Episode[]>(`/episodes?days=${days}`),
  episodeDetail: (id: string) => fetchJson<EpisodeDetail>(`/episode/${id}`),
  persons: () => fetchJson<Person[]>('/persons'),
  extractions: (params: Record<string, string | number>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, String(v)); });
    return fetchJson<ExtractionListResponse>(`/extractions?${qs}`);
  },
  extractionDetail: (id: string) => fetchJson<any>(`/extraction/${id}`),
  maintenanceLog: (days = 7) => fetchJson<MaintenanceLogEntry[]>(`/maintenance-log?days=${days}`),
  filteringFunnel: (person: string) => fetchJson<FunnelData>(`/filtering-funnel?person=${encodeURIComponent(person)}`),
  extractionTypes: () => fetchJson<{ extraction_type: string; cnt: number; avg_quality: number }[]>('/extraction-types'),
  dailyReports: (limit = 7) => fetchJson<DailyReport[]>(`/daily-reports?limit=${limit}`),
  dailyReport: (date: string) => fetchJson<{ date: string; content: string }>(`/daily-report/${date}`),
};

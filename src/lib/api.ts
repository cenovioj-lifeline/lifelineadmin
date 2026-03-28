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
  duration_seconds: number | null;
  air_date_iso: string;
  podcast_name: string;
  extraction_count: number;
  available_count: number;
  used_count: number;
  rejected_count: number;
}

export interface Podcast {
  id: string;
  name: string;
  episode_count: number;
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

export interface Collection {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export interface ProfileImage {
  id: string;
  name: string;
  slug: string;
  subject_type: string;
  image_url: string | null;
  image_source: 'media_asset' | 'legacy_url' | 'none';
  image_query: string | null;
  has_image: boolean;
  has_custom_crop: boolean;
  has_card_crop: boolean;
  media_asset: {
    id: string;
    url: string;
    position_x: number;
    position_y: number;
    scale: number;
    card_position_x: number;
    card_position_y: number;
    card_scale: number;
    width: number | null;
    height: number | null;
  } | null;
}

export interface CollectionImagesResponse {
  collection: { id: string; title: string; slug: string };
  profiles: ProfileImage[];
  stats: {
    total: number;
    with_image: number;
    missing_image: number;
    with_crop: number;
    with_card_crop: number;
  };
}

export interface ImageStats {
  total_profiles: number;
  with_media_asset: number;
  legacy_url_only: number;
  no_image: number;
}

export interface CheckpointPhase {
  name: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
}

export interface CheckpointData {
  exists: boolean;
  collection_slug?: string;
  status?: string;
  updated_at?: string;
  lifelines?: { planned: number; completed: number; failed: number };
  profiles?: { planned: number; completed: number; failed: number };
  mer?: Record<string, any>;
  quotes?: Record<string, any>;
  phases?: CheckpointPhase[];
  error?: string;
}

export interface CheckpointSummary {
  collection_slug: string;
  status: string;
  updated_at: string;
  lifelines_done: number;
  lifelines_planned: number;
}

export interface Operation {
  id: string;
  operation_type: string;
  collection_id: string | null;
  collection_slug: string | null;
  config: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  result: Record<string, any> | null;
  error: string | null;
  created_by: string;
  created_at: string;
}

export interface OperationListResponse {
  items: Operation[];
  total: number;
  limit: number;
  offset: number;
}

export interface OperationType {
  label: string;
  category: string;
  description: string;
  form_fields: string[];
}

export const api = {
  podcasts: () => fetchJson<Podcast[]>('/podcasts'),
  status: () => fetchJson<PipelineStatus>('/status'),
  dailySummary: (days = 7) => fetchJson<DailySummary[]>(`/daily-summary?days=${days}`),
  episodes: () => fetchJson<Episode[]>('/episodes'),
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
  collections: () => fetchJson<Collection[]>('/collections'),
  collectionImages: (slug: string) => fetchJson<CollectionImagesResponse>(`/collection-images?collection_slug=${encodeURIComponent(slug)}`),
  imageStats: () => fetchJson<ImageStats>('/image-stats'),

  // Checkpoints (live progress)
  checkpoint: (slug: string) => fetchJson<CheckpointData>(`/checkpoint/${encodeURIComponent(slug)}`),
  checkpoints: () => fetchJson<CheckpointSummary[]>('/checkpoints'),

  // Operations
  operationTypes: () => fetchJson<Record<string, OperationType>>('/operation-types'),
  operations: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, String(v)); });
    return fetchJson<OperationListResponse>(`/operations?${qs}`);
  },
  operationDetail: (id: string) => fetchJson<Operation>(`/operations/${id}`),
  createOperation: async (data: { operation_type: string; collection_slug?: string; config: Record<string, any> }) => {
    const res = await fetch(`${BASE}/operations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json() as Promise<Operation>;
  },
  pendingCount: () => fetchJson<{ count: number }>('/operations/pending/count'),
};

import { useEffect, useState, useMemo } from 'react';
import { api, Episode, EpisodeDetail, Podcast } from '../lib/api';
import { ChevronRight, Radio, ArrowLeft, Clock, ArrowUpDown } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  personal_story: 'var(--green)',
  quote: 'var(--navy-light)',
  opinion: 'var(--orange)',
  biographical_fact: 'var(--navy)',
  relationship: 'var(--purple)',
  career_event: 'var(--red)',
  personality_trait: '#8b5cf6',
  humor: '#c77d00',
  conflict: 'var(--red-light)',
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(raw: string): string {
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw.slice(0, 16);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return raw.slice(0, 16);
  }
}

export default function Episodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [selected, setSelected] = useState<EpisodeDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedPodcasts, setSelectedPodcasts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.podcasts().then(setPodcasts);
    setLoading(true);
    api.episodes().then(setEpisodes).finally(() => setLoading(false));
  }, []);

  const togglePodcast = (name: string) => {
    setSelectedPodcasts(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = episodes;
    if (selectedPodcasts.size > 0) {
      list = list.filter(ep => selectedPodcasts.has(ep.podcast_name));
    }
    list = [...list].sort((a, b) => {
      const da = a.air_date_iso || '';
      const db = b.air_date_iso || '';
      return sortOrder === 'newest' ? db.localeCompare(da) : da.localeCompare(db);
    });
    return list;
  }, [episodes, selectedPodcasts, sortOrder]);

  const openEpisode = (id: string) => {
    setSelectedId(id);
    api.episodeDetail(id).then(setSelected);
  };

  // Detail view
  if (selected && selectedId) {
    return (
      <div className="space-y-4">
        <button onClick={() => { setSelected(null); setSelectedId(null); }}
          className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--secondary)] cursor-pointer">
          <ArrowLeft size={16} /> Back to episodes
        </button>

        <div className="bg-white rounded-lg border border-[var(--border)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--cyan)] mb-1">
            {selected.episode.podcast_name}
          </div>
          <h2 className="text-lg font-bold mb-2">{selected.episode.title}</h2>
          <div className="flex gap-4 text-xs text-[var(--text-muted)]">
            <span>Aired: {formatDate(selected.episode.air_date)}</span>
            <span>Duration: {formatDuration(selected.episode.duration_seconds)}</span>
            <span>Status: {selected.episode.processing_status}</span>
            <span>Extractions: {selected.extractions.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[var(--border)]">
          <div className="px-5 py-3 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold">Extractions ({selected.extractions.length})</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {selected.extractions.map((ext) => (
              <div key={ext.id} className="px-5 py-3 hover:bg-[var(--bg-soft)]">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-10 rounded-full mt-0.5" style={{ backgroundColor: TYPE_COLORS[ext.extraction_type] || 'var(--border-dark)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: (TYPE_COLORS[ext.extraction_type] || '#888') + '15', color: TYPE_COLORS[ext.extraction_type] || '#888' }}>
                        {ext.extraction_type}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        Quality: {(ext.quality_score * 100).toFixed(0)}%
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${ext.status === 'available' ? 'bg-green-50 text-green-700' : ext.status === 'used' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                        {ext.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{ext.title}</p>
                    {ext.person_names && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">About: {ext.person_names}</p>
                    )}
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{ext.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-start gap-6">
          {/* Podcast filter */}
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Podcasts</label>
            <div className="flex flex-wrap gap-2">
              {podcasts.map(p => {
                const isSelected = selectedPodcasts.has(p.name);
                const allClear = selectedPodcasts.size === 0;
                return (
                  <button key={p.id} onClick={() => togglePodcast(p.name)}
                    className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--secondary)] text-white border-[var(--secondary)]'
                        : allClear
                          ? 'border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--border-dark)]'
                          : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-dark)]'
                    }`}>
                    {p.name}
                    <span className="ml-1.5 opacity-60">{p.episode_count}</span>
                  </button>
                );
              })}
              {selectedPodcasts.size > 0 && (
                <button onClick={() => setSelectedPodcasts(new Set())}
                  className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Sort */}
          <div className="shrink-0">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Air Date</label>
            <button onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg cursor-pointer hover:border-[var(--border-dark)]">
              <ArrowUpDown size={12} />
              {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-[var(--text-muted)]">
        {filtered.length} episode{filtered.length !== 1 ? 's' : ''}
        {selectedPodcasts.size > 0 && ` (filtered from ${episodes.length})`}
      </div>

      {/* Episode List */}
      {loading ? (
        <div className="text-sm text-[var(--text-muted)] py-10 text-center">Loading episodes...</div>
      ) : (
        <div className="bg-white rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
          {filtered.map((ep) => (
            <button key={ep.id} onClick={() => openEpisode(ep.id)}
              className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-[var(--bg-soft)] text-left cursor-pointer">
              <div className="w-10 h-10 rounded bg-[var(--secondary-dim)] flex items-center justify-center shrink-0">
                <Radio size={16} className="text-[var(--secondary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-[var(--cyan)]">{ep.podcast_name}</span>
                  {ep.duration_seconds && (
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-0.5">
                      <Clock size={10} /> {formatDuration(ep.duration_seconds)}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{ep.title}</p>
                <div className="flex gap-3 text-xs text-[var(--text-muted)] mt-0.5">
                  <span>Aired {formatDate(ep.air_date_iso || ep.air_date)}</span>
                  <span>{ep.extraction_count} extractions</span>
                  <span className="text-[var(--accent)]" title="Ready to become lifeline entries">{ep.available_count} unused</span>
                  {ep.used_count > 0 && <span className="text-[var(--cyan)]">{ep.used_count} published</span>}
                  {ep.rejected_count > 0 && <span className="text-[var(--text-muted)]">{ep.rejected_count} rejected</span>}
                </div>
              </div>
              <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">
              {episodes.length === 0 ? 'No episodes found.' : 'No episodes match the selected filters.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

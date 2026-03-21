import { useEffect, useState } from 'react';
import { api, Episode, EpisodeDetail } from '../lib/api';
import { ChevronRight, Radio, ArrowLeft } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  personal_story: 'var(--accent)',
  quote: 'var(--cyan)',
  opinion: 'var(--orange)',
  biographical_fact: 'var(--secondary)',
  relationship: 'var(--purple)',
  career_event: '#e11d48',
  personality_trait: '#8b5cf6',
  humor: '#f59e0b',
  conflict: '#ef4444',
};

export default function Episodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selected, setSelected] = useState<EpisodeDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.episodes(days).then(setEpisodes).finally(() => setLoading(false));
  }, [days]);

  const openEpisode = (id: string) => {
    setSelectedId(id);
    api.episodeDetail(id).then(setSelected);
  };

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
            <span>Aired: {selected.episode.air_date}</span>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Recent Episodes
        </h2>
        <div className="flex gap-2">
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs rounded-full border cursor-pointer ${days === d ? 'bg-[var(--secondary)] text-white border-[var(--secondary)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-dark)]'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-[var(--text-muted)] py-10 text-center">Loading episodes...</div>
      ) : (
        <div className="bg-white rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
          {episodes.map((ep) => (
            <button key={ep.id} onClick={() => openEpisode(ep.id)}
              className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-[var(--bg-soft)] text-left cursor-pointer">
              <div className="w-10 h-10 rounded bg-[var(--secondary-dim)] flex items-center justify-center shrink-0">
                <Radio size={16} className="text-[var(--secondary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[var(--cyan)] mb-0.5">{ep.podcast_name}</div>
                <p className="text-sm font-medium truncate">{ep.title}</p>
                <div className="flex gap-3 text-xs text-[var(--text-muted)] mt-0.5">
                  <span>{ep.air_date}</span>
                  <span>{ep.extraction_count} extractions</span>
                  <span className="text-[var(--accent)]">{ep.available_count} available</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
            </button>
          ))}
          {episodes.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">No episodes in the last {days} days.</div>
          )}
        </div>
      )}
    </div>
  );
}

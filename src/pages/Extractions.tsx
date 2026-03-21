import { useEffect, useState } from 'react';
import { api, ExtractionItem, ExtractionListResponse } from '../lib/api';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

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

const STATUS_OPTIONS = ['', 'available', 'used', 'rejected'];
const TYPE_OPTIONS = ['', 'personal_story', 'quote', 'opinion', 'biographical_fact', 'relationship', 'career_event', 'personality_trait', 'humor', 'conflict'];

export default function Extractions() {
  const [data, setData] = useState<ExtractionListResponse | null>(null);
  const [person, setPerson] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [offset, setOffset] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const limit = 30;

  const doSearch = (newOffset = 0) => {
    setLoading(true);
    setOffset(newOffset);
    api.extractions({ person, status, extraction_type: type, limit, offset: newOffset })
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => { doSearch(); }, []);

  return (
    <div className="flex gap-5">
      {/* Left Sidebar — Filters */}
      <div className="w-[280px] shrink-0">
        <div className="bg-white rounded-lg border border-[var(--border)] p-4 sticky top-[60px] space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Filters</h3>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Person</label>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
              <input
                value={person} onChange={e => setPerson(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                placeholder="Scott Galloway"
                className="w-full pl-8 pr-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--secondary)]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none">
              <option value="">All</option>
              {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none">
              <option value="">All</option>
              {TYPE_OPTIONS.filter(Boolean).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <button onClick={() => doSearch()}
            className="w-full py-2 bg-[var(--secondary)] text-white text-sm font-medium rounded-lg hover:opacity-90 cursor-pointer">
            Search
          </button>

          {data && (
            <div className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
              {data.total.toLocaleString()} results
            </div>
          )}
        </div>
      </div>

      {/* Right Content — Results */}
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="text-sm text-[var(--text-muted)] py-10 text-center">Searching...</div>
        ) : data ? (
          <div className="space-y-3">
            <div className="bg-white rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
              {data.items.map(ext => (
                <div key={ext.id}
                  className={`px-5 py-3 hover:bg-[var(--bg-soft)] cursor-pointer ${expanded === ext.id ? 'bg-[var(--bg-soft)]' : ''}`}
                  onClick={() => setExpanded(expanded === ext.id ? null : ext.id)}>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-8 rounded-full mt-0.5 shrink-0"
                      style={{ backgroundColor: TYPE_COLORS[ext.extraction_type] || 'var(--border-dark)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: (TYPE_COLORS[ext.extraction_type] || '#888') + '15', color: TYPE_COLORS[ext.extraction_type] || '#888' }}>
                          {ext.extraction_type?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          q:{(ext.quality_score * 100).toFixed(0)}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${ext.status === 'available' ? 'bg-green-50 text-green-700' : ext.status === 'used' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                          {ext.status}
                        </span>
                        {ext.person_names && (
                          <span className="text-xs text-[var(--text-muted)]">{ext.person_names}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{ext.title}</p>
                      {ext.episode_title && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">From: {ext.episode_title}</p>
                      )}
                      {expanded === ext.id && (
                        <div className="mt-3 p-3 bg-white border border-[var(--border)] rounded-lg">
                          <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{ext.content}</p>
                          <div className="flex gap-4 mt-2 text-xs text-[var(--text-muted)]">
                            {ext.time_period && <span>Period: {ext.time_period}</span>}
                            {ext.emotional_tone && <span>Tone: {ext.emotional_tone}</span>}
                            <span>Created: {ext.created_at?.slice(0, 10)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {data.items.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">No extractions found with these filters.</div>
              )}
            </div>

            {/* Pagination */}
            {data.total > limit && (
              <div className="flex items-center justify-between">
                <button onClick={() => doSearch(Math.max(0, offset - limit))} disabled={offset === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg disabled:opacity-30 cursor-pointer">
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="text-xs text-[var(--text-muted)]">
                  {offset + 1}–{Math.min(offset + limit, data.total)} of {data.total.toLocaleString()}
                </span>
                <button onClick={() => doSearch(offset + limit)} disabled={offset + limit >= data.total}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg disabled:opacity-30 cursor-pointer">
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

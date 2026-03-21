import { useState } from 'react';
import { api, FunnelData } from '../lib/api';
import { Search, ArrowDown } from 'lucide-react';

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

export default function FilteringFunnel() {
  const [person, setPerson] = useState('Scott Galloway');
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTab, setShowTab] = useState<'passing' | 'filtered'>('filtered');

  const doSearch = () => {
    if (!person.trim()) return;
    setLoading(true);
    api.filteringFunnel(person).then(setData).finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Filter Analysis — Where do extractions get lost?
        </h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
            <input value={person} onChange={e => setPerson(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Enter person name..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--secondary)]"
            />
          </div>
          <button onClick={doSearch}
            className="px-5 py-2 bg-[var(--secondary)] text-white text-sm font-medium rounded-lg hover:opacity-90 cursor-pointer">
            Analyze
          </button>
        </div>
      </div>

      {loading && <div className="text-sm text-[var(--text-muted)] py-10 text-center">Analyzing filtering stages...</div>}

      {data && !loading && (
        <>
          {/* Funnel Visualization */}
          <div className="bg-white rounded-lg border border-[var(--border)] p-5">
            <h3 className="text-sm font-semibold mb-4">Pipeline Funnel for {data.person}</h3>
            <div className="space-y-0">
              {data.funnel.map((stage, i) => {
                const count = typeof stage.count === 'string' ? parseInt(stage.count.replace('~', '')) : stage.count;
                const maxCount = typeof data.funnel[0].count === 'string' ? parseInt(String(data.funnel[0].count).replace('~', '')) : data.funnel[0].count;
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const isEstimate = typeof stage.count === 'string' && String(stage.count).startsWith('~');
                const prevCount = i > 0 ? (typeof data.funnel[i - 1].count === 'string' ? parseInt(String(data.funnel[i - 1].count).replace('~', '')) : data.funnel[i - 1].count) : count;
                const loss = i > 0 ? prevCount - count : 0;

                return (
                  <div key={stage.stage}>
                    {i > 0 && (
                      <div className="flex items-center gap-2 py-1.5 pl-4">
                        <ArrowDown size={12} className="text-[var(--text-muted)]" />
                        {loss > 0 && (
                          <span className="text-xs text-red-500 font-mono">-{loss} filtered</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="w-[200px] text-xs text-[var(--text-secondary)] text-right shrink-0">
                        {stage.stage}
                      </div>
                      <div className="flex-1 h-8 bg-[var(--bg-soft)] rounded overflow-hidden">
                        <div
                          className="h-full rounded transition-all duration-500 flex items-center px-3"
                          style={{
                            width: `${Math.max(pct, 2)}%`,
                            backgroundColor: i === data.funnel.length - 1 ? 'var(--accent)' : 'var(--secondary)',
                            opacity: 0.15 + (0.85 * pct / 100),
                          }}
                        >
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            {isEstimate ? '~' : ''}{count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side-by-side: Types + Quality */}
          <div className="grid grid-cols-2 gap-4">
            {/* Extraction Types */}
            <div className="bg-white rounded-lg border border-[var(--border)] p-5">
              <h3 className="text-sm font-semibold mb-3">Extraction Types (subject-only)</h3>
              <div className="space-y-2">
                {data.extraction_types.map(t => (
                  <div key={t.extraction_type} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[t.extraction_type] || '#888' }} />
                    <span className="text-xs flex-1">{t.extraction_type?.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">{t.cnt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Distribution */}
            <div className="bg-white rounded-lg border border-[var(--border)] p-5">
              <h3 className="text-sm font-semibold mb-3">Quality Distribution (subject-only)</h3>
              <div className="space-y-2">
                {Object.entries(data.quality_distribution).map(([label, count]) => {
                  const colors: Record<string, string> = {
                    premium: 'var(--accent)',
                    high: 'var(--cyan)',
                    good: 'var(--secondary)',
                    acceptable: 'var(--orange)',
                    low: '#ef4444',
                  };
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[label] || '#888' }} />
                      <span className="text-xs flex-1 capitalize">{label}</span>
                      <span className="text-xs font-mono text-[var(--text-muted)]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sample Extractions */}
          <div className="bg-white rounded-lg border border-[var(--border)]">
            <div className="flex border-b border-[var(--border)]">
              <button onClick={() => setShowTab('filtered')}
                className={`flex-1 px-5 py-3 text-sm font-medium border-b-2 cursor-pointer ${showTab === 'filtered' ? 'border-[var(--orange)] text-[var(--orange)]' : 'border-transparent text-[var(--text-secondary)]'}`}>
                Filtered Out (non-subject) — what you're missing
              </button>
              <button onClick={() => setShowTab('passing')}
                className={`flex-1 px-5 py-3 text-sm font-medium border-b-2 cursor-pointer ${showTab === 'passing' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)]'}`}>
                Passing (subject) — what gets through
              </button>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {(showTab === 'passing' ? data.passing_samples : data.filtered_samples).map(ext => (
                <div key={ext.id} className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: (TYPE_COLORS[ext.extraction_type] || '#888') + '15', color: TYPE_COLORS[ext.extraction_type] || '#888' }}>
                      {ext.extraction_type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      q:{(ext.quality_score * 100).toFixed(0)}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{ext.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-3">{ext.content}</p>
                </div>
              ))}
              {(showTab === 'passing' ? data.passing_samples : data.filtered_samples).length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">No samples available.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

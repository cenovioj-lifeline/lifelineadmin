import { useEffect, useState } from 'react';
import { api, ReviewEntry, ReviewResponse, ReviewSourceContext } from '../lib/api';
import { ExternalLink, ChevronDown, ChevronRight, AlertTriangle, User, Bookmark, Calendar, Star, Hash, Radio, FileCheck } from 'lucide-react';

function formatDate(d: string | null): string {
  if (!d) return '—';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return d; }
}

function scoreColor(score: number | null): string {
  if (score === null || score === undefined) return 'bg-gray-100 text-gray-500';
  if (score >= 6) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (score >= 3) return 'bg-blue-50 text-blue-700 border border-blue-200';
  if (score >= 0) return 'bg-gray-100 text-gray-600 border border-gray-200';
  if (score >= -3) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-red-50 text-red-700 border border-red-200';
}

function qualityBadge(q: number | null): string {
  if (q === null || q === undefined) return '';
  if (q >= 0.9) return 'Excellent';
  if (q >= 0.8) return 'Good';
  if (q >= 0.7) return 'Fair';
  return 'Low';
}

function extractionTypeLabel(t: string | null): { label: string; color: string } {
  const types: Record<string, { label: string; color: string }> = {
    personal_story: { label: 'Personal Story', color: 'bg-purple-50 text-purple-700' },
    career_event: { label: 'Career Event', color: 'bg-blue-50 text-blue-700' },
    opinion: { label: 'Opinion', color: 'bg-amber-50 text-amber-700' },
    quote: { label: 'Quote', color: 'bg-emerald-50 text-emerald-700' },
    biographical_fact: { label: 'Bio Fact', color: 'bg-cyan-50 text-cyan-700' },
    personality_trait: { label: 'Personality', color: 'bg-pink-50 text-pink-700' },
    vulnerability: { label: 'Vulnerability', color: 'bg-rose-50 text-rose-700' },
    relationship: { label: 'Relationship', color: 'bg-indigo-50 text-indigo-700' },
    humor: { label: 'Humor', color: 'bg-yellow-50 text-yellow-700' },
    conflict: { label: 'Conflict', color: 'bg-orange-50 text-orange-700' },
  };
  if (!t) return { label: 'Unknown', color: 'bg-gray-50 text-gray-500' };
  return types[t] || { label: t.replace(/_/g, ' '), color: 'bg-gray-50 text-gray-500' };
}

function EntryCard({ entry }: { entry: ReviewEntry }) {
  const [expanded, setExpanded] = useState(false);
  const extType = extractionTypeLabel(entry.extraction_type);

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden hover:border-[var(--border-dark)] transition-colors">
      {/* Score strip */}
      <div className="flex">
        {/* Score badge - left strip */}
        <div className={`w-16 shrink-0 flex flex-col items-center justify-center py-4 ${
          entry.score !== null && entry.score >= 3 ? 'bg-emerald-50' :
          entry.score !== null && entry.score >= 0 ? 'bg-gray-50' :
          entry.score !== null && entry.score < 0 ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          <span className={`text-xl font-bold ${
            entry.score !== null && entry.score >= 3 ? 'text-emerald-600' :
            entry.score !== null && entry.score >= 0 ? 'text-gray-500' :
            entry.score !== null && entry.score < 0 ? 'text-red-600' : 'text-gray-400'
          }`}>
            {entry.score !== null ? (entry.score > 0 ? `+${entry.score}` : entry.score) : '—'}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5">score</span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 p-4">
          {/* Title row */}
          <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
            {entry.title}
          </h3>

          {/* Summary */}
          {entry.summary && (
            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
              {expanded ? entry.summary : (
                entry.summary.length > 300
                  ? entry.summary.slice(0, 280) + '...'
                  : entry.summary
              )}
            </p>
          )}

          {/* Expand/collapse for long summaries (only if truncation saves meaningful space) */}
          {entry.summary && entry.summary.length > 300 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-[var(--secondary)] hover:underline mt-1 cursor-pointer flex items-center gap-1"
            >
              {expanded ? <><ChevronDown size={12} /> Less</> : <><ChevronRight size={12} /> More</>}
            </button>
          )}

          {/* Details (if expanded and available) */}
          {expanded && entry.details && (
            <div className="mt-3 p-3 bg-[var(--bg-soft)] rounded-lg text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
              {entry.details}
            </div>
          )}

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Person */}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--secondary)] bg-[var(--navy-dim)] px-2 py-0.5 rounded-full">
              <User size={11} />
              {entry.person_name}
            </span>

            {/* Lifeline */}
            {entry.lifeline_title && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] bg-[var(--bg-soft)] px-2 py-0.5 rounded-full">
                <Bookmark size={11} />
                {entry.lifeline_title}
              </span>
            )}

            {/* Date */}
            {entry.occurred_on && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Calendar size={11} />
                {formatDate(entry.occurred_on)}
                {entry.date_precision && entry.date_precision !== 'exact' && (
                  <span className="text-[10px] text-amber-500">~{entry.date_precision}</span>
                )}
              </span>
            )}
          </div>

          {/* Pipeline metadata bar */}
          <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-[var(--border)]">
            {/* Extraction type */}
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${extType.color}`}>
              {extType.label}
            </span>

            {/* Quality score */}
            {entry.quality_score != null && (
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <Star size={10} className="text-amber-400" />
                {(entry.quality_score * 100).toFixed(0)}% ({qualityBadge(entry.quality_score)})
              </span>
            )}

            {/* Sentiment */}
            {entry.sentiment && entry.sentiment !== 'neutral' && (
              <span className="text-[11px] text-[var(--text-muted)]">
                {entry.sentiment}
              </span>
            )}

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <Hash size={10} />
                {entry.tags.join(', ')}
              </span>
            )}

            {/* View on site */}
            {entry.collection_slug && (
              <a
                href={`https://lifelinepublic.com/public/collections/${entry.collection_slug}`}
                target="_blank" rel="noopener"
                className="ml-auto text-[var(--text-muted)] hover:text-[var(--secondary)] transition-colors"
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>

          {/* Warning: entry not found */}
          {!entry.entry_exists && (
            <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
              <AlertTriangle size={13} />
              Entry removed from database (possibly by Eyeball QA)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SourceBanner({ ctx }: { ctx: ReviewSourceContext }) {
  const hasDateRange = ctx.episode_date_start && ctx.episode_date_end;
  const sameDate = ctx.episode_date_start === ctx.episode_date_end;

  return (
    <div className="bg-[var(--navy-dim)] border border-[var(--secondary)] border-opacity-15 rounded-lg px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
      <span className="text-xs font-semibold text-[var(--secondary)] uppercase tracking-wider">Source</span>

      {ctx.episodes_processed > 0 && (
        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Radio size={12} className="text-[var(--secondary)]" />
          {ctx.episodes_processed} {ctx.episodes_processed === 1 ? 'episode' : 'episodes'}
        </span>
      )}

      {hasDateRange && (
        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Calendar size={12} className="text-[var(--secondary)]" />
          {sameDate
            ? formatDate(ctx.episode_date_start)
            : `${formatDate(ctx.episode_date_start)} – ${formatDate(ctx.episode_date_end)}`
          }
        </span>
      )}

      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <FileCheck size={12} className="text-[var(--accent)]" />
        {ctx.entries_published} published
      </span>
    </div>
  );
}

function StatsBar({ stats }: { stats: ReviewResponse['stats'] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Total */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5">Entries Published</div>
      </div>

      {/* By Person */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="text-2xl font-bold text-[var(--text-primary)]">{Object.keys(stats.by_person).length}</div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5">People</div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {Object.entries(stats.by_person)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => (
              <span key={name} className="text-[11px] bg-[var(--navy-dim)] text-[var(--secondary)] px-2 py-0.5 rounded-full">
                {name.split(' ')[0]} ({count})
              </span>
            ))}
        </div>
      </div>

      {/* By Lifeline */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="text-2xl font-bold text-[var(--text-primary)]">{Object.keys(stats.by_lifeline).length}</div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5">Lifelines Touched</div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {Object.entries(stats.by_lifeline)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([name, count]) => (
              <span key={name} className="text-[11px] bg-[var(--bg-soft)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full truncate max-w-[180px]">
                {name} ({count})
              </span>
            ))}
          {Object.keys(stats.by_lifeline).length > 6 && (
            <span className="text-[11px] text-[var(--text-muted)]">
              +{Object.keys(stats.by_lifeline).length - 6} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

type GroupBy = 'none' | 'person' | 'lifeline';

export default function DailyReview() {
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(1);
  const [customDate, setCustomDate] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('person');

  useEffect(() => {
    setLoading(true);
    const params = customDate ? { date: customDate } : { days };
    api.reviewEntries(params).then(setData).finally(() => setLoading(false));
  }, [days, customDate]);

  if (loading) {
    return <div className="text-sm text-[var(--text-muted)] py-10 text-center">Loading review entries...</div>;
  }

  const entries = data?.entries || [];
  const stats = data?.stats || { total: 0, by_person: {}, by_lifeline: {} };

  // Group entries
  function groupEntries(): { label: string; entries: ReviewEntry[] }[] {
    if (groupBy === 'none') {
      return [{ label: '', entries }];
    }
    const groups: Record<string, ReviewEntry[]> = {};
    for (const e of entries) {
      const key = groupBy === 'person'
        ? (e.person_name || 'Unknown')
        : (e.lifeline_title || 'Unknown');
      (groups[key] = groups[key] || []).push(e);
    }
    return Object.entries(groups)
      .sort(([, a], [, b]) => b.length - a.length)
      .map(([label, entries]) => ({ label, entries }));
  }

  const grouped = groupEntries();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Batch Review
        </h2>

        <div className="flex items-center gap-3">
          {/* Date range buttons */}
          <div className="flex gap-1.5">
            {[
              { label: 'Today', value: 1 },
              { label: '3d', value: 3 },
              { label: '7d', value: 7 },
              { label: '30d', value: 30 },
            ].map(d => (
              <button
                key={d.value}
                onClick={() => { setDays(d.value); setCustomDate(''); }}
                className={`px-3 py-1 text-xs rounded-full border cursor-pointer transition-colors ${
                  !customDate && days === d.value
                    ? 'bg-[var(--secondary)] text-white border-[var(--secondary)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-soft)]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Custom date */}
          <input
            type="date"
            value={customDate}
            onChange={e => setCustomDate(e.target.value)}
            className="text-xs border border-[var(--border)] rounded-md px-2 py-1 text-[var(--text-secondary)]"
          />

          {/* Separator */}
          <div className="w-px h-5 bg-[var(--border)]" />

          {/* Group by */}
          <div className="flex gap-1.5">
            {(['person', 'lifeline', 'none'] as GroupBy[]).map(g => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`px-3 py-1 text-xs rounded-full border cursor-pointer transition-colors ${
                  groupBy === g
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-soft)]'
                }`}
              >
                {g === 'none' ? 'Flat' : `By ${g}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Source context */}
      {data?.source_context && stats.total > 0 && <SourceBanner ctx={data.source_context} />}

      {/* Stats */}
      {stats.total > 0 && <StatsBar stats={stats} />}

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="bg-white rounded-lg border border-[var(--border)] p-10 text-center">
          <p className="text-sm text-[var(--text-muted)]">No entries published in this period.</p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Run the maintenance engine to generate new content, then review it here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.label || 'all'}>
              {group.label && (
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-2">
                  {group.label}
                  <span className="text-[10px] font-normal bg-[var(--bg-soft)] px-2 py-0.5 rounded-full">
                    {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
                  </span>
                </h3>
              )}
              <div className="space-y-3">
                {group.entries.map(entry => (
                  <EntryCard key={entry.log_id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

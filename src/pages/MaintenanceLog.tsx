import { useEffect, useState } from 'react';
import { api, MaintenanceLogEntry } from '../lib/api';
import { ExternalLink } from 'lucide-react';

export default function MaintenanceLog() {
  const [logs, setLogs] = useState<MaintenanceLogEntry[]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.maintenanceLog(days).then(data => {
      setLogs(Array.isArray(data) ? data : []);
    }).finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div className="text-sm text-[var(--text-muted)] py-10 text-center">Loading maintenance log...</div>;

  const grouped = logs.reduce<Record<string, MaintenanceLogEntry[]>>((acc, log) => {
    const day = log.run_date || log.created_at?.slice(0, 10) || 'Unknown';
    (acc[day] = acc[day] || []).push(log);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Published Entries ({logs.length})
        </h2>
        <div className="flex gap-2">
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs rounded-full border cursor-pointer ${days === d ? 'bg-[var(--secondary)] text-white border-[var(--secondary)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-lg border border-[var(--border)] p-10 text-center">
          <p className="text-sm text-[var(--text-muted)]">No maintenance activity in the last {days} days.</p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Run the maintenance engine to see entries here:
            <code className="bg-[var(--bg-soft)] px-1.5 py-0.5 rounded ml-1">python scripts/run_maintenance.py --collection prof-g-media --limit 5</code>
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([day, entries]) => (
          <div key={day}>
            <h3 className="text-xs font-semibold text-[var(--text-muted)] mb-2">{day}</h3>
            <div className="bg-white rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
              {entries.map(log => (
                <div key={log.id} className="px-5 py-3.5 hover:bg-[var(--bg-soft)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)]">
                          {log.action}
                        </span>
                        {log.extraction_type && (
                          <span className="text-xs text-[var(--text-muted)]">{log.extraction_type}</span>
                        )}
                        {log.quality_score != null && (
                          <span className="text-xs font-mono text-[var(--text-muted)]">
                            q:{(log.quality_score * 100).toFixed(0)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{log.entry_title}</p>
                      <div className="flex gap-3 text-xs text-[var(--text-muted)] mt-0.5">
                        <span>{log.person_name}</span>
                        {log.lifeline_title && <span>→ {log.lifeline_title}</span>}
                        {log.collection_slug && <span>({log.collection_slug})</span>}
                      </div>
                    </div>
                    {log.collection_slug && log.entry_id && (
                      <a href={`https://lifelinepublic.com/public/collections/${log.collection_slug}`}
                        target="_blank" rel="noopener"
                        className="shrink-0 p-2 text-[var(--text-muted)] hover:text-[var(--secondary)]">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

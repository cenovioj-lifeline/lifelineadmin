import { useEffect, useState } from 'react';
import { api, PipelineStatus, DailySummary } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CheckCircle, AlertCircle, Database, Users, FileText, Radio } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded flex items-center justify-center`} style={{ backgroundColor: color + '15', color }}>
          <Icon size={18} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
      {sub && <div className="text-xs text-[var(--text-secondary)] mt-1">{sub}</div>}
    </div>
  );
}

export default function Overview() {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [daily, setDaily] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.status(), api.dailySummary(7)])
      .then(([s, d]) => { setStatus(s); setDaily(d.reverse()); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!status) return null;

  const byStatus = status.extractions.by_status;

  return (
    <div className="space-y-6">
      {/* Health Banner */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4 flex items-center gap-3">
        <CheckCircle size={20} className="text-[var(--accent)]" />
        <div>
          <span className="font-semibold text-sm">Pipeline Healthy</span>
          <span className="text-xs text-[var(--text-secondary)] ml-3">
            Last run: {status.last_run?.date || 'Unknown'}
          </span>
          {status.last_episode && (
            <span className="text-xs text-[var(--text-muted)] ml-3">
              Latest episode: {status.last_episode.title?.substring(0, 60)}...
            </span>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Radio} label="Episodes" value={status.episodes.total}
          sub={`${status.episodes.complete} complete`} color="#0A3161" />
        <StatCard icon={Users} label="Persons" value={status.persons}
          sub="tracked across all podcasts" color="#1a4a7a" />
        <StatCard icon={FileText} label="Extractions" value={status.extractions.total.toLocaleString()}
          sub={`${status.extractions.today} today`} color="#6f9100" />
        <StatCard icon={Database} label="Available" value={(byStatus.available || 0).toLocaleString()}
          sub={`${byStatus.used || 0} used · ${byStatus.rejected || 0} rejected`} color="#B31942" />
      </div>

      {/* 7-Day Chart */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          7-Day Extraction Activity
        </h2>
        {daily.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid var(--border)' }}
                labelFormatter={d => `Date: ${d}`}
              />
              <Bar dataKey="available" fill="var(--accent)" name="Available" radius={[3, 3, 0, 0]} />
              <Bar dataKey="rejected" fill="var(--border-dark)" name="Rejected" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No data for the last 7 days.</p>
        )}
      </div>

      {/* Daily Reports */}
      {status.last_run?.content && (
        <div className="bg-white rounded-lg border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Latest Processing Report
          </h2>
          <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-mono bg-[var(--bg-soft)] p-4 rounded-lg max-h-[300px] overflow-auto">
            {status.last_run.content}
          </pre>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin w-6 h-6 border-2 border-[var(--secondary)] border-t-transparent rounded-full" />
      <span className="ml-3 text-sm text-[var(--text-secondary)]">Loading pipeline status...</span>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start gap-3">
      <AlertCircle size={20} className="text-red-500 mt-0.5" />
      <div>
        <p className="font-semibold text-sm text-red-800">Failed to connect to Admin API</p>
        <p className="text-xs text-red-600 mt-1">{message}</p>
        <p className="text-xs text-red-500 mt-2">
          Make sure the API is running: <code className="bg-red-100 px-1.5 py-0.5 rounded">python -m production.admin_api</code> on port 8082
        </p>
      </div>
    </div>
  );
}

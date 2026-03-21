import { useEffect, useState } from 'react';
import { api, Person } from '../lib/api';
import { Users, Link2 } from 'lucide-react';

export default function Persons() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.persons().then(setPersons).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-[var(--text-muted)] py-10 text-center">Loading persons...</div>;

  const linked = persons.filter(p => p.lp_profile_id);
  const unlinked = persons.filter(p => !p.lp_profile_id);

  return (
    <div className="space-y-6">
      {/* Linked to LP */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-2">
          <Link2 size={14} /> Linked to Lifeline Public ({linked.length})
        </h2>
        <div className="bg-white rounded-lg border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <th className="text-left px-5 py-3">Person</th>
                <th className="text-right px-5 py-3">Total</th>
                <th className="text-right px-5 py-3">Available</th>
                <th className="text-right px-5 py-3">Used</th>
                <th className="text-right px-5 py-3">Rejected</th>
                <th className="text-right px-5 py-3">Usage %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {linked.map(p => {
                const usageRate = p.total_extractions > 0 ? (p.used / p.total_extractions * 100).toFixed(1) : '0.0';
                return (
                  <tr key={p.id} className="hover:bg-[var(--bg-soft)]">
                    <td className="px-5 py-3 font-medium flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--accent-dim)] flex items-center justify-center text-xs font-bold text-[var(--accent)]">
                        {p.name.charAt(0)}
                      </div>
                      {p.name}
                    </td>
                    <td className="text-right px-5 py-3 font-mono text-xs">{p.total_extractions}</td>
                    <td className="text-right px-5 py-3 font-mono text-xs text-[var(--accent)]">{p.available}</td>
                    <td className="text-right px-5 py-3 font-mono text-xs text-[var(--cyan)]">{p.used}</td>
                    <td className="text-right px-5 py-3 font-mono text-xs text-[var(--text-muted)]">{p.rejected}</td>
                    <td className="text-right px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-[var(--bg-soft)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--cyan)] rounded-full" style={{ width: `${Math.min(parseFloat(usageRate), 100)}%` }} />
                        </div>
                        <span className="text-xs font-mono text-[var(--text-muted)]">{usageRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unlinked */}
      {unlinked.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-2">
            <Users size={14} /> Not Linked ({unlinked.length})
          </h2>
          <div className="bg-white rounded-lg border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="text-left px-5 py-3">Person</th>
                  <th className="text-right px-5 py-3">Total</th>
                  <th className="text-right px-5 py-3">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {unlinked.slice(0, 20).map(p => (
                  <tr key={p.id} className="hover:bg-[var(--bg-soft)]">
                    <td className="px-5 py-3 font-medium flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--secondary-dim)] flex items-center justify-center text-xs font-bold text-[var(--secondary)]">
                        {p.name.charAt(0)}
                      </div>
                      {p.name}
                    </td>
                    <td className="text-right px-5 py-3 font-mono text-xs">{p.total_extractions}</td>
                    <td className="text-right px-5 py-3 font-mono text-xs">{p.available}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {unlinked.length > 20 && (
              <div className="px-5 py-3 text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
                Showing 20 of {unlinked.length} unlinked persons
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

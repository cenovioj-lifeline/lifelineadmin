import { ReactNode } from 'react';
import { ArrowDown, AlertTriangle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

/* ── Status Badge ── */
const statusStyles = {
  active: { color: 'var(--accent)', bg: 'var(--green-dim)', label: 'Active', icon: CheckCircle2 },
  manual: { color: 'var(--orange)', bg: 'rgba(199, 125, 0, 0.08)', label: 'Manual Only', icon: Clock },
  built: { color: 'var(--secondary)', bg: 'var(--navy-dim)', label: 'Built', icon: CheckCircle2 },
  partial: { color: 'var(--red)', bg: 'var(--red-dim)', label: 'Partial', icon: AlertTriangle },
};

export function StatusBadge({ status }: { status: keyof typeof statusStyles }) {
  const s = statusStyles[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}>
      <s.icon size={12} />
      {s.label}
    </span>
  );
}

/* ── Page Header ── */
export function PageHeader({ icon: Icon, name, tagline, status, statusDetail }: {
  icon: any; name: string; tagline: string; status: keyof typeof statusStyles; statusDetail: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--navy-dim)] flex items-center justify-center shrink-0">
          <Icon size={24} className="text-[var(--secondary)]" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{name}</h2>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{tagline}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{statusDetail}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Section ── */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">{title}</h3>
      {children}
    </div>
  );
}

/* ── Workflow Step ── */
export function WorkflowStep({ number, title, description, detail, isLast }: {
  number: number; title: string; description: string; detail?: string; isLast?: boolean;
}) {
  return (
    <div className="flex gap-4">
      {/* Vertical line + number */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-[var(--secondary)] text-white flex items-center justify-center text-xs font-bold shrink-0">
          {number}
        </div>
        {!isLast && <div className="w-px flex-1 bg-[var(--border-dark)] my-1" />}
      </div>
      {/* Content */}
      <div className={`pb-5 ${isLast ? '' : ''}`}>
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{title}</h4>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
        {detail && (
          <p className="text-xs text-[var(--text-muted)] mt-1.5 bg-[var(--bg-soft)] px-3 py-2 rounded-md">{detail}</p>
        )}
      </div>
    </div>
  );
}

/* ── Vertical workflow container ── */
export function Workflow({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

/* ── Horizontal flow (compact, for inputs/outputs) ── */
export function HorizontalFlow({ items }: { items: { icon: any; label: string; sub?: string }[] }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-soft)] border border-[var(--border)] flex items-center justify-center">
              <item.icon size={16} className="text-[var(--secondary)]" />
            </div>
            <span className="text-[10px] font-semibold text-[var(--text-primary)] whitespace-nowrap">{item.label}</span>
            {item.sub && <span className="text-[9px] text-[var(--text-muted)] whitespace-nowrap">{item.sub}</span>}
          </div>
          {i < items.length - 1 && <ArrowRight size={14} className="text-[var(--border-dark)] mx-1 shrink-0" />}
        </div>
      ))}
    </div>
  );
}

/* ── File Reference ── */
export function FileRef({ label, path }: { label: string; path: string }) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <span className="text-xs text-[var(--text-muted)] shrink-0 w-32">{label}</span>
      <code className="text-[11px] bg-[var(--bg-soft)] px-2 py-0.5 rounded border border-[var(--border)] text-[var(--text-secondary)]">{path}</code>
    </div>
  );
}

/* ── Issue List ── */
export function IssueList({ issues }: { issues: string[] }) {
  return (
    <div className="bg-[var(--red-dim)] rounded-lg p-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--red)] mb-3 flex items-center gap-2">
        <AlertTriangle size={13} />
        Known Issues ({issues.length})
      </h4>
      <ul className="space-y-2">
        {issues.map((issue, i) => (
          <li key={i} className="text-sm text-[var(--text-primary)] flex items-start gap-2">
            <span className="text-[var(--red)] mt-0.5 shrink-0">&bull;</span>
            {issue}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Info Grid (for dependencies, schedule, etc.) ── */
export function InfoGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map(item => (
        <div key={item.label} className="bg-[var(--bg-soft)] rounded-md px-3 py-2.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-0.5">{item.label}</div>
          <div className="text-xs text-[var(--text-primary)]">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

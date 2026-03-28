import { useEffect, useState } from 'react';
import { api, Operation, OperationType } from '../lib/api';
import OperationForm from '../components/OperationForm';
import {
  Play, Clock, CheckCircle, XCircle, AlertCircle, Loader2, X,
  ChevronDown, ChevronRight, Package, BookOpen, Image, Shield,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
  running: { icon: Loader2, color: '#3b82f6', bg: '#dbeafe', label: 'Running' },
  completed: { icon: CheckCircle, color: '#10b981', bg: '#d1fae5', label: 'Completed' },
  failed: { icon: XCircle, color: '#ef4444', bg: '#fee2e2', label: 'Failed' },
  cancelled: { icon: AlertCircle, color: '#6b7280', bg: '#f3f4f6', label: 'Cancelled' },
};

const CATEGORY_ICONS: Record<string, any> = {
  Collection: Package,
  Books: BookOpen,
  Images: Image,
  QA: Shield,
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon size={12} className={status === 'running' ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  );
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '-';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    const mins = Math.floor(diffMs / (1000 * 60));
    return `${mins}m ago`;
  }
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffHours < 48) return 'Yesterday';

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

// --- Catalog View ---

function OperationCatalog({
  types,
  onSelect,
}: {
  types: Record<string, OperationType>;
  onSelect: (typeId: string) => void;
}) {
  const categories = Object.entries(types).reduce((acc, [id, t]) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push({ id, ...t });
    return acc;
  }, {} as Record<string, (OperationType & { id: string })[]>);

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([cat, ops]) => {
        const CatIcon = CATEGORY_ICONS[cat] || Package;
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <CatIcon size={16} className="text-[var(--text-secondary)]" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {cat}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ops.map((op) => (
                <button
                  key={op.id}
                  onClick={() => onSelect(op.id)}
                  className="bg-white rounded-lg border border-[var(--border)] p-4 text-left hover:border-[var(--secondary)] hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="font-medium text-sm text-[var(--text-primary)] group-hover:text-[var(--secondary)]">
                    {op.label}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                    {op.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Live Progress ---

function LiveProgress({ collectionSlug }: { collectionSlug: string }) {
  const [checkpoint, setCheckpoint] = useState<import('../lib/api').CheckpointData | null>(null);

  useEffect(() => {
    const load = () => {
      api.checkpoint(collectionSlug).then(setCheckpoint).catch(() => {});
    };
    load();
    const interval = setInterval(load, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [collectionSlug]);

  if (!checkpoint?.exists || !checkpoint.phases) return null;

  const phaseIcons: Record<string, { icon: any; color: string }> = {
    completed: { icon: CheckCircle, color: '#10b981' },
    running: { icon: Loader2, color: '#3b82f6' },
    pending: { icon: Clock, color: '#d1d5db' },
    failed: { icon: XCircle, color: '#ef4444' },
  };

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
        Live Progress
        <span className="text-[10px] font-normal ml-2 text-[var(--text-muted)]">
          Updated {checkpoint.updated_at ? new Date(checkpoint.updated_at).toLocaleTimeString() : '-'}
        </span>
      </div>
      <div className="space-y-1.5">
        {checkpoint.phases.map((phase, i) => {
          const cfg = phaseIcons[phase.status] || phaseIcons.pending;
          const Icon = cfg.icon;
          return (
            <div key={i} className="flex items-center gap-2.5 py-1">
              <Icon
                size={16}
                style={{ color: cfg.color }}
                className={phase.status === 'running' ? 'animate-spin' : ''}
              />
              <span className={`text-sm ${
                phase.status === 'completed' ? 'text-[var(--text-primary)]' :
                phase.status === 'running' ? 'text-[var(--text-primary)] font-medium' :
                phase.status === 'failed' ? 'text-red-600' :
                'text-[var(--text-muted)]'
              }`}>
                {phase.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Operation Detail Panel ---

function OperationDetail({
  operation,
  typeRegistry,
  onClose,
  onRerun,
}: {
  operation: Operation;
  typeRegistry: Record<string, OperationType>;
  onClose: () => void;
  onRerun: (opType: string, config: Record<string, any>, collectionSlug?: string) => void;
}) {
  const typeMeta = typeRegistry[operation.operation_type];
  const isRunning = operation.status === 'running';
  const isCollectionOp = ['generate_collection', 'generate_gcme', 'generate_dynamic'].includes(operation.operation_type);

  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {typeMeta?.label || operation.operation_type}
          </h3>
          {operation.collection_slug && (
            <span className="text-sm text-[var(--text-secondary)]">
              Collection: {operation.collection_slug}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={operation.status} />
          {(operation.status === 'completed' || operation.status === 'failed') && (
            <button
              onClick={() => onRerun(operation.operation_type, operation.config, operation.collection_slug || undefined)}
              className="text-xs px-3 py-1.5 bg-[var(--bg-soft)] border border-[var(--border)] rounded hover:bg-[var(--secondary)] hover:text-white hover:border-[var(--secondary)] transition-colors cursor-pointer"
            >
              Re-run
            </button>
          )}
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm cursor-pointer">
            Close
          </button>
        </div>
      </div>

      {/* Timing */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1">Created</div>
          <div>{formatDateTime(operation.created_at)}</div>
        </div>
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1">Started</div>
          <div>{formatDateTime(operation.started_at)}</div>
        </div>
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1">Duration</div>
          <div>{formatDuration(operation.duration_seconds)}</div>
        </div>
      </div>

      {/* Live Progress (for running collection operations) */}
      {isRunning && isCollectionOp && operation.collection_slug && (
        <LiveProgress collectionSlug={operation.collection_slug} />
      )}

      {/* Config */}
      {operation.config && Object.keys(operation.config).length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Configuration
          </div>
          <div className="bg-[var(--bg-soft)] rounded p-3 text-sm font-mono overflow-x-auto">
            {Object.entries(operation.config).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-[var(--text-muted)] min-w-[140px]">{k}:</span>
                <span className="text-[var(--text-primary)]">
                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {operation.result && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Result
          </div>
          <div className="bg-[var(--bg-soft)] rounded p-3 text-sm font-mono overflow-x-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(operation.result, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Error */}
      {operation.error && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-2">
            Error
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
            {operation.error}
          </div>
        </div>
      )}
    </div>
  );
}

// --- History Table ---

function OperationHistory({
  operations,
  typeRegistry,
  onSelect,
  statusFilter,
  typeFilter,
  onStatusFilter,
  onTypeFilter,
}: {
  operations: Operation[];
  typeRegistry: Record<string, OperationType>;
  onSelect: (op: Operation) => void;
  statusFilter: string;
  typeFilter: string;
  onStatusFilter: (s: string) => void;
  onTypeFilter: (s: string) => void;
}) {
  const allTypes = [...new Set(operations.map((o) => o.operation_type))];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
          className="text-sm border border-[var(--border)] rounded px-3 py-1.5 bg-white"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilter(e.target.value)}
          className="text-sm border border-[var(--border)] rounded px-3 py-1.5 bg-white"
        >
          <option value="">All types</option>
          {allTypes.map((t) => (
            <option key={t} value={t}>{typeRegistry[t]?.label || t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {operations.length === 0 ? (
        <div className="bg-white rounded-lg border border-[var(--border)] p-12 text-center">
          <Clock size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
          <div className="text-sm text-[var(--text-secondary)]">
            No operations yet. Operations will appear here as you run them.
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-soft)]">
                <th className="text-left px-4 py-2.5 font-medium text-[var(--text-muted)]">Operation</th>
                <th className="text-left px-4 py-2.5 font-medium text-[var(--text-muted)]">Collection</th>
                <th className="text-left px-4 py-2.5 font-medium text-[var(--text-muted)]">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-[var(--text-muted)]">Duration</th>
                <th className="text-left px-4 py-2.5 font-medium text-[var(--text-muted)]">When</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((op) => (
                <tr
                  key={op.id}
                  onClick={() => onSelect(op)}
                  className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-soft)] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--text-primary)]">
                      {typeRegistry[op.operation_type]?.label || op.operation_type}
                    </div>
                    {op.config?.topic && (
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {op.config.topic}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {op.collection_slug || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={op.status} />
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {formatDuration(op.duration_seconds)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {formatDate(op.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Main Operations Page ---

type View = 'catalog' | 'history';

export default function Operations() {
  const [view, setView] = useState<View>('catalog');
  const [types, setTypes] = useState<Record<string, OperationType>>({});
  const [operations, setOperations] = useState<Operation[]>([]);
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [formType, setFormType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      api.operationTypes(),
      api.operations({ limit: 100 }),
      api.pendingCount(),
    ])
      .then(([t, ops, pc]) => {
        setTypes(t);
        setOperations(ops.items);
        setPendingCount(pc.count);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleFormSubmit = async (config: Record<string, any>, collectionSlug?: string) => {
    if (!formType) return;
    setSubmitting(true);
    try {
      await api.createOperation({
        operation_type: formType,
        collection_slug: collectionSlug || config.collection_slug,
        config,
      });
      setFormType(null);
      setSuccessMessage(`Operation "${types[formType]?.label}" created and queued. Go to Claude Code and say: "run pending operations"`);
      // Don't auto-hide — user needs to see the next step instruction
      loadData();
    } catch (e: any) {
      alert(`Failed to create operation: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOps = operations.filter((op) => {
    if (statusFilter && op.status !== statusFilter) return false;
    if (typeFilter && op.operation_type !== typeFilter) return false;
    return true;
  });

  const stats = {
    total: operations.length,
    completed: operations.filter((o) => o.status === 'completed').length,
    running: operations.filter((o) => o.status === 'running').length,
    pending: pendingCount,
    failed: operations.filter((o) => o.status === 'failed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Banner — stays visible until dismissed */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-green-800">{successMessage}</div>
            <div className="text-xs text-green-700 mt-1">
              Status will update here automatically once execution begins.
            </div>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 hover:text-green-800 cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Operations" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} color="#10b981" />
        <StatCard label="Pending" value={stats.pending} color="#f59e0b" />
        <StatCard label="Failed" value={stats.failed} color="#ef4444" />
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-[var(--bg-soft)] rounded-lg p-1 w-fit">
        <button
          onClick={() => { setView('catalog'); setSelectedOp(null); setFormType(null); }}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
            view === 'catalog'
              ? 'bg-white text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Catalog
        </button>
        <button
          onClick={() => { setView('history'); setSelectedOp(null); setFormType(null); }}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
            view === 'history'
              ? 'bg-white text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          History
          {stats.total > 0 && (
            <span className="ml-1.5 text-xs text-[var(--text-muted)]">({stats.total})</span>
          )}
        </button>
      </div>

      {/* Operation Form (when creating new) */}
      {formType && types[formType] && (
        <OperationForm
          operationType={formType}
          typeMeta={types[formType]}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormType(null)}
          submitting={submitting}
        />
      )}

      {/* Detail Panel (overlays when selected) */}
      {!formType && selectedOp && (
        <OperationDetail
          operation={selectedOp}
          typeRegistry={types}
          onClose={() => setSelectedOp(null)}
          onRerun={(opType, config, collectionSlug) => {
            setSelectedOp(null);
            // Pre-fill the form with previous config
            setFormType(opType);
            // The form will use its defaults — the user can adjust before submitting
          }}
        />
      )}

      {/* Main Content */}
      {!formType && !selectedOp && view === 'catalog' && (
        <OperationCatalog
          types={types}
          onSelect={(typeId) => setFormType(typeId)}
        />
      )}

      {!formType && !selectedOp && view === 'history' && (
        <OperationHistory
          operations={filteredOps}
          typeRegistry={types}
          onSelect={setSelectedOp}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onStatusFilter={setStatusFilter}
          onTypeFilter={setTypeFilter}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold" style={{ color: color || 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

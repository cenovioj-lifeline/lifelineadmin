import { useState } from 'react';
import { Zap, Clock, Globe, Wrench, Archive, AlertTriangle, CheckCircle2 } from 'lucide-react';

type Severity = 'high' | 'medium' | 'low' | 'archived';
type Group = 'unattended' | 'user-facing' | 'manual' | 'indirect' | 'archived';

interface ApiCaller {
  id: string;
  group: Group;
  severity: Severity;
  file: string;
  func?: string;
  lineRef?: string;
  model: string;
  tokensPerCall: string;
  trigger: string;
  scheduled: boolean;
  hasFallback: boolean;
  fallbackDetail?: string;
  whatItDoes: string;
  justification: string;
  alternatives: string[];
}

const inventory: ApiCaller[] = [
  // ─────────── Group A: Unattended / Scheduled (MIGRATED 2026-04-09) ───────────
  {
    id: 'A1',
    group: 'unattended',
    severity: 'low',
    file: 'production/entry_generator.py',
    func: 'generate_entry()',
    lineRef: 'Migrated — now uses claude_headless.call_claude_json()',
    model: 'claude-sonnet (via claude -p, Max subscription)',
    tokensPerCall: '~1000–1500',
    trigger: 'Called by batch_maintenance.process_batch() inside the daily 06:00 launchd job',
    scheduled: true,
    hasFallback: false,
    whatItDoes:
      'Takes a raw SI podcast extraction and writes a polished first-person LP entry — title, narrative, score, date, image query. Now combined with matching into a single batch prompt via batch_maintenance.py.',
    justification:
      'MIGRATED 2026-04-09. No longer calls Anthropic API directly. Uses `claude -p` with a long-lived OAuth token, billing against the Max subscription. Zero marginal API cost.',
    alternatives: [
      'Migration complete — no action needed',
    ],
  },
  {
    id: 'A2',
    group: 'unattended',
    severity: 'low',
    file: 'production/lifeline_matcher.py',
    func: 'match_extraction_to_lifeline()',
    lineRef: 'Migrated — now uses claude_headless.call_claude_json()',
    model: 'claude-sonnet (via claude -p, Max subscription)',
    tokensPerCall: '~300',
    trigger: 'Called by batch_maintenance.process_batch() inside the daily 06:00 launchd job',
    scheduled: true,
    hasFallback: false,
    whatItDoes:
      'Decides which existing lifeline an extraction belongs on, or signals "create a new one." Now combined with entry generation into a single batch prompt.',
    justification:
      'MIGRATED 2026-04-09. Same as A1 — uses `claude -p` under Max subscription. Zero marginal API cost.',
    alternatives: [
      'Migration complete — no action needed',
    ],
  },
  {
    id: 'A3',
    group: 'unattended',
    severity: 'low',
    file: '~/Library/LaunchAgents/com.lifelinepublic.maintenance.plist',
    lineRef: 'launchd job — daily 06:00 → scripts/maintenance_wrapper.sh',
    model: '(scheduling layer — drives batch_maintenance via claude -p)',
    tokensPerCall: '50 entries in batches of 15 = ~3-4 claude -p calls/day',
    trigger: 'launchd timer fires at 06:00 daily',
    scheduled: true,
    hasFallback: false,
    whatItDoes:
      'Runs maintenance_wrapper.sh which sets up the OAuth token environment and calls `python3 scripts/run_maintenance.py --daily --limit 50 --batch-size 15`. All LLM work bills against Max subscription.',
    justification:
      'UPDATED 2026-04-09. Wrapper script unsets ANTHROPIC_API_KEY and exports CLAUDE_CODE_OAUTH_TOKEN so all downstream claude -p calls bill Max. Zero API cost.',
    alternatives: [
      'Migration complete — no action needed',
    ],
  },

  // ─────────── Group B: User-Facing Edge Functions ───────────
  {
    id: 'B1',
    group: 'user-facing',
    severity: 'medium',
    file: 'WebApps/LifelinePublic/supabase/functions/ai-wizard/index.ts',
    lineRef: 'L115 fetch("https://api.anthropic.com/v1/messages", ...)',
    model: 'claude-sonnet-4-20250514',
    tokensPerCall: '~300–500 per turn',
    trigger: 'User on lifelinepublic.com starts the "Create a Lifeline" wizard. Each conversation turn hits this function.',
    scheduled: false,
    hasFallback: false,
    whatItDoes:
      'Conversational AI wizard that helps a visitor build their own lifeline. Exposes tool calls: update_form_field, save_lifeline, save_entry. Deployed as Supabase Edge Function (Deno) on the LP innovation project (qqullemjnkgngxvihvch).',
    justification:
      'STRUCTURALLY UNAVOIDABLE. Edge functions run in Deno on Supabase serverless infrastructure with no Claude Code session present. They cannot call a local model on the user\'s Mac (no network egress to localhost). For server-side AI work without a Claude Code session, direct API is the only option.',
    alternatives: [
      'Move the wizard out of an edge function and into a long-running server (own VM, Fly.io, Railway) — significant rearchitecture, but unlocks local model option',
      'Switch to a cheaper model (Haiku) — already done in B2/B3',
      'Add per-user rate limiting to cap blast radius',
    ],
  },
  {
    id: 'B2',
    group: 'user-facing',
    severity: 'low',
    file: 'WebApps/LifelineExercise/supabase/functions/ai-wizard/index.ts',
    lineRef: 'L267 fetch("https://api.anthropic.com/v1/messages", ...)',
    model: 'claude-haiku-4-5-20251001',
    tokensPerCall: '~300–500 per turn',
    trigger: 'User on lifelineexercise.com interacts with the wizard',
    scheduled: false,
    hasFallback: false,
    whatItDoes:
      'Same shape as B1 but for Lifeline Exercise. Simpler product, fewer reasoning demands, so uses Haiku instead of Sonnet.',
    justification:
      'Same structural reasoning as B1. Haiku chosen deliberately because LE wizard is a form-filler with less reasoning needed than LP\'s lifeline builder. Cheapest available production model.',
    alternatives: ['Same as B1', 'Already on the cheaper model — no further easy wins'],
  },
  {
    id: 'B3',
    group: 'archived',
    severity: 'archived',
    file: 'WebApps/LifelineExercise/server/ai-wizard.mjs',
    func: 'callAnthropic()',
    lineRef: 'DELETED 2026-04-09',
    model: 'claude-haiku-4-5-20251001',
    tokensPerCall: '~300–500 per turn',
    trigger: 'N/A — dead code, deleted',
    scheduled: false,
    hasFallback: false,
    whatItDoes:
      'Was a Node.js proxy server for the LE AI wizard. Confirmed as dead code — B2 (Supabase edge function) is the production path. Server directory and npm scripts deleted.',
    justification:
      'DELETED 2026-04-09. Confirmed redundant with B2. Server/ directory, ai-wizard.mjs, and associated npm scripts removed from LE repo.',
    alternatives: [
      'No action needed — deleted',
    ],
  },

  // ─────────── Group C: Manual Utilities ───────────
  {
    id: 'C1',
    group: 'manual',
    severity: 'low',
    file: 'scripts/backfill_provenance_llm.py',
    func: 'ask_llm()',
    lineRef: 'L84 client = anthropic.Anthropic()',
    model: 'claude-haiku-4-5-20251001',
    tokensPerCall: '~500',
    trigger: 'Manual CLI: `python3 scripts/backfill_provenance_llm.py [--dry-run] [--limit N] [--provider gemini|anthropic]`',
    scheduled: false,
    hasFallback: true,
    fallbackDetail: 'Defaults to Gemini API (free tier). Anthropic is opt-in via --provider anthropic flag.',
    whatItDoes:
      'Match existing LP entries to their SI podcast source by semantic similarity. Backfills missing provenance metadata.',
    justification:
      'This is the ONLY direct-API caller in the LP codebase that already has a non-Anthropic default. It uses Gemini\'s free tier for bulk work and lets you opt into Claude for hard cases. Architecturally, this is the template the rest of the codebase could follow if cost ever becomes a concern.',
    alternatives: ['Already in the right shape — no changes needed'],
  },

  // ─────────── Indirect / Reference ───────────
  {
    id: 'I1',
    group: 'indirect',
    severity: 'low',
    file: 'production/orchestrator.py',
    model: '(none — uses Claude Code Task agents)',
    tokensPerCall: 'FREE — Max subscription',
    trigger: '-GC-, -GCME-, -GDC-, -BCC- collection generation workflows',
    scheduled: false,
    hasFallback: false,
    whatItDoes:
      'High-level orchestrator for full collection generation. Spawns content-generator, mer-specialist, book-researcher agents via Claude Code Task tool. NOT a direct API caller — verified by grep.',
    justification:
      'GOLD STANDARD architecture. All collection generation already runs free under the Max subscription. The cost concerns in this audit are only with the daily *maintenance* path, NOT collection generation.',
    alternatives: ['No changes needed — this is the model the rest should follow when possible'],
  },
];

const groupMeta: Record<Group, { label: string; icon: any; description: string }> = {
  unattended: {
    label: 'Unattended / Scheduled',
    icon: Clock,
    description: 'Runs without a human in the loop. Highest predictable cost.',
  },
  'user-facing': {
    label: 'User-Facing Edge Functions',
    icon: Globe,
    description: 'Scales with user traffic. Structurally constrained — edge functions cannot call local models.',
  },
  manual: {
    label: 'Manual Utilities',
    icon: Wrench,
    description: 'Only fires when explicitly invoked. Low ambient cost.',
  },
  indirect: {
    label: 'Indirect / Reference',
    icon: CheckCircle2,
    description: 'Listed for clarity — these run through Claude Code agents (free under Max), not direct API.',
  },
  archived: {
    label: 'Archived (Dead Code)',
    icon: Archive,
    description: 'In .claude/archive/ — no active call sites.',
  },
};

const severityStyle: Record<Severity, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  archived: 'bg-gray-50 text-gray-500 border-gray-200',
};

export default function ApiUsage() {
  const [openId, setOpenId] = useState<string | null>('A1');

  const counts = {
    total: inventory.filter(i => i.group !== 'indirect').length,
    scheduled: inventory.filter(i => i.scheduled).length,
    userFacing: inventory.filter(i => i.group === 'user-facing').length,
    withFallback: inventory.filter(i => i.hasFallback).length,
  };

  const grouped = inventory.reduce<Record<Group, ApiCaller[]>>((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {} as Record<Group, ApiCaller[]>);

  const groupOrder: Group[] = ['unattended', 'user-facing', 'manual', 'indirect', 'archived'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 rounded-md bg-amber-50 text-amber-600">
            <Zap size={18} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Anthropic API Direct Usage
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
              Every code path that calls the Anthropic API directly (i.e., bills against an API key —
              NOT going through Claude Code's Max subscription, NOT going through a local model).
              Verified by grep across LifelinePublic, LifelineAdmin, LifelinePublicWeb, and LifelineExercise.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Last verified: 2026-04-09 · Source of truth:{' '}
              <code className="bg-[var(--bg-soft)] px-1.5 py-0.5 rounded">
                docs/anthropic-api-inventory.md
              </code>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          <Stat label="Active callers" value={counts.total} />
          <Stat label="Scheduled (cron)" value={counts.scheduled} severity="high" />
          <Stat label="User-facing" value={counts.userFacing} severity="medium" />
          <Stat label="With fallback" value={counts.withFallback} severity="low" />
        </div>
      </div>

      {/* Migration success callout */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
          <div className="text-sm text-emerald-900">
            <strong>Daily maintenance pipeline migrated to Max subscription (2026-04-09).</strong>{' '}
            <code className="bg-white/70 px-1.5 py-0.5 rounded text-xs">entry_generator</code> and{' '}
            <code className="bg-white/70 px-1.5 py-0.5 rounded text-xs">lifeline_matcher</code> now use{' '}
            <code className="bg-white/70 px-1.5 py-0.5 rounded text-xs">claude -p</code> with an OAuth token
            instead of direct API calls. The launchd job still fires daily at 06:00, but all LLM work bills
            against the Max subscription. Zero marginal API cost for the maintenance pipeline.
            Only remaining direct API callers are edge functions (B1, B2) which are structurally required.
          </div>
        </div>
      </div>

      {/* Groups */}
      {groupOrder.map(groupKey => {
        const items = grouped[groupKey] || [];
        if (items.length === 0) return null;
        const meta = groupMeta[groupKey];
        const Icon = meta.icon;

        return (
          <div key={groupKey}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={15} className="text-[var(--text-muted)]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                {meta.label}
              </h3>
              <span className="text-xs text-[var(--text-muted)]">· {items.length}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3 -mt-1.5 ml-6">{meta.description}</p>

            <div className="space-y-2">
              {items.map(item => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-[var(--border)] overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--bg-soft)] cursor-pointer"
                    >
                      <span
                        className={`inline-flex items-center justify-center text-[10px] font-bold px-2 py-0.5 rounded border ${severityStyle[item.severity]} shrink-0 mt-0.5`}
                      >
                        {item.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs font-mono text-[var(--text-primary)] font-semibold">
                            {item.file}
                          </code>
                          {item.func && (
                            <span className="text-xs text-[var(--text-muted)]">· {item.func}</span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-3 flex-wrap">
                          <span>
                            <span className="text-[var(--text-muted)]">Model:</span>{' '}
                            <code className="font-mono">{item.model}</code>
                          </span>
                          <span className="text-[var(--text-muted)]">
                            {item.scheduled && '⏰ scheduled · '}
                            {item.hasFallback ? '✓ fallback' : '⚠ no fallback'}
                          </span>
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-[var(--border)] bg-[var(--bg-soft)] space-y-3 text-sm">
                        <Field label="What it does">{item.whatItDoes}</Field>
                        <Field label="API call site">
                          <code className="font-mono text-xs">{item.lineRef}</code>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Tokens per call">{item.tokensPerCall}</Field>
                          <Field label="Trigger">{item.trigger}</Field>
                        </div>
                        {item.fallbackDetail && (
                          <Field label="Fallback">{item.fallbackDetail}</Field>
                        )}
                        <Field label="Justification (why it's on direct API)">
                          {item.justification}
                        </Field>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
                            Alternative paths
                          </div>
                          <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                            {item.alternatives.map((alt, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-[var(--text-muted)]">·</span>
                                <span>{alt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({
  label,
  value,
  severity,
}: {
  label: string;
  value: number;
  severity?: 'high' | 'medium' | 'low';
}) {
  const color =
    severity === 'high'
      ? 'text-red-600'
      : severity === 'medium'
      ? 'text-amber-600'
      : severity === 'low'
      ? 'text-emerald-600'
      : 'text-[var(--text-primary)]';
  return (
    <div className="bg-[var(--bg-soft)] rounded-md px-3 py-2.5">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
        {label}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">
        {label}
      </div>
      <div className="text-sm text-[var(--text-primary)] leading-relaxed">{children}</div>
    </div>
  );
}

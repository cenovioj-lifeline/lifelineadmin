import {
  Podcast, Brain, Wrench, ImageIcon, Package, Zap, Globe,
  ArrowRight, Clock, CheckCircle2, AlertTriangle, ChevronRight,
  Database, Server, Cpu
} from 'lucide-react';

type SystemId = 'si-pipeline' | 'maintenance-engine' | 'collection-generator' | 'image-pipeline' | 'operations-center' | 'website';

interface SubsystemSummary {
  id: SystemId;
  name: string;
  tagline: string;
  icon: any;
  status: 'active' | 'manual' | 'built' | 'partial';
  statusLabel: string;
  what: string;
}

export const subsystemIndex: SubsystemSummary[] = [
  {
    id: 'si-pipeline',
    name: 'Source Intelligence (SI)',
    tagline: 'Listens to podcasts and extracts facts about people',
    icon: Podcast,
    status: 'active',
    statusLabel: 'Running daily at 5 AM',
    what: 'Processes podcast episodes (Prof G Pod, Pivot), identifies people being discussed, and extracts structured data — quotes, stories, opinions, professional facts. Stores everything in a local SQLite database. Currently tracking 127 people across 588 episodes with 24,600+ extractions.',
  },
  {
    id: 'maintenance-engine',
    name: 'Maintenance Engine',
    tagline: 'Turns SI extractions into published lifeline entries',
    icon: Wrench,
    status: 'manual',
    statusLabel: 'Works but runs manually only',
    what: 'The bridge between raw podcast data and the live website. Takes extractions from SI, matches them to the right lifeline in an existing collection, generates polished entries, checks for duplicates, and publishes directly to the site. Makes collections grow automatically as new podcast content arrives.',
  },
  {
    id: 'collection-generator',
    name: 'Collection Generator',
    tagline: 'Creates entire collections from scratch',
    icon: Package,
    status: 'built',
    statusLabel: 'Used for all collections to date',
    what: 'The main content creation system. Given a topic, it plans a full collection structure, generates lifelines with entries, creates profiles, generates awards (MER), and writes everything to the database. Supports standard, modified ensemble (GCME), and dynamic modes.',
  },
  {
    id: 'image-pipeline',
    name: 'Image Pipeline',
    tagline: 'Finds, generates, and manages all images',
    icon: ImageIcon,
    status: 'built',
    statusLabel: 'Multiple tools, two-pass philosophy',
    what: 'A set of tools for getting images onto the site. Profile photos are found via Brave Search with Gemini AI selection. Cover images and entry images are generated via Gemini. Uses a two-pass approach: best-effort during generation, then a dedicated pass to fix gaps.',
  },
  {
    id: 'operations-center',
    name: 'Operations Center',
    tagline: 'Dashboard forms to launch pipeline operations',
    icon: Zap,
    status: 'built',
    statusLabel: '14 operation types, never fully tested',
    what: 'Instead of remembering CLI commands, you create operations through dashboard forms. Operations queue in Supabase, then Claude Code picks them up and executes. Covers collection generation, image management, content review, and more.',
  },
  {
    id: 'website',
    name: 'Website (lifelinepublic.com)',
    tagline: 'The public-facing site where content lives',
    icon: Globe,
    status: 'active',
    statusLabel: 'Live on Vercel, auto-deploys from GitHub',
    what: 'Vite + React + TypeScript + Tailwind on Vercel. Reads from Supabase — the same database all pipeline tools write to. Supports collections, lifelines, profiles, stories, awards, user accounts, subscriptions, and a feed.',
  },
];

const statusConfig = {
  active: { color: 'var(--accent)', bg: 'var(--green-dim)', label: 'Active' },
  manual: { color: 'var(--orange)', bg: 'rgba(199, 125, 0, 0.08)', label: 'Manual Only' },
  built: { color: 'var(--secondary)', bg: 'var(--navy-dim)', label: 'Built' },
  partial: { color: 'var(--red)', bg: 'var(--red-dim)', label: 'Partial' },
};

function StatusDot({ status }: { status: SubsystemSummary['status'] }) {
  const cfg = statusConfig[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function FlowDiagram() {
  const steps = [
    { icon: Podcast, label: 'Podcasts', sub: 'RSS feeds' },
    { icon: Brain, label: 'SI Pipeline', sub: 'Extract & classify' },
    { icon: Database, label: 'SI Database', sub: '24,600+ extractions' },
    { icon: Wrench, label: 'Maintenance', sub: 'Match & publish' },
    { icon: Server, label: 'Supabase', sub: 'Production DB' },
    { icon: Globe, label: 'Website', sub: 'lifelinepublic.com' },
  ];

  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-5">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
        Content Flow: Podcast to Website
      </h3>
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-1 shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-lg bg-[var(--bg-soft)] border border-[var(--border)] flex items-center justify-center">
                <step.icon size={18} className="text-[var(--secondary)]" />
              </div>
              <span className="text-[11px] font-semibold text-[var(--text-primary)] whitespace-nowrap">{step.label}</span>
              <span className="text-[9px] text-[var(--text-muted)] whitespace-nowrap">{step.sub}</span>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight size={14} className="text-[var(--border-dark)] mx-0.5 shrink-0" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
        <Cpu size={11} />
        <span>Separate path: <strong>Collection Generator</strong> creates collections from scratch (not from SI). <strong>Image Pipeline</strong> fills images at any stage.</span>
      </div>
    </div>
  );
}

export default function SystemMap({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">System Map</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          How the Lifeline Public content pipeline works — from podcast audio to published website.
        </p>
      </div>

      <FlowDiagram />

      {/* Subsystem List */}
      <div className="space-y-2">
        {subsystemIndex.map(sys => {
          const Icon = sys.icon;
          return (
            <button
              key={sys.id}
              onClick={() => onNavigate(`subsystem:${sys.id}`)}
              className="w-full bg-white rounded-lg border border-[var(--border)] p-4 hover:border-[var(--secondary)] hover:shadow-sm transition-all text-left cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--navy-dim)] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={17} className="text-[var(--secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--secondary)] transition-colors">
                      {sys.name}
                    </span>
                    <StatusDot status={sys.status} />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{sys.what}</p>
                </div>
                <ChevronRight size={16} className="text-[var(--text-muted)] mt-1 shrink-0 group-hover:text-[var(--secondary)] transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

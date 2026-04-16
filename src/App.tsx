import { useState } from 'react';
import {
  Map, LayoutDashboard, ClipboardList, Radio, Users, FileText, Filter,
  ImageIcon, Play, ChevronDown, ChevronRight, Eye, Zap, Headphones, Youtube
} from 'lucide-react';
import Overview from './pages/Overview';
import Episodes from './pages/Episodes';
import Extractions from './pages/Extractions';
import Persons from './pages/Persons';
import MaintenanceLog from './pages/MaintenanceLog';
import DailyReview from './pages/DailyReview';
import FilteringFunnel from './pages/FilteringFunnel';
import Images from './pages/Images';
import Operations from './pages/Operations';
import SystemMap from './pages/SystemMap';
import SubsystemPage from './pages/subsystems/SubsystemPage';
import ApiUsage from './pages/ApiUsage';
import PodcastPipeline from './pages/PodcastPipeline';
import YouTubePipeline from './pages/YouTubePipeline';

// Subsystem names for the header breadcrumb
const subsystemNames: Record<string, string> = {
  'si-pipeline': 'Source Intelligence (SI)',
  'maintenance-engine': 'Maintenance Engine',
  'collection-generator': 'Collection Generator',
  'image-pipeline': 'Image Pipeline',
  'operations-center': 'Operations Center',
  'website': 'Website',
};

interface NavItem {
  id: string;
  label: string;
  icon: any;
}

interface NavGroup {
  label: string;
  defaultOpen: boolean;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Understand',
    defaultOpen: true,
    items: [
      { id: 'system-map', label: 'System Map', icon: Map },
    ],
  },
  {
    label: 'How It Works',
    defaultOpen: true,
    items: [
      { id: 'podcast-pipeline', label: 'Podcast Pipeline', icon: Headphones },
      { id: 'youtube-pipeline', label: 'YouTube Pipeline', icon: Youtube },
    ],
  },
  {
    label: 'Monitor',
    defaultOpen: true,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'batch-review', label: 'Batch Review', icon: Eye },
      { id: 'maintenance', label: 'Maintenance Log', icon: ClipboardList },
    ],
  },
  {
    label: 'Pipeline (SI)',
    defaultOpen: false,
    items: [
      { id: 'episodes', label: 'Episodes', icon: Radio },
      { id: 'persons', label: 'Persons', icon: Users },
      { id: 'extractions', label: 'Extractions', icon: FileText },
      { id: 'funnel', label: 'Filtering Funnel', icon: Filter },
    ],
  },
  {
    label: 'Content',
    defaultOpen: false,
    items: [
      { id: 'images', label: 'Images', icon: ImageIcon },
    ],
  },
  {
    label: 'Operations',
    defaultOpen: false,
    items: [
      { id: 'operations', label: 'Operations', icon: Play },
    ],
  },
  {
    label: 'Infrastructure',
    defaultOpen: false,
    items: [
      { id: 'api-usage', label: 'API Usage', icon: Zap },
    ],
  },
];

function SidebarGroup({ group, activeId, onSelect }: {
  group: NavGroup;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const hasActiveItem = group.items.some(item => item.id === activeId);
  const [open, setOpen] = useState(group.defaultOpen || hasActiveItem);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
      >
        {group.label}
        {open
          ? <ChevronDown size={12} />
          : <ChevronRight size={12} />
        }
      </button>
      {open && (
        <div className="space-y-0.5 px-2">
          {group.items.map(item => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--navy-dim)] text-[var(--secondary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-[var(--secondary)]' : 'text-[var(--text-muted)]'} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeId, setActiveId] = useState('system-map');

  const isSubsystem = activeId.startsWith('subsystem:');
  const subsystemId = isSubsystem ? activeId.replace('subsystem:', '') : null;

  // Resolve page title
  let pageTitle = 'System Map';
  if (isSubsystem && subsystemId) {
    pageTitle = subsystemNames[subsystemId] || 'Subsystem';
  } else {
    const item = navGroups.flatMap(g => g.items).find(i => i.id === activeId);
    if (item) pageTitle = item.label;
  }

  // Determine which sidebar item is active (subsystem pages highlight System Map)
  const sidebarActiveId = isSubsystem ? 'system-map' : activeId;

  function renderPage() {
    if (isSubsystem && subsystemId) {
      return (
        <SubsystemPage
          id={subsystemId}
          onBack={() => setActiveId('system-map')}
        />
      );
    }

    switch (activeId) {
      case 'system-map': return <SystemMap onNavigate={setActiveId} />;
      case 'dashboard': return <Overview />;
      case 'batch-review': return <DailyReview />;
      case 'maintenance': return <MaintenanceLog />;
      case 'episodes': return <Episodes />;
      case 'persons': return <Persons />;
      case 'extractions': return <Extractions />;
      case 'funnel': return <FilteringFunnel />;
      case 'images': return <Images />;
      case 'operations': return <Operations />;
      case 'api-usage': return <ApiUsage />;
      case 'podcast-pipeline': return <PodcastPipeline />;
      case 'youtube-pipeline': return <YouTubePipeline />;
      default: return <SystemMap onNavigate={setActiveId} />;
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-[var(--border)] flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <img src="/lifeline-icon.svg" alt="Lifeline" className="w-7 h-7" />
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)] leading-none">Lifeline Admin</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Content Pipeline</div>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 py-3 space-y-2">
          {navGroups.map(group => (
            <SidebarGroup
              key={group.label}
              group={group}
              activeId={sidebarActiveId}
              onSelect={setActiveId}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border)]">
          <div className="text-[10px] text-[var(--text-muted)]">
            Local only &middot; Port 8083
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-[var(--border)] px-6 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-2 text-sm">
            {isSubsystem && (
              <>
                <button
                  onClick={() => setActiveId('system-map')}
                  className="text-[var(--text-muted)] hover:text-[var(--secondary)] transition-colors cursor-pointer"
                >
                  System Map
                </button>
                <span className="text-[var(--text-muted)]">/</span>
              </>
            )}
            <span className="font-semibold text-[var(--text-primary)]">{pageTitle}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 max-w-[1200px]">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

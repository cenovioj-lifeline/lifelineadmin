import { useState } from 'react';
import { Activity, Radio, Users, FileText, Filter, ClipboardList } from 'lucide-react';
import Overview from './pages/Overview';
import Episodes from './pages/Episodes';
import Extractions from './pages/Extractions';
import Persons from './pages/Persons';
import MaintenanceLog from './pages/MaintenanceLog';
import FilteringFunnel from './pages/FilteringFunnel';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'episodes', label: 'Episodes', icon: Radio },
  { id: 'persons', label: 'Persons', icon: Users },
  { id: 'extractions', label: 'Extractions', icon: FileText },
  { id: 'maintenance', label: 'Maintenance Log', icon: ClipboardList },
  { id: 'funnel', label: 'Filtering Funnel', icon: Filter },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[var(--secondary)] text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[var(--accent)] flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">Lifeline Admin</h1>
              <p className="text-xs text-white/60 mt-0.5">Pipeline Visibility Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="bg-white border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 flex gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[var(--secondary)] text-[var(--secondary)] bg-[var(--secondary-dim)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-soft)]'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'episodes' && <Episodes />}
          {activeTab === 'persons' && <Persons />}
          {activeTab === 'extractions' && <Extractions />}
          {activeTab === 'maintenance' && <MaintenanceLog />}
          {activeTab === 'funnel' && <FilteringFunnel />}
        </div>
      </main>
    </div>
  );
}

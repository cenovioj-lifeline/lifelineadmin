import { ArrowLeft } from 'lucide-react';
import SIPipeline from './SIPipeline';
import MaintenanceEngine from './MaintenanceEngine';
import CollectionGenerator from './CollectionGenerator';
import ImagePipeline from './ImagePipeline';
import OperationsCenter from './OperationsCenter';
import Website from './Website';

const pages: Record<string, React.FC> = {
  'si-pipeline': SIPipeline,
  'maintenance-engine': MaintenanceEngine,
  'collection-generator': CollectionGenerator,
  'image-pipeline': ImagePipeline,
  'operations-center': OperationsCenter,
  'website': Website,
};

export default function SubsystemPage({ id, onBack }: { id: string; onBack: () => void }) {
  const Page = pages[id];
  if (!Page) return <div>Unknown subsystem: {id}</div>;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors mb-5 cursor-pointer"
      >
        <ArrowLeft size={15} />
        Back to System Map
      </button>
      <Page />
    </div>
  );
}

import { Zap, FormInput, Database, Play, CheckCircle, XCircle } from 'lucide-react';
import { PageHeader, Section, Workflow, WorkflowStep, FileRef, IssueList, InfoGrid } from './shared';

export default function OperationsCenter() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={Zap}
        name="Operations Center"
        tagline="Dashboard-driven way to configure and launch pipeline operations"
        status="built"
        statusDetail="14 operation types built with forms. Never end-to-end tested through the full create → claim → execute → complete cycle."
      />

      <Section title="The Big Picture">
        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-3">
          Before the Operations Center, every pipeline action required knowing the right CLI command or Python import.
          The Operations tab replaces that with forms — pick what you want to do, fill in the config, and submit.
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Operations are queued in Supabase, then Claude Code picks them up on command. Some operations run fully automated,
          but most require Claude Code's agent orchestration (spawning AI agents, waiting for user approval).
        </p>
      </Section>

      <Section title="How It Works">
        <Workflow>
          <WorkflowStep
            number={1}
            title="Create operation on dashboard"
            description="Go to the Operations tab, pick an operation type from the catalog, fill out the form, and click Create. This writes a record to the Supabase operations table with status 'pending'."
          />
          <WorkflowStep
            number={2}
            title='Tell Claude Code: "run pending operations"'
            description="Claude Code checks for pending operations, shows what's queued, and asks for confirmation before starting."
          />
          <WorkflowStep
            number={3}
            title="Claude Code claims and executes"
            description="The operation is claimed (status → 'running'), then routed to the right handler. Some are fully automated (just run a script), others are interactive (spawn agents, get user approvals mid-way)."
            detail="Automated: fill_images, export_collection. Interactive: generate_collection, generate_gcme, mer_rework, content_review."
          />
          <WorkflowStep
            number={4}
            title="Track progress"
            description="Running operations update their status in real-time. Collection generations also have checkpoint files for resume-on-failure."
          />
          <WorkflowStep
            number={5}
            title="Complete or fail"
            description="When done, the operation is marked completed with the result stored on the record. If something goes wrong, it's marked failed with the error message."
            isLast
          />
        </Workflow>
      </Section>

      <Section title="Operation Types (14 Total)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { cat: 'Collection Generation', ops: ['Generate Collection', 'Generate GCME', 'Generate Dynamic', 'Update News'] },
            { cat: 'Content Management', ops: ['Generate Book', 'Content Review', 'MER Rework', 'Export Collection'] },
            { cat: 'Image Management', ops: ['Fill Images', 'Generate Covers', 'Generate Entry Images', 'Image Review', 'Hero Image', 'Manual Image Fix'] },
          ].map(group => (
            <div key={group.cat} className="bg-[var(--bg-soft)] rounded-lg p-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">{group.cat}</h4>
              <ul className="space-y-1">
                {group.ops.map(op => (
                  <li key={op} className="text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[var(--secondary)]" />
                    {op}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Schedule & Dependencies">
        <InfoGrid items={[
          { label: 'Schedule', value: 'On-demand — user creates operation on dashboard, tells Claude Code to execute' },
          { label: 'Depends On', value: 'Supabase (operations table), Claude Code (execution engine), all subsystems above' },
          { label: 'Missing', value: 'Maintenance Engine run is NOT in the catalog — needs to be added' },
          { label: 'Future', value: 'Could be fully automated — Claude Code polls for pending ops instead of being told' },
        ]} />
      </Section>

      <Section title="Key Files">
        <div className="space-y-0.5">
          <FileRef label="Operations pickup" path="production/operations_pickup.py" />
          <FileRef label="Operations router" path="production/operations_router.py" />
          <FileRef label="Admin API" path="production/admin_api.py" />
          <FileRef label="Admin frontend" path="~/Claude-Projects/WebApps/LifelineAdmin/" />
        </div>
      </Section>

      <IssueList issues={[
        'Never end-to-end tested — the full create → claim → execute → complete cycle hasn\'t been verified',
        'Maintenance Engine run is missing from the operation catalog',
        'No polling — Claude Code must be manually told to check for pending operations',
      ]} />
    </div>
  );
}

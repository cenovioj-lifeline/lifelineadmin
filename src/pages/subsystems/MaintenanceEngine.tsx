import { Wrench, Database, Users, GitBranch, FileCheck, Upload, Search, BookOpen, ShieldCheck, ArrowRight, Podcast } from 'lucide-react';
import { PageHeader, Section, Workflow, WorkflowStep, FileRef, IssueList, InfoGrid } from './shared';

export default function MaintenanceEngine() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={Wrench}
        name="Maintenance Engine"
        tagline="Turns SI extractions into published lifeline entries — keeps collections alive as new podcast data arrives"
        status="manual"
        statusDetail="Validated end-to-end on March 21. Published 3 entries to Prof G Media. Currently manual-only — no automated scheduling."
      />

      {/* The Big Picture */}
      <Section title="The Big Picture">
        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-4">
          Collections on Lifeline Public aren't meant to be static. When a new Prof G Pod episode airs and Scott Galloway
          tells a story about his early career, that story should eventually appear as an entry on his lifeline — automatically.
        </p>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-4">
          The <strong>Source Intelligence (SI) pipeline</strong> already listens to podcasts and extracts structured data about people.
          But those extractions just sit in a SQLite database. The <strong>Maintenance Engine</strong> is the bridge that turns
          raw extractions into polished, published content on the live website.
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Think of SI as the ears and the maintenance engine as the hands. SI hears the stories; the maintenance engine
          writes them into the right place on the site.
        </p>
      </Section>

      {/* Visual Flow */}
      <Section title="How Data Flows">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {[
            { icon: Podcast, label: 'New Episode', bg: 'var(--bg-soft)' },
            { icon: Database, label: 'SI Extractions', bg: 'var(--bg-soft)' },
            { icon: Users, label: 'Match to Profile', bg: 'var(--bg-soft)' },
            { icon: GitBranch, label: 'Match to Lifeline', bg: 'var(--bg-soft)' },
            { icon: BookOpen, label: 'Generate Entry', bg: 'var(--bg-soft)' },
            { icon: ShieldCheck, label: 'Duplicate Check', bg: 'var(--bg-soft)' },
            { icon: Upload, label: 'Publish to Site', bg: 'var(--green-dim)' },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-lg border border-[var(--border)] flex items-center justify-center" style={{ backgroundColor: step.bg }}>
                  <step.icon size={16} className="text-[var(--secondary)]" />
                </div>
                <span className="text-[10px] font-medium text-[var(--text-primary)] whitespace-nowrap">{step.label}</span>
              </div>
              {i < arr.length - 1 && <ArrowRight size={13} className="text-[var(--border-dark)] shrink-0 mt-[-14px]" />}
            </div>
          ))}
        </div>
      </Section>

      {/* Step by Step */}
      <Section title="Step-by-Step Workflow">
        <Workflow>
          <WorkflowStep
            number={1}
            title="Pick a collection to maintain"
            description="The engine takes a collection slug as input — for example, 'prof-g-media'. This tells it which collection to look for new content for."
            detail="Command: python -m production.maintenance_runner --collection prof-g-media"
          />
          <WorkflowStep
            number={2}
            title="Load the collection's profiles"
            description="It queries Supabase for all profiles in that collection. For Prof G Media, that's Scott Galloway, Katherine Dillon, Ed Elson, and the rest of the team. Each profile is a person the engine will look for new data about."
          />
          <WorkflowStep
            number={3}
            title="Query SI for new extractions"
            description="For each profile, it queries the SI SQLite database for extractions about that person. In 'daily' mode, it only looks at extractions created since the last run. In 'enrichment' mode, it processes everything available."
            detail="Two modes: Enrichment (bulk catch-up, all available data) or Daily (only new since last run)"
          />
          <WorkflowStep
            number={4}
            title="Match extraction to the right lifeline"
            description="This is the intelligent part. A person might have multiple lifelines — 'Professional Life', 'Academic Career', 'Family & Relationships'. The lifeline matcher uses the extraction's content to decide which lifeline it belongs to. A quote about NYU goes to the academic lifeline, not the business one."
            detail="The matcher uses the lifeline's title and intro text to score relevance. It picks the best match above a confidence threshold."
          />
          <WorkflowStep
            number={5}
            title="Generate a polished entry"
            description="The raw extraction is a structured data blob from SI. The entry generator turns it into a proper lifeline entry with a title, description, date context, and formatted content that matches the collection's voice and style."
            detail="Uses Claude API for generation. The entry inherits the collection's generation mode (educational, superfan, critical)."
          />
          <WorkflowStep
            number={6}
            title="Check for duplicates"
            description="Before publishing, two checks run. First, exact title match — if an entry with the same title already exists on that lifeline, skip it. Second, fuzzy near-duplicate — if the new title is 55%+ similar to an existing title (catches 'Galloway Rejected by NYU' vs 'NYU Rejection Story'), skip it."
            detail="Uses Python's SequenceMatcher for fuzzy matching at a 0.55 threshold. Prevents the same story told in slightly different words from appearing twice."
          />
          <WorkflowStep
            number={7}
            title="Publish to Supabase"
            description="The entry is written to the production database. It immediately appears on the live website. The extraction is marked as 'used' in SI so it won't be processed again."
          />
          <WorkflowStep
            number={8}
            title="Log the action"
            description="Every publication is recorded in the maintenance_log table in Supabase. This is what the Maintenance Log tab in this dashboard shows — a record of everything the engine has published, when, and to which lifeline."
            isLast
          />
        </Workflow>
      </Section>

      {/* What Goes In / What Comes Out */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="What Goes In">
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <Database size={14} className="text-[var(--secondary)] mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">SI Extractions</div>
                <div className="text-xs text-[var(--text-muted)]">Raw structured data from podcast episodes — stored in local SQLite</div>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Users size={14} className="text-[var(--secondary)] mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">Collection Profiles</div>
                <div className="text-xs text-[var(--text-muted)]">The list of people in the target collection — from Supabase</div>
              </div>
            </li>
          </ul>
        </Section>
        <Section title="What Comes Out">
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <Upload size={14} className="text-[var(--accent)] mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">Published Entries</div>
                <div className="text-xs text-[var(--text-muted)]">New entries on existing lifelines — visible immediately on the live site</div>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <FileCheck size={14} className="text-[var(--accent)] mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">Maintenance Log Records</div>
                <div className="text-xs text-[var(--text-muted)]">Audit trail of every action — viewable in the Maintenance Log tab</div>
              </div>
            </li>
          </ul>
        </Section>
      </div>

      {/* Schedule & Dependencies */}
      <Section title="Schedule & Dependencies">
        <InfoGrid items={[
          { label: 'Schedule', value: 'Manual only — needs a launchd plist to run automatically after the SI daily cron (5 AM)' },
          { label: 'Depends On', value: 'SI Pipeline (source data), Supabase (read profiles + write entries), Anthropic API (Claude for entry generation)' },
          { label: 'Ideal Cadence', value: 'Daily, triggered after SI finishes processing new episodes. SI runs at 5 AM, so maintenance would run at ~6 AM.' },
          { label: 'Collections Supported', value: 'Currently only tested on prof-g-media. Any collection with profiles linked to SI persons would work.' },
        ]} />
      </Section>

      {/* Key Files */}
      <Section title="Key Files">
        <div className="space-y-0.5">
          <FileRef label="Runner (main entry)" path="production/maintenance_runner.py" />
          <FileRef label="Publisher" path="production/maintenance_publisher.py" />
          <FileRef label="Entry generator" path="production/entry_generator.py" />
          <FileRef label="Lifeline matcher" path="production/lifeline_matcher.py" />
          <FileRef label="Maintenance log" path="production/maintenance_log.py" />
          <FileRef label="SI query bridge" path="production/si_query.py" />
          <FileRef label="SI usage tracker" path="production/si_usage_tracker.py" />
          <FileRef label="State file" path="temp/maintenance_state.json" />
        </div>
      </Section>

      {/* Known Issues */}
      <IssueList issues={[
        'No automated scheduling — someone has to manually trigger each run',
        'Only tested once (March 21) — published 3 entries to prof-g-media successfully, but needs more real-world runs',
        'Near-duplicate detection uses basic string matching (SequenceMatcher), not semantic similarity — could miss paraphrased duplicates',
        'Fabricated Ed Elson entry — the pipeline hallucinated content once. Need to decide: delete it? add safeguards?',
        'Not in the Operations Center catalog — you can\'t trigger a maintenance run from the dashboard yet',
      ]} />
    </div>
  );
}

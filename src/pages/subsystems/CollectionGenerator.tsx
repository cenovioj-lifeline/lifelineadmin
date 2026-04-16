import { Package, FileText, Users, Award, MessageSquareQuote, ImageIcon, CheckSquare } from 'lucide-react';
import { PageHeader, Section, Workflow, WorkflowStep, FileRef, InfoGrid } from './shared';

export default function CollectionGenerator() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={Package}
        name="Collection Generator"
        tagline="Creates entire collections from scratch — lifelines, profiles, entries, awards, quotes"
        status="built"
        statusDetail="Fully built and used for all collections created to date. Supports standard, GCME (modified ensemble), and dynamic modes."
      />

      <Section title="The Big Picture">
        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-3">
          This is the main content creation engine. Give it a topic — "Game of Thrones", "Prof G Media", "House of Cards" —
          and it plans and generates an entire collection: the lifelines, their entries, profile pages for people/orgs,
          satirical awards (MER), and notable quotes.
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Unlike the Maintenance Engine (which adds to existing collections), the Collection Generator builds everything from zero.
          It uses Claude AI agents running in parallel to generate content, with a checkpoint system that survives interruptions.
        </p>
      </Section>

      <Section title="Three Collection Modes">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              title: 'Standard Ensemble',
              trigger: '-GC-',
              desc: 'A topic with multiple subjects. Each person or concept gets lifelines.',
              example: 'Game of Thrones, House of Cards',
            },
            {
              title: 'Modified Ensemble (GCME)',
              trigger: '-GCME-',
              desc: 'Company/org with one primary figure and a supporting team. Needs a YAML definition file.',
              example: 'Prof G Media (Galloway + team), Pixar founding era',
            },
            {
              title: 'Dynamic',
              trigger: '-GDC-',
              desc: 'Real-person collection that tracks news over time. Gets ongoing updates.',
              example: 'Taylor Swift (continuous news lifelines)',
            },
          ].map(mode => (
            <div key={mode.title} className="bg-[var(--bg-soft)] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">{mode.title}</h4>
                <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--secondary)]">{mode.trigger}</code>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-1.5">{mode.desc}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Example: {mode.example}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Step-by-Step Workflow">
        <Workflow>
          <WorkflowStep
            number={1}
            title="Pre-flight check"
            description="Verifies database connection, normalizer sync, and API health. Generation won't start if anything is broken."
            detail="Command: python production/qa_preflight.py"
          />
          <WorkflowStep
            number={2}
            title="Plan the collection"
            description="The collection-analyzer skill takes the topic and generates a structured plan: what lifelines to create, their types (person or list), how many entries each should have, and who gets profiles."
          />
          <WorkflowStep
            number={3}
            title="User approves the plan"
            description="The plan is saved and presented for review. This is the main decision point — the user can adjust lifeline counts, rename things, or cut items before generation starts."
          />
          <WorkflowStep
            number={4}
            title="Create collection in database"
            description="The orchestrator creates the collection record in Supabase and initializes a checkpoint file for resilience. If generation gets interrupted, it can resume from here."
          />
          <WorkflowStep
            number={5}
            title="Generate lifeline content (parallel)"
            description="3-5 content-generator agents run in parallel, each producing a complete lifeline with all its entries. Results are written to temp files, then the orchestrator reads them and writes to the database."
            detail="Agents use the content-generator subagent type (no web search needed). For books, book-researcher agents are used instead (need web search)."
          />
          <WorkflowStep
            number={6}
            title="Generate profiles"
            description="Profile pages are generated for each person/organization in the collection — bio, metadata, and linked to their lifelines."
          />
          <WorkflowStep
            number={7}
            title="Generate MER (Mock Election Results)"
            description="Satirical awards like 'Most Likely To...' for the collection's subjects. Uses v4.1 rules with framing variety, anti-monotony checks, and a podium test."
            detail="MER uses the mer-specialist subagent. Subject type (fictional vs real_people) determines guardrails."
          />
          <WorkflowStep
            number={8}
            title="Finalize"
            description="Links profiles to lifelines, imports images, runs post-flight QA. The collection is now live on the website."
            isLast
          />
        </Workflow>
      </Section>

      <Section title="Schedule & Dependencies">
        <InfoGrid items={[
          { label: 'Schedule', value: 'On-demand — triggered via Operations tab or CLI shortcuts (-GC-, -GCME-, -GDC-)' },
          { label: 'Depends On', value: 'Anthropic API (Claude for content), Supabase (database), SerpAPI + Brave (images)' },
          { label: 'Duration', value: 'Varies — a 25-lifeline collection takes ~30-45 minutes with parallel agents' },
          { label: 'Resilience', value: 'Checkpoint system in temp/checkpoints/ — survives interruptions and context loss' },
        ]} />
      </Section>

      <Section title="Key Files">
        <div className="space-y-0.5">
          <FileRef label="Orchestrator" path="production/orchestrator.py" />
          <FileRef label="Supabase writer" path="production/supabase_writer.py" />
          <FileRef label="QA preflight" path="production/qa_preflight.py" />
          <FileRef label="QA postflight" path="production/qa_postflight.py" />
          <FileRef label="Checkpoint" path="production/generation_checkpoint.py" />
          <FileRef label="Collection analyzer" path=".claude/skills/collection-analyzer.md" />
          <FileRef label="Content generator agent" path=".claude/agents/content-generator.md" />
          <FileRef label="MER specialist agent" path=".claude/agents/mer-specialist.md" />
        </div>
      </Section>
    </div>
  );
}

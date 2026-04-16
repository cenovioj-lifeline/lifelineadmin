import { Podcast, Radio, Brain, Database, Filter, AlertTriangle, Headphones } from 'lucide-react';
import { PageHeader, Section, Workflow, WorkflowStep, FileRef, IssueList, InfoGrid } from './shared';

export default function SIPipeline() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={Podcast}
        name="Source Intelligence (SI)"
        tagline="Listens to podcasts and extracts structured facts about people"
        status="active"
        statusDetail="Running daily at 5 AM via launchd. 588 episodes processed, 24,600+ extractions, 127 tracked people."
      />

      <Section title="The Big Picture">
        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-3">
          SI is the data collection layer. It subscribes to podcast RSS feeds, downloads episode transcripts,
          and uses Claude to identify who's being discussed and what's being said about them. Every fact, quote,
          story, and opinion gets extracted and classified.
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Right now it's focused on two podcasts: <strong>Prof G Pod</strong> (~900 episodes, ~800 still unprocessed)
          and <strong>Pivot</strong> (1,330 episodes, backfill in progress). The daily cron processes 10 new episodes per run.
        </p>
      </Section>

      <Section title="Step-by-Step Workflow">
        <Workflow>
          <WorkflowStep
            number={1}
            title="Pick up unprocessed episodes"
            description="The backfill script checks for episodes not yet in the database. In daily mode, it grabs the 10 oldest unprocessed episodes. In batch mode, it processes up to 100."
            detail="Daily cron: 10 eps/run at 5 AM. Batch backfills: 100 eps/run (2 batches completed so far)."
          />
          <WorkflowStep
            number={2}
            title="Download and parse episode content"
            description="For each episode, SI retrieves the transcript (from podtrac feeds or cached copies). Episodes without usable transcripts are skipped."
          />
          <WorkflowStep
            number={3}
            title="Speaker identification"
            description="Claude identifies every person mentioned or discussed in the episode — not just speakers, but people being talked about. Each person gets a record in the SI database."
          />
          <WorkflowStep
            number={4}
            title="Extract structured data"
            description="For each identified person, Claude extracts specific content types: personal stories, professional facts, quotes (direct and attributed), opinions, predictions, relationships, and more. Each extraction gets a quality score."
            detail="Extraction types: personal_story, professional_fact, quote, opinion, prediction, relationship, anecdote, educational_insight"
          />
          <WorkflowStep
            number={5}
            title="Subject filter (biggest drop-off)"
            description="Extractions that are about a topic rather than a specific person get filtered out. For example, 'the economy is struggling' isn't about a person. This filter removes about 65% of all extractions."
            detail="This is the most aggressive filter. The 95% overall filtering rate is largely driven by this step."
          />
          <WorkflowStep
            number={6}
            title="Quality gate"
            description="Surviving extractions are scored for quality. Low-quality items (vague, too short, not insightful) are rejected. About 62% of what passes the subject filter gets rejected here."
          />
          <WorkflowStep
            number={7}
            title="Store in SQLite"
            description="Passing extractions are stored with full metadata: person, episode, type, quality score, time period, emotional tone, and content. They sit here until the Maintenance Engine picks them up."
            isLast
          />
        </Workflow>
      </Section>

      <Section title="Current Numbers">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Episodes', value: '588', sub: 'processed' },
            { label: 'Persons', value: '127', sub: 'tracked' },
            { label: 'Extractions', value: '24,600+', sub: 'total' },
            { label: 'Remaining', value: '~813', sub: 'Prof G Pod eps' },
          ].map(stat => (
            <div key={stat.label} className="bg-[var(--bg-soft)] rounded-md px-3 py-3 text-center">
              <div className="text-lg font-bold text-[var(--text-primary)]">{stat.value}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{stat.sub}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Schedule & Dependencies">
        <InfoGrid items={[
          { label: 'Schedule', value: 'launchd daily at 5 AM, processes 10 episodes per run' },
          { label: 'Depends On', value: 'Anthropic API (Claude for extraction), podcast RSS feeds (podtrac)' },
          { label: 'Batch 1', value: '100 episodes complete — 98 succeeded, 2,145 extractions' },
          { label: 'Batch 2', value: '100 episodes complete — 99 succeeded, 2,374 extractions' },
          { label: 'Pivot Backfill', value: 'In progress — 1,330 episodes via launchd job' },
          { label: 'Reliability', value: 'Unreliable — Anthropic overload errors and podtrac feed failures cause skipped runs' },
        ]} />
      </Section>

      <Section title="Key Files">
        <div className="space-y-0.5">
          <FileRef label="SI Codebase" path="~/Claude-Projects/SourceIntelligence/" />
          <FileRef label="Backfill script" path="~/Claude-Projects/SourceIntelligence/scripts/backfill.py" />
          <FileRef label="SI Database" path="~/Claude-Projects/SourceIntelligence/data/podcast_people.db" />
          <FileRef label="LP integration" path="production/si_query.py" />
          <FileRef label="Usage tracker" path="production/si_usage_tracker.py" />
        </div>
      </Section>

      <IssueList issues={[
        'Daily cron is unreliable — Anthropic API overload errors and podtrac feed failures cause skipped runs',
        '~813 Prof G Pod episodes still unprocessed (need Batch 3+)',
        '95% overall filtering rate — might be too aggressive. Filtering Funnel tab helps diagnose this.',
        'Fabricated content — pipeline hallucinated an Ed Elson entry once. Safeguards needed.',
        'Speaker-about pre-check could be improved — better filtering before expensive extraction step',
      ]} />
    </div>
  );
}

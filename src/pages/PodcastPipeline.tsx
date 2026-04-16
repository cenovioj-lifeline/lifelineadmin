import { Headphones, Mic2, Brain, Users, Sparkles, Database, ArrowRight, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { PageHeader, Section, Workflow, WorkflowStep, FileRef, InfoGrid, IssueList } from './subsystems/shared';

function StrategyBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--navy-dim)] rounded-lg p-5 border border-[var(--border)]">
      <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--secondary)] mb-3 flex items-center gap-2">
        <BookOpen size={13} />
        The Strategy
      </h4>
      <div className="text-sm text-[var(--text-primary)] leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}

function ThresholdTable() {
  const rows = [
    { band: 'Scarce', range: '< 10 extractions', threshold: '0.1', meaning: 'Accept almost anything — we need content for this person' },
    { band: 'Low', range: '10–30', threshold: '0.3', meaning: 'Still building — keep anything decent' },
    { band: 'Moderate', range: '30–100', threshold: '0.5', meaning: 'Be selective — only good stuff' },
    { band: 'Abundant', range: '100+', threshold: '0.7', meaning: 'Only the best — we have enough' },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-2 pr-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Band</th>
            <th className="text-left py-2 pr-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Existing Extractions</th>
            <th className="text-left py-2 pr-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Min Quality</th>
            <th className="text-left py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">In Practice</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.band} className="border-b border-[var(--border)] last:border-0">
              <td className="py-2.5 pr-4 font-semibold text-[var(--text-primary)]">{r.band}</td>
              <td className="py-2.5 pr-4 text-[var(--text-secondary)]">{r.range}</td>
              <td className="py-2.5 pr-4">
                <span className="bg-[var(--bg-soft)] px-2 py-0.5 rounded text-xs font-mono">{r.threshold}</span>
              </td>
              <td className="py-2.5 text-[var(--text-secondary)]">{r.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExtractionTypes() {
  const types = [
    { name: 'Personal Story', desc: 'A narrative — something that happened to someone, with characters and events' },
    { name: 'Biographical Fact', desc: 'School, family, career, age — hard facts about a person\'s life' },
    { name: 'Opinion', desc: 'A strong position that reveals what someone values' },
    { name: 'Quote', desc: 'A memorable verbatim line worth preserving' },
    { name: 'Relationship', desc: 'How two people relate to each other' },
    { name: 'Career Event', desc: 'Job changes, promotions, company founding, exits' },
    { name: 'Personality Trait', desc: 'Behavior that reveals character' },
    { name: 'Humor', desc: 'Jokes, funny moments, comedic exchanges' },
    { name: 'Conflict', desc: 'Disagreements, tensions, opposing views' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {types.map(t => (
        <div key={t.name} className="bg-[var(--bg-soft)] rounded-md px-3 py-2.5">
          <div className="text-xs font-semibold text-[var(--text-primary)]">{t.name}</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{t.desc}</div>
        </div>
      ))}
    </div>
  );
}

function ValidationChecklist() {
  const checks = [
    { question: 'Are daily_process.py and backlog_process.py still the entry points?', asset: 'scripts/daily_process.py, scripts/backlog_process.py' },
    { question: 'Is mlx-whisper still the transcription engine (not cloud API)?', asset: 'src/transcription/mlx_transcriber.py' },
    { question: 'Is pyannote still doing diarization?', asset: 'src/transcription/diarizer.py' },
    { question: 'Is Gemini 2.5 Flash still the extraction model (not Claude)?', asset: 'src/extraction/extractor.py' },
    { question: 'Are the scarcity thresholds still 0.1 / 0.3 / 0.5 / 0.7?', asset: 'src/extraction/pipeline.py (lines 24-30)' },
    { question: 'Does LP still read via si_query.py?', asset: 'production/si_query.py (in LP repo)' },
    { question: 'Are voiceprints still the primary speaker ID method?', asset: 'src/identification/voiceprint_store.py' },
    { question: 'Is the database still SQLite at data/podcast_people.db?', asset: 'data/podcast_people.db' },
  ];
  return (
    <div className="bg-amber-50 rounded-lg p-5 border border-amber-200">
      <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3 flex items-center gap-2">
        <CheckCircle2 size={13} />
        Validation Checklist
      </h4>
      <p className="text-xs text-amber-600 mb-3">
        Use this to verify this page still matches reality. Check each item — if something changed, this page needs updating.
      </p>
      <div className="space-y-2">
        {checks.map((c, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-4 h-4 rounded border border-amber-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm text-[var(--text-primary)]">{c.question}</div>
              <code className="text-[10px] text-amber-600">{c.asset}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PodcastPipeline() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={Headphones}
        name="Podcast Pipeline"
        tagline="How podcasts become structured content about people"
        status="active"
        statusDetail="Runs daily at 5 AM + 9 AM backlog. Processes audio locally on this Mac using Apple Silicon GPU."
      />

      <StrategyBlock>
        <p>
          We subscribe to podcast RSS feeds. Every day, the system picks up new episodes and processes them
          entirely on this machine — no cloud transcription, no external services except Gemini for the final
          extraction step.
        </p>
        <p>
          The goal is <strong>person-centric intelligence</strong>. We don't care about the topics of
          episodes — we care about what people <em>said</em>, what <em>happened to them</em>, and what it
          <em> reveals about who they are</em>. A 30-second personal anecdote is worth more than a 5-minute
          market analysis.
        </p>
        <p>
          Quality thresholds are <strong>scarcity-weighted</strong>: if we know almost nothing about someone,
          we accept almost anything. As we accumulate content about a person, we get pickier. This means
          early episodes are gold mines, and later episodes only contribute their best material.
        </p>
      </StrategyBlock>

      <Section title="How It Works — Step by Step">
        <Workflow>
          <WorkflowStep
            number={1}
            title="Discover new episodes from RSS feeds"
            description="The system checks registered podcast RSS feeds for episodes we haven't processed yet. New episodes get queued in the database with 'pending' status."
            detail="Currently tracking: Prof G Pod, Pivot, and 3 other Prof G feeds. Each feed is checked on every run."
          />
          <WorkflowStep
            number={2}
            title="Download the audio"
            description="Each episode's audio file is downloaded from the RSS feed URL and normalized to 16kHz mono WAV — the format our local transcription model needs. Files are cached so we never re-download."
            detail="Audio cached at: ~/Claude-Projects/SourceIntelligence/data/audio/"
          />
          <WorkflowStep
            number={3}
            title="Transcribe with mlx-whisper (local, on this Mac)"
            description="The audio is transcribed using Whisper large-v3-turbo running natively on Apple Silicon via MLX. This gives us word-level timestamps — we know exactly when every word was spoken. Runs at about 9x faster than real-time."
            detail="No cloud API. No cost. No data leaving this machine. ~6 min for a 60-min episode."
          />
          <WorkflowStep
            number={4}
            title="Diarize — figure out who's talking when"
            description="Pyannote 3.1 (also running locally on Apple Silicon) segments the audio into speaker turns: 'SPEAKER_00 talked from 0:00 to 1:30, then SPEAKER_01 from 1:30 to 3:00.' At this point we don't know names yet — just speaker labels."
            detail="Also produces speaker embeddings — a unique 'voiceprint' for each speaker, used in the next step."
          />
          <WorkflowStep
            number={5}
            title="Identify speakers by name"
            description="Three methods, tried in order. (1) Voiceprint matching: compare this speaker's voice signature against our database of known voices. If it matches Scott Galloway's stored voiceprint with >75% confidence, that's Scott. (2) Intro detection: scan for 'I'm Scott Galloway' or 'This is Kara Swisher' patterns. (3) LLM fallback: ask Claude to figure it out from context."
            detail="Voiceprints are the most reliable. New speakers get their voiceprint stored automatically for future episodes."
          />
          <WorkflowStep
            number={6}
            title="Merge everything into a speaker-attributed transcript"
            description="Combine the word-level transcription with the speaker diarization. The result: a transcript where every sentence is tagged with who said it and when. 'Scott said X at 4:32, Kara said Y at 4:45.'"
          />
          <WorkflowStep
            number={7}
            title="Segment the transcript into topics"
            description="The merged transcript is split into chunks of ~3,000 characters, using speaker turns and time gaps as natural boundaries. A 3+ second gap usually means a topic change."
            detail="Typical episode produces 3–6 segments."
          />
          <WorkflowStep
            number={8}
            title="Extract content with Gemini (the key step)"
            description="Each segment goes to Gemini 2.5 Flash with a prompt that says: 'Find anything person-centric — stories, biographical facts, opinions, quotes, relationships, career events, personality traits, humor, conflicts.' Gemini returns structured JSON with speaker attribution, quality scores, and emotional tone."
            detail="4 concurrent workers. Critical rule: a story told BY Scott ABOUT Ed is attributed to BOTH of them."
          />
          <WorkflowStep
            number={9}
            title="Resolve names to database records"
            description="The names Gemini extracted ('Scott', 'Galloway', 'Prof G') get resolved to actual person records in our database. Handles aliases, first-name-only references, and nicknames."
          />
          <WorkflowStep
            number={10}
            title="Deduplicate"
            description="Content hashes prevent storing the same quote or story twice, even across different episodes. If someone tells the same anecdote on two different shows, we only keep the first one."
            detail="Phase 1: exact hash matching. Phase 2 (future): semantic similarity for near-duplicates."
          />
          <WorkflowStep
            number={11}
            title="Apply quality thresholds (scarcity-weighted)"
            description="This is the gate. Each extraction's quality score is compared against a threshold that depends on how much content we already have for that person. New people: accept almost anything (0.1). Well-known people: only the best (0.7). Extractions that pass become 'available' for LP to consume. Rejected ones are stored but hidden."
          />
          <WorkflowStep
            number={12}
            title="Store in database"
            description="Passing extractions go into the database as 'available' — ready for Lifeline Public to pick up. Rejected ones are stored too (status: 'rejected') so admins can review what was filtered out."
            isLast
          />
        </Workflow>
      </Section>

      <Section title="What Gets Extracted">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Nine types of person-centric content. Everything else (market analysis, stock tips, ad reads) is ignored.
        </p>
        <ExtractionTypes />
      </Section>

      <Section title="Quality Thresholds">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          The quality gate is dynamic — it adjusts based on how much content we already have for each person.
          This is evaluated <strong>per-person</strong>, not per-episode.
        </p>
        <ThresholdTable />
        <p className="text-xs text-[var(--text-muted)] mt-3">
          Example: If we have 5 extractions for Claire Miller, she's "scarce" — we accept anything scored 0.1+.
          If we have 150 for Scott Galloway, he's "abundant" — only scores 0.7+ make it through.
        </p>
      </Section>

      <Section title="How Lifeline Public Uses This">
        <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
          <p>
            LP queries the SI database for extractions with status <code className="text-xs bg-[var(--bg-soft)] px-1.5 py-0.5 rounded">available</code>.
            It can query by person (for enriching a specific lifeline) or broadly (for discovering new content).
          </p>
          <p>
            When LP uses an extraction in a published lifeline entry, it marks it <code className="text-xs bg-[var(--bg-soft)] px-1.5 py-0.5 rounded">used</code>.
            Used extractions are "sacred" — they're never overwritten, even if the episode is reprocessed later.
          </p>
          <div className="flex items-center gap-2 flex-wrap text-xs mt-2">
            <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">available</span>
            <ArrowRight size={12} className="text-[var(--text-muted)]" />
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">used</span>
            <span className="text-[var(--text-muted)] mx-1">|</span>
            <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full font-medium">saved</span>
            <span className="text-[var(--text-muted)] mx-1">|</span>
            <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full font-medium">trash</span>
            <span className="text-[var(--text-muted)] mx-1">|</span>
            <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded-full font-medium">rejected</span>
          </div>
        </div>
      </Section>

      <Section title="Schedule & Infrastructure">
        <InfoGrid items={[
          { label: 'Daily Run', value: 'launchd cron at 5 AM — processes new episodes (default: unlimited, 1-hour runtime budget)' },
          { label: 'Backlog Run', value: 'launchd cron at 9 AM — clears pending episodes (7-hour runtime budget)' },
          { label: 'Transcription', value: 'mlx-whisper large-v3-turbo on Apple Silicon GPU (local, free, ~9x realtime)' },
          { label: 'Diarization', value: 'pyannote 3.1 on Apple Silicon MPS (local, free, ~47s per episode)' },
          { label: 'Extraction AI', value: 'Gemini 2.5 Flash API (4 concurrent workers per episode)' },
          { label: 'Database', value: 'SQLite at ~/Claude-Projects/SourceIntelligence/data/podcast_people.db' },
          { label: 'OOM Protection', value: 'Each episode runs in its own subprocess — OS reclaims memory between episodes' },
          { label: 'Health Monitor', value: 'data/health_status.json — detects if previous run was killed by macOS (jetsam)' },
        ]} />
      </Section>

      <Section title="Technical Assets">
        <p className="text-xs text-[var(--text-muted)] mb-3">All paths relative to ~/Claude-Projects/SourceIntelligence/ unless noted.</p>
        <div className="space-y-0.5">
          <FileRef label="Daily processor" path="scripts/daily_process.py" />
          <FileRef label="Backlog processor" path="scripts/backlog_process.py" />
          <FileRef label="Episode processor" path="scripts/process_one_episode.py" />
          <FileRef label="Podcast registry" path="src/ingestion/podcast_registry.py" />
          <FileRef label="Transcription" path="src/transcription/mlx_transcriber.py" />
          <FileRef label="Diarization" path="src/transcription/diarizer.py" />
          <FileRef label="Transcript merger" path="src/transcription/merger.py" />
          <FileRef label="Speaker identifier" path="src/identification/identifier.py" />
          <FileRef label="Voiceprint store" path="src/identification/voiceprint_store.py" />
          <FileRef label="Content extractor" path="src/extraction/extractor.py" />
          <FileRef label="Quality thresholds" path="src/extraction/pipeline.py" />
          <FileRef label="Deduplication" path="src/extraction/dedup.py" />
          <FileRef label="Entity resolver" path="src/extraction/entity_resolver.py" />
          <FileRef label="Database schema" path=".claude/reference/database-schema.md" />
          <FileRef label="LP query module" path="~/Claude-Projects/LifelinePublic/production/si_query.py" />
          <FileRef label="LP usage tracker" path="~/Claude-Projects/LifelinePublic/production/si_usage_tracker.py" />
        </div>
      </Section>

      <ValidationChecklist />

      <div className="bg-[var(--bg-soft)] rounded-lg p-4 text-xs text-[var(--text-muted)]">
        <strong>Last verified:</strong> April 2026. This page describes the pipeline as built after the
        mlx-whisper + pyannote migration. If the transcription or extraction engine changed, this page
        needs updating.
      </div>
    </div>
  );
}

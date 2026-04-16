import { Youtube, BookOpen, CheckCircle2, ArrowRight, FileSearch, Camera, Layers, Database, Library, Search } from 'lucide-react';
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

function ArchitectureChange() {
  return (
    <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
      <h4 className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-3">
        v1 → v2 Architecture Change (April 13, 2026)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-md p-3 border border-purple-100 opacity-60">
          <div className="text-xs font-bold text-red-500 mb-1">v1 — Discover-First (Superseded)</div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Sample ~30 videos → extract everything → store → curate later.
            Modeled after the podcast pipeline. Produced decontextualized content you had to triage.
          </p>
        </div>
        <div className="bg-white rounded-md p-3 border border-purple-200">
          <div className="text-xs font-bold text-green-600 mb-1">v2 — Load-and-Query (Current)</div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Load ALL videos into NotebookLM (no extraction) → query on demand for specific topics →
            save results as extractions. Only extract what you know you want.
          </p>
        </div>
      </div>
      <p className="text-xs text-purple-600 mt-3">
        <strong>Why the change:</strong> YouTube back-catalogs are reference libraries, not news feeds. Pre-extracting
        produces noise. Targeted sweeps ("give me all F-150 content") are more efficient — NotebookLM's comprehension
        is pre-computed on ingest, so queries are fast (~25-30 seconds) and free.
      </p>
    </div>
  );
}

function ThreeToolArchitecture() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="bg-[var(--bg-soft)] rounded-lg p-4 border border-[var(--border)]">
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">NotebookLM</div>
        <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">Comprehension</div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Ingests YouTube videos natively. Identifies speakers by name, understands stories and context,
          can answer targeted questions about content across hundreds of videos at once.
          <em> The brain — but has no timestamps.</em>
        </p>
      </div>
      <div className="bg-[var(--bg-soft)] rounded-lg p-4 border border-[var(--border)]">
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">yt-dlp</div>
        <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">Data & Captions</div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Downloads metadata, auto-generated SRT captions with timestamps, and video files for screenshots.
          Enumerates entire channels. <em>The data — but has no comprehension.</em>
        </p>
      </div>
      <div className="bg-[var(--bg-soft)] rounded-lg p-4 border border-[var(--border)]">
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Text Matching</div>
        <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">Bridge Layer</div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Maps NotebookLM's insights to yt-dlp's SRT timestamps using keyword density + substring matching.
          Enables precise screenshots. <em>The glue that connects the other two.</em>
        </p>
      </div>
    </div>
  );
}

function TwoPhases() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Library size={16} className="text-blue-600" />
          <div className="text-sm font-semibold text-blue-800">Phase 1: Ingest (One-Time)</div>
        </div>
        <p className="text-xs text-blue-700 leading-relaxed mb-2">
          Load <strong>all</strong> videos from a channel into NotebookLM. Download all SRT captions.
          No extraction happens — we're just building the reference library. NotebookLM pre-computes
          its comprehension on ingest, so future queries are fast.
        </p>
        <div className="text-[10px] text-blue-500 uppercase tracking-wider font-bold">~2 hours for TFL (2,260 videos)</div>
      </div>
      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
        <div className="flex items-center gap-2 mb-2">
          <Search size={16} className="text-green-600" />
          <div className="text-sm font-semibold text-green-800">Phase 2: Targeted Sweeps (On Demand)</div>
        </div>
        <p className="text-xs text-green-700 leading-relaxed mb-2">
          When LP wants content about a topic, we run a "sweep" — a targeted query across the
          loaded notebooks. "Give me every F-150 test result" or "Find all Andre Smirnov personal stories."
          Results become extractions.
        </p>
        <div className="text-[10px] text-green-500 uppercase tracking-wider font-bold">~25-30 sec per query, on demand</div>
      </div>
    </div>
  );
}

function NotebookManagement() {
  return (
    <div className="bg-[var(--bg-soft)] rounded-lg p-5 border border-[var(--border)]">
      <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">
        Notebook Management
      </h4>
      <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
        <p>
          NotebookLM notebooks are <strong>persistent, not disposable</strong>. Each holds up to 500 videos
          (leaving buffer below the 600 hard limit). A channel like TFL (2,260 videos) gets split into ~5
          notebooks by date range.
        </p>
        <p>
          <strong>Naming rule:</strong> All SI notebooks use the prefix <code className="text-xs bg-white px-1.5 py-0.5 rounded border">SI · </code>
          followed by source name and segment label. Example: <code className="text-xs bg-white px-1.5 py-0.5 rounded border">SI · TFL Studios · 2009-2015</code>.
          This prevents collisions — the NotebookLM account is shared for personal use too.
        </p>
        <p>
          A <strong>notebook registry</strong> tracks every notebook: its ID, source count, date range, capacity,
          and status. The registry lives in the SI database and is exported as JSON after every change.
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Active', desc: 'Still adding new videos', limit: '500 max' },
          { label: 'Full', desc: 'At capacity, no new sources', limit: '500 sources' },
          { label: 'Archived', desc: 'Channel fully loaded', limit: '550 max' },
          { label: 'Registry', desc: 'DB + JSON export', limit: 'Always synced' },
        ].map(n => (
          <div key={n.label} className="bg-white rounded-md px-3 py-2 border border-[var(--border)]">
            <div className="text-xs font-semibold text-[var(--text-primary)]">{n.label}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{n.desc}</div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{n.limit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenshotRule() {
  return (
    <div className="bg-[var(--bg-soft)] rounded-lg p-5 border border-[var(--border)]">
      <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 flex items-center gap-2">
        <Camera size={13} />
        Screenshot Rule (Mandatory)
      </h4>
      <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
        <p>
          If an entry was created from a video extraction, its image <strong>must</strong> come from a
          screenshot of that video at the extraction's timestamp. No web search. This is a hard rule.
        </p>
        <p>
          <strong>How it works:</strong> Multi-frame grab — 7 frames across a 60-second window around the
          extraction's timestamp. AI selects the best frame. Takes ~3 seconds per screenshot, costs nothing.
        </p>
        <p>
          <strong>Why:</strong> Screenshots are authentic (they show the actual moment), fast, free, and include
          the channel's watermark. Web search finds generic images; screenshots show what really happened.
        </p>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        Validated on 3 TFL videos (April 13, 2026). Multi-frame + AI selection produces consistently good results.
      </p>
    </div>
  );
}

function ExtractionTypes() {
  const types = [
    { name: 'Personal Story', isNew: false },
    { name: 'Biographical Fact', isNew: false },
    { name: 'Opinion', isNew: false },
    { name: 'Quote', isNew: false },
    { name: 'Relationship', isNew: false },
    { name: 'Career Event', isNew: false },
    { name: 'Personality Trait', isNew: false },
    { name: 'Humor', isNew: false },
    { name: 'Conflict', isNew: false },
    { name: 'Product Rating', isNew: true },
    { name: 'Comparison Result', isNew: true },
    { name: 'Recurring Segment', isNew: true },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {types.map(t => (
        <span key={t.name} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          t.isNew
            ? 'bg-purple-50 text-purple-700 border border-purple-200'
            : 'bg-[var(--bg-soft)] text-[var(--text-secondary)] border border-[var(--border)]'
        }`}>
          {t.name}
          {t.isNew && <span className="ml-1 text-[9px] uppercase">new</span>}
        </span>
      ))}
    </div>
  );
}

function ValidationChecklist() {
  const checks = [
    { question: 'Is the architecture still load-and-query (v2), not discover-first (v1)?', asset: 'docs/planning/youtube-architecture-v2.md' },
    { question: 'Is sweep.py the entry point for targeted queries?', asset: 'src/youtube/sweep.py' },
    { question: 'Is NotebookLM still the comprehension layer?', asset: 'src/youtube/notebooklm.py' },
    { question: 'Are notebooks persistent (not disposable) with SI · prefix naming?', asset: 'notebook_registry table + data/notebook_registry.json' },
    { question: 'Is yt-dlp still the metadata/caption source?', asset: 'src/ingestion/youtube.py' },
    { question: 'Does timestamp matching still use keyword density + SRT?', asset: 'src/youtube/timestamp_matcher.py' },
    { question: 'Are video screenshots mandatory for video-sourced entries?', asset: 'src/youtube/screenshot.py' },
    { question: 'Does LP still use si_query.py to read extractions?', asset: 'production/si_query.py (in LP repo)' },
    { question: 'Is the TFL collection still being rebuilt (or is it complete)?', asset: 'Collection ID: 421ad40f...' },
    { question: 'Are source_metadata and extraction_media still the YouTube-specific DB additions?', asset: '.claude/reference/database-schema.md' },
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

export default function YouTubePipeline() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={Youtube}
        name="YouTube Pipeline"
        tagline="How YouTube channels become structured content via NotebookLM + yt-dlp"
        status="built"
        statusDetail="Architecture v2 designed April 13, 2026. SI implementation pending. TFL collection reset for quality rebuild."
      />

      <StrategyBlock>
        <p>
          YouTube is different from podcasts. A YouTube channel is a <strong>reference library</strong> — thousands
          of videos sitting there, ready to be queried. Podcasts are a <strong>news feed</strong> — new episodes
          arrive and need immediate processing.
        </p>
        <p>
          So instead of the podcast approach (process everything as it arrives, extract and triage), YouTube uses
          a <strong>load-and-query model</strong>: load all videos into NotebookLM once, then query on demand
          when we want specific content. "Give me every Ford F-150 review" or "Find all of Andre's personal
          stories." We only extract what we know we want.
        </p>
        <p>
          The same <strong>three-tool architecture</strong> still applies: NotebookLM for comprehension, yt-dlp
          for data and timestamps, text matching to bridge them. But the <em>when</em> of extraction changed
          — from upfront to on-demand.
        </p>
      </StrategyBlock>

      <ArchitectureChange />

      <Section title="The Three-Tool Architecture">
        <ThreeToolArchitecture />
        <p className="text-xs text-[var(--text-muted)] mt-3">
          Proven with TFL Studios video "Here's Why I'm SELLING My Toyota Tundra" (E7LOU8OSt10, 21 min).
          All 7 visual moments matched to exact SRT timestamps.
        </p>
      </Section>

      <Section title="Two Phases">
        <TwoPhases />
      </Section>

      <Section title="Phase 1: Ingest — Step by Step">
        <p className="text-xs text-[var(--text-muted)] mb-3">One-time setup per channel. No extractions happen here — just loading the library.</p>
        <Workflow>
          <WorkflowStep
            number={1}
            title="Enumerate the YouTube channel"
            description="yt-dlp scans the channel and lists every video with title, view count, upload date, duration, and tags. For TFL Studios, that's 2,260 videos."
          />
          <WorkflowStep
            number={2}
            title="Plan notebook splits by date range"
            description="The videos are divided chronologically into batches of ≤500 (for active channels) or ≤550 (for archived). TFL needs ~5 notebooks: '2009-2015', '2016-2018', '2019-2021', '2022-2024', '2025-present'."
          />
          <WorkflowStep
            number={3}
            title="Create NotebookLM notebooks"
            description="Each notebook is created with the naming convention: 'SI · TFL Studios · 2009-2015'. The 'SI ·' prefix identifies it as SI-managed — the account is shared for personal use."
          />
          <WorkflowStep
            number={4}
            title="Add all videos as sources"
            description="YouTube video URLs are added to their respective notebooks. NotebookLM processes each video natively — it 'watches' them and pre-computes its comprehension. Rate-limited to ~1-2 seconds between additions."
            detail="~75 minutes for 2,260 videos. Process one notebook at a time, verify indexing before the next."
          />
          <WorkflowStep
            number={5}
            title="Download all SRT captions"
            description="yt-dlp downloads auto-generated subtitles for every video. These timestamped captions are needed later when we match NotebookLM's insights to specific moments in videos."
            detail="Stored at: data/youtube_captions/{channel-slug}/{video_id}.srt"
          />
          <WorkflowStep
            number={6}
            title="Register everything"
            description="Every notebook and every source is tracked in a database registry. The registry exports as JSON after every change so other tools can read it."
            isLast
          />
        </Workflow>
      </Section>

      <Section title="Phase 2: Targeted Sweeps — Step by Step">
        <p className="text-xs text-[var(--text-muted)] mb-3">Runs on demand when LP wants content about a specific topic.</p>
        <Workflow>
          <WorkflowStep
            number={1}
            title="LP requests a sweep"
            description="Someone (you or the system) asks for content about a topic: 'Every F-150 test result from TFL Studios' or 'All personal stories from Andre Smirnov.' This becomes a sweep request with a tag for tracking."
          />
          <WorkflowStep
            number={2}
            title="Query all matching notebooks"
            description="The sweep module finds every notebook belonging to the requested source ('TFL Studios') and queries each one. NotebookLM returns prose answers with citations from the source videos."
            detail="~25-30 seconds per notebook query. Queries run across all notebooks for the source."
          />
          <WorkflowStep
            number={3}
            title="Parse responses into discrete extractions"
            description="NotebookLM returns natural language answers, not JSON. The responses get parsed into individual extraction records — each with a type, content, speaker, and quality score."
          />
          <WorkflowStep
            number={4}
            title="Match to SRT timestamps"
            description="Each extraction gets matched to the corresponding moment in the SRT captions. This gives us the exact video ID and timestamp — needed for screenshots and deep-links."
          />
          <WorkflowStep
            number={5}
            title="Deduplicate and store"
            description="Content hashes prevent storing the same insight twice, even if it appears across multiple notebooks. Results go into the same extractions table as podcasts, tagged with sweep metadata."
          />
          <WorkflowStep
            number={6}
            title="Extract screenshots"
            description="For each extraction, grab 7 frames across a 60-second window around the timestamp. AI selects the best frame. This becomes the entry image if LP uses this extraction."
            isLast
          />
        </Workflow>
      </Section>

      <NotebookManagement />

      <ScreenshotRule />

      <Section title="Extraction Types">
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Same 9 types as podcasts, plus 3 new ones specific to YouTube content:
        </p>
        <ExtractionTypes />
      </Section>

      <Section title="How LP Uses YouTube Extractions">
        <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
          <p>
            LP reads sweep results from the same extractions table as podcasts. The <code className="text-xs bg-[var(--bg-soft)] px-1.5 py-0.5 rounded">source_metadata</code> JSON
            field tells LP this came from YouTube and includes the sweep tag, video ID, and timestamp.
          </p>
          <p>
            <strong>The rebuild approach:</strong> TFL collection was completely reset (April 13, 2026). Instead of bulk
            generation, the collection is being rebuilt one lifeline at a time. Each sweep targets a specific topic,
            results are reviewed for quality, and only the best content makes it in. Slow and deliberate.
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            YouTube extractions carry visual content — screenshots at exact timestamps and deep-link
            URLs back to the video. This is a new dimension podcasts don't have.
          </p>
        </div>
      </Section>

      <Section title="Relationship to Podcast Pipeline">
        <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
          <p>
            Both pipelines write to the <strong>same extractions table</strong>. LP doesn't need to know
            whether an extraction came from a podcast or YouTube.
          </p>
          <p>
            But the <strong>processing models are fundamentally different</strong>:
          </p>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 pr-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Aspect</th>
                  <th className="text-left py-2 pr-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Podcasts</th>
                  <th className="text-left py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">YouTube</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                {[
                  ['Model', 'Extract-and-triage (proactive)', 'Load-and-query (on demand)'],
                  ['Extraction timing', 'Immediate, as episodes arrive', 'On request, via targeted sweeps'],
                  ['Transcription', 'Local (mlx-whisper on this Mac)', 'Cloud (NotebookLM)'],
                  ['Extraction AI', 'Gemini 2.5 Flash', 'NotebookLM (built-in)'],
                  ['Schedule', 'Daily at 5 AM + 9 AM backlog', 'Manual (later: weekly new-video check)'],
                  ['Notebooks', 'N/A', 'Persistent, registered, named'],
                  ['Screenshots', 'N/A', 'Mandatory for video-sourced entries'],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-4 font-semibold text-[var(--text-primary)]">{row[0]}</td>
                    <td className="py-2 pr-4">{row[1]}</td>
                    <td className="py-2">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section title="Current State">
        <InfoGrid items={[
          { label: 'Architecture', value: 'v2 (load-and-query) designed. SI implementation pending.' },
          { label: 'First Target', value: 'TFL Studios (@TFLtruck) — 2,260 videos. Collection shell preserved, all content deleted for quality rebuild.' },
          { label: 'TFL Collection', value: 'EMPTY SHELL (ID: 421ad40f...). Previous 771 entries + 39 lifelines + 9 profiles deleted April 13. Backup at backups/tfl-studios/.' },
          { label: 'Next Step', value: 'SI implements v2: delete old notebooks, create registry, bulk ingest 2,260 videos into 5 notebooks, build sweep module.' },
          { label: 'After SI Ingest', value: 'LP runs first targeted sweep, creates entries with video screenshots, rebuilds TFL one lifeline at a time.' },
          { label: 'Future Target', value: 'MKBHD — ~1,800 videos, tech review channel' },
          { label: 'Database', value: 'Same SQLite as podcasts. YouTube data uses source_metadata JSON + extraction_media table.' },
          { label: 'Thread', value: '[4F] Content Architecture — cross-project with Source Intelligence' },
        ]} />
      </Section>

      <Section title="Technical Assets">
        <p className="text-xs text-[var(--text-muted)] mb-3">All paths relative to ~/Claude-Projects/SourceIntelligence/ unless noted.</p>
        <div className="space-y-0.5">
          <FileRef label="v2 Design Doc" path="docs/planning/youtube-architecture-v2.md" />
          <FileRef label="Sweep module (v2)" path="src/youtube/sweep.py (TO BE BUILT)" />
          <FileRef label="NotebookLM wrapper" path="src/youtube/notebooklm.py" />
          <FileRef label="Timestamp matcher" path="src/youtube/timestamp_matcher.py" />
          <FileRef label="Screenshot extractor" path="src/youtube/screenshot.py" />
          <FileRef label="yt-dlp wrapper" path="src/ingestion/youtube.py" />
          <FileRef label="Pipeline orchestrator" path="src/youtube/pipeline.py (updating for v2)" />
          <FileRef label="Notebook registry" path="notebook_registry + notebook_sources tables (TO BE BUILT)" />
          <FileRef label="Registry JSON export" path="data/notebook_registry.json (TO BE BUILT)" />
          <FileRef label="TFL backup" path="~/Claude-Projects/LifelinePublic/backups/tfl-studios/" />
          <FileRef label="LP query module" path="~/Claude-Projects/LifelinePublic/production/si_query.py" />
          <FileRef label="LP usage tracker" path="~/Claude-Projects/LifelinePublic/production/si_usage_tracker.py" />
          <FileRef label="Integration contract" path=".claude/reference/lifeline-integration.md" />
          <FileRef label="Database schema" path=".claude/reference/database-schema.md" />
        </div>
      </Section>

      <ValidationChecklist />

      <IssueList issues={[
        'SI implementation not started — sweep module, notebook registry, and bulk ingest still need to be built',
        'NotebookLM is cloud-based and has no official API — relies on CLI tool, could break',
        'NotebookLM response parsing is an open question — returns prose, not JSON. May need Claude to post-process.',
        'No scheduling yet — new-video ingestion for active channels will need a periodic check',
        'SRT availability unknown — what percentage of TFL\'s 2,260 videos have captions? Will find out during ingest.',
        'Cross-notebook dedup needs testing — same content cited differently across notebooks?',
      ]} />

      <div className="bg-[var(--bg-soft)] rounded-lg p-4 text-xs text-[var(--text-muted)]">
        <strong>Last verified:</strong> April 13, 2026. This page reflects the v2 architecture (load-and-query).
        The v1 discover-first model was superseded on the same date. SI implementation has not started yet.
      </div>
    </div>
  );
}

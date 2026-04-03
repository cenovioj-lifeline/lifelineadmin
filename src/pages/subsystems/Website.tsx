import { Globe, GitBranch, Database, Shield, Paintbrush, Rss } from 'lucide-react';
import { PageHeader, Section, Workflow, WorkflowStep, FileRef, IssueList, InfoGrid } from './shared';

export default function Website() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={Globe}
        name="Website (lifelinepublic.com)"
        tagline="The public-facing site where all pipeline content lives"
        status="active"
        statusDetail="Live on Vercel. Auto-deploys from GitHub on every push to main."
      />

      <Section title="The Big Picture">
        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-3">
          This is where users go. Everything the pipeline builds — collections, lifelines, entries, profiles, awards, quotes —
          is displayed here. The website reads from Supabase, the same database that all the pipeline tools write to.
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Built with Vite + React + TypeScript + Tailwind. Hosted on Vercel (Hobby tier). Shares a Supabase project
          with Lifeline Exercise — same database, same auth pool, different content schemas.
        </p>
      </Section>

      <Section title="Development Workflow">
        <Workflow>
          <WorkflowStep number={1} title="Edit locally" description="Code lives at ~/Claude-Projects/WebApps/LifelinePublic/. Run dev server with npx vite --port 5175." />
          <WorkflowStep number={2} title="Test at localhost" description="Preview changes at http://localhost:5175. Hot reload via Vite." />
          <WorkflowStep number={3} title="Push to main" description="git push to main on cenovioj-lifeline/lifelinepublic. No feature branches — always direct to main." />
          <WorkflowStep number={4} title="Vercel auto-deploys" description="Vercel picks up the push and deploys in ~30-60 seconds. No manual steps." />
          <WorkflowStep number={5} title="Verify" description="Check lifelinepublic.com to confirm deployment succeeded." isLast />
        </Workflow>
      </Section>

      <Section title="Architecture">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Paintbrush, label: 'Frontend', value: 'Vite + React + TypeScript + Tailwind CSS' },
            { icon: Globe, label: 'Hosting', value: 'Vercel (Hobby tier) — auto-deploys from GitHub main' },
            { icon: Database, label: 'Database', value: 'Supabase project qqullemjnkgngxvihvch (public schema)' },
            { icon: Shield, label: 'Auth', value: 'Supabase Auth — shared with Lifeline Exercise' },
            { icon: GitBranch, label: 'GitHub', value: 'cenovioj-lifeline/lifelinepublic' },
            { icon: Rss, label: 'DNS', value: 'GoDaddy — A record pointing to Vercel (216.198.79.1)' },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-2.5 p-3 bg-[var(--bg-soft)] rounded-lg">
              <item.icon size={14} className="text-[var(--secondary)] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">{item.label}</div>
                <div className="text-xs text-[var(--text-secondary)]">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="What the Site Displays">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {['Collections', 'Lifelines', 'Entries', 'Profiles', 'Awards (MER)', 'Quotes', 'Stories', 'User Feed', 'Subscriptions', 'User Accounts'].map(feature => (
            <div key={feature} className="text-xs text-[var(--text-primary)] bg-[var(--bg-soft)] px-3 py-2 rounded-md text-center">
              {feature}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Key Files">
        <div className="space-y-0.5">
          <FileRef label="Website repo" path="~/Claude-Projects/WebApps/LifelinePublic/" />
          <FileRef label="Content pipeline" path="~/Claude-Projects/LifelinePublic/ (separate codebase)" />
          <FileRef label="Admin dashboard" path="~/Claude-Projects/WebApps/LifelineAdmin/ (this app)" />
        </div>
      </Section>

      <IssueList issues={[
        'CSS alias migration needed — 23 components use old variable names',
      ]} />
    </div>
  );
}

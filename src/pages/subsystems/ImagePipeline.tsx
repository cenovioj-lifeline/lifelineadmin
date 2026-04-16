import { ImageIcon, Search, Sparkles, Upload, Crop, Eye, Layers } from 'lucide-react';
import { PageHeader, Section, Workflow, WorkflowStep, FileRef, InfoGrid } from './shared';

export default function ImagePipeline() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={ImageIcon}
        name="Image Pipeline"
        tagline="Finds, generates, and manages all images for profiles and lifelines"
        status="built"
        statusDetail="Multiple tools built. Two-pass philosophy: best-effort during generation, then dedicated pass for gaps."
      />

      <Section title="The Big Picture">
        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-3">
          Every profile needs a photo, every lifeline can have a cover image, and entries can have illustrations.
          The image pipeline is actually a collection of independent tools that handle different image needs.
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          The guiding philosophy is <strong>two-pass</strong>: during collection generation, images are filled on a best-effort basis (fast pass).
          After generation, a dedicated second pass finds and fixes gaps. This keeps generation fast while ensuring nothing stays broken.
        </p>
      </Section>

      <Section title="The Image Tools">
        <div className="space-y-3">
          {[
            {
              icon: Search,
              name: 'Brave Image Fill',
              desc: 'Finds real photos of people via Brave Search. Gemini AI selects the best match from search results. Used for profile images.',
              trigger: 'fill_images operation or -FILLIMAGES- shortcut',
            },
            {
              icon: Sparkles,
              name: 'Gemini Image Generator',
              desc: 'Generates artistic cover images for lifelines based on title and theme. Also generates entry illustrations.',
              trigger: 'generate_covers or generate_entry_images operations',
            },
            {
              icon: Layers,
              name: 'AI Outpainting',
              desc: 'Widens narrow images by generating extended backgrounds with Gemini. Fixes portrait-only photos that look bad in card layouts.',
              trigger: 'Manual — via profile image editor in admin dashboard',
            },
            {
              icon: Crop,
              name: 'Crop Editor',
              desc: 'Admin tool for adjusting avatar crops (1:1) and card crops (16:9) on profile images. Side-by-side editor with saved positions.',
              trigger: 'Images tab in this dashboard',
            },
            {
              icon: Eye,
              name: 'Image Reviewer',
              desc: 'AI-powered quality review. Checks images against 6 criteria (resolution, relevance, appropriateness, etc.) and flags issues.',
              trigger: 'image_review operation',
            },
            {
              icon: Layers,
              name: 'Hero Image Collector',
              desc: 'Creates collage images for collection landing pages from profile photos.',
              trigger: 'hero_image operation or -HIC- shortcut',
            },
          ].map(tool => (
            <div key={tool.name} className="flex items-start gap-3 p-3 bg-[var(--bg-soft)] rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-white border border-[var(--border)] flex items-center justify-center shrink-0">
                <tool.icon size={15} className="text-[var(--secondary)]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">{tool.name}</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tool.desc}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Trigger: {tool.trigger}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Profile Image Workflow">
        <Workflow>
          <WorkflowStep number={1} title="Search" description="Brave Search for the person's name + collection context. Returns candidate images." />
          <WorkflowStep number={2} title="AI Selection" description="Gemini reviews candidates and picks the best photo (or rejects all if none are suitable)." />
          <WorkflowStep number={3} title="Upload" description="Selected image is uploaded to Supabase storage in the media-uploads bucket." />
          <WorkflowStep number={4} title="Record" description="A media_assets record is created with the image metadata, and the profile is updated with the image URL." />
          <WorkflowStep number={5} title="Crop (optional)" description="If the image is narrow, AI outpainting can widen it. Card and avatar crop positions can be fine-tuned in the editor." isLast />
        </Workflow>
      </Section>

      <Section title="Schedule & Dependencies">
        <InfoGrid items={[
          { label: 'Schedule', value: 'On-demand via Operations tab (6 image-related operation types)' },
          { label: 'Depends On', value: 'Brave Search API, Gemini API (selection + generation), Supabase Storage' },
          { label: 'Storage Bucket', value: 'media-uploads in Supabase (5,821 files)' },
          { label: 'Search Query', value: '"Name" "Collection" photograph — no SerpAPI filters (per product decision)' },
        ]} />
      </Section>

      <Section title="Key Files">
        <div className="space-y-0.5">
          <FileRef label="Brave image fill" path="production/brave_image_fill.py" />
          <FileRef label="Brave search" path="production/brave_search.py" />
          <FileRef label="Gemini image gen" path="production/gemini_image_generator.py" />
          <FileRef label="Hero collector" path="production/hero_image_collector.py" />
          <FileRef label="Image reviewer" path="production/image_reviewer.py" />
          <FileRef label="Storage validator" path="production/storage_validator.py" />
        </div>
      </Section>
    </div>
  );
}

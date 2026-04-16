import { useEffect, useState, useMemo } from 'react';
import { api, Collection, ProfileImage, CollectionImagesResponse, ImageStats } from '../lib/api';
import { ImageIcon, CheckCircle, AlertCircle, Crop, RectangleHorizontal, Search, ChevronDown, X, Eye } from 'lucide-react';

type StatusFilter = 'all' | 'has_image' | 'missing' | 'no_crop' | 'no_card_crop';

export default function Images() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [data, setData] = useState<CollectionImagesResponse | null>(null);
  const [globalStats, setGlobalStats] = useState<ImageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<ProfileImage | null>(null);

  // Load collections on mount
  useEffect(() => {
    api.collections().then(setCollections).catch(console.error);
    api.imageStats().then(setGlobalStats).catch(console.error);
  }, []);

  // Load collection images when selected
  useEffect(() => {
    if (!selectedSlug) {
      setData(null);
      return;
    }
    setLoading(true);
    setSelectedProfile(null);
    api.collectionImages(selectedSlug)
      .then(setData)
      .finally(() => setLoading(false));
  }, [selectedSlug]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.profiles;

    // Status filter
    if (statusFilter === 'has_image') list = list.filter(p => p.has_image);
    if (statusFilter === 'missing') list = list.filter(p => !p.has_image);
    if (statusFilter === 'no_crop') list = list.filter(p => p.has_image && !p.has_custom_crop);
    if (statusFilter === 'no_card_crop') list = list.filter(p => p.has_image && !p.has_card_crop);

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    return list;
  }, [data, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      {globalStats && !selectedSlug && (
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Profiles" value={globalStats.total_profiles} />
          <StatCard label="With Image" value={globalStats.with_media_asset} accent="var(--accent)" />
          <StatCard label="Legacy URL Only" value={globalStats.legacy_url_only} accent="var(--orange)" />
          <StatCard label="No Image" value={globalStats.no_image} accent="#ef4444" />
        </div>
      )}

      {/* Collection Picker */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
          Select Collection
        </label>
        <div className="relative">
          <select
            value={selectedSlug}
            onChange={(e) => { setSelectedSlug(e.target.value); setStatusFilter('all'); setSearchQuery(''); }}
            className="w-full max-w-md appearance-none bg-[var(--bg-soft)] border border-[var(--border)] rounded-md px-4 py-2.5 text-sm pr-10 focus:outline-none focus:border-[var(--secondary)]"
          >
            <option value="">Choose a collection...</option>
            {collections.map(c => (
              <option key={c.slug} value={c.slug}>{c.title}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>
      </div>

      {loading && (
        <div className="text-sm text-[var(--text-muted)] py-10 text-center">Loading image data...</div>
      )}

      {/* Collection View */}
      {data && !loading && (
        <>
          {/* Collection Stats Bar */}
          <div className="grid grid-cols-5 gap-3">
            <FilterButton
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
              label="All"
              count={data.stats.total}
            />
            <FilterButton
              active={statusFilter === 'has_image'}
              onClick={() => setStatusFilter('has_image')}
              label="Has Image"
              count={data.stats.with_image}
              color="var(--accent)"
            />
            <FilterButton
              active={statusFilter === 'missing'}
              onClick={() => setStatusFilter('missing')}
              label="Missing"
              count={data.stats.missing_image}
              color="#ef4444"
            />
            <FilterButton
              active={statusFilter === 'no_crop'}
              onClick={() => setStatusFilter('no_crop')}
              label="No Avatar Crop"
              count={data.stats.with_image - data.stats.with_crop}
              color="var(--orange)"
            />
            <FilterButton
              active={statusFilter === 'no_card_crop'}
              onClick={() => setStatusFilter('no_card_crop')}
              label="No Card Crop"
              count={data.stats.with_image - data.stats.with_card_crop}
              color="var(--purple)"
            />
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search profiles..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--bg-soft)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--secondary)]"
            />
          </div>

          {/* Profile Grid + Detail Panel */}
          <div className="flex gap-5">
            {/* Grid */}
            <div className={`${selectedProfile ? 'flex-1 min-w-0' : 'w-full'}`}>
              <div className="text-xs text-[var(--text-muted)] mb-2">
                {filtered.length} profile{filtered.length !== 1 ? 's' : ''}
              </div>
              <div className={`grid ${selectedProfile ? 'grid-cols-3' : 'grid-cols-4'} gap-3`}>
                {filtered.map(p => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    isSelected={selectedProfile?.id === p.id}
                    onClick={() => setSelectedProfile(selectedProfile?.id === p.id ? null : p)}
                  />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-sm text-[var(--text-muted)] py-10 text-center">
                  No profiles match this filter.
                </div>
              )}
            </div>

            {/* Detail Panel */}
            {selectedProfile && (
              <DetailPanel
                profile={selectedProfile}
                onClose={() => setSelectedProfile(null)}
              />
            )}
          </div>
        </>
      )}

      {/* Empty state */}
      {!selectedSlug && !loading && (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a collection to view its profile images</p>
        </div>
      )}
    </div>
  );
}


// --- Sub-components ---

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">{label}</div>
      <div className="text-2xl font-bold" style={accent ? { color: accent } : undefined}>{value}</div>
    </div>
  );
}

function FilterButton({ active, onClick, label, count, color }: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-lg border p-3 transition-colors cursor-pointer ${
        active
          ? 'border-[var(--secondary)] bg-[var(--secondary-dim)]'
          : 'border-[var(--border)] bg-white hover:bg-[var(--bg-soft)]'
      }`}
    >
      <div className="text-xs text-[var(--text-muted)] mb-0.5">{label}</div>
      <div className="text-lg font-bold" style={color ? { color } : undefined}>{count}</div>
    </button>
  );
}

function ProfileCard({ profile, isSelected, onClick }: {
  profile: ProfileImage;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-lg border overflow-hidden transition-all cursor-pointer ${
        isSelected
          ? 'border-[var(--secondary)] ring-2 ring-[var(--secondary)]/20'
          : 'border-[var(--border)] hover:border-[var(--border-dark)]'
      }`}
    >
      {/* Image area */}
      <div className="aspect-square bg-[var(--bg-soft)] relative overflow-hidden">
        {profile.image_url ? (
          <img
            src={profile.image_url}
            alt={profile.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={24} className="text-[var(--text-muted)] opacity-30" />
          </div>
        )}

        {/* Status indicators */}
        <div className="absolute top-1.5 right-1.5 flex gap-1">
          {profile.has_image && profile.has_custom_crop && (
            <span className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center" title="Avatar crop set">
              <Crop size={10} className="text-white" />
            </span>
          )}
          {profile.has_image && profile.has_card_crop && (
            <span className="w-5 h-5 rounded-full bg-[var(--cyan)] flex items-center justify-center" title="Card crop set">
              <RectangleHorizontal size={10} className="text-white" />
            </span>
          )}
          {!profile.has_image && (
            <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center" title="No image">
              <AlertCircle size={10} className="text-white" />
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      <div className="px-3 py-2">
        <div className="text-xs font-medium truncate">{profile.name}</div>
        <div className="text-[10px] text-[var(--text-muted)]">
          {profile.image_source === 'media_asset' ? 'Pipeline' :
           profile.image_source === 'legacy_url' ? 'Legacy' : 'No image'}
        </div>
      </div>
    </button>
  );
}

function DetailPanel({ profile, onClose }: { profile: ProfileImage; onClose: () => void }) {
  return (
    <div className="w-[360px] shrink-0 bg-white rounded-lg border border-[var(--border)] overflow-hidden sticky top-20 self-start">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold truncate">{profile.name}</h3>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
          <X size={16} />
        </button>
      </div>

      {/* Image preview */}
      <div className="aspect-square bg-[var(--bg-soft)] relative">
        {profile.image_url ? (
          <img src={profile.image_url} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-2">
            <ImageIcon size={40} className="text-[var(--text-muted)] opacity-30" />
            <span className="text-xs text-[var(--text-muted)]">No image</span>
          </div>
        )}
      </div>

      {/* Card preview (16:9) */}
      {profile.image_url && (
        <div className="px-4 pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
            Card Preview (16:9)
          </div>
          <div className="aspect-video bg-[var(--bg-soft)] rounded overflow-hidden relative">
            <img
              src={profile.image_url}
              alt={`${profile.name} card`}
              className="w-full h-full object-cover"
              style={profile.media_asset ? {
                objectPosition: `${profile.media_asset.card_position_x ?? 50}% ${profile.media_asset.card_position_y ?? 50}%`
              } : undefined}
            />
          </div>
        </div>
      )}

      {/* Details */}
      <div className="px-4 py-3 space-y-3">
        <DetailRow label="Source" value={
          profile.image_source === 'media_asset' ? 'Pipeline (media_assets)' :
          profile.image_source === 'legacy_url' ? 'Legacy URL' : 'None'
        } />
        <DetailRow label="Subject Type" value={profile.subject_type} />

        {profile.image_query && (
          <DetailRow label="Search Query" value={profile.image_query} mono />
        )}

        {profile.media_asset && (
          <>
            <div className="border-t border-[var(--border)] pt-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Avatar Crop (1:1)
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="X" value={profile.media_asset.position_x} />
                <MiniStat label="Y" value={profile.media_asset.position_y} />
                <MiniStat label="Scale" value={profile.media_asset.scale} />
              </div>
              <StatusBadge
                set={profile.has_custom_crop}
                labelSet="Custom position"
                labelDefault="Default (center)"
              />
            </div>

            <div className="border-t border-[var(--border)] pt-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Card Crop (16:9)
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="X" value={profile.media_asset.card_position_x} />
                <MiniStat label="Y" value={profile.media_asset.card_position_y} />
                <MiniStat label="Scale" value={profile.media_asset.card_scale} />
              </div>
              <StatusBadge
                set={profile.has_card_crop}
                labelSet="Custom position"
                labelDefault="Default (center)"
              />
            </div>

            {(profile.media_asset.width || profile.media_asset.height) && (
              <DetailRow
                label="Dimensions"
                value={`${profile.media_asset.width} x ${profile.media_asset.height}`}
              />
            )}
          </>
        )}

        {profile.image_url && (
          <a
            href={profile.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[var(--cyan)] hover:underline mt-2"
          >
            <Eye size={12} /> View full image
          </a>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
      <div className={`text-sm mt-0.5 ${mono ? 'font-mono text-xs break-all' : ''}`}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[var(--bg-soft)] rounded px-2 py-1.5 text-center">
      <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
      <div className="text-xs font-mono font-medium">{value}</div>
    </div>
  );
}

function StatusBadge({ set, labelSet, labelDefault }: { set: boolean; labelSet: string; labelDefault: string }) {
  return (
    <div className={`mt-1.5 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${
      set
        ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
        : 'bg-[var(--bg-soft)] text-[var(--text-muted)]'
    }`}>
      {set ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
      {set ? labelSet : labelDefault}
    </div>
  );
}

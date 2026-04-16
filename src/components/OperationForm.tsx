import { useEffect, useState } from 'react';
import { api, Collection, OperationType } from '../lib/api';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';

interface OperationFormProps {
  operationType: string;
  typeMeta: OperationType;
  onSubmit: (config: Record<string, any>, collectionSlug?: string) => void;
  onCancel: () => void;
  submitting: boolean;
}

// Field definitions per operation type
const FIELD_CONFIGS: Record<string, FieldConfig[]> = {
  generate_collection: [
    { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Game of Thrones, House MD', required: true },
    { key: 'mode', label: 'Generation Mode', type: 'select', options: ['educational', 'superfan', 'critical'], defaultValue: 'educational' },
    { key: 'scope', label: 'Scope', type: 'select', options: [
      { value: 'full', label: 'Full (lifelines + profiles + MER + quotes)' },
      { value: 'lifelines_profiles', label: 'Lifelines + Profiles only' },
      { value: 'lifelines_only', label: 'Lifelines only' },
    ], defaultValue: 'full' },
    { key: 'subject_type', label: 'Subject Type', type: 'select', options: [
      { value: 'fictional', label: 'Fictional (TV, movies, books, games)' },
      { value: 'real_people', label: 'Real People (public figures, orgs)' },
    ], defaultValue: 'fictional' },
    { key: 'target_lifeline_count', label: 'Target Lifeline Count', type: 'number', placeholder: '25', defaultValue: 25 },
    { key: 'special_instructions', label: 'Special Instructions', type: 'textarea', placeholder: 'Optional notes for the generation...' },
  ],
  generate_gcme: [
    { key: 'name', label: 'Collection Name', type: 'text', placeholder: 'e.g., The Prof G Collection', required: true },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What this collection is about...', required: true },
    { key: 'organization', label: 'Organization', type: 'text', placeholder: 'e.g., Prof G Media', required: true },
    { key: 'primary', label: 'Primary Person', type: 'text', placeholder: 'e.g., Scott Galloway', required: true },
    { key: 'ensemble', label: 'Ensemble Members', type: 'list', placeholder: 'Add ensemble member...' },
    { key: 'mode', label: 'Generation Mode', type: 'select', options: ['educational', 'superfan', 'critical'], defaultValue: 'superfan' },
    { key: 'scope', label: 'Scope', type: 'select', options: [
      { value: 'full', label: 'Full (lifelines + profiles + MER + quotes)' },
      { value: 'lifelines_profiles', label: 'Lifelines + Profiles only' },
      { value: 'lifelines_only', label: 'Lifelines only' },
    ], defaultValue: 'full' },
    { key: 'subject_type', label: 'Subject Type', type: 'select', options: [
      { value: 'fictional', label: 'Fictional' },
      { value: 'real_people', label: 'Real People' },
    ], defaultValue: 'real_people' },
    { key: 'target_lifeline_count', label: 'Target Lifeline Count', type: 'number', placeholder: '35', defaultValue: 35 },
    { key: 'derive_ensemble', label: 'Derive Ensemble from Research', type: 'checkbox', defaultValue: false },
  ],
  generate_dynamic: [
    { key: 'topic', label: 'Topic / Person', type: 'text', placeholder: 'e.g., Taylor Swift', required: true },
    { key: 'primary_person', label: 'Primary Person Name', type: 'text', placeholder: 'Full name of the primary subject', required: true },
    { key: 'special_instructions', label: 'Special Instructions', type: 'textarea', placeholder: 'Optional notes...' },
  ],
  update_news: [
    { key: 'collection_slug', label: 'Collection', type: 'collection_picker', required: true },
  ],
  export_collection: [
    { key: 'collection_slug', label: 'Collection', type: 'collection_picker', required: true },
    { key: 'format', label: 'Format', type: 'select', options: ['excel', 'json'], defaultValue: 'excel' },
  ],
  generate_book: [
    { key: 'author', label: 'Author', type: 'text', placeholder: 'e.g., Scott Galloway', required: true },
    { key: 'titles', label: 'Book Title(s)', type: 'text', placeholder: 'Comma-separated: The Drift, The Four, Algebra of Wealth', required: true },
    { key: 'method', label: 'Method', type: 'select', options: [
      { value: 'claude', label: 'Claude Multi-Agent (recommended)' },
      { value: 'perplexity', label: 'Perplexity API' },
    ], defaultValue: 'claude' },
    { key: 'destination', label: 'Destination', type: 'select', options: [
      { value: 'database', label: 'Direct to Database' },
      { value: 'file', label: 'Markdown File' },
    ], defaultValue: 'database' },
  ],
  content_review: [
    { key: 'collection_slug', label: 'Collection', type: 'collection_picker', required: true },
  ],
  mer_rework: [
    { key: 'collection_slug', label: 'Collection', type: 'collection_picker', required: true },
    { key: 'subject_type', label: 'Subject Type', type: 'select', options: [
      { value: 'fictional', label: 'Fictional' },
      { value: 'real_people', label: 'Real People' },
    ], defaultValue: 'fictional' },
  ],
  fill_images: [
    { key: 'collection_slug', label: 'Collection', type: 'collection_picker', required: true },
  ],
  generate_covers: [
    { key: 'collection_slug', label: 'Collection', type: 'collection_picker', required: true },
  ],
  generate_entry_images: [
    { key: 'scope', label: 'Scope', type: 'select', options: [
      { value: 'collection', label: 'Entire Collection' },
      { value: 'profile', label: 'Single Profile' },
      { value: 'lifeline', label: 'Single Lifeline' },
    ], defaultValue: 'collection' },
    { key: 'collection_slug', label: 'Collection', type: 'collection_picker', required: true },
    { key: 'target_id', label: 'Target ID (if profile/lifeline scope)', type: 'text', placeholder: 'UUID of the profile or lifeline' },
  ],
  image_review: [
    { key: 'collection_slug', label: 'Collection', type: 'collection_picker', required: true },
  ],
  hero_image: [
    { key: 'collection_slug', label: 'Collection', type: 'collection_picker', required: true },
  ],
  manual_image_fix: [
    { key: 'collection_slug', label: 'Collection', type: 'collection_picker', required: true },
    { key: 'target_type', label: 'What to Fix', type: 'select', options: [
      { value: 'profile', label: 'Profile Image' },
      { value: 'cover', label: 'Lifeline Cover Image' },
    ], defaultValue: 'profile' },
    { key: 'target_selection', label: 'Which ones?', type: 'target_picker', required: true },
    { key: 'image_url', label: 'Image URL (optional — leave blank to let Claude search)', type: 'text', placeholder: 'https://example.com/image.jpg' },
    { key: 'search_query', label: 'Search Query (optional — overrides default name search)', type: 'text', placeholder: 'e.g., Zooey Deschanel as Jessica Day New Girl' },
  ],
};

interface SelectOption {
  value: string;
  label: string;
}

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'list' | 'collection_picker' | 'target_picker';
  placeholder?: string;
  required?: boolean;
  options?: (string | SelectOption)[];
  defaultValue?: any;
}

interface TargetItem {
  id: string;
  name: string;
  has_image: boolean;
}

function TargetPicker({
  collectionSlug,
  targetType,
  value,
  onChange,
}: {
  collectionSlug: string;
  targetType: string;
  value: { mode: string; targets: string[] };
  onChange: (val: { mode: string; targets: string[] }) => void;
}) {
  const [items, setItems] = useState<TargetItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!collectionSlug) {
      setItems([]);
      return;
    }
    setLoading(true);
    api.missingImages(collectionSlug, targetType || 'profile')
      .then((res) => setItems(res.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [collectionSlug, targetType]);

  const missingItems = items.filter((i) => !i.has_image);
  const mode = value?.mode || 'all_missing';

  if (!collectionSlug) {
    return <div className="text-xs text-[var(--text-muted)]">Select a collection first</div>;
  }
  if (loading) {
    return <div className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Loading...</div>;
  }

  return (
    <div className="space-y-3">
      {/* Mode selector */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="target_mode"
            checked={mode === 'all_missing'}
            onChange={() => onChange({ mode: 'all_missing', targets: missingItems.map(i => i.name) })}
            className="accent-[var(--secondary)]"
          />
          <span className="text-sm">
            All missing
            {missingItems.length > 0 && (
              <span className="ml-1 text-xs text-red-500 font-medium">({missingItems.length})</span>
            )}
            {missingItems.length === 0 && (
              <span className="ml-1 text-xs text-green-600 font-medium">(none missing)</span>
            )}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="target_mode"
            checked={mode === 'specific'}
            onChange={() => onChange({ mode: 'specific', targets: [] })}
            className="accent-[var(--secondary)]"
          />
          <span className="text-sm">Pick specific</span>
        </label>
      </div>

      {/* Missing items summary */}
      {mode === 'all_missing' && missingItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <div className="text-xs font-medium text-amber-800 mb-1.5">Will fix {missingItems.length} missing:</div>
          <div className="flex flex-wrap gap-1.5">
            {missingItems.map((item) => (
              <span key={item.id} className="inline-block bg-white border border-amber-300 rounded px-2 py-0.5 text-xs text-amber-900">
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Specific picker — shows all items with checkboxes, missing highlighted */}
      {mode === 'specific' && (
        <div className="border border-[var(--border)] rounded-md max-h-48 overflow-y-auto">
          {items.map((item) => {
            const checked = (value?.targets || []).includes(item.name);
            return (
              <label
                key={item.id}
                className={`flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--bg-soft)] cursor-pointer border-b border-[var(--border)] last:border-b-0 ${
                  !item.has_image ? 'bg-red-50' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...(value?.targets || []), item.name]
                      : (value?.targets || []).filter((n) => n !== item.name);
                    onChange({ mode: 'specific', targets: next });
                  }}
                  className="accent-[var(--secondary)]"
                />
                <span className="text-sm flex-1">{item.name}</span>
                {!item.has_image && (
                  <span className="text-xs text-red-500 font-medium">missing</span>
                )}
                {item.has_image && (
                  <span className="text-xs text-green-600">has image</span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CollectionPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (slug: string) => void;
}) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.collections()
      .then(setCollections)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-[var(--text-muted)]">Loading collections...</div>;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
    >
      <option value="">Select a collection...</option>
      {collections.map((c) => (
        <option key={c.id} value={c.slug}>
          {c.title} ({c.slug})
        </option>
      ))}
    </select>
  );
}

function ListInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
          placeholder={placeholder}
          className="flex-1 border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-2 bg-[var(--secondary)] text-white rounded-md text-sm hover:opacity-90 cursor-pointer"
        >
          <Plus size={16} />
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-[var(--bg-soft)] border border-[var(--border)] rounded-full px-3 py-1 text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OperationForm({ operationType, typeMeta, onSubmit, onCancel, submitting }: OperationFormProps) {
  const fields = FIELD_CONFIGS[operationType] || [];

  // Initialize form state from field defaults
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.defaultValue !== undefined) {
        initial[f.key] = f.defaultValue;
      } else if (f.type === 'list') {
        initial[f.key] = [];
      } else if (f.type === 'checkbox') {
        initial[f.key] = false;
      } else {
        initial[f.key] = '';
      }
    });
    return initial;
  });

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Extract collection_slug from config if present (for the API endpoint)
    const collectionSlug = formData.collection_slug || undefined;

    // Clean config: remove empty strings, convert types
    const config: Record<string, any> = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== '' && v !== undefined && v !== null) {
        // Flatten target_selection into target_mode and target_names
        if (k === 'target_selection' && typeof v === 'object') {
          config['target_mode'] = v.mode;
          config['target_names'] = v.targets || [];
        } else {
          config[k] = v;
        }
      }
    });

    onSubmit(config, collectionSlug);
  };

  const isValid = fields
    .filter((f) => f.required)
    .every((f) => {
      const val = formData[f.key];
      if (f.type === 'target_picker') {
        if (!val) return false;
        if (val.mode === 'all_missing') return true; // API will resolve the targets
        return val.targets && val.targets.length > 0;
      }
      if (Array.isArray(val)) return val.length > 0;
      return val !== '' && val !== undefined && val !== null;
    });

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[var(--border)] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{typeMeta.label}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{typeMeta.description}</p>
        </div>
        <button type="button" onClick={onCancel} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
          <X size={20} />
        </button>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={formData[field.key] || ''}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={formData[field.key] || ''}
                onChange={(e) => updateField(field.key, parseInt(e.target.value) || '')}
                placeholder={field.placeholder}
                className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={formData[field.key] || ''}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent resize-y"
              />
            )}

            {field.type === 'select' && (
              <select
                value={formData[field.key] || ''}
                onChange={(e) => updateField(field.key, e.target.value)}
                className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
              >
                {field.options?.map((opt) => {
                  const val = typeof opt === 'string' ? opt : opt.value;
                  const label = typeof opt === 'string' ? opt : opt.label;
                  return <option key={val} value={val}>{label}</option>;
                })}
              </select>
            )}

            {field.type === 'checkbox' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[field.key] || false}
                  onChange={(e) => updateField(field.key, e.target.checked)}
                  className="rounded border-[var(--border)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Enabled</span>
              </label>
            )}

            {field.type === 'list' && (
              <ListInput
                value={formData[field.key] || []}
                onChange={(items) => updateField(field.key, items)}
                placeholder={field.placeholder}
              />
            )}

            {field.type === 'collection_picker' && (
              <CollectionPicker
                value={formData[field.key] || ''}
                onChange={(slug) => updateField(field.key, slug)}
              />
            )}

            {field.type === 'target_picker' && (
              <TargetPicker
                collectionSlug={formData['collection_slug'] || ''}
                targetType={formData['target_type'] || 'profile'}
                value={formData[field.key] || { mode: 'all_missing', targets: [] }}
                onChange={(val) => updateField(field.key, val)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="px-5 py-2 bg-[var(--secondary)] text-white text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Creating...
            </>
          ) : (
            'Create Operation'
          )}
        </button>
      </div>
    </form>
  );
}

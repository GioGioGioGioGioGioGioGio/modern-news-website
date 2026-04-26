import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const { data } = await supabase.from('tags').select('*').order('name');
    setTags(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await supabase.from('tags').update(formData).eq('id', editingId);
    } else {
      await supabase.from('tags').insert(formData);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', slug: '' });
    loadTags();
  };

  const handleEdit = (tag: Tag) => {
    setFormData({ name: tag.name, slug: tag.slug });
    setEditingId(tag.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo tag?')) return;
    await supabase.from('tags').delete().eq('id', id);
    loadTags();
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Tag</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', slug: '' });
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded"
        >
          <Plus className="w-4 h-4" />
          Nuovo Tag
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 max-w-md">
          <h2 className="font-serif text-xl mb-4">
            {editingId ? 'Modifica Tag' : 'Nuovo Tag'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded bg-background"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded">
                {editingId ? 'Aggiorna' : 'Crea'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-border rounded"
              >
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="px-4 py-2 bg-card border border-border rounded animate-pulse">
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
          ))
        ) : tags.length > 0 ? (
          tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded"
            >
              <span>{tag.name}</span>
              <span className="text-muted-foreground text-sm">/{tag.slug}</span>
              <button onClick={() => handleEdit(tag)} className="p-1 hover:bg-muted rounded">
                <Edit className="w-3 h-3" />
              </button>
              <button onClick={() => handleDelete(tag.id)} className="p-1 hover:bg-muted rounded text-destructive">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">Nessun tag. Crea il primo!</p>
        )}
      </div>
    </div>
  );
}
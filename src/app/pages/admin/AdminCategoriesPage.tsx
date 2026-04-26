import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', color: '#000000' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await supabase.from('categories').update(formData).eq('id', editingId);
    } else {
      await supabase.from('categories').insert(formData);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', slug: '', description: '', color: '#000000' });
    loadCategories();
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color,
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questa categoria?')) return;
    await supabase.from('categories').delete().eq('id', id);
    loadCategories();
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Categorie</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', slug: '', description: '', color: '#000000' });
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded"
        >
          <Plus className="w-4 h-4" />
          Nuova Categoria
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-serif text-xl mb-4">
            {editingId ? 'Modifica Categoria' : 'Nuova Categoria'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrizione</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Colore</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-20 h-10"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
              <div className="h-6 w-24 bg-muted rounded mb-2" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">/{category.slug}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 hover:bg-muted rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 hover:bg-muted rounded text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-8">
            Nessuna categoria. Crea la prima!
          </p>
        )}
      </div>
    </div>
  );
}
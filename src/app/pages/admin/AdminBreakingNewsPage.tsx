import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Zap } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface BreakingNews {
  id: string;
  text: string;
  active: boolean;
  created_at: string;
}

export function AdminBreakingNewsPage() {
  const [items, setItems] = useState<BreakingNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ text: '', active: true });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase.from('breaking_news').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await supabase.from('breaking_news').update(formData).eq('id', editingId);
    } else {
      await supabase.from('breaking_news').insert(formData);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ text: '', active: true });
    loadData();
  };

  const handleEdit = (item: BreakingNews) => {
    setFormData({ text: item.text, active: item.active });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare?')) return;
    await supabase.from('breaking_news').delete().eq('id', id);
    loadData();
  };

  const handleSetActive = async (id: string, active: boolean) => {
    await supabase.from('breaking_news').update({ active }).eq('id', id);
    if (active) {
      await supabase.from('breaking_news').update({ active: false }).neq('id', id);
    }
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Breaking News</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ text: '', active: true });
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded"
        >
          <Plus className="w-4 h-4" />
          Nuovo
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
          <h2 className="font-serif text-xl mb-4">
            {editingId ? 'Modifica' : 'Nuovo'} Breaking News
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Testo</label>
              <input
                type="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background"
                required
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <span>Attivo</span>
            </label>
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

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
          ))
        ) : items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className={`bg-card border border-border rounded-lg p-4 flex items-center justify-between ${
                item.active ? 'border-primary' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Zap className={`w-5 h-5 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium">{item.text}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.created_at).toLocaleString('it-IT')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!item.active && (
                  <button
                    onClick={() => handleSetActive(item.id, true)}
                    className="px-3 py-1 text-sm border border-border rounded hover:bg-muted"
                  >
                    Attiva
                  </button>
                )}
                {item.active && (
                  <button
                    onClick={() => handleSetActive(item.id, false)}
                    className="px-3 py-1 text-sm border border-border rounded hover:bg-muted"
                  >
                    Disattiva
                  </button>
                )}
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 hover:bg-muted rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 hover:bg-muted rounded text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Nessun breaking news. Crea il primo!
          </p>
        )}
      </div>
    </div>
  );
}
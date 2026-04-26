import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatDate } from '../../../lib/api';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string;
  };
  category?: {
    name: string;
  };
}

export function AdminArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());

  const statusParam = searchParams.get('status');

  useEffect(() => {
    async function loadArticles() {
      setLoading(true);
      try {
        let query = supabase
          .from('articles')
          .select(`
            id, title, slug, status, featured, views, created_at, updated_at,
            author:profiles!author_id(full_name),
            category:categories(name)
          `)
          .order('created_at', { ascending: false });

        if (statusParam) {
          query = query.eq('status', statusParam);
        }

        if (search) {
          query = query.ilike('title', `%${search}%`);
        }

        const { data, error } = await query;

        if (!error) {
          setArticles(data || []);
        }
      } catch (err) {
        console.error('Error loading articles:', err);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, [statusParam, search]);

  const handleStatusFilter = (status: string) => {
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
    setStatusFilter(status);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo articolo?')) return;

    const { error } = await supabase.from('articles').delete().eq('id', id);
    
    if (!error) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedArticles.size} articoli?`)) return;

    const { error } = await supabase
      .from('articles')
      .delete()
      .in('id', Array.from(selectedArticles));

    if (!error) {
      setArticles(articles.filter(a => !selectedArticles.has(a.id)));
      setSelectedArticles(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedArticles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedArticles.size === articles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(articles.map(a => a.id)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Articoli</h1>
        <Link
          to="/admin/articles/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Nuovo Articolo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cerca articoli..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded bg-background"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded bg-background"
          >
            <option value="">Tutti</option>
            <option value="published">Pubblicati</option>
            <option value="draft">Bozze</option>
            <option value="archived">Archiviati</option>
          </select>
        </div>

        {selectedArticles.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 border border-destructive text-destructive rounded hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
            Elimina ({selectedArticles.size})
          </button>
        )}
      </div>

      {/* Articles Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-10 p-4">
                <input
                  type="checkbox"
                  checked={selectedArticles.size === articles.length && articles.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="p-4 text-left text-sm font-medium">Titolo</th>
              <th className="p-4 text-left text-sm font-medium">Autore</th>
              <th className="p-4 text-left text-sm font-medium">Categoria</th>
              <th className="p-4 text-left text-sm font-medium">Stato</th>
              <th className="p-4 text-left text-sm font-medium">Views</th>
              <th className="p-4 text-left text-sm font-medium">Data</th>
              <th className="w-20 p-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-4"><div className="w-4 h-4 bg-muted rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-4 w-48 bg-muted rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-4 w-24 bg-muted rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-4 w-20 bg-muted rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-4 w-16 bg-muted rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-4 w-12 bg-muted rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-4 w-24 bg-muted rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-8 w-8 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))
            ) : articles.length > 0 ? (
              articles.map((article) => (
                <tr key={article.id} className="border-t border-border">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedArticles.has(article.id)}
                      onChange={() => toggleSelect(article.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {article.featured && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Featured</span>
                      )}
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <p className="text-sm text-muted-foreground">/{article.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {article.author?.full_name || '-'}
                  </td>
                  <td className="p-4 text-sm">
                    {article.category?.name || '-'}
                  </td>
                  <td className="p-4">
                    <span className={`text-sm px-2 py-1 rounded ${
                      article.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : article.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {article.views || 0}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {formatDate(article.created_at)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/article/${article.slug}`}
                        target="_blank"
                        className="p-2 hover:bg-muted rounded"
                        title="Visualizza"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/admin/articles/${article.id}`}
                        className="p-2 hover:bg-muted rounded"
                        title="Modifica"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-2 hover:bg-muted rounded text-destructive"
                        title="Elimina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-border">
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  Nessun articolo trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { uploadImage } from '../../../lib/api';
import { RichTextEditor } from '../../components/RichTextEditor';

interface ArticleFormData {
  title: string;
  slug: string;
  subtitle: string;
  content: string;
  excerpt: string;
  cover_image: string;
  category_id: string;
  status: 'draft' | 'published';
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
}

export function AdminArticleEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    subtitle: '',
    content: '',
    excerpt: '',
    cover_image: '',
    category_id: '',
    status: 'draft',
    featured: false,
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [categoriesRes] = await Promise.all([
          supabase.from('categories').select('id, name').order('name'),
        ]);

        setCategories(categoriesRes.data || []);

        if (id) {
          const { data: article, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();

          if (!error && article) {
            setFormData({
              title: article.title,
              slug: article.slug,
              subtitle: article.subtitle || '',
              content: article.content,
              excerpt: article.excerpt || '',
              cover_image: article.cover_image || '',
              category_id: article.category_id || '',
              status: article.status,
              featured: article.featured,
            });
            setCoverPreview(article.cover_image || '');
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    const newSlug = isEditing ? formData.slug : generateSlug(title);
    setFormData({ ...formData, title, slug: newSlug });
  };

  const handleContentChange = useCallback((content: string) => {
    setFormData(prev => ({ ...prev, content }));
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const url = await uploadImage(file);
      setFormData({ ...formData, cover_image: url });
      setCoverPreview(url);
    } catch (err) {
      console.error('Error uploading cover:', err);
      alert('Errore nel caricamento dell\'immagine');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleRemoveCover = () => {
    setFormData({ ...formData, cover_image: '' });
    setCoverPreview('');
  };

  const handleSave = async (status?: 'draft' | 'published') => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const articleData = {
        ...formData,
        status: status || formData.status,
        published_at: status === 'published' ? new Date().toISOString() : formData.published_at,
      };

      if (isEditing) {
        await supabase
          .from('articles')
          .update(articleData)
          .eq('id', id);
      } else {
        await supabase
          .from('articles')
          .insert({
            ...articleData,
            author_id: user.id,
          });
      }

      navigate('/admin/articles');
    } catch (err) {
      console.error('Error saving article:', err);
      alert('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    const { error } = await supabase.from('articles').delete().eq('id', id);
    
    if (!error) {
      navigate('/admin/articles');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-12 w-full bg-muted rounded animate-pulse" />
        <div className="h-96 w-full bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/articles"
            className="p-2 hover:bg-muted rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-2xl">
            {isEditing ? 'Modifica Articolo' : 'Nuovo Articolo'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && formData.status === 'published' && (
            <Link
              to={`/article/${formData.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 border border-border rounded hover:bg-muted transition-colors"
            >
              <Eye className="w-4 h-4" />
              Visualizza
            </Link>
          )}
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded hover:bg-muted disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvataggio...' : 'Salva Bozza'}
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Pubblicazione...' : 'Pubblica'}
          </button>
          {isEditing && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-destructive hover:bg-destructive/10 rounded"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Titolo *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Titolo dell'articolo"
              className="w-full px-4 py-3 text-xl font-serif border border-border rounded bg-background"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">/article/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 px-3 py-2 border border-border rounded bg-background"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium mb-2">Sottotitolo</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Sottotitolo opzionale"
              className="w-full px-4 py-2 border border-border rounded bg-background"
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Contenuto *</label>
            <RichTextEditor
              content={formData.content}
              onChange={handleContentChange}
              placeholder="Scrivi il tuo articolo..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3">Immagine di copertina</h3>
            
            {coverPreview ? (
              <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemoveCover}
                  className="absolute top-2 right-2 p-1 bg-background/80 rounded hover:bg-background"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {uploadingCover ? 'Caricamento...' : 'Clicca per caricare'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={uploadingCover}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Category */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3">Categoria</h3>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded bg-background"
            >
              <option value="">Seleziona categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3">Riassunto</h3>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Breve descrizione per anteprima..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded bg-background resize-none"
            />
          </div>

          {/* Options */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3">Opzioni</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Articolo in evidenza</span>
            </label>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md">
            <h3 className="font-serif text-xl mb-4">Conferma eliminazione</h3>
            <p className="text-muted-foreground mb-6">
              Sei sicuro di voler eliminare questo articolo? L'azione non può essere annullata.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-border rounded hover:bg-muted"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:opacity-90"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
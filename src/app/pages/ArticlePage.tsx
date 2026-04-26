import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { TrendingArticle } from '../components/TrendingArticle';
import { Skeleton } from '../components/ui/skeleton';
import { Clock, Calendar, User, Share2, Bookmark, Facebook, Twitter, Linkedin } from 'lucide-react';
import { getArticleBySlug, getRelatedArticles, formatDate, calculateReadTime, type ArticleWithDetails } from '../../lib/api';

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<ArticleWithDetails | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ArticleWithDetails[]>([]);

  useEffect(() => {
    async function loadArticle() {
      if (!id) {
        setError('Articolo non trovato');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const articleData = await getArticleBySlug(id);

        if (!articleData) {
          setError('Articolo non trovato');
          setLoading(false);
          return;
        }

        setArticle(articleData);

        const related = await getRelatedArticles(
          articleData.id,
          articleData.category_id || '',
          4
        ).catch(() => []);
        setRelatedArticles(related);
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Errore nel caricamento dell\'articolo');
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [id]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || '';

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-2/3 mb-8" />
        <div className="flex gap-8 mb-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="aspect-[16/9] w-full mb-12" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-serif mb-4">Articolo non trovato</h1>
        <p className="text-muted-foreground mb-8">{error || 'L\'articolo richiesto non esiste o è stato rimosso.'}</p>
        <Link to="/" className="text-primary hover:underline">
          ← Torna alla home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-3 gap-12">
        <article className="md:col-span-2">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              ← Torna alla home
            </Link>

            <div className="mb-6">
              <span className="inline-block uppercase tracking-wider text-xs font-medium text-primary mb-4">
                {article.category?.name || 'Notizia'}
              </span>
              <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {article.subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author?.full_name || 'Redazione'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time>{formatDate(article.published_at || article.created_at)}</time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{calculateReadTime(article.content)} di lettura</span>
              </div>
            </div>
          </div>

          {article.cover_image && (
            <div className="relative aspect-[16/9] mb-12 overflow-hidden">
              <ImageWithFallback
                src={article.cover_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none font-serif">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags?.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/tag/${tag.slug}`}
                  className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full hover:bg-muted/70 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between py-6 border-t border-b border-border">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Condividi:</span>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleShare('facebook')}
                  className="p-2 hover:bg-muted rounded transition-colors" 
                  aria-label="Condividi su Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleShare('twitter')}
                  className="p-2 hover:bg-muted rounded transition-colors" 
                  aria-label="Condividi su Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleShare('linkedin')}
                  className="p-2 hover:bg-muted rounded transition-colors" 
                  aria-label="Condividi su LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded transition-colors" aria-label="Salva articolo">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </article>

        <aside>
          <div className="sticky top-24">
            <h3 className="font-serif text-2xl mb-6 pb-3 border-b-2 border-primary">
              Articoli correlati
            </h3>
            <div>
              {relatedArticles.length > 0 ? (
                relatedArticles.map((article, index) => (
                  <TrendingArticle
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    category={article.category?.name || 'Notizia'}
                    rank={index + 1}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Nessun articolo correlato</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
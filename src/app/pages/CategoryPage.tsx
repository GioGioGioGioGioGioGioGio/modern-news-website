import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';
import { getArticles, getCategoryBySlug, formatDate, calculateReadTime, type ArticleWithDetails, type Category } from '../../lib/api';
import { Skeleton } from '../components/ui/skeleton';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<ArticleWithDetails[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!slug) {
        setError('Categoria non trovata');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [categoryData, articlesData] = await Promise.all([
          getCategoryBySlug(slug),
          getArticles({ categorySlug: slug, limit: 20 }),
        ]);

        if (!categoryData) {
          setError('Categoria non trovata');
          setLoading(false);
          return;
        }

        setCategory(categoryData);
        setArticles(articlesData);
      } catch (err) {
        console.error('Error loading category:', err);
        setError('Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Skeleton className="h-12 w-48 mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-serif mb-4">Categoria non trovata</h1>
        <p className="text-muted-foreground mb-8">{error || 'La categoria richiesta non esiste.'}</p>
        <Link to="/" className="text-primary hover:underline">
          ← Torna alla home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-xl text-muted-foreground">{category.description}</p>
        )}
      </div>

      {articles.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              id={article.id}
              image={article.cover_image || ''}
              category={article.category?.name || category.name}
              title={article.title}
              excerpt={article.excerpt || article.subtitle || ''}
              author={article.author?.full_name || 'Redazione'}
              date={formatDate(article.published_at || article.created_at)}
              readTime={calculateReadTime(article.content)}
              variant="default"
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Non ci sono articoli in questa categoria.</p>
      )}
    </div>
  );
}
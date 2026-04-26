import { useEffect, useState } from 'react';
import { BreakingNews } from '../components/BreakingNews';
import { ArticleCard } from '../components/ArticleCard';
import { CategorySection } from '../components/CategorySection';
import { TrendingArticle } from '../components/TrendingArticle';
import { NewsletterCTA } from '../components/NewsletterCTA';
import { Skeleton } from '../components/ui/skeleton';
import { getBreakingNews, getFeaturedArticle, getArticles, getTrendingArticles, formatDate, calculateReadTime, type ArticleWithDetails, type BreakingNews as BreakingNewsType } from '../../lib/api';

function ArticleCardData({ article, variant = 'default' }: { article: ArticleWithDetails; variant?: 'default' | 'hero' | 'small' }) {
  return (
    <ArticleCard
      id={article.id}
      image={article.cover_image || ''}
      category={article.category?.name || 'Notizia'}
      title={article.title}
      excerpt={article.excerpt || article.subtitle || ''}
      author={article.author?.full_name || 'Redazione'}
      date={formatDate(article.published_at || article.created_at)}
      readTime={calculateReadTime(article.content)}
      variant={variant}
    />
  );
}

function TrendingArticleData({ article, rank }: { article: ArticleWithDetails; rank: number }) {
  return (
    <TrendingArticle
      id={article.id}
      title={article.title}
      category={article.category?.name || 'Notizia'}
      rank={rank}
    />
  );
}

export function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breakingNews, setBreakingNews] = useState<BreakingNewsType | null>(null);
  const [heroArticle, setHeroArticle] = useState<ArticleWithDetails | null>(null);
  const [topArticles, setTopArticles] = useState<ArticleWithDetails[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<ArticleWithDetails[]>([]);
  const [techArticles, setTechArticles] = useState<ArticleWithDetails[]>([]);
  const [cultureArticles, setCultureArticles] = useState<ArticleWithDetails[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [
          breakingNewsData,
          heroData,
          topData,
          trendingData,
          techData,
          cultureData
        ] = await Promise.all([
          getBreakingNews().catch(() => null),
          getFeaturedArticle().catch(() => null),
          getArticles({ limit: 5 }).catch(() => []),
          getTrendingArticles(5).catch(() => []),
          getArticles({ categorySlug: 'tecnologia', limit: 3 }).catch(() => []),
          getArticles({ categorySlug: 'cultura', limit: 3 }).catch(() => [])
        ]);

        setBreakingNews(breakingNewsData);
        setHeroArticle(heroData);
        setTopArticles(topData.slice(0, 4));
        setTrendingArticles(trendingData);
        setTechArticles(techData);
        setCultureArticles(cultureData);
      } catch (err) {
        console.error('Error loading home page data:', err);
        setError('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-12 w-full" />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-16">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-80 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {breakingNews && <BreakingNews text={breakingNews.text} />}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-16">
          {heroArticle ? (
            <ArticleCardData article={heroArticle} variant="hero" />
          ) : topArticles[0] ? (
            <ArticleCardData article={topArticles[0]} variant="hero" />
          ) : null}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="md:col-span-2">
            <div className="grid md:grid-cols-2 gap-8">
              {topArticles.slice(1, 5).map((article) => (
                <ArticleCardData key={article.id} article={article} variant="default" />
              ))}
            </div>
          </div>

          <aside>
            <div className="sticky top-24">
              <h3 className="font-serif text-2xl mb-6 pb-3 border-b-2 border-primary">
                Trending
              </h3>
              <div>
                {trendingArticles.map((article, index) => (
                  <TrendingArticleData key={article.id} article={article} rank={index + 1} />
                ))}
              </div>
            </div>
          </aside>
        </div>

        <CategorySection
          title="Tecnologia"
          slug="tecnologia"
          articles={techArticles.map(a => ({
            id: a.id,
            image: a.cover_image || '',
            category: a.category?.name || 'Tecnologia',
            title: a.title,
            excerpt: a.excerpt || a.subtitle || '',
            author: a.author?.full_name || 'Redazione',
            date: formatDate(a.published_at || a.created_at),
            readTime: calculateReadTime(a.content),
          }))}
        />

        <CategorySection
          title="Cultura"
          slug="cultura"
          articles={cultureArticles.map(a => ({
            id: a.id,
            image: a.cover_image || '',
            category: a.category?.name || 'Cultura',
            title: a.title,
            excerpt: a.excerpt || a.subtitle || '',
            author: a.author?.full_name || 'Redazione',
            date: formatDate(a.published_at || a.created_at),
            readTime: calculateReadTime(a.content),
          }))}
        />
      </div>

      <NewsletterCTA />
    </div>
  );
}
import { Link } from 'react-router-dom';
import { ArticleCard } from './ArticleCard';

interface Article {
  id: string;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
}

interface CategorySectionProps {
  title: string;
  slug: string;
  articles: Article[];
}

export function CategorySection({ title, slug, articles }: CategorySectionProps) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-primary">
        <h2 className="font-serif text-3xl">{title}</h2>
        <Link
          to={`/category/${slug}`}
          className="text-sm uppercase tracking-wider hover:text-primary transition-colors"
        >
          Vedi tutto →
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.id} {...article} variant="default" />
        ))}
      </div>
    </section>
  );
}

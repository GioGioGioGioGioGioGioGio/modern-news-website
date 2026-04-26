import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

interface TrendingArticleProps {
  id: string;
  title: string;
  category: string;
  rank: number;
}

export function TrendingArticle({ id, title, category, rank }: TrendingArticleProps) {
  return (
    <Link to={`/article/${id}`} className="group flex gap-4 py-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors px-4 -mx-4">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded font-medium">
        {rank}
      </div>
      <div className="flex-1">
        <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
          {category}
        </span>
        <h4 className="text-sm leading-snug group-hover:text-primary transition-colors">
          {title}
        </h4>
      </div>
      <TrendingUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
    </Link>
  );
}

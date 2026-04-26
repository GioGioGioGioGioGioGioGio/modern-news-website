import { Link } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ArticleCardProps {
  id: string;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  variant?: 'default' | 'hero' | 'small';
}

export function ArticleCard({
  id,
  image,
  category,
  title,
  excerpt,
  author,
  date,
  readTime,
  variant = 'default'
}: ArticleCardProps) {
  const isHero = variant === 'hero';
  const isSmall = variant === 'small';

  return (
    <Link to={`/article/${id}`} className="group block">
      <article className={`${isHero ? 'grid md:grid-cols-2 gap-8' : ''}`}>
        <div className={`relative overflow-hidden bg-muted ${
          isHero ? 'aspect-[16/10]' : isSmall ? 'aspect-[4/3]' : 'aspect-[16/9]'
        }`}>
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className={`${isHero ? 'flex flex-col justify-center' : 'mt-4'}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="uppercase tracking-wider text-xs font-medium text-primary">
              {category}
            </span>
            <span className="text-xs text-muted-foreground">{readTime}</span>
          </div>

          <h3 className={`font-serif mb-3 leading-tight group-hover:text-primary/80 transition-colors ${
            isHero ? 'text-5xl' : isSmall ? 'text-xl' : 'text-2xl'
          }`}>
            {title}
          </h3>

          {!isSmall && (
            <p className={`text-muted-foreground leading-relaxed ${
              isHero ? 'text-lg mb-4' : 'text-base mb-3'
            }`}>
              {excerpt}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{author}</span>
            <span>·</span>
            <time>{date}</time>
          </div>
        </div>
      </article>
    </Link>
  );
}

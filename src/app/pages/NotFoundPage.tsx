import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="font-serif text-6xl mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Pagina non trovata</p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
      >
        Torna alla home
      </Link>
    </div>
  );
}

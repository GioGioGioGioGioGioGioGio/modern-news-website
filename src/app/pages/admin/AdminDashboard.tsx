import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Eye, TrendingUp, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  totalUsers: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0,
    publishedArticles: 0,
    totalViews: 0,
    totalUsers: 0,
  });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [articlesRes, profilesRes] = await Promise.all([
          supabase.from('articles').select('id, status, views, title, created_at'),
          supabase.from('profiles').select('id'),
        ]);

        const articles = articlesRes.data || [];
        const publishedArticles = articles.filter(a => a.status === 'published');
        
        setStats({
          totalArticles: articles.length,
          publishedArticles: publishedArticles.length,
          totalViews: publishedArticles.reduce((sum, a) => sum + (a.views || 0), 0),
          totalUsers: (profilesRes.data || []).length,
        });

        setRecentArticles(articles.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, link }: { title: string; value: number; icon: any; link?: string }) => (
    <Link
      to={link || '#'}
      className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-serif">{value.toLocaleString('it-IT')}</p>
        </div>
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
              <div className="h-4 w-24 bg-muted rounded mb-2" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Dashboard</h1>
        <Link
          to="/admin/articles/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuovo Articolo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Totale Articoli" value={stats.totalArticles} icon={FileText} link="/admin/articles" />
        <StatCard title="Pubblicati" value={stats.publishedArticles} icon={TrendingUp} link="/admin/articles?status=published" />
        <StatCard title="Visualizzazioni" value={stats.totalViews} icon={Eye} />
        <StatCard title="Utenti" value={stats.totalUsers} icon={Users} link="/admin/users" />
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-serif text-xl mb-4">Articoli Recenti</h2>
        <div className="space-y-2">
          {recentArticles.length > 0 ? (
            recentArticles.map(article => (
              <Link
                key={article.id}
                to={`/admin/articles/${article.id}`}
                className="flex items-center justify-between p-3 rounded hover:bg-muted transition-colors"
              >
                <div>
                  <p className="font-medium">{article.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(article.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <span className={`text-sm px-2 py-1 rounded ${
                  article.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {article.status}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-muted-foreground">Nessun articolo. Crea il primo!</p>
          )}
        </div>
      </div>
    </div>
  );
}
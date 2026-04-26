import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Plus, Folder, Tag, Users, Zap, Home, LogOut } from 'lucide-react';
import { useAuth } from '../AuthContext';

export function AdminSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const NavLink = ({ to, icon: Icon, children }: { to: string; icon: any; children: React.ReactNode }) => {
    const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
          isActive 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-muted'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-xl">Il Giornale</span>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">Pannello di Redazione</p>
      </div>

      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavLink to="/admin" icon={LayoutDashboard}>Dashboard</NavLink>
        <NavLink to="/admin/articles" icon={FileText}>Articoli</NavLink>
        <NavLink to="/admin/articles/new" icon={Plus}>Nuovo Articolo</NavLink>
        <NavLink to="/admin/categories" icon={Folder}>Categorie</NavLink>
        <NavLink to="/admin/tags" icon={Tag}>Tag</NavLink>

        {profile?.role === 'admin' && (
          <>
            <div className="pt-4 pb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider px-3">
                Amministrazione
              </span>
            </div>
            <NavLink to="/admin/users" icon={Users}>Utenti</NavLink>
            <NavLink to="/admin/breaking-news" icon={Zap}>Breaking News</NavLink>
          </>
        )}
      </div>

      <div className="p-4 border-t border-border space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Torna al sito</span>
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Esci</span>
        </button>
      </div>
    </nav>
  );
}
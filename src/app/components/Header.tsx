import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, Moon, Sun, User, LogOut } from 'lucide-react';
import { getCategories, getCurrentUser, signOut, type Category, type Profile } from '../../lib/api';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ darkMode, onToggleDarkMode }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<Profile | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error loading user:', err);
      }
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const today = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="border-b border-border py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs">
          <time className="text-muted-foreground">{today}</time>
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleDarkMode}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user.full_name || user.email}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded shadow-lg py-2">
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 hover:bg-muted text-sm"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 hover:bg-muted text-sm text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Esci
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1 hover:text-foreground transition-colors">
                <User className="w-4 h-4" />
                <span>Accedi</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex-1 text-center">
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight">
              Il Giornale
            </h1>
          </Link>

          <button className="p-2 hover:bg-muted rounded transition-colors" aria-label="Cerca">
            <Search className="w-5 h-5" />
          </button>
        </div>

        <nav className={`${menuOpen ? 'block' : 'hidden'} md:block border-t md:border-t-0 pt-4 md:pt-0`}>
          <ul className="flex flex-col md:flex-row md:items-center md:justify-center gap-4 md:gap-6 text-sm">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/category/${category.slug}`}
                  className="hover:text-foreground text-muted-foreground transition-colors uppercase tracking-wide"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
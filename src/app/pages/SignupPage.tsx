import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../../lib/api';

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Errore nella registrazione');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <h1 className="font-serif text-3xl mb-4">Controlla la tua email</h1>
          <p className="text-muted-foreground mb-6">
            Ti abbiamo inviato un link di conferma. Clicca sul link per attivare il tuo account.
          </p>
          <Link to="/" className="text-primary hover:underline">
            Torna alla home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-card border border-border rounded-lg p-8">
        <h1 className="font-serif text-3xl mb-6 text-center">Registrati</h1>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
              Nome completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded bg-background"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded bg-background"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-border rounded bg-background"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Hai già un account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
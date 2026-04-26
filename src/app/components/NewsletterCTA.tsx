import { Mail } from 'lucide-react';
import { useState } from 'react';

export function NewsletterCTA() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <section className="bg-primary text-primary-foreground py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <Mail className="w-12 h-12 mx-auto mb-4 opacity-90" />
        <h2 className="font-serif text-3xl md:text-4xl mb-4">
          Iscriviti alla newsletter
        </h2>
        <p className="text-lg mb-8 opacity-90">
          Ricevi ogni giorno le notizie più importanti direttamente nella tua casella email
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tua@email.com"
            required
            className="flex-1 px-4 py-3 bg-background text-foreground rounded focus:outline-none focus:ring-2 focus:ring-primary-foreground"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary-foreground text-primary rounded hover:opacity-90 transition-opacity font-medium"
          >
            Iscriviti
          </button>
        </form>
      </div>
    </section>
  );
}

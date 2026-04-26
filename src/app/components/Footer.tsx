import { Link } from 'react-router-dom';

export function Footer() {
  const sections = [
    {
      title: 'Sezioni',
      links: ['Politica', 'Economia', 'Tecnologia', 'Cultura', 'Sport', 'Scienza']
    },
    {
      title: 'Informazioni',
      links: ['Chi siamo', 'Contatti', 'Pubblicità', 'Lavora con noi']
    },
    {
      title: 'Legale',
      links: ['Privacy Policy', 'Cookie Policy', 'Termini di servizio', 'Gestisci consensi']
    }
  ];

  return (
    <footer className="border-t border-border bg-muted/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-serif text-2xl mb-4">Il Giornale</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Informazione indipendente e di qualità dal 1990.
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-medium mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link
                      to="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2026 Il Giornale. Tutti i diritti riservati.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-foreground transition-colors">
              Facebook
            </Link>
            <Link to="#" className="hover:text-foreground transition-colors">
              Twitter
            </Link>
            <Link to="#" className="hover:text-foreground transition-colors">
              Instagram
            </Link>
            <Link to="#" className="hover:text-foreground transition-colors">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Sobre',
      links: [
        { name: 'Nossa História', href: '/about' },
        { name: 'Como Funciona', href: '/how-it-works' },
        { name: 'Depoimentos', href: '/testimonials' },
        { name: 'Blog', href: '/blog' }
      ]
    },
    {
      title: 'Suporte',
      links: [
        { name: 'Perguntas Frequentes', href: '/faq' },
        { name: 'Contato', href: '/contact' },
        { name: 'Termos de Uso', href: '/terms' },
        { name: 'Política de Privacidade', href: '/privacy' }
      ]
    },
    {
      title: 'Propriedades',
      links: [
        { name: 'Fazendas', href: '/properties?type=farm' },
        { name: 'Vinícolas', href: '/properties?type=winery' },
        { name: 'Sítios', href: '/properties?type=ranch' },
        { name: 'Pesqueiros', href: '/properties?type=fishing' }
      ]
    }
  ];

  return (
    <footer className="bg-white border-t border-border">
      <div className="container-px max-w-7xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center space-x-2">
              <img 
                src="/lovable-uploads/e519efc1-257a-49de-acaa-461d821b5ad9.png" 
                alt="AgroRota Logo" 
                className="h-10 w-auto" 
              />
              <span className="text-2xl font-bold playfair tracking-tight text-nature-800">
                Agro<span className="text-nature-600">Rota</span>
              </span>
            </Link>
            <p className="mt-4 text-muted-foreground text-sm max-w-xs">
              Descubra experiências autênticas no campo paranaense. Conectamos você às melhores propriedades rurais para uma experiência inesquecível.
            </p>
            <div className="mt-6 flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-nature-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-nature-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-nature-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold text-foreground">{column.title}</h3>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-muted-foreground hover:text-nature-700 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-foreground">Newsletter</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Fique por dentro das novidades e promoções.
            </p>
            <form className="mt-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="px-3 py-2 bg-muted border border-border rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-nature-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-nature-600 text-white rounded-md text-sm font-medium hover:bg-nature-700 transition-colors"
                >
                  Assinar
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} AgroRota. Todos os direitos reservados.
            </p>
            <div className="mt-4 sm:mt-0 flex space-x-4">
              <Link 
                to="/terms" 
                className="text-xs text-muted-foreground hover:text-nature-700 transition-colors"
              >
                Termos
              </Link>
              <Link 
                to="/privacy" 
                className="text-xs text-muted-foreground hover:text-nature-700 transition-colors"
              >
                Privacidade
              </Link>
              <Link 
                to="/cookies" 
                className="text-xs text-muted-foreground hover:text-nature-700 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

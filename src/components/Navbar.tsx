
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Calendar, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Propriedades', path: '/properties' },
    { name: 'Mapa', path: '/map' },
    { name: 'Experiências', path: '/experiences' },
    { name: 'Sobre', path: '/about' },
  ];

  const iconLinks = [
    { icon: <MapPin className="h-5 w-5" />, path: '/map', label: 'Mapa' },
    { icon: <Calendar className="h-5 w-5" />, path: '/bookings', label: 'Reservas' },
    { icon: <ShoppingCart className="h-5 w-5" />, path: '/shop', label: 'Loja' },
    { icon: <User className="h-5 w-5" />, path: '/profile', label: 'Perfil' },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-white/90 backdrop-blur-lg shadow-sm py-2" 
          : "bg-transparent py-4"
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl md:text-2xl font-bold playfair tracking-tight text-nature-800">
              Agro<span className="text-nature-600">Paraná</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md trans",
                  location.pathname === link.path
                    ? "text-nature-700 bg-nature-50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Icon Links */}
          <div className="hidden md:flex items-center space-x-2">
            {iconLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "p-2 rounded-full trans",
                  location.pathname === link.path
                    ? "text-nature-700 bg-nature-50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                aria-label={link.label}
              >
                {link.icon}
              </Link>
            ))}
            <Button size="sm" variant="default" className="ml-2 bg-nature-600 hover:bg-nature-700">
              Entrar
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted hover:text-foreground focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">Abrir menu</span>
            {isMobileMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out transform",
          isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        )}
      >
        <div className="flex flex-col h-full pt-20 pb-6 px-4 space-y-6">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-3 text-base font-medium rounded-md transition-colors",
                  location.pathname === link.path
                    ? "text-nature-700 bg-nature-50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="border-t border-border pt-6">
            <div className="grid grid-cols-4 gap-2">
              {iconLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex flex-col items-center justify-center p-3 space-y-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-foreground">{link.icon}</span>
                  <span className="text-xs text-muted-foreground">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mt-auto">
            <Button className="w-full bg-nature-600 hover:bg-nature-700">
              Entrar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Fish, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  const isAdmin = user?.user_metadata?.role === 'admin';

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/products', label: 'Productos' },
    { path: '/about', label: 'Nosotros' },
    { path: '/contact', label: 'Contacto' },
  ];

  return (
    <nav className="bg-blue-900 text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Fish className="h-8 w-8" />
            <span className="text-xl font-bold hidden xs:block">MarDelicia</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`hover:text-blue-200 transition-colors ${
                  location.pathname === link.path ? 'text-blue-200' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
                  >
                    <LayoutDashboard className="h-6 w-6" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
                >
                  <User className="h-6 w-6" />
                  <span>Perfil</span>
                </Link>
              </>
            )}
            <button
              onClick={handleAuthClick}
              className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
            >
              {user ? (
                <>
                  <LogOut className="h-6 w-6" />
                  <span>Salir</span>
                </>
              ) : (
                <>
                  <User className="h-6 w-6" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-900 border-t border-blue-800">
          <div className="container mx-auto px-4 py-3 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 hover:text-blue-200 transition-colors ${
                  location.pathname === link.path ? 'text-blue-200' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block py-2 hover:text-blue-200 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Admin</span>
                    </div>
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block py-2 hover:text-blue-200 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Perfil</span>
                  </div>
                </Link>
              </>
            )}
            <button
              onClick={() => {
                handleAuthClick();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-blue-200 transition-colors"
            >
              <div className="flex items-center space-x-2">
                {user ? (
                  <>
                    <LogOut className="h-5 w-5" />
                    <span>Salir</span>
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5" />
                    <span>Entrar</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
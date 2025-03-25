import React from 'react';
import { Link } from 'react-router-dom';
import { Fish, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Fish className="h-8 w-8" />
              <span className="text-xl font-bold">MarDelicia</span>
            </Link>
            <p className="text-blue-100">
              Llevando lo mejor del mar a tu mesa desde 1995. Calidad y frescura garantizada.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-blue-100 hover:text-white">Inicio</Link>
              </li>
              <li>
                <Link to="/products" className="text-blue-100 hover:text-white">Productos</Link>
              </li>
              <li>
                <Link to="/about" className="text-blue-100 hover:text-white">Nosotros</Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-100 hover:text-white">Contacto</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contáctanos</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-blue-100" />
                <span className="text-blue-100">+51 123 456 789</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-100" />
                <span className="text-blue-100">ventas@mardelicia.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-100" />
                <span className="text-blue-100">Eduardo Castex, La Pampa, Argentina</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-100 hover:text-white">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-blue-100 hover:text-white">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-blue-100 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
            <div className="mt-4">
              <p className="text-sm text-blue-100">
                Horario de atención:<br />
                Lunes a Sábado<br />
                7:00 AM - 4:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-100">
          <p>&copy; {new Date().getFullYear()} MarDelicia. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
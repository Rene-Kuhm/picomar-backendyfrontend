import React from 'react';
import { Fish, Award, Users, Truck, ShieldCheck } from 'lucide-react';

export function About() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80"
          alt="Equipo MarDelicia"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/60 flex items-center">
          <div className="max-w-3xl mx-auto text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Nuestra Historia</h1>
            <p className="text-xl text-blue-100">
              Más de 25 años llevando los mejores productos del mar a las mesas peruanas
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Nuestra Misión</h2>
          <p className="text-gray-600">
            Proveer a nuestros clientes con los productos marinos más frescos y de la más alta calidad, 
            manteniendo prácticas sostenibles y apoyando a las comunidades pesqueras locales.
          </p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Nuestra Visión</h2>
          <p className="text-gray-600">
            Ser la empresa líder en distribución de productos marinos en el Perú, reconocida por 
            nuestra excelencia en calidad, servicio y compromiso con la sostenibilidad.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">Nuestros Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <ShieldCheck className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Calidad</h3>
              <p className="text-gray-600">
                Garantizamos la más alta calidad en todos nuestros productos y servicios.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Users className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Compromiso</h3>
              <p className="text-gray-600">
                Comprometidos con nuestros clientes, proveedores y el medio ambiente.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Award className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Excelencia</h3>
              <p className="text-gray-600">
                Buscamos la excelencia en cada aspecto de nuestro negocio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">Nuestro Equipo</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80"
              alt="CEO"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold">Carlos Martínez</h3>
            <p className="text-gray-600">CEO</p>
          </div>
          <div className="text-center">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80"
              alt="Gerente de Operaciones"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold">Ana Silva</h3>
            <p className="text-gray-600">Gerente de Operaciones</p>
          </div>
          <div className="text-center">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"
              alt="Jefe de Calidad"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold">Miguel Torres</h3>
            <p className="text-gray-600">Jefe de Calidad</p>
          </div>
          <div className="text-center">
            <img
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80"
              alt="Gerente Comercial"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold">Laura Pérez</h3>
            <p className="text-gray-600">Gerente Comercial</p>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">Certificaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-xl text-center">
              <Award className="h-12 w-12 text-blue-900 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">ISO 9001:2015</h3>
              <p className="text-gray-600">Gestión de Calidad</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl text-center">
              <Award className="h-12 w-12 text-blue-900 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">HACCP</h3>
              <p className="text-gray-600">Seguridad Alimentaria</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl text-center">
              <Award className="h-12 w-12 text-blue-900 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">ISO 14001</h3>
              <p className="text-gray-600">Gestión Ambiental</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
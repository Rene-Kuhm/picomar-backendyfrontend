import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Fish, ShoppingCart, Truck, Award, Shield, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?auto=format&fit=crop&q=80",
      title: "Mariscos Frescos a Tu Mesa",
      description: "Descubre la mejor selección de pescados y mariscos frescos, directamente del mar a tu hogar."
    },
    {
      image: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?auto=format&fit=crop&q=80",
      title: "Calidad Garantizada",
      description: "Trabajamos con los mejores proveedores para garantizar la máxima frescura y calidad en cada producto."
    },
    {
      image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=2940",
      title: "Envíos en el Día",
      description: "Realizamos entregas el mismo día para pedidos antes de las 12:00 PM. ¡Tu pedido fresco y puntual!"
    }
  ];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, heroSlides.length]);

  async function fetchFeaturedProducts() {
    try {
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .limit(6)
        .throwOnError();

      if (supabaseError) throw supabaseError;

      if (!data) {
        throw new Error('No data received from Supabase');
      }

      setFeaturedProducts(data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setError('Error al cargar los productos destacados. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  const nextSlide = () => {
    setAutoplay(false);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setAutoplay(false);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="space-y-16">
      {/* Hero Section with Carousel */}
      <section className="relative h-[600px] rounded-xl overflow-hidden group">
        <div 
          className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide, index) => (
            <div key={index} className="relative w-full h-full flex-shrink-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex items-center">
                <div className="max-w-xl ml-12 text-white">
                  <h1 className="text-5xl font-bold mb-4 animate-fade-in">{slide.title}</h1>
                  <p className="text-xl mb-8 animate-fade-in-delay">{slide.description}</p>
                  <Link 
                    to="/products" 
                    className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2 group animate-fade-in-delay-2"
                  >
                    <span>Ver Productos</span>
                    <ShoppingCart className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronLeft className="h-6 w-6 text-blue-900" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronRight className="h-6 w-6 text-blue-900" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setAutoplay(false);
                setCurrentSlide(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl transform hover:-translate-y-1 transition-all hover:shadow-lg">
            <div className="bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-4">Envío Express</h3>
            <p className="text-blue-800">
              Entrega el mismo día para pedidos antes de las 12:00 PM. Mantenemos la cadena de frío para garantizar la máxima frescura.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl transform hover:-translate-y-1 transition-all hover:shadow-lg">
            <div className="bg-green-700 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-4">Calidad Premium</h3>
            <p className="text-green-800">
              Productos seleccionados cuidadosamente y certificados bajo los más altos estándares de calidad.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl transform hover:-translate-y-1 transition-all hover:shadow-lg">
            <div className="bg-purple-700 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-purple-900 mb-4">Garantía Total</h3>
            <p className="text-purple-800">
              Garantizamos la satisfacción en cada compra. Si no estás conforme, te devolvemos tu dinero.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Productos Destacados</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra selección de productos frescos y de alta calidad, 
            cuidadosamente elegidos para brindarte la mejor experiencia gastronómica.
          </p>
        </div>

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos destacados...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <div 
                key={product.id} 
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {product.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.category && (
                      <span className="absolute top-2 left-2 bg-blue-900/90 text-white px-3 py-1 rounded-full text-sm">
                        {product.category}
                      </span>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      {product.unit_price > 0 && (
                        <p className="text-sm font-medium text-gray-900">
                          ${product.unit_price.toFixed(2)}/unidad
                        </p>
                      )}
                      {product.box_price > 0 && (
                        <p className="text-sm font-medium text-gray-900">
                          ${product.box_price.toFixed(2)}/caja
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/products`}
                      className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2 group"
                    >
                      <span>Ver más</span>
                      <ShoppingCart className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-3 rounded-full hover:bg-blue-800 transition-colors group"
          >
            <span>Ver Todos los Productos</span>
            <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/90">
          <img
            src="https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?auto=format&fit=crop&q=80"
            alt="Background"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para probar la mejor calidad del mar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de clientes satisfechos que confían en nosotros para llevar 
            los mejores productos del mar a su mesa.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/products"
              className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2 group"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Comprar Ahora</span>
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
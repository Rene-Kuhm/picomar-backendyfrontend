import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, Clock, ShoppingBag, User, Settings, LogOut, ShoppingCart, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ChatWidget } from '../components/ChatWidget';
import type { Database } from '../types/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface OrderWithDetails extends Order {
  items: (OrderItem & { product: Product })[];
}

export function UserProfile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'chat'>('orders');

  useEffect(() => {
    if (user) {
      fetchOrders();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const ordersChannel = supabase.channel('user-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
    };
  };

  async function fetchOrders() {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData as OrderWithDetails[] || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* User Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-6 w-6 text-blue-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.email}</h2>
              <p className="text-gray-600">Cliente desde {new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'orders'
                  ? 'border-b-2 border-blue-900 text-blue-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mis Pedidos
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'chat'
                  ? 'border-b-2 border-blue-900 text-blue-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chat de Soporte
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-900 text-blue-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mi Perfil
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Historial de Pedidos</h3>
                <Link
                  to="/products"
                  className="flex items-center gap-2 text-blue-900 hover:text-blue-700"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Hacer nuevo pedido
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes pedidos aún</h3>
                  <p className="text-gray-600 mb-4">¡Comienza a comprar nuestros productos frescos!</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Ver Productos
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Clock className="h-4 w-4" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            <span className="font-medium">Pedido #{order.id.slice(0, 8)}</span>
                          </div>
                          {order.notes && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                              <Calendar className="h-4 w-4" />
                              <span>{order.notes}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-lg font-bold text-blue-900">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-t">
                            <div className="flex items-center gap-3">
                              {item.product.image_url && (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-gray-600">
                                  {item.quantity} x ${item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold">
                              ${(item.quantity * item.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Chat de Soporte</h3>
              </div>
              <ChatWidget />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Información de la Cuenta</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Usuario</label>
                    <p className="mt-1 text-sm text-gray-900">Cliente</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Miembro desde</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(user?.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total de Pedidos</label>
                    <p className="mt-1 text-sm text-gray-900">{orders.length}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado de la Cuenta</label>
                    <p className="mt-1 text-sm text-gray-900">Activa</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Preferencias</h4>
                <div className="space-y-4">
                  <button
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                  >
                    <Settings className="h-5 w-5" />
                    Configurar notificaciones
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
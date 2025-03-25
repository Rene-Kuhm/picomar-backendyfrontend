import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Package, DollarSign, ShoppingBag, Users, Upload, X, Check, AlertCircle, Calendar, Bell, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface OrderWithDetails extends Order {
  items: (OrderItem & { product: Product })[];
}

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  pendingOrders: number;
  registeredUsers: number;
  recentOrders: OrderWithDetails[];
}

interface PriceUpdate {
  name: string;
  price: number;
  unit_price?: number;
  box_price?: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSales: 0,
    pendingOrders: 0,
    registeredUsers: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [priceFile, setPriceFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [newOrderNotification, setNewOrderNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchInitialStats();
    setupRealtimeSubscription();

    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  const setupRealtimeSubscription = () => {
    const ordersChannel = supabase.channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            if (audioRef.current) {
              try {
                await audioRef.current.play();
              } catch (error) {
                console.error('Error playing notification sound:', error);
              }
            }
            setNewOrderNotification(true);
            setTimeout(() => setNewOrderNotification(false), 5000);
          }
          fetchInitialStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        () => {
          fetchInitialStats();
        }
      )
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
    };
  };

  async function fetchInitialStats() {
    try {
      // Fetch total products
      const { data: products } = await supabase
        .from('products')
        .select('id');
      
      // Fetch orders with details
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const orders = ordersData as OrderWithDetails[];
      
      const totalSales = orders.reduce((sum, order) => 
        order.status === 'completed' ? sum + order.total : sum, 0) || 0;
      
      const pendingOrders = orders.filter(order => 
        order.status === 'pending').length || 0;

      const uniqueUsers = new Set(orders.map(order => order.user_id));
      const registeredUsers = uniqueUsers.size;

      setStats({
        totalProducts: products?.length || 0,
        totalSales,
        pendingOrders,
        registeredUsers,
        recentOrders: orders.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSetDeliveryDate = async () => {
    if (!selectedOrder || !deliveryDate) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'confirmed',
          notes: `Entrega programada para: ${deliveryDate}`
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      setShowDeliveryModal(false);
      setSelectedOrder(null);
      setDeliveryDate('');
      fetchInitialStats();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPriceFile(file);
      setUpdateError(null);
      setUpdateSuccess(false);
    }
  };

  const handlePriceUpdate = async () => {
    if (!priceFile) {
      setUpdateError('Por favor, seleccione un archivo CSV');
      return;
    }

    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const text = await priceFile.text();
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      
      const updates: PriceUpdate[] = rows.slice(1).map(row => {
        const [name, price, unit_price, box_price] = row.split(',').map(cell => cell.trim());
        return {
          name,
          price: parseFloat(price) || 0,
          unit_price: parseFloat(unit_price) || undefined,
          box_price: parseFloat(box_price) || undefined
        };
      });

      for (const update of updates) {
        const { error } = await supabase
          .from('products')
          .update({
            price: update.price,
            ...(update.unit_price && { unit_price: update.unit_price }),
            ...(update.box_price && { box_price: update.box_price })
          })
          .eq('name', update.name);

        if (error) throw error;
      }

      setUpdateSuccess(true);
      setPriceFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating prices:', error);
      setUpdateError('Error al actualizar los precios. Por favor, verifique el formato del archivo.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {newOrderNotification && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2 shadow-lg z-50">
          <Bell className="h-5 w-5" />
          <span>¡Nuevo pedido recibido!</span>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-semibold">{stats.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-900" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-semibold">${stats.totalSales.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pedidos Pendientes</p>
              <p className="text-2xl font-semibold">{stats.pendingOrders}</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios con Pedidos</p>
              <p className="text-2xl font-semibold">{stats.registeredUsers}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Pedidos Recientes</h3>
          <div className="space-y-4">
            {stats.recentOrders.map(order => (
              <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">Pedido #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      Cliente: {order.customer_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'completed' ? 'Completado' :
                       order.status === 'confirmed' ? 'Confirmado' :
                       order.status === 'pending' ? 'Pendiente' : 'Desconocido'}
                    </span>
                  </div>
                </div>

                <div className="mt-2 space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {item.quantity}x {item.product.name} - ${item.price.toFixed(2)}
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <p className="mt-2 text-sm text-blue-600">
                    {order.notes}
                  </p>
                )}

                {order.status === 'pending' && (
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDeliveryModal(true);
                    }}
                    className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Programar entrega</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/admin/products"
              className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-blue-900">Gestionar Productos</h4>
                <p className="text-sm text-blue-700">Agregar, editar o eliminar productos</p>
              </div>
              <Package className="h-6 w-6 text-blue-900" />
            </Link>

            <Link
              to="/admin/chat"
              className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-green-900">Chat de Soporte</h4>
                <p className="text-sm text-green-700">Atender consultas de clientes</p>
              </div>
              <MessageSquare className="h-6 w-6 text-green-900" />
            </Link>

            <button
              onClick={() => setShowPriceModal(true)}
              className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-yellow-900">Actualizar Precios</h4>
                <p className="text-sm text-yellow-700">Actualizar precios en lote</p>
              </div>
              <DollarSign className="h-6 w-6 text-yellow-900" />
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Date Modal */}
      {showDeliveryModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Programar Entrega - Pedido #{selectedOrder.id.slice(0, 8)}
              </h3>
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setSelectedOrder(null);
                  setDeliveryDate('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrega
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeliveryModal(false);
                    setSelectedOrder(null);
                    setDeliveryDate('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSetDeliveryDate}
                  disabled={!deliveryDate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400"
                >
                  <Calendar className="h-4 w-4" />
                  Confirmar Fecha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Update Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Actualizar Precios en Lote</h3>
              <button
                onClick={() => {
                  setShowPriceModal(false);
                  setPriceFile(null);
                  setUpdateError(null);
                  setUpdateSuccess(false);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo CSV de Precios
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="price-file"
                        className="relative cursor-pointer rounded-md font-medium text-blue-900 hover:text-blue-800"
                      >
                        <span>Cargar archivo</span>
                        <input
                          id="price-file"
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">o arrastrar y soltar</p>
                    </div>
                    <p className="text-xs text-gray-500">CSV con formato: nombre,precio,precio_unidad,precio_caja</p>
                  </div>
                </div>
              </div>

              {priceFile && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Archivo seleccionado: {priceFile.name}</span>
                </div>
              )}

              {updateError && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{updateError}</span>
                </div>
              )}

              {updateSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-5 w-5" />
                  <span>Precios actualizados correctamente</span>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPriceModal(false);
                    setPriceFile(null);
                    setUpdateError(null);
                    setUpdateSuccess(false);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePriceUpdate}
                  disabled={!priceFile || updating}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md ${
                    !priceFile || updating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-900 hover:bg-blue-800'
                  }`}
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Actualizar Precios</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fish, ShoppingBag, Info, Truck, Scale, Plus, Minus, X, Package, AlertCircle, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { StockIndicator } from '../components/StockIndicator';
import { CustomerForm } from '../components/CustomerForm';
import { OrderSummary } from '../components/OrderSummary';
import type { Database } from '../types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

const MAIN_CATEGORIES = ['Pescados', 'Mariscos', 'Pollo'];

const CATEGORY_IMAGES = {
  'Pescados': 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80',
  'Mariscos': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80',
  'Pollo': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80'
};

export function Products() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderType, setOrderType] = useState<'unit' | 'box'>('unit');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [quantities, setQuantities] = useState({
    unit: 1,
    box: 1
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const defaultType = selectedProduct.unit_stock > 0 ? 'unit' : 'box';
      setOrderType(defaultType);
      setQuantities({
        unit: 1,
        box: 1
      });
      setOrderError(null);
      setFormErrors({});
    }
  }, [selectedProduct]);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('category', MAIN_CATEGORIES)
        .order('category');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleQuantityChange = (value: number, type: 'unit' | 'box') => {
    if (!selectedProduct) return;
    setOrderError(null);

    const newQuantity = Math.max(1, value);
    const maxUnits = type === 'unit' ? Math.min(1000, selectedProduct.unit_stock) : undefined;
    
    if (maxUnits && newQuantity > maxUnits) {
      setOrderError(`Máximo ${maxUnits} unidades permitidas`);
      setQuantities(prev => ({
        ...prev,
        [type]: maxUnits
      }));
    } else {
      setQuantities(prev => ({
        ...prev,
        [type]: newQuantity
      }));
    }
  };

  const handleOrder = async (product: Product) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!product) return;
    
    const quantity = orderType === 'unit' ? quantities.unit : quantities.box;
    const stock = orderType === 'unit' ? product.unit_stock : product.box_stock;
    const price = orderType === 'unit' ? product.unit_price : product.box_price;
    
    if (quantity > stock) {
      setOrderError(`No hay suficiente stock disponible (${stock} ${orderType === 'unit' ? 'unidades' : 'cajas'} disponibles)`);
      return;
    }

    // Validar información del cliente
    const errors: { [key: string]: string } = {};
    
    if (!customerName || customerName.length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!customerPhone || customerPhone.length < 6) {
      errors.phone = 'El teléfono debe tener al menos 6 caracteres';
    }
    
    if (!deliveryAddress || deliveryAddress.length < 10) {
      errors.address = 'La dirección debe tener al menos 10 caracteres';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setProcessingOrder(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: price * quantity,
          status: 'pending',
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddress
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderData.id,
          product_id: product.id,
          quantity: quantity,
          price: price
        });

      if (itemError) throw itemError;

      const { error: stockError } = await supabase
        .from('products')
        .update({
          [orderType === 'unit' ? 'unit_stock' : 'box_stock']: stock - quantity
        })
        .eq('id', product.id);

      if (stockError) throw stockError;

      navigate('/profile');
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderError('Error al procesar el pedido. Por favor, intente nuevamente.');
    } finally {
      setProcessingOrder(false);
    }
  };

  const getPrice = (product: Product, type: 'unit' | 'box') => {
    return type === 'unit' ? product.unit_price : product.box_price;
  };

  const getStock = (product: Product, type: 'unit' | 'box') => {
    return type === 'unit' ? product.unit_stock : product.box_stock;
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="relative h-[300px] overflow-hidden rounded-xl">
        <img
          src="https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?auto=format&fit=crop&q=80"
          alt="Productos frescos"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/60 flex items-center">
          <div className="container">
            <h1 className="text-4xl font-bold text-white mb-4">Nuestros Productos</h1>
            <p className="text-xl text-blue-100 max-w-2xl">
              Descubre nuestra selección de pescados, mariscos y pollo de la más alta calidad. 
              Frescura y sabor garantizados en cada producto.
            </p>
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="flex items-center gap-2 text-white">
                <Truck className="h-5 w-5" />
                <span>Envío en el día</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Scale className="h-5 w-5" />
                <span>Peso garantizado</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Fish className="h-5 w-5" />
                <span>Frescura asegurada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Categorías de Productos</h2>
          <div className="responsive-grid">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`relative overflow-hidden rounded-xl aspect-[4/3] ${
                selectedCategory === 'all'
                  ? 'ring-4 ring-blue-900 ring-offset-2'
                  : 'hover:ring-2 hover:ring-blue-900 hover:ring-offset-2'
              }`}
            >
              <img
                src="https://images.unsplash.com/photo-1498654200943-1088dd4438ae?auto=format&fit=crop&q=80"
                alt="Todos los productos"
                className="w-full h-full object-cover brightness-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xl font-bold">Todos</span>
              </div>
            </button>

            {MAIN_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`relative overflow-hidden rounded-xl aspect-[4/3] ${
                  selectedCategory === category
                    ? 'ring-4 ring-blue-900 ring-offset-2'
                    : 'hover:ring-2 hover:ring-blue-900 hover:ring-offset-2'
                }`}
              >
                <img
                  src={CATEGORY_IMAGES[category as keyof typeof CATEGORY_IMAGES]}
                  alt={category}
                  className="w-full h-full object-cover brightness-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory === 'all' ? 'Todos los Productos' : `Productos - ${selectedCategory}`}
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
          ) : (
            <div className="responsive-grid">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="card group"
                >
                  <div className="relative">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      {product.unit_stock > 0 && (
                        <StockIndicator 
                          stock={product.unit_stock} 
                          type="unit"
                          weight={product.unit_weight}
                        />
                      )}
                      {product.box_stock > 0 && (
                        <StockIndicator 
                          stock={product.box_stock} 
                          type="box"
                          weight={product.box_weight}
                        />
                      )}
                      {product.unit_stock === 0 && product.box_stock === 0 && (
                        <StockIndicator stock={0} type="unit" />
                      )}
                    </div>
                  </div>
                  
                  <div className="card-padding">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-blue-900 font-medium">{product.category}</p>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex flex-col gap-1.5">
                        {product.unit_price > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Precio por unidad:</span>
                            <span className="font-semibold text-gray-900">
                              ${product.unit_price.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {product.box_price > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Precio por caja ({product.units_per_box} unidades):
                            </span>
                            <span className="font-semibold text-gray-900">
                              ${product.box_price.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Package className="h-4 w-4" />
                            <span>
                              {product.box_stock > 0 
                                ? `${product.box_stock} cajas disponibles`
                                : 'Sin stock en cajas'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Scale className="h-4 w-4" />
                            <span>
                              {product.unit_stock > 0
                                ? `${product.unit_stock} unidades disponibles`
                                : 'Sin stock en unidades'}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setSelectedProduct(product)}
                          disabled={product.unit_stock === 0 && product.box_stock === 0}
                          className={`button-primary ${
                            (product.unit_stock === 0 && product.box_stock === 0)
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          <ShoppingBag className="h-5 w-5" />
                          {(product.unit_stock > 0 || product.box_stock > 0) ? 'Hacer Pedido' : 'Sin Stock'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="hidden group-hover:block absolute top-2 left-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <Info className="h-5 w-5 text-blue-900" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {selectedProduct.image_url && (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover"
                />
              )}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                <p className="text-blue-900 font-medium">{selectedProduct.category}</p>
              </div>

              <div className="space-y-6">
                <p className="text-gray-600">{selectedProduct.description}</p>

                {!user && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <LogIn className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                      Inicia sesión para realizar pedidos
                    </h4>
                    <p className="text-yellow-700 mb-4">
                      Para poder realizar pedidos necesitas tener una cuenta. ¡Regístrate ahora!
                    </p>
                    <Link
                      to="/auth"
                      className="inline-flex items-center justify-center gap-2 bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      <LogIn className="h-5 w-5" />
                      <span>Iniciar Sesión / Registrarse</span>
                    </Link>
                  </div>
                )}

                {user && (selectedProduct.unit_stock > 0 || selectedProduct.box_stock > 0) && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block font-semibold text-gray-900 mb-2">
                          Seleccione tipo de pedido:
                        </label>
                        <div className="flex gap-3">
                          {selectedProduct.unit_stock > 0 && (
                            <button
                              onClick={() => {
                                setOrderType('unit');
                                setOrderError(null);
                              }}
                              className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                                orderType === 'unit'
                                  ? 'bg-blue-900 text-white'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              <Scale className="h-5 w-5" />
                              <div className="text-left">
                                <div className="font-semibold">Por Unidad</div>
                                <div className="text-sm opacity-90">Máx. 1000 unidades</div>
                              </div>
                            </button>
                          )}
                          {selectedProduct.box_stock > 0 && (
                            <button
                              onClick={() => {
                                setOrderType('box');
                                setOrderError(null);
                              }}
                              className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                                orderType === 'box'
                                  ? 'bg-blue-900 text-white'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              <Package className="h-5 w-5" />
                              <div className="text-left">
                                <div className="font-semibold">Por Caja</div>
                                <div className="text-sm opacity-90">Sin límite de cajas</div>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-900 mb-2">
                          Cantidad ({orderType === 'unit' ? 'unidades' : 'cajas'}):
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(
                              quantities[orderType] - 1,
                              orderType
                            )}
                            disabled={quantities[orderType] <= 1}
                            className="button-secondary p-2"
                          >
                            <Minus className="h-5 w-5" />
                          </button>
                          <input
                            type="number"
                            value={quantities[orderType]}
                            onChange={(e) => handleQuantityChange(
                              parseInt(e.target.value) || 1,
                              orderType
                            )}
                            min="1"
                            max={orderType === 'unit' ? Math.min(1000, selectedProduct.unit_stock) : undefined}
                            className="input-field w-24 text-center"
                          />
                          <button
                            onClick={() => handleQuantityChange(
                              quantities[orderType] + 1,
                              orderType
                            )}
                            disabled={
                              orderType === 'unit' && 
                              quantities[orderType] >= Math.min(1000, selectedProduct.unit_stock)
                            }
                            className="button-secondary p-2"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                        {orderError && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {orderError}
                          </p>
                        )}
                      </div>
                    </div>

                    <CustomerForm
                      customerName={customerName}
                      setCustomerName={setCustomerName}
                      customerPhone={customerPhone}
                      setCustomerPhone={setCustomerPhone}
                      deliveryAddress={deliveryAddress}
                      setDeliveryAddress={setDeliveryAddress}
                      errors={formErrors}
                    />

                    <OrderSummary
                      product={selectedProduct}
                      unitQuantity={quantities.unit}
                      boxQuantity={quantities.box}
                      orderType={orderType}
                    />

                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleOrder(selectedProduct)}
                          disabled={processingOrder}
                          className="button-primary flex-1 py-3 text-lg"
                        >
                          {processingOrder ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Procesando...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-5 w-5" />
                              <span>Realizar Pedido</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900">Información de Pedido</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-blue-900" />
                            Por unidad: máximo 1000 unidades
                          </li>
                          <li className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-900" />
                            Por caja: sin límite de cantidad
                          </li>
                          <li className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-900" />
                            Entrega en el día para pedidos antes de las 12:00
                          </li>
                          <li className="flex items-center gap-2">
                            <Fish className="h-4 w-4 text-blue-900" />
                            Producto fresco garantizado
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
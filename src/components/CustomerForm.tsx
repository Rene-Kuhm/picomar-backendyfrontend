import React from 'react';
import { User, Phone, MapPin } from 'lucide-react';

interface CustomerFormProps {
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  errors: {
    name?: string;
    phone?: string;
    address?: string;
  };
}

export function CustomerForm({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  deliveryAddress,
  setDeliveryAddress,
  errors
}: CustomerFormProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Información del Cliente</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Completo *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className={`input-field pl-10 ${errors.name ? 'border-red-300' : ''}`}
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className={`input-field pl-10 ${errors.phone ? 'border-red-300' : ''}`}
            placeholder="Ej: +51 123 456 789"
            required
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección de Entrega *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className={`input-field pl-10 min-h-[80px] ${errors.address ? 'border-red-300' : ''}`}
            placeholder="Ej: Calle Principal 123, Apt 4B, Ciudad"
            required
          />
        </div>
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      <p className="text-sm text-gray-500">
        * Campos obligatorios
      </p>
    </div>
  );
}
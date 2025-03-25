import React from 'react';
import { Scale, Package } from 'lucide-react';
import type { Database } from '../types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface OrderSummaryProps {
  product: Product;
  unitQuantity: number;
  boxQuantity: number;
  orderType: 'unit' | 'box';
}

export function OrderSummary({ product, unitQuantity, boxQuantity, orderType }: OrderSummaryProps) {
  const unitTotal = unitQuantity * product.unit_price;
  const boxTotal = boxQuantity * product.box_price;
  const totalUnits = boxQuantity * product.units_per_box;
  
  // Calculate weights
  const unitWeight = product.unit_weight ? unitQuantity * product.unit_weight : 0;
  const boxWeight = product.box_weight ? boxQuantity * product.box_weight : 0;
  const totalWeight = unitWeight + boxWeight;

  return (
    <div className="space-y-4">
      {/* Units Section */}
      {product.unit_stock > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-5 w-5 text-blue-900" />
            <h4 className="font-semibold text-blue-900">Por Unidad</h4>
          </div>
          <div className="space-y-2 text-blue-900">
            <div className="flex justify-between items-baseline">
              <span>Cantidad:</span>
              <span className="font-medium">{unitQuantity} unidades</span>
            </div>
            {product.unit_weight && (
              <div className="flex justify-between items-baseline text-sm">
                <span>Peso total:</span>
                <span>{unitWeight.toFixed(2)} kg</span>
              </div>
            )}
            <div className="flex justify-between items-baseline font-semibold">
              <span>Subtotal:</span>
              <span>${unitTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Boxes Section */}
      {product.box_stock > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-5 w-5 text-blue-900" />
            <h4 className="font-semibold text-blue-900">Por Caja</h4>
          </div>
          <div className="space-y-2 text-blue-900">
            <div className="flex justify-between items-baseline">
              <span>Cantidad:</span>
              <span className="font-medium">{boxQuantity} cajas</span>
            </div>
            <div className="flex justify-between items-baseline text-sm">
              <span>Total unidades:</span>
              <span>{totalUnits} unidades</span>
            </div>
            {product.box_weight && (
              <div className="flex justify-between items-baseline text-sm">
                <span>Peso total:</span>
                <span>{boxWeight.toFixed(2)} kg</span>
              </div>
            )}
            <div className="flex justify-between items-baseline font-semibold">
              <span>Subtotal:</span>
              <span>${boxTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Total Section */}
      <div className="bg-blue-100 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-3">Resumen Total</h4>
        <div className="space-y-2 text-blue-900">
          <div className="flex justify-between items-baseline">
            <span>Total productos:</span>
            <span className="font-medium">
              {unitQuantity + totalUnits} unidades
            </span>
          </div>
          {(product.unit_weight || product.box_weight) && (
            <div className="flex justify-between items-baseline">
              <span>Peso total:</span>
              <span className="font-medium">{totalWeight.toFixed(2)} kg</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2 border-t border-blue-200">
            <span className="font-semibold">Total a pagar:</span>
            <span className="text-xl font-bold">
              ${(unitTotal + boxTotal).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
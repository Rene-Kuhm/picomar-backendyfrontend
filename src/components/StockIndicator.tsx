import React from 'react';
import { XCircle, AlertCircle, CheckCircle2, Scale } from 'lucide-react';

interface StockIndicatorProps {
  stock: number;
  type: 'unit' | 'box';
  weight?: number | null;
}

export function StockIndicator({ stock, type, weight }: StockIndicatorProps) {
  let bgColor = '';
  let textColor = '';
  let icon = null;

  if (stock === 0) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    icon = <XCircle className="h-4 w-4" />;
  } else if (stock <= 10) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    icon = <AlertCircle className="h-4 w-4" />;
  } else {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    icon = <CheckCircle2 className="h-4 w-4" />;
  }

  return (
    <div className={`flex flex-col gap-1 ${bgColor} p-2 rounded-lg`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className={`text-sm font-medium ${textColor}`}>
          {stock === 0 ? (
            'Sin stock'
          ) : (
            `${stock} ${type === 'unit' ? 'unidades' : 'cajas'}`
          )}
        </span>
      </div>
      {weight && stock > 0 && (
        <div className="flex items-center gap-1 text-xs">
          <Scale className={`h-3 w-3 ${textColor}`} />
          <span className={textColor}>
            {(weight * stock).toFixed(2)} kg
          </span>
        </div>
      )}
    </div>
  );
}
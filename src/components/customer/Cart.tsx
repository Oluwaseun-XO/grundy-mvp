'use client';

import React from 'react';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/paystack';
import Image from 'next/image';

interface CartProps {
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const { state, updateQuantity, removeItem, getItemCount } = useCart();

  if (state.items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600">Add some products to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Shopping Cart</h2>
          <span className="text-sm text-gray-600">
            {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {state.items.map((item) => (
            <div key={item.product.id} className="p-4 flex items-center space-x-4">
              <div className="relative h-16 w-16 flex-shrink-0">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded"
                  sizes="64px"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.product.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {formatCurrency(item.product.price)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="p-1 h-8 w-8"
                >
                  <Minus size={14} />
                </Button>
                
                <span className="text-sm font-medium w-8 text-center">
                  {item.quantity}
                </span>
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="p-1 h-8 w-8"
                >
                  <Plus size={14} />
                </Button>
                
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removeItem(item.product.id)}
                  className="p-1 h-8 w-8 ml-2"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              
              <div className="text-sm font-medium text-gray-900 w-20 text-right">
                {formatCurrency(item.product.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(state.total)}
            </span>
          </div>
          
          <Button
            onClick={onCheckout}
            className="w-full"
            size="lg"
          >
            Proceed to Checkout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
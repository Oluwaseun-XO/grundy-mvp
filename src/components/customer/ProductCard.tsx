'use client';

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/utils/paystack';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.stock <= 5 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
            Low Stock
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(product.price)}
          </span>
          <span className="text-sm text-gray-500">
            {product.stock} in stock
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {product.category}
          </span>
          
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
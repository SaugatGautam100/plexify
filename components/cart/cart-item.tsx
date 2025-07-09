'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/contexts/cart-context';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= item.product.stockQuantity) {
      setQuantity(newQuantity);
      updateQuantity(item.product.id, newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    handleQuantityChange(value);
  };

  const itemTotal = item.product.price * item.quantity;

  return (
    <div className="flex items-center space-x-4 py-4 border-b">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Link href={`/product/${item.product.id}`}>
          <div className="w-20 h-20 relative bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={item.product.image}
              alt={item.product.name}
              fill
              className="object-cover"
            />
          </div>
        </Link>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/product/${item.product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
            {item.product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1">{item.product.brand}</p>
        <p className="text-sm font-medium text-gray-900 mt-1">
          ${item.product.price}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          className="w-16 text-center"
          min="1"
          max={item.product.stockQuantity}
        />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= item.product.stockQuantity}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Item Total */}
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          ${itemTotal.toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-600 hover:text-red-700"
        onClick={() => removeItem(item.product.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
'use client';

import Image from 'next/image';
import { Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CartItem({
  item,
  onDelete,
  imageIndex,
  onQuantityChange,
  updating = false,
}: {
  item: any;
  onDelete: (id: string, title: string) => void;
  imageIndex: number;
  onQuantityChange: (id: string, newQty: number) => void;
  updating?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-white font-inter relative">
      <div className="relative w-24 h-24 flex-shrink-0">
        {item.productImageUris && item.productImageUris.length > 0 ? (
          <>
            <Image
              src={item.productImageUris[imageIndex]}
              alt={`${item.productTitle || "Product Image"} ${imageIndex + 1}`}
              fill
              className="object-contain rounded-md"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/100x100/E0E0E0/808080?text=Image+Error";
              }}
            />
            {item.productImageUris.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                {imageIndex + 1} / {item.productImageUris.length}
              </div>
            )}
          </>
        ) : (
          <Image
            src="https://placehold.co/100x100/E0E0E0/808080?text=No+Image"
            alt="No Image Available"
            fill
            className="object-contain rounded-md"
          />
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-md font-semibold text-gray-800">{item.productTitle}</h3>
        <p className="text-sm text-gray-600">{item.productCategory}</p>
        <p className="text-sm text-gray-600">Available: {item.productStock}</p>
        <p className="text-md font-bold text-blue-900">
          Rs.{item.productPrice.toFixed(2)} <span className="text-sm text-gray-500">per {item.productUnit}</span>
        </p>
        {/* Quantity Counter */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            size="icon"
            variant="outline"
            disabled={item.productQuantity <= 1 || updating}
            onClick={() => onQuantityChange(item.id, item.productQuantity - 1)}
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="mx-2">{item.productQuantity}</span>
          <Button
            size="icon"
            variant="outline"
            disabled={item.productQuantity >= item.productStock || updating}
            onClick={() => onQuantityChange(item.id, item.productQuantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-bold">Rs.{(item.productPrice * item.productQuantity).toFixed(2)}</span>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-gray-300 hover:bg-red-50 hover:text-red-600 mt-2"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id, item.productTitle);
          }}
          aria-label={`Remove ${item.productTitle} from cart`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
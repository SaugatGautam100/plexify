
'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * CartItem component displays a single cart item with product details, a delete button, and an image carousel.
 * @param item - The cart item data
 * @param onDelete - Function to trigger the confirmation dialog for deletion
 * @param imageIndex - Current index of the image to display
 */
export default function CartItem({ item, onDelete, imageIndex }) {
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
        <p className="text-sm text-gray-600">Quantity: {item.productQuantity}</p>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full border-gray-300 hover:bg-red-50 hover:text-red-600"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Delete button clicked:", { id: item.id, productTitle: item.productTitle });
          onDelete(item.id, item.productTitle);
        }}
        aria-label={`Remove ${item.productTitle} from cart`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const { user } = useFirebaseAuth();

  // Get the current image URL or fallback to placeholder
  const getCurrentImageUrl = () => {
    if (product.productImageUris && product.productImageUris.length > currentImageIndex) {
      return product.productImageUris[currentImageIndex];
    }
    return '/placeholder-image.jpg';
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to your cart.',
        variant: 'destructive',
      });
      return;
    }

    if (product.productStock <= 0) {
      toast({
        title: 'Out of Stock',
        description: 'This product is currently out of stock.',
        variant: 'destructive',
      });
      return;
    }

    addItem(product);
    toast({
      title: 'Added to Cart',
      description: `${product.productTitle} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to your wishlist.',
        variant: 'destructive',
      });
      return;
    }

    if (isInWishlist(product.productId)) {
      removeFromWishlist(product.productId);
      toast({
        title: 'Removed from Wishlist',
        description: `${product.productTitle} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: 'Added to Wishlist',
        description: `${product.productTitle} has been added to your wishlist.`,
      });
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(
      `Image failed to load for product "${product.productTitle}" (ID: ${product.productId}):`,
      getCurrentImageUrl(),
      e
    );
    // Try the next image if available, otherwise use the placeholder
    if (product.productImageUris && currentImageIndex < product.productImageUris.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setIsImageLoaded(true); // Show the placeholder image
    }
  };

  return (
    <Card className={cn("group hover:shadow-lg transition-shadow duration-300", className)}>
      <div className="relative overflow-hidden">
        <Link href={`/product/${product.productId}`}>
          <div className="aspect-square relative bg-gray-100">
            <Image
              src={getCurrentImageUrl()}
              alt={product.productTitle}
              fill
              className={cn(
                "object-cover transition-transform duration-300 group-hover:scale-105",
                isImageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setIsImageLoaded(true)}
              onError={handleImageError}
            />
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.productStock <= 0 && (
            <Badge variant="secondary" className="text-xs">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={handleWishlistToggle}
          >
            <Heart className={cn("w-4 h-4", isInWishlist(product.productId) && "fill-current text-red-500")} />
          </Button>
          <Link href={`/product/${product.productId}`}>
            <Button size="icon" variant="secondary" className="h-8 w-8">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={handleAddToCart}
            disabled={product.productStock <= 0}
            className="w-full"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Category and Unit */}
          <p className="text-sm text-gray-600">
            {product.productCategory} • {product.productQuantity} {product.productUnit}
          </p>

          {/* Product Name */}
          <Link href={`/product/${product.productId}`}>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
              {product.productTitle}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.productPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
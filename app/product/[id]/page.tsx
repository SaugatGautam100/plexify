'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Minus, Plus, Shield, Truck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import ProductGrid from '@/components/product/product-grid';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);
          
          // Fetch related products
          if (data.product?.category) {
            const relatedResponse = await fetch(`/api/products?category=${data.product.category}&limit=4`);
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              setRelatedProducts(relatedData.products.filter((p: Product) => p.id !== productId));
            }
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button onClick={() => router.push('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isOnSale 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnail Images */}
          <div className="flex space-x-2 overflow-x-auto">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2",
                  selectedImage === index ? "border-blue-500" : "border-gray-200"
                )}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Brand and Category */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{product.brand}</span>
            <span>•</span>
            <span>{product.category}</span>
          </div>

          {/* Product Name */}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              ${product.price}
            </span>
            {isOnSale && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
                <Badge variant="destructive">
                  Save {discountPercentage}%
                </Badge>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              product.inStock ? "bg-green-500" : "bg-red-500"
            )} />
            <span className={cn(
              "text-sm font-medium",
              product.inStock ? "text-green-700" : "text-red-700"
            )}>
              {product.inStock ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-2">Key Features</h3>
            <ul className="space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Quantity and Add to Cart */}
          {product.inStock && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleAddToCart} className="flex-1">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className={cn(
                    "flex-shrink-0",
                    isInWishlist(product.id) && "text-red-500 border-red-500"
                  )}
                >
                  <Heart className={cn(
                    "w-4 h-4",
                    isInWishlist(product.id) && "fill-current"
                  )} />
                </Button>
              </div>
            </div>
          )}

          {/* Shipping Info */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-green-600" />
              <span className="text-sm">Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm">2-year warranty included</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-purple-600" />
              <span className="text-sm">30-day return policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-16">
        <Tabs defaultValue="specifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="font-medium">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-gray-600">Reviews coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Information</h3>
                    <p className="text-gray-600">
                      We offer free standard shipping on all orders over $50. Orders are typically processed within 1-2 business days.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Return Policy</h3>
                    <p className="text-gray-600">
                      You can return items within 30 days of purchase for a full refund. Items must be in original condition.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
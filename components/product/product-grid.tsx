import ProductCard from './product-card';
import { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  className?: string;
  isLoading?: boolean; // New prop for loading state
  error?: string | null; // New prop for error state
}

export default function ProductGrid({
  products,
  className,
  isLoading = false, // Default to false
  error = null, // Default to null
}: ProductGridProps) {
  if (isLoading) {
    // Basic loading skeleton
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-gray-200 rounded-lg shadow-md animate-pulse h-64"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error: {error}</p>
        <p className="text-gray-500 mt-2">Please try again later.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  );
}
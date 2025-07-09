'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductForm from '@/components/seller/product-form';
import { useSeller } from '@/contexts/seller-context';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData, Product } from '@/types';
import Link from 'next/link';

export default function EditProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  // Mock product data for demonstration
  const mockProduct = {
    id: productId,
    name: 'Sample Product',
    price: 99.99,
    originalPrice: 129.99,
    description: 'This is a sample product description.',
    category: 'Electronics',
    subcategory: 'Smartphones',
    brand: 'SampleBrand',
    stockQuantity: 10,
    features: ['Feature 1', 'Feature 2'],
    specifications: { 'Color': 'Black', 'Size': 'Medium' },
    tags: ['tag1', 'tag2'],
    images: ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800']
  };

  useEffect(() => {
    setProduct(mockProduct as Product);
  }, [productId]);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Mock success for demonstration
      toast({
        title: 'Product updated successfully!',
        description: 'Your product has been updated.',
      });
      router.push('/seller/products');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const initialData: Partial<ProductFormData> = product;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/seller/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-gray-600 mt-2">Update your product information</p>
          </div>
        </div>

        {/* Product Form */}
        <ProductForm
          onSubmit={handleSubmit}
          initialData={initialData}
          isLoading={isSubmitting}
          submitLabel="Update Product"
        />
      </div>
    </div>
  );
}
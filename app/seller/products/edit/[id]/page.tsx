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
  const { seller, isLoading, getSellerProducts, updateProduct } = useSeller();
  const [product, setProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  useEffect(() => {
    if (!isLoading && !seller) {
      router.push('/seller/products');
      return;
    }

    if (seller) {
      const products = getSellerProducts();
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        toast({
          title: 'Product not found',
          description: 'The product you are trying to edit does not exist.',
          variant: 'destructive',
        });
        router.push('/seller/products');
      }
    }
  }, [seller, isLoading, productId, router, getSellerProducts, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // if (!seller || !product) {
  //   return null;
  // }

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const success = await updateProduct(productId, data);
      if (success) {
        toast({
          title: 'Product updated successfully!',
          description: 'Your product has been updated.',
        });
        router.push('/seller/products');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update product?. Please try again.',
          variant: 'destructive',
        });
      }
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

  const initialData: Partial<ProductFormData> = {
    name: product?.name,
    price: product?.price,
    originalPrice: product?.originalPrice,
    description: product?.description,
    category: product?.category,
    subcategory: product?.subcategory,
    brand: product?.brand,
    stockQuantity: product?.stockQuantity,
    features: product?.features,
    specifications: product?.specifications,
    tags: product?.tags,
    images: product?.images,
  };

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
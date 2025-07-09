'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductForm from '@/components/seller/product-form';
import { useSeller } from '@/contexts/seller-context';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData } from '@/types';
import Link from 'next/link';

export default function AddProductPage() {
  const { seller, isLoading, addProduct } = useSeller();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !seller) {
      router.push('/seller/products/add');
    }
  }, [seller, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // if (!seller) {
  //   return null;
  // }

  const handleSubmit = async (data: ProductFormData) => {}
    // try {
    //   const success = await addProduct();
      // if (success) {
      //   toast({
      //     title: 'Product added successfully!',
      //     description: 'Your product has been added to your store.',
      //   });
      //   router.push('/seller/products');
      // } else {
      //   toast({
      //     title: 'Error',
      //     description: 'Failed to add product. Please try again.',
      //     variant: 'destructive',
      //   });
      // }
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: 'Something went wrong. Please try again.',
  //       variant: 'destructive',
  //     });
  //   }
  // };

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
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-gray-600 mt-2">Fill in the details to add a new product to your store</p>
          </div>
        </div>

        {/* Product Form */}
        <ProductForm onSubmit={handleSubmit} submitLabel="Add Product" />
      </div>
    </div>
  );
}
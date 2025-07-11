'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductForm from '@/components/seller/product-form';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData } from '@/types';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function AddProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session || session.user?.userType !== 'seller') {
      router.push('/seller/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session || session.user?.userType !== 'seller') {
    return null; // Will redirect
  }

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Product added successfully!',
          description: 'Your product has been added to your store.',
        });
        router.push('/seller/products');
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to add product. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-gray-600 mt-2">Fill in the details to add a new product to your store</p>
          </div>
        </div>

        {/* Product Form */}
        <ProductForm 
          onSubmit={handleSubmit} 
          submitLabel="Add Product" 
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
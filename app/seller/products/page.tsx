'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SellerProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();

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

  // Mock products data for demonstration
  const products = [
    {
      id: '1',
      name: 'Sample Product 1',
      category: 'Electronics',
      brand: 'SampleBrand',
      price: 99.99,
      inStock: true,
      stockQuantity: 10,
      image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '2',
      name: 'Sample Product 2',
      category: 'Fashion',
      brand: 'FashionBrand',
      price: 49.99,
      inStock: false,
      stockQuantity: 0,
      image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      // Mock success for demonstration
      toast({
        title: 'Product deleted',
        description: 'Product has been successfully deleted.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Products</h1>
            <p className="text-gray-600 mt-2">Manage your product inventory</p>
          </div>
          <Link href="/seller/products/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">
                {products.length === 0 ? 'No products yet' : 'No products found'}
              </h2>
              <p className="text-gray-600 mb-4">
                {products.length === 0 
                  ? 'Start by adding your first product to your store'
                  : 'Try adjusting your search criteria'
                }
              </p>
              {products.length === 0 && (
                <Link href="/seller/products/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-square relative bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={product.inStock ? 'default' : 'secondary'}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">${product.price}</span>
                      <span className="text-sm text-gray-600">
                        Stock: {product.stockQuantity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Link href={`/product/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/seller/products/edit/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
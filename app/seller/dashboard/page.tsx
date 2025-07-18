'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus, DollarSign, TrendingUp, Eye, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


import { useSession } from 'next-auth/react';


export default function SellerDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock seller data for demonstration
  const mockSeller = {
    name: 'John Seller',
    isVerified: true,
    rating: 4.5,
    totalSales: 150
  };
  
  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session || session.user?.userType !== 'seller') {
      router.push('/seller/login');
      return;
    }
  }, [session, status, router]);

  // Fetch seller's products
  const fetchProducts = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products?sellerId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.inStock).length;
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * (p.stockQuantity || 0)), 0);

  return (
    <>
      
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {session?.user?.name}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={session?.user?.isVerified ? 'default' : 'secondary'}>
                {session?.user?.isVerified ? 'Verified Seller' : 'Pending Verification'}
              </Badge>
              <span className="text-sm text-gray-600">
                Rating: {session?.user?.rating || 0}/5 ⭐
              </span>
            </div>
          </div>
          <Link href="/seller/products/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {inStockProducts} in stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSeller?.totalSales || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Current inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Store Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session?.user?.rating || 0}/5</div>
              <p className="text-xs text-muted-foreground">
                Customer rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/seller/products/add">
              <CardContent className="p-6 text-center">
                <Plus className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-semibold mb-2">Add New Product</h3>
                <p className="text-gray-600">List a new product in your store</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/seller/products">
              <CardContent className="p-6 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">Manage Products</h3>
                <p className="text-gray-600">Edit and manage your existing products</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/seller/profile">
              <CardContent className="p-6 text-center">
                <Eye className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold mb-2">Store Profile</h3>
                <p className="text-gray-600">Update your store information</p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Products</CardTitle>
              <Link href="/seller/products">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first product</p>
                <Link href="/seller/products/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-medium">${product.price}</span>
                        <Badge variant={product.inStock ? 'default' : 'secondary'}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Stock</p>
                      <p className="font-semibold">{product.stockQuantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
      
    </>
    
  );
}
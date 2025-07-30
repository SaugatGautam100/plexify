'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, Truck, Shield, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';
import { products, categories } from '@/lib/mock-data';
import { Product } from '@/types';

export default function Dashboard() {
  const featuredProducts = products.slice(0, 4);
  const { user, loading } = useFirebaseAuth();
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});

  // Initialize image indices for featured products
  useEffect(() => {
    const initialIndices = featuredProducts.reduce((acc, item) => ({
      ...acc,
      [item.productId]: 0
    }), {});
    setImageIndices(initialIndices);
  }, []);

  // Automatic carousel cycling for featured products
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndices(prev => {
        const newIndices = { ...prev };
        featuredProducts.forEach(item => {
          const imageCount = item.productImageUris?.length || 1;
          if (imageCount > 1) {
            newIndices[item.productId] = (prev[item.productId] || 0) + 1 >= imageCount ? 0 : (prev[item.productId] || 0) + 1;
          }
        });
        return newIndices;
      });
    }, 1500); // Change image every 1.5 seconds

    return () => clearInterval(interval);
  }, [featuredProducts]);

 
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white hero-section" id='hero-section'>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Plexify
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover amazing products at unbeatable prices. Your one-stop shop for everything you need.
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link href="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          {/* Ensures 2 columns on small devices */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((item) => (
              <Card key={item.productId} className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <Link href={`/product/${item.productId}`} className="block">
                  {/* Changed background to white and added a light bottom border */}
                  <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-white border-b border-gray-200">
                    {item.productImageUris && item.productImageUris.length > 0 ? (
                      <>
                        <Image
                          src={item.productImageUris[imageIndices[item.productId] || 0]}
                          alt={`${item.productTitle || "Product Image"} ${imageIndices[item.productId] + 1}`}
                          fill
                          className="object-contain transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/600x400/E0E0E0/808080?text=Image+Error";
                          }}
                        />
                        {item.productImageUris.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                            {imageIndices[item.productId] + 1} / {item.productImageUris.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <Image
                        src="https://placehold.co/600x400/E0E0E0/808080?text=No+Image"
                        alt="No Image Available"
                        fill
                        className="object-contain transition-transform duration-300 hover:scale-105"
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h2 className="mb-1 text-lg font-semibold text-gray-800 truncate">{item.productTitle}</h2>
                    <p className="text-sm text-gray-600">{item.productCategory}</p>
                    <p className="text-sm text-gray-600">Available: {item.productStock}</p>
                    <div className="mt-2 text-xl font-bold text-blue-900">
                      Rs.{item.productPrice}{' '}
                      <span className="text-sm text-gray-500">per {item.productUnit}</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          {/* Ensures 2 columns on small devices */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  {/* Changed padding from p-6 to p-4 for less padding */}
                  <CardContent className="p-4">
                    <div className="aspect-square relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <Button variant="outline" className="w-full">
                      Shop Now
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $50</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure payment processing</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

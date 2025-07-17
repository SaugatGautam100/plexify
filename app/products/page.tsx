
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Filter, Grid, List, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import app from "../firebaseConfig";
import { getDatabase, ref, get } from "firebase/database";
import { useEffect, useState } from 'react';

/**
 * ProductsPage component displays a list of products fetched from Firebase Realtime Database.
 * It includes a responsive layout with desktop filters and a mobile filter sheet,
 * and handles loading and empty states. Each product card features an automatic image carousel.
 */
export default function ProductsPage() {
  // State to store the array of products fetched from Firebase
  const [productArray, setProductArray] = useState([]);
  // State to manage the loading status of data fetching
  const [isLoading, setIsLoading] = useState(true);
  // State to display messages to the user (e.g., error messages, no products found)
  const [message, setMessage] = useState('');
  // State to track current image index for each product's carousel
  const [imageIndices, setImageIndices] = useState({});

  /**
   * Fetches product data from Firebase Realtime Database.
   * Sets loading state, handles success and error cases, and updates messages.
   */
  const fetchData = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const db = getDatabase(app);
      const dbRef = ref(db, "Admins/AllProduct");
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const myData = snapshot.val();
        const temporaryArray = Object.keys(myData).map(myFireId => {
          return {
            ...myData[myFireId],
            productId: myFireId
          };
        });
        setProductArray(temporaryArray);
        // Initialize image indices for each product
        setImageIndices(temporaryArray.reduce((acc, item) => ({
          ...acc,
          [item.productId]: 0
        }), {}));
        setMessage('');
      } else {
        setMessage("No products found. Please add products to the database.");
        setProductArray([]);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      setMessage("Failed to load products. Please check your network or try again later.");
      setProductArray([]);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect hook to call fetchData when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // useEffect for automatic carousel cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndices(prev => {
        const newIndices = { ...prev };
        productArray.forEach(item => {
          const imageCount = item.productImageUris?.length || 1;
          if (imageCount > 1) {
            newIndices[item.productId] = (prev[item.productId] || 0) + 1 >= imageCount ? 0 : (prev[item.productId] || 0) + 1;
          }
        });
        return newIndices;
      });
    }, 1500); // Change image every 1.5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [productArray]);

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filters Section (hidden on small screens) */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Card className="rounded-xl shadow-lg">
            <CardHeader className="bg-gray-50 rounded-t-xl p-4">
              <CardTitle className="text-xl font-bold text-gray-800">Filters</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Search Input */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">Search</h3>
                  <Input
                    placeholder="Search products..."
                    type="text"
                    className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">Category</h3>
                  <Select>
                    <SelectTrigger className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg shadow-lg">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand Filter */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">Brand</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="brand-a" className="rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="brand-a" className="text-sm text-gray-700 cursor-pointer">
                        Brand A
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="brand-b" className="rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="brand-b" className="text-sm text-gray-700 cursor-pointer">
                        Brand B
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="brand-c" className="rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="brand-c" className="text-sm text-gray-700 cursor-pointer">
                        Brand C
                      </label>
                    </div>
                  </div>
                </div>

                {/* Price Range Input */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">Price Range</h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      defaultValue={0}
                      className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-500">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      defaultValue={5000}
                      className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                <Button variant="outline" className="w-full rounded-lg border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Header with Product Count and Sort/View Options */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                All Products
              </h1>
              <p className="text-gray-600 mt-1">
                Showing {productArray.length} products
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Mobile Filter Toggle Button (visible on small screens) */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden rounded-lg border-gray-300 hover:bg-gray-50 transition-colors duration-200">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-sm rounded-l-xl p-6">
                  <div className="mt-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3 text-gray-700">Search</h3>
                        <Input
                          placeholder="Search products..."
                          type="text"
                          className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3 text-gray-700">Category</h3>
                        <Select>
                          <SelectTrigger className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg shadow-lg">
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="electronics">Electronics</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="books">Books</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3 text-gray-700">Brand</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="mobile-brand-a" className="rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="mobile-brand-a" className="text-sm text-gray-700 cursor-pointer">
                              Brand A
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="mobile-brand-b" className="rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="mobile-brand-b" className="text-sm text-gray-700 cursor-pointer">
                              Brand B
                            </label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3 text-gray-700">Price Range</h3>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            defaultValue={0}
                            className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-gray-500">-</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            defaultValue={5000}
                            className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <Button variant="outline" className="w-full rounded-lg border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort By Dropdown */}
              <Select>
                <SelectTrigger className="w-48 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-lg">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional Rendering based on Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">Loading products...</p>
            </div>
          ) : (
            <>
              {message && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                  <span className="block sm:inline">{message}</span>
                </div>
              )}

              {productArray.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {productArray.map((item) => (
                    <Card key={item.productId} className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                      <Link href={`/product/${item.productId}`} className="block">
                        <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gray-100">
                          {/* Automatic Image Carousel */}
                          {item.productImageUris && item.productImageUris.length > 0 ? (
                            <>
                              <Image
                                src={item.productImageUris[imageIndices[item.productId] || 0]}
                                alt={`${item.productTitle || "Product Image"} ${imageIndices[item.productId] + 1}`}
                                layout="fill"
                                objectFit="contain"
                                className="transition-transform duration-300 hover:scale-105"
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
                              layout="fill"
                              objectFit="contain"
                              className="transition-transform duration-300 hover:scale-105"
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
              ) : (
                <div className="text-center py-12 col-span-full">
                  <h3 className="text-xl font-semibold mb-2 text-gray-700">No products available</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
                </div>
              )}

              {productArray.length > 0 && (
                <div className="text-center mt-8">
                  <Button size="lg" className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors duration-200">
                    Load More Products
                  </Button>
                </div>
              )}

              {productArray.length > 0 && (
                <div className="text-center mt-4 text-sm text-gray-600">
                  Displaying {productArray.length} products
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}

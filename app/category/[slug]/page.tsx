// /app/category/[slug]/CategoryClientPage.tsx
'use client'; // THIS IS THE CLIENT COMPONENT

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { categories } from '@/lib/mock-data';
import { getDatabase, ref, get } from 'firebase/database';
import app from '../../../app/firebaseConfig';
import Link from 'next/link';
import Image from 'next/image';
import type { ChangeEvent, FC } from 'react';

// --- TYPE DEFINITIONS ---
type Product = {
  productId: string;
  productTitle: string;
  productCategory: string;
  productPrice: number;
  productStock: number;
  productUnit: string;
  productImageUris: string[];
  productRating?: number;
  addedAt?: number;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  subcategories?: { id: string; name: string; description?: string }[];
};

// The component function itself
export default function CategoryClientPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug =
    Array.isArray(params.slug) ? params.slug[0] : (params.slug as string) || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 48;

  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);

  const category: Category | undefined = categories.find(
    (cat: Category) => cat.slug === categorySlug
  );

  const fetchProducts = useCallback(async () => {
    if (!category) {
      setIsLoading(false);
      setMessage('Category not found.');
      setProducts([]);
      setFilteredProducts([]);
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      const db = getDatabase(app);
      const dbRef = ref(db, 'Admins/AllProduct');
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const allProducts = snapshot.val();
        const categoryProducts: Product[] = Object.keys(allProducts)
          .map((key) => ({
            productId: key,
            ...allProducts[key],
          }))
          .filter((product: Product) => product.productCategory === category.name);

        setProducts(categoryProducts);
      } else {
        setProducts([]);
        setMessage('No products found in the database for this category.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage('Failed to load products. Please check your network or try again later.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchQuery(decodeURIComponent(query));
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndices((prev) => {
        const newIndices = { ...prev };
        products.forEach((item) => {
          const imageCount = item.productImageUris?.length || 1;
          if (imageCount > 1) {
            newIndices[item.productId] = ((prev[item.productId] || 0) + 1) % imageCount;
          }
        });
        return newIndices;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [products]);

  useEffect(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.productTitle?.toLowerCase().includes(query) ||
          item.productCategory?.toLowerCase().includes(query)
      );
    }

    if (priceRange.min !== '' || priceRange.max !== '') {
      const min = priceRange.min !== '' ? parseFloat(priceRange.min) : 0;
      const max = priceRange.max !== '' ? parseFloat(priceRange.max) : Infinity;
      result = result.filter((item) => {
        const price = item.productPrice || 0;
        return price >= min && price <= max;
      });
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.productPrice || 0) - (a.productPrice || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.productRating || 0) - (a.productRating || 0));
        break;
      case 'newest':
        result.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, searchQuery, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPriceRange((prev) => ({ ...prev, [field]: value }));
    }
  };

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSortBy('featured');
    if (!searchParams.get('search')) {
      setSearchQuery('');
    }
    setShowFilters(false);
  };

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center font-inter">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">The category you're looking for doesn't exist or is invalid.</p>
        <Button onClick={() => router.back()} className="rounded-lg bg-blue-600 hover:bg-blue-700">Go Back</Button>
      </div>
    );
  }

  const FilterContent: FC = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 text-gray-700">Search</h3>
        <Input
          placeholder="Search products..."
          type="text"
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <h3 className="font-semibold mb-3 text-gray-700">Price Range</h3>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handlePriceChange('min', e.target.value)}
            ref={minInputRef}
            className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-gray-500">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handlePriceChange('max', e.target.value)}
            ref={maxInputRef}
            className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full rounded-lg border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
      >
        Clear Filters
      </Button>
    </div>
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    event.currentTarget.src = 'https://placehold.co/1200x400/E0E0E0/808080?text=Image+Error';
  };

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      {/* ... The rest of your JSX goes here ... */}
      <div className="mb-8">
        <div className="aspect-[3/1] relative bg-gray-100 rounded-lg overflow-hidden mb-6">
          <Image
            src={category.image || 'https://placehold.co/1200x400/E0E0E0/808080?text=Category+Image'}
            alt={category.name}
            fill
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
              <p className="text-xl opacity-90">{category.description || 'Explore our products in this category.'}</p>
            </div>
          </div>
        </div>
      </div>

      {message && !isLoading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Card className="rounded-xl shadow-lg">
            <CardHeader className="bg-gray-50 rounded-t-xl p-4">
              <CardTitle className="text-xl font-bold text-gray-800">Filters</CardTitle>
            </CardHeader>
            <CardContent className="p-6"><FilterContent /></CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">{category.name} Products</h2>
              <p className="text-gray-600">Showing {filteredProducts.length} results</p>
            </div>
            <div className="flex items-center gap-4">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden rounded-lg">
                    <Filter className="w-4 h-4 mr-2" />Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-sm rounded-l-xl p-6">
                  <div className="mt-4"><FilterContent /></div>
                </SheetContent>
              </Sheet>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 rounded-lg"><SelectValue placeholder="Sort By" /></SelectTrigger>
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
          
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Shop by Subcategory</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {category.subcategories.map((subcategory) => (
                  <Card key={subcategory.id} className="hover:shadow-md transition-shadow cursor-pointer rounded-lg">
                    <CardContent className="p-4 text-center">
                      <h4 className="font-medium">{subcategory.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{subcategory.description || 'Explore this subcategory.'}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="pt-28 lg:pt-0 max-h-[calc(100vh-15rem)] overflow-y-auto pr-4 custom-scrollbar">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">Loading products...</p>
              </div>
            ) : (
              <>
                {currentProducts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {currentProducts.map((item) => (
                        <Card key={item.productId} className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                          <Link href={`/product/${item.productId}`} className="block">
                            <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-white border-b border-gray-200">
                              {item.productImageUris && item.productImageUris.length > 0 ? (
                                <>
                                  <Image
                                    src={item.productImageUris[imageIndices[item.productId] || 0]}
                                    alt={`${item.productTitle || 'Product Image'} ${(imageIndices[item.productId] || 0) + 1}`}
                                    fill
                                    className="object-contain transition-transform duration-300 hover:scale-105"
                                    sizes="100vw"
                                    style={{ objectFit: 'contain' }}
                                    onError={handleImageError}
                                  />
                                  {item.productImageUris.length > 1 && (
                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                                      {(imageIndices[item.productId] || 0) + 1} / {item.productImageUris.length}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <Image src="https://placehold.co/600x400/E0E0E0/808080?text=No+Image" alt="No Image Available" fill className="object-contain" />
                              )}
                            </div>
                            <CardContent className="p-4">
                              <h2 className="mb-1 text-lg font-semibold text-gray-800 truncate">{item.productTitle}</h2>
                              <p className="text-sm text-gray-600">{item.productCategory}</p>
                              <p className="text-sm text-gray-600">Available: {item.productStock}</p>
                              <div className="mt-2 text-xl font-bold text-blue-900">
                                Rs.{item.productPrice?.toFixed(2) || '0.00'}{' '}
                                <span className="text-sm text-gray-500">per {item.productUnit}</span>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4 mt-8">
                        <Button size="lg" className="rounded-lg" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
                        <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
                        <Button size="lg" className="rounded-lg" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">No products match your filters</h3>
                    <p className="text-gray-600">Try adjusting your search or price range.</p>
                    <Button onClick={clearFilters} className="mt-4 rounded-lg">Reset Filters</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
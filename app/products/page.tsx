'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Grid, List, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ProductGrid from '@/components/product/product-grid';
import { categories } from '@/lib/mock-data';
import { Product } from '@/types';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Update search query when URL parameter changes
  useEffect(() => {
    setSearchQuery(searchFromUrl);
  }, [searchFromUrl]);

  // Fetch products from API
  const fetchProducts = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy !== 'featured') {
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortBy === 'price-low' ? 'asc' : 'desc');
      }
      params.append('page', page.toString());
      params.append('limit', '12');
      
      console.log('Fetching products with params:', params.toString());
      
      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Products API response:', data);
      
      setBrands(data.brands || []);
      
      if (append && page > 1) {
        setProducts(prev => [...prev, ...(data.products || [])]);
      } else {
        setProducts(data.products || []);
      }
      
      setTotalPages(data.pagination?.pages || 1);
      setCurrentPage(page);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  const loadMoreProducts = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchProducts(currentPage + 1, true);
    }
  };

  // Client-side filtering for additional filters not handled by API
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Brand filter (client-side)
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }

    // Price filter (client-side)
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    return filtered;
  }, [products, selectedBrands, priceRange]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="font-semibold mb-3">Search</h3>
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-3">Category</h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Brand</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={brand}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => handleBrandToggle(brand)}
                />
                <label htmlFor={brand} className="text-sm">
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          />
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={() => {
          setSearchQuery('');
          setSelectedCategory('all');
          setSelectedBrands([]);
          setPriceRange([0, 5000]);
        }}
        className="w-full"
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filters */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <FilterContent />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Products'}
              </h1>
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Mobile Filter Toggle */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="mt-4">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchProducts(1, false)}
                className="ml-4"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <ProductGrid products={filteredProducts} />
              
              {/* No Products Message */}
              {filteredProducts.length === 0 && products.length === 0 && !error && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
                </div>
              )}
              
              {/* Filtered Results Empty */}
              {filteredProducts.length === 0 && products.length > 0 && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No products match your filters</h3>
                  <p className="text-gray-600">Try adjusting your filters to see more results.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedBrands([]);
                      setPriceRange([0, 5000]);
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
              
              {/* Load More Button */}
              {currentPage < totalPages && filteredProducts.length > 0 && (
                <div className="text-center mt-8">
                  <Button 
                    onClick={loadMoreProducts} 
                    disabled={isLoadingMore}
                    size="lg"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      'Load More Products'
                    )}
                  </Button>
                </div>
              )}
              
              {/* Pagination Info */}
              {products.length > 0 && (
                <div className="text-center mt-4 text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • Showing {filteredProducts.length} products
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
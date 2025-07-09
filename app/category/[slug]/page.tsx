'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ProductGrid from '@/components/product/product-grid';
import { categories } from '@/lib/mock-data';
import { Product } from '@/types';

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.slug as string;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Find the category
  const category = categories.find(cat => cat.slug === categorySlug);

  // Get products for this category
  const fetchProducts = useCallback(async () => {
    if (!category) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products?category=${category.name}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categoryProducts = products;
  // Get unique brands for this category
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(categoryProducts.map(p => p.brand))];
    return uniqueBrands.sort();
  }, [categoryProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = categoryProducts.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!product.name.toLowerCase().includes(query) &&
            !product.description.toLowerCase().includes(query) &&
            !product.brand.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // Featured - no sorting needed
        break;
    }

    return filtered;
  }, [categoryProducts, searchQuery, selectedBrands, priceRange, sortBy]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  // If category not found
  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
        <Button onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

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
      {/* Category Header */}
      <div className="mb-8">
        <div className="aspect-[3/1] relative bg-gray-100 rounded-lg overflow-hidden mb-6">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
              <p className="text-xl opacity-90">{category.description}</p>
            </div>
          </div>
        </div>
      </div>

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
              <h2 className="text-2xl font-bold">{category.name} Products</h2>
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {categoryProducts.length} products
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

          {/* Subcategories */}
          {category.subcategories.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Shop by Subcategory</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {category.subcategories.map((subcategory) => (
                  <Card key={subcategory.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <h4 className="font-medium">{subcategory.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{subcategory.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}

          {/* No products message */}
          {categoryProducts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No products available</h3>
              <p className="text-gray-600">We're working on adding products to this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { ProductFormData } from '@/types';
import { categories } from '@/lib/mock-data';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Partial<ProductFormData>;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function ProductForm({ onSubmit, initialData, isLoading, submitLabel = 'Add Product' }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || undefined,
    description: initialData?.description || '',
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    brand: initialData?.brand || '',
    stockQuantity: initialData?.stockQuantity || 0,
    features: initialData?.features || [],
    specifications: initialData?.specifications || {},
    tags: initialData?.tags || [],
    images: initialData?.images || [''],
  });

  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  const selectedCategory = categories.find(cat => cat.name === formData.category);

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: { ...prev.specifications, [specKey.trim()]: specValue.trim() }
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty images
    const filteredImages = formData.images.filter(img => img.trim() !== '');
    if (filteredImages.length === 0) {
      // You can use a toast here if available, or just return
      console.error('Please add at least one product image');
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      console.error('Product name is required');
      return;
    }

    if (!formData.description.trim()) {
      console.error('Product description is required');
      return;
    }

    if (!formData.category) {
      console.error('Product category is required');
      return;
    }

    if (!formData.brand.trim()) {
      console.error('Product brand is required');
      return;
    }

    if (formData.price <= 0) {
      console.error('Product price must be greater than 0');
      return;
    }

    const submitData = {
      ...formData,
      images: filteredImages,
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price ($) - Optional</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice || ''}
                  onChange={(e) => handleChange('originalPrice', parseFloat(e.target.value) || undefined)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => handleChange('stockQuantity', parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Category & Description */}
        <Card>
          <CardHeader>
            <CardTitle>Category & Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select value={formData.subcategory} onValueChange={(value) => handleChange('subcategory', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory.subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.name}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.images.map((image, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Image URL"
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
              />
              {formData.images.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeImageField(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addImageField}>
            <Plus className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a feature"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <Button type="button" onClick={addFeature}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {feature}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => removeFeature(index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Specification name"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Specification value"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecification())}
              />
              <Button type="button" onClick={addSpecification}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(formData.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span><strong>{key}:</strong> {value}</span>
                <X
                  className="w-4 h-4 cursor-pointer text-red-500"
                  onClick={() => removeSpecification(key)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {tag}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => removeTag(index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? 'Processing...' : submitLabel}
      </Button>
    </form>
  );
}
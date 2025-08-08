
import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import app from "../../firebaseConfig";
import { getDatabase, ref, get, push, set, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// You can import this from your types if you have it
type Product = {
  adminUid: string;
  itemCount: number;
  productCategory: string;
  productId: string;
  productImageUris: string[];
  productPrice: number;
  productQuantity: number;
  productRandomId: string;
  productStock: number;
  productTitle: string;
  productType: string;
  productUnit: string;
  productBrand?: string;
  productMaterial?: string;
};

function ProductDetailPage() {
  const params = useParams<{ firebaseId: string }>();
  const router = useRouter();
  const productId = params.firebaseId;

  const [productData, setProductData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [zoomedImageIndex, setZoomedImageIndex] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (!productId) {
        toast.error("No product ID provided. Please navigate from the product list.");
        setIsLoading(false);
        return;
      }

      try {
        const db = getDatabase(app);
        const dbRef = ref(db, `Admins/AllProduct/${productId}`);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          const fetchedProduct = snapshot.val();
          setProductData({ ...fetchedProduct, productId: productId });
        } else {
          toast.error("Product not found. It might have been removed or the link is incorrect.");
          setProductData(null);
        }
      } catch (error) {
        console.error("Error fetching product data: ", error);
        toast.error("Failed to load product details. Please try again later.");
        setProductData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleAddToCart = async () => {
    let errorMessage = "";
    let successMessage = "";

    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        errorMessage = "Please log in to add items to your cart.";
        return;
      }

      if (!productData) {
        errorMessage = "Product data is missing. Please try again.";
        return;
      }

      const requiredFields: (keyof Product)[] = [
        'productTitle', 'productPrice', 'productCategory',
        'productStock', 'productUnit', 'productType', 'adminUid', 'productId'
      ];
      for (const field of requiredFields) {
        if (!productData[field]) {
          errorMessage = `Missing product detail: ${String(field).replace('product', '')}. Cannot add to cart.`;
          return;
        }
      }

      const quantity = Number(productQuantity);
      if (isNaN(quantity) || quantity < 1) {
        errorMessage = "Please enter a valid quantity (minimum 1).";
        return;
      }
      if (quantity > productData.productStock) {
        errorMessage = `Cannot add ${quantity} items. Only ${productData.productStock} in stock.`;
        return;
      }

      const db = getDatabase(app);
      const userCartRef = ref(db, `AllUsers/Users/${user.uid}/UserCartItems`);
      const snapshot = await get(userCartRef);
      let productFoundInCart = false;

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const cartItem = childSnapshot.val();
          if (cartItem.productId === productData.productId) {
            const newQuantity = cartItem.productQuantity + quantity;
            if (newQuantity > productData.productStock) {
              errorMessage = `Adding ${quantity} more would exceed stock. Only ${productData.productStock} in total allowed.`;
              productFoundInCart = true;
              return true;
            }
            update(childSnapshot.ref, {
              productQuantity: newQuantity,
              itemCount: newQuantity,
              addedAt: Date.now()
            });
            successMessage = `Quantity of "${productData.productTitle}" updated to ${newQuantity} in cart.`;
            productFoundInCart = true;
            return true;
          }
        });
      }

      if (errorMessage) return;

      if (!productFoundInCart) {
        const newDocRef = push(userCartRef);
        await set(newDocRef, {
          adminUid: productData.adminUid,
          itemCount: quantity,
          productCategory: productData.productCategory,
          productId: productData.productId,
          productImageUris: productData.productImageUris || [],
          productPrice: Number(productData.productPrice),
          productQuantity: quantity,
          productRandomId: productData.productRandomId || null,
          productStock: Number(productData.productStock),
          productTitle: productData.productTitle,
          productType: productData.productType,
          productUnit: productData.productUnit,
          addedAt: Date.now()
        });
        successMessage = `"${productData.productTitle}" added to cart successfully!`;
      }
      setProductQuantity(1);
    } catch (error: any) {
      console.error("Error adding/updating to cart:", error);
      errorMessage = `Failed to add product to cart: ${error.message}.`;
    } finally {
      if (errorMessage) {
        toast.error(errorMessage);
      } else if (successMessage) {
        toast.success(successMessage);
      }
    }
  };

  const handleAddToWishlist = async () => {
    let errorMessage = "";
    let successMessage = "";

    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        errorMessage = "Please log in to add items to your wishlist.";
        return;
      }

      if (!productData) {
        errorMessage = "Product data is missing. Cannot add to wishlist.";
        return;
      }

      const requiredFields: (keyof Product)[] = [
        'productId', 'productTitle', 'productPrice', 'productCategory',
        'productStock', 'productUnit', 'productType', 'adminUid'
      ];
      for (const field of requiredFields) {
        if (!productData[field]) {
          errorMessage = `Missing product detail: ${String(field).replace('product', '')}. Cannot add to wishlist.`;
          return;
        }
      }

      const db = getDatabase(app);
      const userWishlistRef = ref(db, `AllUsers/Users/${user.uid}/UserWishlistItems`);
      const snapshot = await get(userWishlistRef);
      let productFoundInWishlist = false;

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          if (childSnapshot.val().productId === productData.productId) {
            productFoundInWishlist = true;
            return true;
          }
        });
      }

      if (productFoundInWishlist) {
        errorMessage = `"${productData.productTitle}" is already in your wishlist.`;
      } else {
        const newDocRef = push(userWishlistRef);
        await set(newDocRef, {
          adminUid: productData.adminUid,
          itemCount: 1,
          productCategory: productData.productCategory,
          productId: productData.productId,
          productImageUris: productData.productImageUris || [],
          productPrice: Number(productData.productPrice),
          productQuantity: 1,
          productRandomId: productData.productRandomId || null,
          productStock: Number(productData.productStock),
          productTitle: productData.productTitle,
          productType: productData.productType,
          productUnit: productData.productUnit,
          addedAt: Date.now()
        });
        successMessage = `"${productData.productTitle}" added to wishlist successfully!`;
      }
    } catch (error: any) {
      console.error("Error adding to wishlist:", error);
      errorMessage = `Failed to add product to wishlist: ${error.message}.`;
    } finally {
      if (errorMessage) {
        toast.error(errorMessage);
      } else if (successMessage) {
        toast.success(successMessage);
      }
    }
  };

  const handleBackButtonClick = () => router.back();
  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => setProductQuantity(Number(e.target.value));
  const openZoomModal = (index: number) => {
    setZoomedImageIndex(index);
    setIsZoomModalOpen(true);
  };
  const closeZoomModal = () => setIsZoomModalOpen(false);

  const handlePrevImage = useCallback(() => {
    if (productData?.productImageUris) {
      setCurrentImageIndex((prev) => (prev === 0 ? productData.productImageUris.length - 1 : prev - 1));
    }
  }, [productData]);

  const handleNextImage = useCallback(() => {
    if (productData?.productImageUris) {
      setCurrentImageIndex((prev) => (prev === productData.productImageUris.length - 1 ? 0 : prev + 1));
    }
  }, [productData]);

  const handlePrevZoomedImage = useCallback(() => {
    if (productData?.productImageUris) {
      setZoomedImageIndex((prev) => (prev === 0 ? productData.productImageUris.length - 1 : prev - 1));
    }
  }, [productData]);

  const handleNextZoomedImage = useCallback(() => {
    if (productData?.productImageUris) {
      setZoomedImageIndex((prev) => (prev === productData.productImageUris.length - 1 ? 0 : prev + 1));
    }
  }, [productData]);

  // Helper for fallback image (for next/image, you may need a wrapper for onError)
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://placehold.co/800x600/E0E0E0/808080?text=Image+Error";
  };

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleBackButtonClick}
          className="rounded-lg border-gray-300 hover:bg-gray-50 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading product details...</p>
        </div>
      ) : (
        <>
          {productData ? (
            <Card className="rounded-xl shadow-lg overflow-hidden md:flex md:items-start md:space-x-8 p-6">
              <div className="relative w-full md:w-1/2 h-[400px] rounded-lg overflow-hidden flex-shrink-0 mb-6 md:mb-0">
                {productData.productImageUris?.length > 0 ? (
                  <>
                    <Image
                      src={productData.productImageUris[currentImageIndex]}
                      alt={productData.productTitle || "Product Image"}
                      fill
                      className="rounded-lg cursor-pointer object-contain"
                      onError={handleImageError}
                      onClick={() => openZoomModal(currentImageIndex)}
                    />
                    {productData.productImageUris.length > 1 && (
                      <>
                        <div className="absolute top-1/2 transform -translate-y-1/2 flex justify-between w-full px-4 z-10">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePrevImage}
                            className="bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNextImage}
                            className="bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                        </div>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-sm z-10">
                          {`${currentImageIndex + 1} / ${productData.productImageUris.length}`}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Image
                    src="https://placehold.co/800x600/E0E0E0/808080?text=No+Image"
                    alt="No Image Available"
                    fill
                    className="rounded-lg object-contain"
                  />
                )}
              </div>

              <CardContent className="flex-1 p-0">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
                  {productData.productTitle}
                </h1>

                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-blue-900">
                    Rs.{productData.productPrice}
                  </span>
                  <span className="text-lg text-gray-500 ml-2">
                    per {productData.productUnit}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-md text-gray-700">
                    <span className="font-semibold">Category:</span> {productData.productCategory}
                  </p>
                  <p className="text-md text-gray-700">
                    <span className="font-semibold">Stock:</span> {productData.productStock} units
                  </p>
                  {productData.productBrand && (
                    <p className="text-md text-gray-700">
                      <span className="font-semibold">Brand:</span> {productData.productBrand}
                    </p>
                  )}
                  {productData.productMaterial && (
                    <p className="text-md text-gray-700">
                      <span className="font-semibold">Material:</span> {productData.productMaterial}
                    </p>
                  )}
                  <p className="text-md text-gray-700">
                    <span className="font-semibold">Type:</span> {productData.productType}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 mt-6 items-center">
                  <div className="flex items-center">
                    <label htmlFor="quantity" className="mr-2 text-md font-semibold">Quantity:</label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={productData.productStock}
                      value={productQuantity}
                      onChange={handleQuantityChange}
                      className="w-20 rounded-lg border-gray-300"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors duration-200"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-lg border-gray-300 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                    onClick={handleAddToWishlist}
                  >
                    Add to Wishlist
                  </Button>
                </div>
                {productData.productStock < 10 && (
                  <p className="text-sm text-red-600 mt-2">
                    {`Only ${productData.productStock} units left in stock!`}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            !isLoading && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2 text-gray-700">Product details could not be loaded.</h3>
                <p className="text-gray-600">Please check the URL or try again from the product list.</p>
              </div>
            )
          )}
        </>
      )}

      {isZoomModalOpen && productData?.productImageUris && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={closeZoomModal}>
          <div className="relative bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" onClick={closeZoomModal} className="absolute top-2 right-2 text-white bg-gray-700 hover:bg-gray-600 rounded-full z-10"><X className="h-6 w-6" /></Button>
            <div className="relative w-full h-[70vh] md:h-[80vh] max-w-[1200px] max-h-[900px] mx-auto flex items-center justify-center">
              <Image
                src={productData.productImageUris[zoomedImageIndex]}
                alt={`${productData.productTitle || "Product Image"} - Zoomed`}
                fill
                className="rounded-lg object-contain"
                onError={handleImageError}
              />
              {productData.productImageUris.length > 1 && (
                <>
                  <Button variant="outline" size="icon" onClick={handlePrevZoomedImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md z-10"><ChevronLeft className="h-6 w-6" /></Button>
                  <Button variant="outline" size="icon" onClick={handleNextZoomedImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md z-10"><ChevronRight className="h-6 w-6" /></Button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">{`${zoomedImageIndex + 1} / ${productData.productImageUris.length}`}</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;
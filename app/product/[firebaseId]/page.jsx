
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import app from "../../firebaseConfig";
import { getDatabase, ref, get, push, set, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

/**
 * ProductDetailPage component displays detailed information for a single product.
 * It fetches product data from Firebase Realtime Database based on the productId
 * and allows adding the product to the user's cart or wishlist with all specified details.
 */
function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.firebaseId;

  // State to store product data
  const [productData, setProductData] = useState(null);
  // State to manage loading status
  const [isLoading, setIsLoading] = useState(true);
  // State to display messages (e.g., error, product not found, cart/wishlist feedback)
  const [message, setMessage] = useState('');
  // State for quantity input
  const [productQuantity, setProductQuantity] = useState(1);
  // State for carousel current image index (kept for consistency with prior use of imageUris)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /**
   * Fetches the specific product's data from Firebase Realtime Database.
   * Runs when the component mounts or when productId changes.
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setMessage('');
      if (!productId) {
        setMessage("No product ID provided. Please navigate from the product list.");
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
          setMessage('');
        } else {
          setMessage("Product not found. It might have been removed or the link is incorrect.");
          setProductData(null);
        }
      } catch (error) {
        console.error("Error fetching product data: ", error);
        setMessage("Failed to load product details. Please try again later.");
        setProductData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  /**
   * Saves the product data to the user's cart in Firebase Realtime Database
   * or updates the quantity if the product already exists in the cart.
   */
  const handleAddToCart = async () => {
    setMessage('');
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        setMessage("Please log in to add items to your cart.");
        return;
      }

      if (!productData) {
        setMessage("Product data is missing. Please try again.");
        return;
      }

      // Validate required fields
      const requiredFields = [
        'productTitle', 'productPrice', 'productCategory',
        'productStock', 'productUnit', 'productType',
        'adminUid', 'productId'
      ];
      for (const field of requiredFields) {
        if (!productData[field]) {
          setMessage(`Missing product detail: ${field.replace('product', '')}. Cannot add to cart.`);
          return;
        }
      }

      const quantity = parseInt(productQuantity);
      if (isNaN(quantity) || quantity < 1) {
        setMessage("Please enter a valid quantity (minimum 1).");
        return;
      }
      if (quantity > productData.productStock) {
        setMessage(`Cannot add ${quantity} items. Only ${productData.productStock} in stock.`);
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
            // Product found, update quantity
            const newQuantity = cartItem.productQuantity + quantity;
            if (newQuantity > productData.productStock) {
              setMessage(`Adding ${quantity} more would exceed stock. Only ${productData.productStock} in total allowed.`);
              productFoundInCart = true;
              return true;
            }
            update(childSnapshot.ref, {
              productQuantity: newQuantity,
              itemCount: newQuantity,
              addedAt: Date.now()
            });
            setMessage(`Quantity of "${productData.productTitle}" updated to ${newQuantity} in cart.`);
            productFoundInCart = true;
            return true;
          }
        });
      }

      if (!productFoundInCart) {
        const newDocRef = push(userCartRef);
        await set(newDocRef, {
          adminUid: productData.adminUid,
          itemCount: quantity,
          productCategory: productData.productCategory,
          productId: productData.productId,
          productImageUris: productData.productImageUris || [],
          productPrice: parseFloat(productData.productPrice),
          productQuantity: quantity,
          productRandomId: productData.productRandomId || null,
          productStock: parseInt(productData.productStock),
          productTitle: productData.productTitle,
          productType: productData.productType,
          productUnit: productData.productUnit,
          addedAt: Date.now()
        });
        setMessage(`"${productData.productTitle}" added to cart successfully!`);
      }

      setProductQuantity(1);
    } catch (error) {
      console.error("Error adding/updating to cart:", error);
      setMessage(`Failed to add product to cart: ${error.message}.`);
    }
  };

  /**
   * Adds the product to the user's wishlist with all required fields.
   * Checks for duplicates before adding.
   */
  const handleAddToWishlist = async () => {
    setMessage('');
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        setMessage("Please log in to add items to your wishlist.");
        return;
      }

      if (!productData) {
        setMessage("Product data is missing. Cannot add to wishlist.");
        return;
      }

      // Validate required fields
      const requiredFields = [
        'productId', 'productTitle', 'productPrice', 'productCategory',
        'productStock', 'productUnit', 'productType', 'adminUid'
      ];
      for (const field of requiredFields) {
        if (!productData[field]) {
          setMessage(`Missing product detail: ${field.replace('product', '')}. Cannot add to wishlist.`);
          return;
        }
      }

      const db = getDatabase(app);
      const userWishlistRef = ref(db, `AllUsers/Users/${user.uid}/UserWishlistItems`);
      const snapshot = await get(userWishlistRef);
      let productFoundInWishlist = false;

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const wishlistItem = childSnapshot.val();
          if (wishlistItem.productId === productData.productId) {
            productFoundInWishlist = true;
            return true;
          }
        });
      }

      if (productFoundInWishlist) {
        setMessage(`"${productData.productTitle}" is already in your wishlist.`);
      } else {
        const newDocRef = push(userWishlistRef);
        await set(newDocRef, {
          adminUid: productData.adminUid,
          itemCount: 1,
          productCategory: productData.productCategory,
          productId: productData.productId,
          productImageUris: productData.productImageUris || [],
          productPrice: parseFloat(productData.productPrice),
          productQuantity: 1,
          productRandomId: productData.productRandomId || null,
          productStock: parseInt(productData.productStock),
          productTitle: productData.productTitle,
          productType: productData.productType,
          productUnit: productData.productUnit,
          addedAt: Date.now()
        });
        setMessage(`"${productData.productTitle}" added to wishlist successfully!`);
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      setMessage(`Failed to add product to wishlist: ${error.message}.`);
    }
  };

  // Handle back button click
  const handleBackButtonClick = () => {
    router.back();
  };

  // Handle quantity input change
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setProductQuantity(value);
  };

  // Carousel navigation functions (kept as no-op for consistency)
  const handlePrevImage = useCallback(() => {}, []);
  const handleNextImage = useCallback(() => {}, []);

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
          {message && (
            <div
              className={`border px-4 py-3 rounded-lg relative mb-6 ${
                message.includes("successfully") || message.includes("updated")
                  ? "bg-green-100 border-green-400 text-green-700"
                  : "bg-red-100 border-red-400 text-red-700"
              }`}
              role="alert"
            >
              <span className="block sm:inline">{message}</span>
            </div>
          )}

          {productData ? (
            <Card className="rounded-xl shadow-lg overflow-hidden md:flex md:items-start md:space-x-8 p-6">
              <div className="relative w-full md:w-1/2 rounded-lg overflow-hidden flex-shrink-0 mb-6 md:mb-0">
                {productData.productImageUris && productData.productImageUris.length > 0 ? (
                  <>
                    <Image
                      src={productData.productImageUris[currentImageIndex]}
                      alt={`${productData.productTitle || "Product Image"}`}
                      width={800}
                      height={600}
                      layout="responsive"
                      objectFit="contain"
                      className="rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/800x600/E0E0E0/808080?text=Image+Error";
                      }}
                    />
                    {productData.productImageUris.length > 1 && (
                      <div className="absolute top-1/2 transform -translate-y-1/2 flex justify-between w-full px-4">
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
                    )}
                    {productData.productImageUris.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {productData.productImageUris.length}
                      </div>
                    )}
                  </>
                ) : (
                  <Image
                    src="https://placehold.co/800x600/E0E0E0/808080?text=No+Image"
                    alt="No Image Available"
                    width={800}
                    height={600}
                    layout="responsive"
                    objectFit="contain"
                    className="rounded-lg"
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

                <div className="flex gap-4 mt-6 items-center">
                  <div className="flex items-center">
                    <label htmlFor="quantity" className="mr-2 text-md font-semibold">Quantity:</label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
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
                    Only {productData.productStock} units left in stock!
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            !isLoading &&
            !message && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2 text-gray-700">Product details could not be loaded.</h3>
                <p className="text-gray-600">Please check the URL or try again from the product list.</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

export default ProductDetailPage;

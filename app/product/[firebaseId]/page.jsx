"use client"
import React, { useState, useEffect } from 'react';
import app from "../../firebaseConfig";
import { getDatabase, ref, get } from "firebase/database";
import { useParams, useRouter } from 'next/navigation'; // Import useRouter for navigation
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

/**
 * ProductDetailPage component displays detailed information for a single product.
 * It fetches product data from Firebase Realtime Database based on the productId
 * provided in the URL parameters.
 */
function ProductDetailPage() {
  const params = useParams(); // Hook to access dynamic route parameters
  const router = useRouter(); // Hook to access the router object for navigation
  const productId = params.firebaseId; // Get the product ID from the URL (renamed from firebaseId for clarity)

  // State to store all product data
  const [productData, setProductData] = useState(null);
  // State to manage loading status
  const [isLoading, setIsLoading] = useState(true);
  // State to display messages (e.g., error, product not found)
  const [message, setMessage] = useState('');

  /**
   * Fetches the specific product's data from Firebase Realtime Database.
   * Runs when the component mounts or when productId changes.
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Set loading to true when starting fetch
      setMessage(''); // Clear any previous messages
      if (!productId) {
        // If productId is not available (e.g., direct access to /product/ without ID)
        setMessage("No product ID provided. Please navigate from the product list.");
        setIsLoading(false);
        return;
      }

      try {
        const db = getDatabase(app); // Get the database instance
        // Reference to the specific product using its ID
        const dbRef = ref(db, `Admins/AllProduct/${productId}`);
        const snapshot = await get(dbRef); // Fetch data once

        if (snapshot.exists()) {
          const fetchedProduct = snapshot.val(); // Get the product data
          setProductData({ ...fetchedProduct, productId: productId }); // Store product data with its ID
          setMessage(''); // Clear message on success
        } else {
          // If no product found for the given ID
          setMessage("Product not found. It might have been removed or the link is incorrect.");
          setProductData(null); // Clear product data
        }
      } catch (error) {
        // Catch any errors during the fetch operation
        console.error("Error fetching product data: ", error);
        setMessage("Failed to load product details. Please try again later.");
        setProductData(null); // Clear product data on error
      } finally {
        setIsLoading(false); // Set loading to false once fetch is complete
      }
    };

    fetchData(); // Call the fetch function
  }, [productId]); // Dependency array: re-run effect if productId changes

  // Handle back button click
  const handleBackButtonClick = () => {
    router.back(); // Go back to the previous page in history
  };

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      <div className="mb-6">
        {/* Back button */}
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
        // Loading spinner while data is being fetched
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading product details...</p>
        </div>
      ) : (
        <>
          {/* Display messages (e.g., product not found, error) */}
          {message && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <span className="block sm:inline">{message}</span>
            </div>
          )}

          {productData ? (
            // Product details card
            <Card className="rounded-xl shadow-lg overflow-hidden md:flex md:items-start md:space-x-8 p-6">
              {/* Product Image Section */}
              <div className="relative w-full md:w-1/2 h-80 md:h-96 rounded-lg overflow-hidden flex-shrink-0 mb-6 md:mb-0">
                <Image
                  src={productData.productImageUris && productData.productImageUris[0] ? productData.productImageUris[0] : "https://placehold.co/800x600/E0E0E0/808080?text=No+Image"}
                  alt={productData.productTitle || "Product Image"}
                  layout="fill"
                  objectFit="contain" // Use 'contain' for detail page to show full image
                  className="rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/800x600/E0E0E0/808080?text=Image+Error";
                  }}
                />
              </div>

              {/* Product Information Section */}
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
                  {/* Add more product details as needed */}
                </div>

                {/* Example Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <Button size="lg" className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors duration-200">
                    Add to Cart
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-lg border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Fallback message if productData is null (e.g., after an error or not found)
            !isLoading && !message && ( // Only show if not loading and no specific message is already shown
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

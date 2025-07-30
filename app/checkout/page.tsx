// CheckoutPageDesign.tsx
import React from 'react';

// This component is purely for visual design demonstration
// It does NOT include any interactive JavaScript logic, state, or API calls.
// It assumes Tailwind CSS is configured in your project.

export default function CheckoutPageDesign() {
  // Hardcoded data for visual representation
  const items = [
    {
      id: 'prod1',
      product: {
        id: 'p1',
        name: 'High-Performance Wireless Headphones',
        price: 79.99,
        image: 'https://via.placeholder.com/150/F0F0F0/808080?text=Headphones',
      },
      quantity: 1,
    },
    {
      id: 'prod2',
      product: {
        id: 'p2',
        name: 'Ergonomic Mechanical Keyboard',
        price: 120.00,
        image: 'https://via.placeholder.com/150/F0F0F0/808080?text=Keyboard',
      },
      quantity: 1,
    },
    {
      id: 'prod3',
      product: {
        id: 'p3',
        name: 'Ultra-Wide Gaming Monitor',
        price: 349.00,
        image: 'https://via.placeholder.com/150/F0F0F0/808080?text=Monitor',
      },
      quantity: 1,
    },
  ];

  // Hardcoded calculations for display
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 15; // Example: Free shipping over $200, otherwise $15
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const finalTotal = subtotal + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Form wrapper (no <form> tag to avoid default browser submission) */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Card (simulated Shadcn Card) */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 border-b">
                <h2 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
                  {/* MapPin Icon (SVG equivalent from Lucide React) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Shipping Address
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      defaultValue="Jane"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      defaultValue="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-1">
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    defaultValue="456 Commerce Drive"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      defaultValue="Lalitpur"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-1">
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      defaultValue="Bagmati Province"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-1">
                      ZIP Code
                    </label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      defaultValue="44700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Card (simulated Shadcn Card) */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 border-b">
                <h2 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
                  {/* CreditCard Icon (SVG equivalent from Lucide React) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                  Payment Method
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* RadioGroup (simulated without JS) */}
                <div className="grid gap-2"> {/* This simulates RadioGroup's outer div */}
                  <div className="flex items-center space-x-2"> {/* RadioGroupItem */}
                    <input type="radio" id="card" name="paymentMethod" value="card" defaultChecked className="h-4 w-4 shrink-0 rounded-full border border-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                    <label htmlFor="card" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Credit/Debit Card
                    </label>
                  </div>
                  <div className="flex items-center space-x-2"> {/* RadioGroupItem */}
                    <input type="radio" id="paypal" name="paymentMethod" value="paypal" className="h-4 w-4 shrink-0 rounded-full border border-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                    <label htmlFor="paypal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      PayPal
                    </label>
                  </div>
                </div>

                {/* Card Details (always visible for static design, as if 'card' is selected) */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-1">
                      Card Number
                    </label>
                    <input
                      id="cardNumber"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-1">
                        Expiry Date
                      </label>
                      <input
                        id="expiryDate"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        type="text"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-1">
                        CVV
                      </label>
                      <input
                        id="cvv"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        type="text"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div>
            {/* Order Summary Card (simulated Shadcn Card) */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 border-b">
                <h2 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
                  {/* Package Icon (SVG equivalent from Lucide React) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m7.5 4.27 9 5.15" />
                    <path d="M21 8.03v8.01c0 .7-.37 1.34-.98 1.7L13 21.7c-.63.38-1.41.38-2.04 0L3.98 17.74c-.6-.36-.97-1-.97-1.7V8.03c0-.7.37-1.34.98-1.7L11 2.3c.63-.38 1.41-.38 2.04 0Z" />
                    <path d="m3 8-7 4.03-2.04 1.17c-.63.38-1.41.38-2.04 0L3.98 17.74c-.6-.36-.97-1-.97-1.7V8.03c0-.7.37-1.34.98-1.7L11 2.3c.63-.38 1.41-.38 2.04 0Z" />
                  </svg>
                  Order Summary
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Separator (simulated Shadcn Separator) */}
                <div className="shrink-0 bg-border h-[1px] w-full" />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {/* Separator (simulated Shadcn Separator) */}
                  <div className="shrink-0 bg-border h-[1px] w-full" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button (simulated Shadcn Button) */}
                <button
                  type="button" // Use type="button" to prevent default form submission if wrapped in a <form>
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 w-full"
                >
                  Place Order - ${finalTotal.toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
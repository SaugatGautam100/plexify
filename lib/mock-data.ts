import { Product, Category, User, Order } from '@/types';

// Assuming a Seller type exists in your types/index.ts
// If not, you can define it here or in your types file.
// export interface Seller {
//   id: string;
//   name: string;
//   email: string;
//   businessName: string;
//   businessAddress: string;
//   phone: string;
//   avatar: string;
//   description: string;
//   rating: number;
//   totalSales: number;
//   products: string[];
//   isVerified: boolean;
//   createdAt: number;
// }

export const categories: Category[] = [
  {
    id: '1',
    name: 'Vegetables & Fruits',
    slug: 'vegetables-fruits',
    description: 'Fresh vegetables and fruits',
    image: '/category-images/vegetable.png',
    subcategories: [],
  },
  {
    id: '2',
    name: 'Dairy & Breakfast',
    slug: 'dairy-breakfast',
    description: 'Milk, cheese, yogurt, and breakfast essentials',
    image: '/category-images/dairy_breakfast.png',
    subcategories: [],
  },
  {
    id: '3',
    name: 'Chips & Namkeen',
    slug: 'chips-namkeen',
    description: 'Snacks and savory delights',
    image: '/category-images/munchies.png',
    subcategories: [],
  },
  {
    id: '4',
    name: 'Cold Drinks & Juices',
    slug: 'cold-drinks-juices',
    description: 'Refreshing beverages and natural juices',
    image: '/category-images/cold_and_juices.png',
    subcategories: [],
  },
  {
    id: '5',
    name: 'Instant & Frozen',
    slug: 'instant-frozen',
    description: 'Quick meals and frozen foods',
    image: '/category-images/instant.png',
    subcategories: [],
  },
  {
    id: '6',
    name: 'Tea Coffee & Health',
    slug: 'tea-coffee-health',
    description: 'Hot beverages and health drinks',
    image: '/category-images/tea_coffee.png',
    subcategories: [],
  },
  {
    id: '7',
    name: 'Bakery & Biscuits',
    slug: 'bakery-biscuits',
    description: 'Freshly baked goods and various biscuits',
    image: '/category-images/bakery_biscuits.png',
    subcategories: [],
  },
  {
    id: '8',
    name: 'Sweet Tooth',
    slug: 'sweet-tooth',
    description: 'Chocolates, candies, and desserts',
    image: '/category-images/sweet_tooth.png',
    subcategories: [],
  },
  {
    id: '9',
    name: 'Atta Rice & Dal',
    slug: 'atta-rice-dal',
    description: 'Staple grains and pulses',
    image: '/category-images/atta_rice.png',
    subcategories: [],
  },
  {
    id: '10',
    name: 'Dry Fruits Masala & Oil',
    slug: 'dry-fruits-masala-oil',
    description: 'Nuts, spices, and cooking oils',
    image: '/category-images/dry_masala.png',
    subcategories: [],
  },
  {
    id: '11',
    name: 'Sauces & Spreads',
    slug: 'sauces-spreads',
    description: 'Condiments and delicious spreads',
    image: '/category-images/sauce_spreads.png',
    subcategories: [],
  },
  {
    id: '12',
    name: 'Chicken Meat & Fish',
    slug: 'chicken-meat-fish',
    description: 'Fresh poultry, meat, and seafood',
    image: '/category-images/chicken_meat.png',
    subcategories: [],
  },
  {
    id: '13',
    name: 'Pan Corner Treats',
    slug: 'pan-corner-treats',
    description: 'Traditional Indian mouth fresheners',
    image: '/category-images/paan_corner.png',
    subcategories: [],
  },
  {
    id: '14',
    name: 'Organic & Premium',
    slug: 'organic-premium',
    description: 'High-quality organic products',
    image: '/category-images/organic_premium.png',
    subcategories: [],
  },
  {
    id: '15',
    name: 'Baby Care Essentials',
    slug: 'baby-care-essentials',
    description: 'Products for baby care',
    image: '/category-images/baby_care.png',
    subcategories: [],
  },
  {
    id: '16',
    name: 'Pharma & Wellness',
    slug: 'pharma-wellness',
    description: 'Health and pharmaceutical products',
    image: '/category-images/pharma_wellness.png',
    subcategories: [],
  },
  {
    id: '17',
    name: 'Cleaning Essential',
    slug: 'cleaning-essential',
    description: 'Household cleaning supplies',
    image: '/category-images/cleaning.png',
    subcategories: [],
  },
  {
    id: '18',
    name: 'Home & Office',
    slug: 'home-office',
    description: 'Supplies for home and office',
    image: '/category-images/home_office.png',
    subcategories: [],
  },
  {
    id: '19',
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Products for personal hygiene and grooming',
    image: '/category-images/personal_care.png',
    subcategories: [],
  },
  {
    id: '20',
    name: 'Pet Care Essential',
    slug: 'pet-care-essential',
    description: 'Everything for your beloved pets',
    image: '/category-images/pet_care.png',
    subcategories: [],
  },
];


export const products: Product[] = [
  {
    adminUid: "suPbGytrYMSTPyPaPowTK2uQ3gi1",
    itemCount: 0,
    productCategory: "Dry Fruits Masala & Oil",
    productId: "Zq0Dit4xBl1JEKUXOeNc53S1j",
    productImageUris: [
      "https://firebasestorage.googleapis.com/v0/b/plexify-6469a.firebasestorage.app/o/2Ed8DN4Yw7RfSZnP95jz2FHJ4vt1%2Fimages%2F500e0d7e-811f-4152-930d-ef3b3e7a369e?alt=media&token=abc82aa2-9994-47fb-9416-5f685ad0e28e",
      "https://firebasestorage.googleapis.com/v0/b/plexify-6469a.firebasestorage.app/o/2Ed8DN4Yw7RfSZnP95jz2FHJ4vt1%2Fimages%2F3584fe67-233c-4d05-9244-6748e9787763?alt=media&token=bac55218-e743-4275-8db8-885e9b88dd01",
      "https://firebasestorage.googleapis.com/v0/b/plexify-6469a.firebasestorage.app/o/2Ed8DN4Yw7RfSZnP95jz2FHJ4vt1%2Fimages%2F866600e1-d610-4250-bb45-a0ee085795dd?alt=media&token=e83a2bcc-b0d5-4fd0-a793-c03c3c547543",
      "https://firebasestorage.googleapis.com/v0/b/plexify-6469a.firebasestorage.app/o/2Ed8DN4Yw7RfSZnP95jz2FHJ4vt1%2Fimages%2Fd75e0b54-aa47-4d45-a94a-ed74c6685a5f?alt=media&token=02d40e8e-0a92-4577-b52f-25987e5fff2d"
    ],
    productPrice: 240,
    productQuantity: 1,
    productRandomId: "3IbNeqWT5vq9Nd220eVtLx5qU",
    productStock: 48,
    productTitle: "Oil",
    productType: "Cooking Oil",
    productUnit: "Ltr",
  },
  {
    adminUid: "suPbGytrYMSTPyPaPowTK2uQ3gi1",
    itemCount: 0,
    productCategory: "Dairy & Breakfast",
    productId: "WExzVbdE7X5UYkM763k9VraO5",
    productImageUris: [
      'https://firebasestorage.googleapis.com/v0/b/plexify-6469a.firebasestorage.app/o/2Ed8DN4Yw7RfSZnP95jz2FHJ4vt1%2Fimages%2F5642e0f0-2024-4b2b-b211-30216ff57dfa?alt=media&token=f3af9ffd-adc2-4098-97c8-46337d79f819'
    ],
    productPrice: 125,
    productQuantity: 1,
    productRandomId: "5D2bAaMhonHSVnLnVncB05mbR",
    productStock: 164,
    productTitle: "Amul Milk",
    productType: "Milk, Curd & Paneer",
    productUnit: "Ltr",
  },
  {
    adminUid: "suPbGytrYMSTPyPaPowTK2uQ3gi1",
    itemCount: 0,
    productCategory: "Atta Rice & Dal",
    productId: "2JDKrAHHELFI3L5thBICth4RC",
    productImageUris: [
      'https://firebasestorage.googleapis.com/v0/b/plexify-6469a.firebasestorage.app/o/2Ed8DN4Yw7RfSZnP95jz2FHJ4vt1%2Fimages%2Ff525a6b5-1ad3-43b1-add9-3de266bc36b2?alt=media&token=98652298-eb4f-4263-b508-4d77ab218e1b'
    ],
    productPrice: 130,
    productQuantity: 1,
    productRandomId: "hngwkJj7ic3msLeLASP5IUyp3",
    productStock: 55,
    productTitle: "Atta",
    productType: "Atta & Rice",
    productUnit: "kg",
  },
  {
    adminUid: "suPbGytrYMSTPyPaPowTK2uQ3gi1",
    itemCount: 0,
    productCategory: "Atta Rice & Dal",
    productId: "yK3nwUFsF2UcTkbUDDl4ROYLI",
    productImageUris: [
      'https://firebasestorage.googleapis.com/v0/b/plexify-6469a.firebasestorage.app/o/2Ed8DN4Yw7RfSZnP95jz2FHJ4vt1%2Fimages%2F8018beda-4bd5-4e55-8412-db5b07313b93?alt=media&token=ebf35ae9-57b9-4191-8255-6d96133e7c50'
    ],
    productPrice: 150,
    productQuantity: 1,
    productRandomId: "uew9EPgYsDe9q8rBw8Cv9Jw8j",
    productStock: 24,
    productTitle: "Rice",
    productType: "Atta & Rice",
    productUnit: "kg",
  },
];

export const mockUser: User = {
  id: '1',
  UserName: 'John Doe',
  UserEmail: 'john@example.com',
  UserPhone: '9800000000',
  UserAddress: '123 Main St, Anytown',
  UserType: 'user',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  // The 'createdAt' field must be a number (Unix timestamp).
  // Date.parse() converts the string to the correct number format.
  createdAt: Date.parse('2024-01-01T10:00:00Z'),

  // NOTE: The following properties are commented out because they are not
  // defined in your `User` interface in `types/index.ts`. To use them,
  // you must first add them to the `User` type definition.
  /*
  addresses: [
    {
      id: '1',
      name: 'Home',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      isDefault: true,
    },
  ],
  orders: [],
  wishlist: ['1', '3'],
  */
};

// Assuming a 'Seller' type similar to this exists in your types/index.ts
// export const mockSeller: Seller = {
//   id: 'seller1',
//   name: 'Jane Smith',
//   email: 'seller@example.com',
//   businessName: 'TechWorld Store',
//   businessAddress: '456 Business Ave, San Francisco, CA 94102',
//   phone: '+1 (555) 987-6543',
//   avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
//   description: 'Leading retailer of premium electronics and gadgets with over 10 years of experience.',
//   rating: 4.8,
//   totalSales: 15420,
//   products: ['1', '2'],
//   isVerified: true,
//   createdAt: Date.parse('2023-06-15T10:00:00Z'), // Converted to a number
// };
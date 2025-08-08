import { Product, Category, User } from '@/types';

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
  // ... (rest of your categories, unchanged)
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

// Example address type for User mock
type Address = {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
};

// If your User type expects addresses, orders, wishlist, etc., add them as optional fields
export const mockUser: User = {
  id: '1',
  UserName: 'John Doe',
  UserEmail: 'john@example.com',
  UserPhone: '1234567890',
  UserAddress: '123 Main St, New York, NY',
  UserType: 'user',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  createdAt: Date.parse('2024-01-01T10:00:00Z'), // number
  // If you want to add addresses, orders, wishlist, etc., add them here as optional fields
  // addresses: [
  //   {
  //     id: '1',
  //     name: 'Home',
  //     street: '123 Main St',
  //     city: 'New York',
  //     state: 'NY',
  //     zipCode: '10001',
  //     country: 'USA',
  //     isDefault: true,
  //   },
  // ],
  // orders: [],
  // wishlist: ['1', '3'],
};
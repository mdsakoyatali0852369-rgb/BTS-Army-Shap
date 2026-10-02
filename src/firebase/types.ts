export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex?: string;
  sku?: string;
  stock: number;
  price?: number;
  salePrice?: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  gender?: 'Men' | 'Women' | 'Unisex' | 'Kids' | string;
  fabric?: string;
  images: string[];
  thumbnail: string;
  price: number;
  salePrice?: number;
  costPrice?: number; // Admin only
  sizes: string[];
  colors: { name: string; hex: string; image?: string }[];
  variants: ProductVariant[];
  totalStock: number;
  tags?: string[];
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  active: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CustomerShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  division: string;
  district: string;
  upazila?: string;
  deliveryNotes?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'
  | 'Refunded';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customer: CustomerShippingAddress;
  items: OrderItem[];
  discount: number;
  couponCode?: string;
  deliveryCharge: number;
  deliveryZoneName?: string;
  total: number;
  paymentMethod: 'Cash on Delivery' | 'bKash' | 'Nagad' | 'Online';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory?: { status: OrderStatus; timestamp: string; note?: string }[];
  customerNote?: string;
  adminNotes?: string;
  guestAccessToken?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  target: string;
  targetId?: string | null;
  timestamp: string;
  details?: Record<string, unknown>;
  userAgent?: string;
}

export interface Customer {
  id: string;
  uid: string;
  displayName?: string;
  email?: string;
  phone?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'blocked';
  createdAt: string;
  lastLoginAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  minOrder?: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  charge: number;
  minOrderFree?: number;
  active: boolean;
  isDefault?: boolean;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  active: boolean;
  sortOrder: number;
}

export interface StaticPageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface SiteSettings {
  storeName: string;
  storeDescription: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  currency: string;
  deliveryArea: string;
  announcement?: string;
  announcementActive?: boolean;
  logoUrl?: string;
}

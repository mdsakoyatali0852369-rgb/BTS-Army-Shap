import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './config';
import {
  Product,
  Category,
  Order,
  OrderItem,
  Customer,
  Review,
  Coupon,
  DeliveryZone,
  Banner,
  StaticPageContent,
  SiteSettings,
  AuditLog,
} from './types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==================== SANITIZATION HELPER ====================
export function removeUndefinedFields<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? removeUndefinedFields(item) : item)) as unknown as T;
  }
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      sanitized[key] = removeUndefinedFields(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}

// ==================== AUDIT LOGGING ====================
export async function logAdminAudit(
  action: string,
  target: string,
  targetId?: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    if (!auth.currentUser) return;
    const path = 'auditLogs';
    await addDoc(collection(db, path), {
      adminUid: auth.currentUser.uid,
      adminEmail: auth.currentUser.email || 'admin',
      action,
      target,
      targetId: targetId || null,
      details: details || {},
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 150) : 'unknown',
    });
  } catch (err) {
    console.warn('Audit log write notice:', err);
  }
}

export async function getAuditLogsAdmin(limitCount = 50): Promise<AuditLog[]> {
  const path = 'auditLogs';
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ==================== PRODUCTS ====================
export async function getActiveProducts(limitCount?: number): Promise<Product[]> {
  const path = 'products';
  try {
    const q = limitCount
      ? query(collection(db, path), where('active', '==', true), limit(limitCount))
      : query(collection(db, path), where('active', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getAllProductsAdmin(limitCount = 100): Promise<Product[]> {
  const path = 'products';
  try {
    const q = query(collection(db, path), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const path = `products/${id}`;
  try {
    const snap = await getDoc(doc(db, 'products', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Product;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const path = 'products';
  try {
    const q = query(collection(db, path), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Product;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const path = 'products';
  try {
    const now = new Date().toISOString();
    const sanitized = removeUndefinedFields({
      ...productData,
      createdAt: now,
      updatedAt: now,
    });
    const docRef = await addDoc(collection(db, path), sanitized);
    await logAdminAudit('PRODUCT_CREATE', 'products', docRef.id, {
      name: productData.name,
      price: productData.price,
      sku: productData.sku,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const path = `products/${id}`;
  try {
    const refDoc = doc(db, 'products', id);
    const sanitized = removeUndefinedFields({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(refDoc, sanitized);
    await logAdminAudit('PRODUCT_UPDATE', 'products', id, { updatedKeys: Object.keys(updates) });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
    await logAdminAudit('PRODUCT_DELETE', 'products', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== CATEGORIES ====================
export async function getCategories(): Promise<Category[]> {
  const path = 'categories';
  try {
    const snap = await getDocs(collection(db, path));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
    return list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createCategory(catData: Omit<Category, 'id' | 'createdAt'>): Promise<string> {
  const path = 'categories';
  try {
    const sanitized = removeUndefinedFields({
      ...catData,
      createdAt: new Date().toISOString(),
    });
    const docRef = await addDoc(collection(db, path), sanitized);
    await logAdminAudit('CATEGORY_CREATE', 'categories', docRef.id, { name: catData.name });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  const path = `categories/${id}`;
  try {
    const sanitized = removeUndefinedFields(updates);
    await updateDoc(doc(db, 'categories', id), sanitized);
    await logAdminAudit('CATEGORY_UPDATE', 'categories', id, { updatedKeys: Object.keys(updates) });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const path = `categories/${id}`;
  try {
    await deleteDoc(doc(db, 'categories', id));
    await logAdminAudit('CATEGORY_DELETE', 'categories', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== ORDERS ====================
export async function createOrder(
  orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'> & { idempotencyKey?: string }
): Promise<string> {
  const path = 'orders';
  try {
    // 1. Basic input validation
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    if (!orderData.customer || !orderData.customer.fullName || !orderData.customer.phone || !orderData.customer.address) {
      throw new Error('Customer full name, phone number, and delivery address are required');
    }

    // 2. Check for duplicate order via idempotency key
    if (orderData.idempotencyKey) {
      const existingQuery = query(
        collection(db, 'orders'),
        where('idempotencyKey', '==', orderData.idempotencyKey),
        limit(1)
      );
      const existingSnap = await getDocs(existingQuery);
      if (!existingSnap.empty) {
        return existingSnap.docs[0].id;
      }
    }

    // 3. Pre-fetch coupon if couponCode provided
    let couponDocRef: any = null;
    if (orderData.couponCode) {
      const couponQuery = query(
        collection(db, 'coupons'),
        where('code', '==', orderData.couponCode.trim().toUpperCase()),
        limit(1)
      );
      const couponSnap = await getDocs(couponQuery);
      if (!couponSnap.empty) {
        couponDocRef = couponSnap.docs[0].ref;
      }
    }

    // 4. Execute atomic transaction: Read trusted product prices, verify stock, deduct inventory, apply coupon
    const newOrderId = await runTransaction(db, async (transaction) => {
      const now = new Date().toISOString();
      let trustedSubtotal = 0;
      const verifiedItems: OrderItem[] = [];
      const productStockUpdates: Array<{
        ref: any;
        newTotalStock: number;
        newVariants?: any[];
      }> = [];

      // Read Phase: Fetch all product documents
      for (const item of orderData.items) {
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await transaction.get(productRef);
        if (!productSnap.exists()) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        const product = { id: productSnap.id, ...productSnap.data() } as Product;
        if (!product.active) {
          throw new Error(`"${product.name}" is currently unavailable`);
        }

        const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
        if (product.totalStock < qty) {
          throw new Error(`Insufficient stock for "${product.name}". Only ${product.totalStock} left.`);
        }

        // Determine trusted price from database
        let trustedUnitPrice = (typeof product.salePrice === 'number' && product.salePrice > 0 && product.salePrice < product.price)
          ? product.salePrice
          : product.price;

        let updatedVariants: any[] | undefined = undefined;
        if (product.variants && product.variants.length > 0) {
          const matchedIdx = product.variants.findIndex(
            (v) =>
              (!item.size || v.size.toLowerCase() === item.size.toLowerCase()) &&
              (!item.color || v.color.toLowerCase() === item.color.toLowerCase())
          );

          if (matchedIdx !== -1) {
            const variant = product.variants[matchedIdx];
            if (variant.stock < qty) {
              throw new Error(`Stock depleted for "${product.name}" (${[item.size, item.color].filter(Boolean).join(' ')}). Only ${variant.stock} left.`);
            }
            if (typeof variant.salePrice === 'number' && variant.salePrice > 0 && (variant.price === undefined || variant.salePrice < variant.price)) {
              trustedUnitPrice = variant.salePrice;
            } else if (typeof variant.price === 'number' && variant.price > 0) {
              trustedUnitPrice = variant.price;
            }

            updatedVariants = product.variants.map((v, idx) =>
              idx === matchedIdx ? { ...v, stock: Math.max(0, v.stock - qty) } : v
            );
          }
        }

        const itemSubtotal = trustedUnitPrice * qty;
        trustedSubtotal += itemSubtotal;

        verifiedItems.push({
          productId: product.id,
          name: product.name,
          image: item.image || product.thumbnail || product.images?.[0] || '/logo.jpg',
          size: item.size,
          color: item.color,
          quantity: qty,
          price: trustedUnitPrice,
          subtotal: itemSubtotal,
        });

        productStockUpdates.push({
          ref: productRef,
          newTotalStock: Math.max(0, product.totalStock - qty),
          newVariants: updatedVariants,
        });
      }

      // Re-read coupon doc in transaction to atomically verify and increment usedCount
      let trustedDiscount = 0;
      if (couponDocRef) {
        const freshCouponSnap = await transaction.get(couponDocRef);
        if (freshCouponSnap.exists()) {
          const freshCoupon = freshCouponSnap.data() as Coupon;
          const isNotExpired = !freshCoupon.expiryDate || new Date(freshCoupon.expiryDate).getTime() > Date.now();
          const hasRemainingUsage = !freshCoupon.usageLimit || (freshCoupon.usedCount || 0) < freshCoupon.usageLimit;
          const meetsMinOrder = !freshCoupon.minOrder || trustedSubtotal >= freshCoupon.minOrder;

          if (freshCoupon.active && isNotExpired && hasRemainingUsage && meetsMinOrder) {
            if (freshCoupon.discountType === 'percentage') {
              const rawDisc = Math.round((trustedSubtotal * freshCoupon.discountAmount) / 100);
              trustedDiscount = freshCoupon.maxDiscount ? Math.min(rawDisc, freshCoupon.maxDiscount) : rawDisc;
            } else {
              trustedDiscount = Math.min(trustedSubtotal, freshCoupon.discountAmount);
            }

            transaction.update(couponDocRef, {
              usedCount: (freshCoupon.usedCount || 0) + 1,
            });
          }
        }
      }

      // Calculate delivery charge from trusted rules
      let verifiedDeliveryCharge = 70; // Inside Dhaka default
      if (trustedSubtotal >= 3000) {
        verifiedDeliveryCharge = 0; // Free delivery over ৳3,000 threshold
      } else if (orderData.deliveryZoneName && orderData.deliveryZoneName.toLowerCase().includes('outside')) {
        verifiedDeliveryCharge = 130;
      } else if (typeof orderData.deliveryCharge === 'number' && orderData.deliveryCharge >= 0) {
        verifiedDeliveryCharge = orderData.deliveryCharge;
      }

      const trustedGrandTotal = Math.max(0, trustedSubtotal - trustedDiscount + verifiedDeliveryCharge);

      // Write Phase: Apply product stock updates
      for (const update of productStockUpdates) {
        if (update.newVariants) {
          transaction.update(update.ref, {
            totalStock: update.newTotalStock,
            variants: update.newVariants,
            updatedAt: now,
          });
        } else {
          transaction.update(update.ref, {
            totalStock: update.newTotalStock,
            updatedAt: now,
          });
        }
      }

      // Generate Order Number
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const orderNumber = `BTS-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randomDigits}`;
      const guestAccessToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const orderRef = doc(collection(db, path));
      const orderDocument: Order = {
        id: orderRef.id,
        orderNumber,
        customerId: orderData.customerId || undefined,
        customer: {
          fullName: orderData.customer.fullName.trim(),
          phone: orderData.customer.phone.trim(),
          email: orderData.customer.email?.trim() || undefined,
          address: orderData.customer.address.trim(),
          division: orderData.customer.division || 'Dhaka',
          district: orderData.customer.district || 'Dhaka',
          upazila: orderData.customer.upazila?.trim() || undefined,
          deliveryNotes: orderData.customer.deliveryNotes?.trim() || undefined,
        },
        items: verifiedItems,
        discount: trustedDiscount,
        couponCode: trustedDiscount > 0 ? orderData.couponCode : undefined,
        deliveryCharge: verifiedDeliveryCharge,
        deliveryZoneName: orderData.deliveryZoneName || 'Standard',
        total: trustedGrandTotal,
        paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        customerNote: orderData.customerNote?.trim() || undefined,
        guestAccessToken: !orderData.customerId ? guestAccessToken : undefined,
        idempotencyKey: orderData.idempotencyKey || undefined,
        createdAt: now,
        updatedAt: now,
        statusHistory: [
          {
            status: 'Pending',
            timestamp: now,
            note: 'Order placed by customer (Verified)',
          },
        ],
      };

      transaction.set(orderRef, orderDocument);

      return orderRef.id;
    });

    return newOrderId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const path = `orders/${id}`;
  try {
    const snap = await getDoc(doc(db, 'orders', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Order;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('orderNumber', '==', orderNumber.trim()), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Order;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('customerId', '==', customerId));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getAllOrdersAdmin(limitCount = 100): Promise<Order[]> {
  const path = 'orders';
  try {
    const q = query(collection(db, path), limit(limitCount));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: Order['orderStatus'],
  note?: string,
  paymentStatus?: Order['paymentStatus']
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    const existingHistory = orderDoc.exists() ? orderDoc.data().statusHistory || [] : [];
    const now = new Date().toISOString();

    const updates: Record<string, unknown> = {
      orderStatus: newStatus,
      updatedAt: now,
      statusHistory: [
        ...existingHistory,
        {
          status: newStatus,
          timestamp: now,
          note: note || `Status changed to ${newStatus}`,
        },
      ],
    };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }
    await updateDoc(doc(db, 'orders', orderId), updates);
    await logAdminAudit('ORDER_STATUS_UPDATE', 'orders', orderId, { newStatus, paymentStatus, note });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==================== CUSTOMERS ====================
export async function syncCustomerProfile(user: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
}): Promise<void> {
  const path = `customers/${user.uid}`;
  try {
    const refDoc = doc(db, 'customers', user.uid);
    const snap = await getDoc(refDoc);
    const now = new Date().toISOString();
    if (!snap.exists()) {
      await setDoc(refDoc, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        phone: user.phoneNumber || '',
        totalOrders: 0,
        totalSpent: 0,
        status: 'active',
        createdAt: now,
        lastLoginAt: now,
      });
    } else {
      await updateDoc(refDoc, {
        lastLoginAt: now,
      });
    }
  } catch (error) {
    // Non-fatal profile sync
    console.warn('Customer profile sync notice:', error);
  }
}

export async function getAllCustomersAdmin(): Promise<Customer[]> {
  const path = 'customers';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateCustomerStatus(uid: string, status: 'active' | 'blocked'): Promise<void> {
  const path = `customers/${uid}`;
  try {
    await updateDoc(doc(db, 'customers', uid), { status });
    await logAdminAudit('CUSTOMER_STATUS_UPDATE', 'customers', uid, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==================== REVIEWS ====================
export async function getProductReviews(productId: string): Promise<Review[]> {
  const path = 'reviews';
  try {
    const q = query(
      collection(db, path),
      where('productId', '==', productId),
      where('approved', '==', true)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getAllReviewsAdmin(limitCount = 100): Promise<Review[]> {
  const path = 'reviews';
  try {
    const q = query(collection(db, path), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function submitReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'approved'>): Promise<string> {
  const path = 'reviews';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...reviewData,
      approved: false, // Requires admin approval to prevent review spam
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateReviewApproval(reviewId: string, approved: boolean): Promise<void> {
  const path = `reviews/${reviewId}`;
  try {
    await updateDoc(doc(db, 'reviews', reviewId), { approved });
    await logAdminAudit('REVIEW_APPROVAL_UPDATE', 'reviews', reviewId, { approved });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  const path = `reviews/${reviewId}`;
  try {
    await deleteDoc(doc(db, 'reviews', reviewId));
    await logAdminAudit('REVIEW_DELETE', 'reviews', reviewId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== COUPONS ====================
export async function getCouponsAdmin(): Promise<Coupon[]> {
  const path = 'coupons';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function validateCoupon(code: string, cartTotal: number): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
  const path = 'coupons';
  try {
    const q = query(collection(db, path), where('code', '==', code.trim().toUpperCase()), where('active', '==', true), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
    }
    const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;
    if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
      return { valid: false, discount: 0, message: 'This coupon has expired' };
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
    }
    if (coupon.minOrder && cartTotal < coupon.minOrder) {
      return { valid: false, discount: 0, message: `Minimum order amount for this coupon is ৳${coupon.minOrder}` };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((cartTotal * coupon.discountAmount) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountAmount;
    }

    return { valid: true, discount, message: 'Coupon applied successfully!', coupon };
  } catch (error) {
    return { valid: false, discount: 0, message: 'Unable to validate coupon' };
  }
}

export async function createCoupon(data: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>): Promise<string> {
  const path = 'coupons';
  try {
    const sanitized = removeUndefinedFields({
      ...data,
      code: data.code.trim().toUpperCase(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    });
    const docRef = await addDoc(collection(db, path), sanitized);
    await logAdminAudit('COUPON_CREATE', 'coupons', docRef.id, { code: data.code });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<void> {
  const path = `coupons/${id}`;
  try {
    const sanitized = removeUndefinedFields(updates);
    await updateDoc(doc(db, 'coupons', id), sanitized);
    await logAdminAudit('COUPON_UPDATE', 'coupons', id, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  const path = `coupons/${id}`;
  try {
    await deleteDoc(doc(db, 'coupons', id));
    await logAdminAudit('COUPON_DELETE', 'coupons', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== DELIVERY ZONES ====================
export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const path = 'deliveryZones';
  try {
    const snap = await getDocs(collection(db, path));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as DeliveryZone));
    if (list.length === 0) {
      return [
        { id: 'dhaka', name: 'Inside Dhaka', charge: 70, active: true, isDefault: true },
        { id: 'outside-dhaka', name: 'Outside Dhaka', charge: 130, active: true, isDefault: false },
        { id: 'rangpur', name: 'Rangpur (Local Store Zone)', charge: 60, active: true, isDefault: false },
      ];
    }
    return list;
  } catch (error) {
    return [
      { id: 'dhaka', name: 'Inside Dhaka', charge: 70, active: true, isDefault: true },
      { id: 'outside-dhaka', name: 'Outside Dhaka', charge: 130, active: true, isDefault: false },
    ];
  }
}

export async function createDeliveryZone(data: Omit<DeliveryZone, 'id'>): Promise<string> {
  const path = 'deliveryZones';
  try {
    const sanitized = removeUndefinedFields(data);
    const docRef = await addDoc(collection(db, path), sanitized);
    await logAdminAudit('DELIVERY_ZONE_CREATE', 'deliveryZones', docRef.id, { name: data.name, charge: data.charge });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateDeliveryZone(id: string, updates: Partial<DeliveryZone>): Promise<void> {
  const path = `deliveryZones/${id}`;
  try {
    const sanitized = removeUndefinedFields(updates);
    await updateDoc(doc(db, 'deliveryZones', id), sanitized);
    await logAdminAudit('DELIVERY_ZONE_UPDATE', 'deliveryZones', id, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteDeliveryZone(id: string): Promise<void> {
  const path = `deliveryZones/${id}`;
  try {
    await deleteDoc(doc(db, 'deliveryZones', id));
    await logAdminAudit('DELIVERY_ZONE_DELETE', 'deliveryZones', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== BANNERS ====================
export async function getBanners(): Promise<Banner[]> {
  const path = 'banners';
  try {
    const snap = await getDocs(collection(db, path));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Banner));
    return list.filter((b) => b.active).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    return [];
  }
}

export async function getAllBannersAdmin(): Promise<Banner[]> {
  const path = 'banners';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Banner));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createBanner(data: Omit<Banner, 'id'>): Promise<string> {
  const path = 'banners';
  try {
    const sanitized = removeUndefinedFields(data);
    const docRef = await addDoc(collection(db, path), sanitized);
    await logAdminAudit('BANNER_CREATE', 'banners', docRef.id, { title: data.title });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateBanner(id: string, updates: Partial<Banner>): Promise<void> {
  const path = `banners/${id}`;
  try {
    const sanitized = removeUndefinedFields(updates);
    await updateDoc(doc(db, 'banners', id), sanitized);
    await logAdminAudit('BANNER_UPDATE', 'banners', id, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteBanner(id: string): Promise<void> {
  const path = `banners/${id}`;
  try {
    await deleteDoc(doc(db, 'banners', id));
    await logAdminAudit('BANNER_DELETE', 'banners', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== STATIC PAGES ====================
export async function getPageContent(slug: string): Promise<StaticPageContent | null> {
  const path = 'pages';
  try {
    const q = query(collection(db, path), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as StaticPageContent;
  } catch (error) {
    return null;
  }
}

export async function savePageContent(slug: string, title: string, content: string): Promise<void> {
  const path = 'pages';
  try {
    const q = query(collection(db, path), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    const now = new Date().toISOString();
    if (snap.empty) {
      await addDoc(collection(db, path), { slug, title, content, updatedAt: now });
    } else {
      await updateDoc(doc(db, path, snap.docs[0].id), { title, content, updatedAt: now });
    }
    await logAdminAudit('PAGE_CONTENT_UPDATE', 'pages', slug, { title });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==================== SITE SETTINGS ====================
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  storeName: 'BTS Army',
  storeDescription: 'আমাদের ওয়েবসাইটে আপনাকে স্বাগতম! এটি একটি বিশ্বস্ত ও আধুনিক ডিজিটাল প্লাটফর্ম, যা আপনার প্রয়োজনীয় সব মানসম্মত নিজস্ব প্রজেক্ট এক জায়গায় নিয়ে এসেছে। Daraz-এর মতো সহজ ও নিরবচ্ছিন্ন কেনাকাটার অভিজ্ঞতায়, আপনি এখানে সরাসরি আমাদের তৈরি সেরা প্রজেক্টগুলো দেখতে, বেছে নিতে এবং নিরাপদে অর্ডার করতে পারবেন। আপনার ডিজিটাল প্রয়োজন মেটাতে সেরা কোয়ালিটি ও দ্রুত সেবাই আমাদের মূল লক্ষ্য!',
  phone: '01733047371',
  email: 'btsarmy@lovers.bd',
  address: 'Rangpur, Bangladesh.',
  whatsapp: '01733047371',
  facebook: 'https://www.facebook.com/share/1DjaDz8n6k/',
  tiktok: 'https://vm.tiktok.com/ZS9DdsdmoMhcP-LvSFM/',
  youtube: 'https://youtube.com/@mrgamer_bd?si=wQXB5BwF1lUlnNst',
  currency: '৳',
  deliveryArea: 'Bangladesh',
  announcement: '💜 Welcome to BTS Army Official Clothing Store! Free Delivery on orders over ৳3,000 across Bangladesh! 💜',
  announcementActive: true,
  logoUrl: '/logo.jpg',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const path = 'settings/general';
  try {
    const snap = await getDoc(doc(db, 'settings', 'general'));
    if (snap.exists()) {
      return { ...DEFAULT_SITE_SETTINGS, ...snap.data() } as SiteSettings;
    }
    return DEFAULT_SITE_SETTINGS;
  } catch (error) {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const path = 'settings/general';
  try {
    await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
    await logAdminAudit('SETTINGS_UPDATE', 'settings', 'general', settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==================== IMAGE STORAGE ====================
// Client-side image compression utility
async function compressImageClient(file: File, maxDimension: number, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality
      );
    };
    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function uploadProductImage(file: File): Promise<string> {
  // 1. Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid image format. Allowed formats: JPEG, PNG, WebP, AVIF, GIF.');
  }

  // 2. Validate file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('Image size exceeds 5MB limit. Please upload a smaller image.');
  }

  // 3. Compress if above 800KB before uploading
  let uploadBlob: Blob = file;
  if (file.size > 800 * 1024 && typeof document !== 'undefined') {
    try {
      uploadBlob = await compressImageClient(file, 1600, 0.85);
    } catch {
      uploadBlob = file;
    }
  }

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
    const storagePath = `products/catalog/${Date.now()}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, uploadBlob, {
      contentType: file.type,
    });
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.warn('Storage upload fallback triggered:', error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

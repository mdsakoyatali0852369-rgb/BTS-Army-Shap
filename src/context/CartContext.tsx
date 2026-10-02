import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, ProductVariant, DeliveryZone, Coupon } from '../firebase/types';
import { validateCoupon } from '../firebase/services';

export interface CartItem {
  id: string; // unique item id: ${productId}-${size || 'none'}-${color || 'none'}
  product: Product;
  variant?: ProductVariant;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  appliedCoupon: Coupon | null;
  couponMessage: string | null;
  deliveryZone: DeliveryZone | null;
  deliveryCharge: number;
  grandTotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    selectedSize?: string,
    selectedColor?: string,
    quantity?: number,
    openDrawer?: boolean
  ) => { success: boolean; message: string };
  updateQuantity: (itemId: string, newQty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  setDeliveryZone: (zone: DeliveryZone) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bts_army_shopping_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>({
    id: 'dhaka',
    name: 'Inside Dhaka',
    charge: 70,
    active: true,
    isDefault: true,
  });

  // Save cart to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Could not save cart:', e);
    }
  }, [cartItems]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Re-calculate coupon discount if subtotal changed
  useEffect(() => {
    if (appliedCoupon) {
      if (appliedCoupon.minOrder && subtotal < appliedCoupon.minOrder) {
        setCouponDiscount(0);
        setAppliedCoupon(null);
        setCouponMessage(`Coupon removed: minimum order ৳${appliedCoupon.minOrder}`);
        return;
      }
      let disc = 0;
      if (appliedCoupon.discountType === 'percentage') {
        disc = Math.round((subtotal * appliedCoupon.discountAmount) / 100);
        if (appliedCoupon.maxDiscount && disc > appliedCoupon.maxDiscount) {
          disc = appliedCoupon.maxDiscount;
        }
      } else {
        disc = appliedCoupon.discountAmount;
      }
      setCouponDiscount(disc);
    } else {
      setCouponDiscount(0);
    }
  }, [subtotal, appliedCoupon]);

  const deliveryCharge = deliveryZone
    ? deliveryZone.minOrderFree && subtotal >= deliveryZone.minOrderFree
      ? 0
      : deliveryZone.charge
    : 70;

  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryCharge);

  const addToCart = (
    product: Product,
    selectedSize?: string,
    selectedColor?: string,
    quantity = 1,
    openDrawer = true
  ): { success: boolean; message: string } => {
    if (!product.active) {
      return { success: false, message: 'This product is currently inactive.' };
    }

    // Determine variant if applicable
    let matchedVariant: ProductVariant | undefined;
    if (product.variants && product.variants.length > 0) {
      matchedVariant = product.variants.find((v) => {
        const sizeMatch = !selectedSize || v.size === selectedSize;
        const colorMatch = !selectedColor || v.color === selectedColor;
        return sizeMatch && colorMatch;
      });

      if (!matchedVariant && (product.sizes?.length > 0 || product.colors?.length > 0)) {
        return {
          success: false,
          message: 'Please choose an available size and color combination.',
        };
      }
    }

    // Determine available stock
    const availableStock = matchedVariant ? matchedVariant.stock : product.totalStock;
    if (availableStock <= 0) {
      return { success: false, message: 'Sorry, this item is out of stock.' };
    }

    const itemId = `${product.id}-${selectedSize || 'nosize'}-${selectedColor || 'nocolor'}`;
    const effectivePrice =
      matchedVariant?.salePrice ||
      (matchedVariant?.price !== undefined ? matchedVariant.price : product.salePrice || product.price);

    const existingIndex = cartItems.findIndex((item) => item.id === itemId);
    if (existingIndex > -1) {
      const currentQty = cartItems[existingIndex].quantity;
      if (currentQty + quantity > availableStock) {
        return {
          success: false,
          message: `Only ${availableStock} items available in stock.`,
        };
      }
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      setCartItems(updated);
    } else {
      if (quantity > availableStock) {
        return {
          success: false,
          message: `Only ${availableStock} items available in stock.`,
        };
      }
      setCartItems((prev) => [
        ...prev,
        {
          id: itemId,
          product,
          variant: matchedVariant,
          size: selectedSize,
          color: selectedColor,
          quantity,
          unitPrice: effectivePrice,
        },
      ]);
    }

    if (openDrawer) {
      setIsCartDrawerOpen(true);
    }
    return { success: true, message: 'Added to cart!' };
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const maxStock = item.variant ? item.variant.stock : item.product.totalStock;
          const cappedQty = Math.min(newQty, maxStock > 0 ? maxStock : 1);
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage(null);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const applyCouponCode = async (code: string) => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Please enter a coupon code' };
    }
    const res = await validateCoupon(code, subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discount);
      setCouponMessage(res.message);
      return { success: true, message: res.message };
    } else {
      return { success: false, message: res.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        discount: couponDiscount,
        appliedCoupon,
        couponMessage,
        deliveryZone,
        deliveryCharge,
        grandTotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCouponCode,
        removeCoupon,
        setDeliveryZone,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

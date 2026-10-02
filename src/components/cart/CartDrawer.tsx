import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

interface CartDrawerProps {
  navigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ navigate }) => {
  const {
    cartItems,
    cartCount,
    subtotal,
    discount,
    appliedCoupon,
    couponMessage,
    deliveryCharge,
    grandTotal,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponAlert, setCouponAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponAlert(null);
    try {
      const res = await applyCouponCode(couponInput);
      if (res.success) {
        setCouponAlert({ type: 'success', text: res.message });
        setCouponInput('');
      } else {
        setCouponAlert({ type: 'error', text: res.message });
      }
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-900" />
              <h2 className="text-base font-bold text-zinc-900">Your Shopping Bag ({cartCount})</h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 text-zinc-500 hover:text-zinc-900 rounded-full hover:bg-zinc-200 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-zinc-800">Your bag is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs">
                  Discover our premium clothing and apparel collection and start adding items!
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 rounded-full bg-purple-900 text-white text-xs font-bold hover:bg-purple-800 transition-all shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-2xl border border-zinc-100 bg-white hover:border-purple-200 transition-colors shadow-2xs"
                >
                  <img
                    src={item.product.thumbnail || item.product.images[0] || '/logo.jpg'}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded-xl bg-zinc-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => {
                            setIsCartDrawerOpen(false);
                            navigate(`/product/${item.product.id}`);
                          }}
                          className="text-xs sm:text-sm font-semibold text-zinc-900 line-clamp-1 hover:text-purple-800 cursor-pointer"
                        >
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant Specs */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.size && (
                          <span className="text-[11px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-medium">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-[11px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md font-medium">
                            Color: {item.color}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-50">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-1 text-xs font-semibold text-zinc-800 bg-white min-w-7 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-bold text-zinc-900">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-200 bg-zinc-50/70 space-y-3">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Discount Coupon"
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs uppercase font-medium focus:border-purple-600 focus:outline-hidden"
                  />
                  <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-purple-900 disabled:opacity-50 transition-all shrink-0"
                >
                  {couponLoading ? 'Checking...' : 'Apply'}
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon {appliedCoupon.code} applied (-{formatPrice(discount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponAlert && !appliedCoupon && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponAlert.text}</span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-600 pt-2 border-t border-zinc-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-200">
                  <span>Total Amount</span>
                  <span className="text-purple-950 font-extrabold">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  navigate('/checkout');
                }}
                className="w-full py-3 rounded-xl bg-purple-950 text-white font-bold text-sm hover:bg-purple-900 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  navigate('/cart');
                }}
                className="w-full py-2 text-center text-xs font-semibold text-zinc-600 hover:text-purple-900 hover:underline"
              >
                View Cart & Modify Quantities
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

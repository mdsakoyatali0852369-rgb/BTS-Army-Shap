import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { EmptyState } from '../components/common/EmptyState';
import { formatPrice } from '../utils/formatters';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Tag,
  Check,
  AlertCircle,
  ShieldCheck,
  Truck,
} from 'lucide-react';

interface CartPageProps {
  navigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const {
    cartItems,
    cartCount,
    subtotal,
    discount,
    appliedCoupon,
    deliveryZone,
    deliveryCharge,
    grandTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCouponCode,
    removeCoupon,
    setDeliveryZone,
  } = useCart();

  const { deliveryZones } = useSettings();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    const res = await applyCouponCode(couponCode);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
    setCouponLoading(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Your Shopping Bag is Empty"
          description="Looks like you haven't added any clothing pieces to your cart yet."
          actionText="Explore Shop"
          onAction={() => navigate('/shop')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">Shopping Cart</h1>
          <p className="text-xs text-zinc-500 mt-1">
            You have {cartCount} {cartCount === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-zinc-400 hover:text-rose-600 font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8">
        
        {/* Items Table / Cards */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-zinc-200 bg-white flex flex-col sm:flex-row gap-4 items-center"
            >
              <img
                src={item.product.thumbnail || item.product.images[0] || '/logo.jpg'}
                alt={item.product.name}
                className="w-24 h-28 object-cover rounded-xl bg-zinc-100 shrink-0"
              />

              <div className="flex-1 min-w-0 space-y-1 w-full text-center sm:text-left">
                <span className="text-[11px] font-bold text-purple-900 uppercase">
                  {item.product.category}
                </span>
                <h3
                  onClick={() => navigate(`/product/${item.product.id}`)}
                  className="text-sm font-bold text-zinc-900 hover:text-purple-800 cursor-pointer line-clamp-1"
                >
                  {item.product.name}
                </h3>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                  {item.size && (
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-medium">
                      Size: {item.size}
                    </span>
                  )}
                  {item.color && (
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 font-medium">
                      Color: {item.color}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 font-bold"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-semibold text-zinc-900 min-w-7 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 font-bold"
                >
                  +
                </button>
              </div>

              {/* Subtotal & Delete */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                <span className="text-base font-extrabold text-zinc-950">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Delivery Zone Selector */}
          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-900" />
              <span>Select Your Shipping Area</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {deliveryZones.filter(z => z.active).map((zone) => {
                const isSelected = deliveryZone?.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => setDeliveryZone(zone)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-950 bg-white ring-2 ring-purple-950/20'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-zinc-900">{zone.name}</p>
                      {zone.minOrderFree && (
                        <p className="text-[10px] text-emerald-600">
                          Free on orders over {formatPrice(zone.minOrderFree)}
                        </p>
                      )}
                    </div>
                    <span className="font-extrabold text-purple-950">
                      {zone.minOrderFree && subtotal >= zone.minOrderFree ? 'FREE' : formatPrice(zone.charge)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg space-y-6 sticky top-24">
            <h3 className="text-base font-extrabold text-zinc-900 pb-3 border-b border-zinc-100">
              Order Summary
            </h3>

            {/* Coupon field */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code"
                    className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs uppercase font-medium focus:border-purple-900 focus:bg-white focus:outline-hidden"
                  />
                  <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-purple-900 disabled:opacity-50 transition-colors"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon {appliedCoupon.code} applied!</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-xl">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}
            </form>

            {/* Numbers breakdown */}
            <div className="space-y-2.5 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({deliveryZone?.name || 'Standard'})</span>
                <span className="font-semibold text-zinc-900">{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-zinc-900 pt-3 border-t border-zinc-200">
                <span>Total Amount</span>
                <span className="text-purple-950 font-black">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure Cash On Delivery</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

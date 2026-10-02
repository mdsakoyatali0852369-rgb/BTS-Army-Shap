import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { createOrder } from '../firebase/services';
import { BANGLADESH_DIVISIONS } from '../utils/bangladeshGeo';
import { validateBangladeshiPhone } from '../utils/validation';
import { formatPrice } from '../utils/formatters';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Banknote,
  ArrowRight,
} from 'lucide-react';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const {
    cartItems,
    subtotal,
    discount,
    appliedCoupon,
    deliveryZone,
    deliveryCharge,
    grandTotal,
    clearCart,
    setDeliveryZone,
  } = useCart();

  const { currentUser } = useAuth();
  const { deliveryZones } = useSettings();

  // Form Fields
  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [upazila, setUpazila] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'bKash'>('Cash on Delivery');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available districts for the selected division
  const currentDivisionObj = BANGLADESH_DIVISIONS.find((d) => d.division === division);
  const availableDistricts = currentDivisionObj ? currentDivisionObj.districts : [];

  const handleDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    const divObj = BANGLADESH_DIVISIONS.find((d) => d.division === newDivision);
    if (divObj && divObj.districts.length > 0) {
      setDistrict(divObj.districts[0]);
    }

    // Auto-select Inside Dhaka vs Outside Dhaka if configured
    if (newDivision === 'Dhaka') {
      const dhakaZone = deliveryZones.find((z) => z.name.toLowerCase().includes('inside'));
      if (dhakaZone) setDeliveryZone(dhakaZone);
    } else {
      const outsideZone = deliveryZones.find((z) => z.name.toLowerCase().includes('outside'));
      if (outsideZone) setDeliveryZone(outsideZone);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before placing an order.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!validateBangladeshiPhone(phone)) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01733047371).');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please enter your full shipping address (House/Road/Area).');
      return;
    }

    setLoading(true);

    try {
      // Unique idempotency key based on customer phone + timestamp window
      const idempotencyKey = `ord_${phone.trim().slice(-4)}_${cartItems.map(i => i.product.id + (i.size || '') + i.quantity).join('_')}_${Math.floor(Date.now() / 30000)}`;

      // Prepare sanitized order items
      const orderItems = cartItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        image: item.product.thumbnail || item.product.images[0] || '/logo.jpg',
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
      }));

      // Create order in Firestore
      const newOrderId = await createOrder({
        idempotencyKey,
        customerId: currentUser?.uid,
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          division,
          district,
          upazila: upazila.trim() || undefined,
          deliveryNotes: deliveryNotes.trim() || undefined,
        },
        items: orderItems,
        discount,
        couponCode: appliedCoupon?.code,
        deliveryCharge,
        deliveryZoneName: deliveryZone?.name || 'Standard',
        total: grandTotal,
        paymentMethod: paymentMethod === 'bKash' ? 'bKash' : 'Cash on Delivery',
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        customerNote: deliveryNotes.trim() || undefined,
      });

      // Clear cart
      clearCart();

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      // Route to confirmation
      navigate(`/order-confirmation/${newOrderId}`);
    } catch (err: any) {
      console.error('Order creation error:', err);
      let userFriendlyMsg = 'Failed to place order. Please check your connection and try again.';
      if (err?.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.error) userFriendlyMsg = parsed.error;
        } catch {
          userFriendlyMsg = err.message;
        }
      }
      setErrorMessage(userFriendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">No Items to Checkout</h2>
        <p className="text-xs text-zinc-500 mb-6">
          Your cart is currently empty. Browse our clothing collection to find your favorite items.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-full bg-purple-950 text-white text-xs font-bold"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 mb-8 border-b border-zinc-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">Checkout</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Complete your order with 100% Cash On Delivery across Bangladesh
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Shipping Form Left */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-5">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-900" />
              <span>Customer & Shipping Address</span>
            </h3>

            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Md. Sakoyat Ali"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:border-purple-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                  Mobile Number (BD) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01733047371"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:border-purple-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@example.com"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:border-purple-900 focus:outline-hidden"
              />
            </div>

            {/* Division & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                  Division *
                </label>
                <select
                  value={division}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:border-purple-900 focus:outline-hidden cursor-pointer"
                >
                  {BANGLADESH_DIVISIONS.map((d) => (
                    <option key={d.division} value={d.division}>
                      {d.division}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                  District *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:border-purple-900 focus:outline-hidden cursor-pointer"
                >
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upazila / Police Station */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                Thana / Upazila / Area
              </label>
              <input
                type="text"
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                placeholder="e.g. Kotwali / Uttara / Dhanmondi"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:border-purple-900 focus:outline-hidden"
              />
            </div>

            {/* Full Street Address */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                Full Delivery Address *
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House #, Road #, Village / Sector, Nearest Landmark..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:border-purple-900 focus:outline-hidden"
              />
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                Order Notes / Special Instructions
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Call before delivery, deliver in afternoon..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:border-purple-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-purple-900" />
              <span>Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 cursor-pointer transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-purple-950 bg-purple-50/40 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="accent-purple-900 w-4 h-4"
                />
                <div>
                  <div className="font-bold text-xs text-zinc-900">Cash on Delivery (COD)</div>
                  <div className="text-[11px] text-zinc-500">Pay cash upon receiving products</div>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('bKash')}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 cursor-pointer transition-all ${
                  paymentMethod === 'bKash'
                    ? 'border-purple-950 bg-purple-50/40 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bKash'}
                  onChange={() => setPaymentMethod('bKash')}
                  className="accent-purple-900 w-4 h-4"
                />
                <div>
                  <div className="font-bold text-xs text-zinc-900">bKash (Direct Merchant)</div>
                  <div className="text-[11px] text-zinc-500">Pay via bKash personal/agent</div>
                </div>
              </label>
            </div>

            {paymentMethod === 'bKash' && (
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 text-xs text-pink-900 space-y-1">
                <p className="font-bold">bKash Payment Instruction:</p>
                <p>Please send money to our official bKash number: <strong className="font-mono">01733047371</strong>.</p>
                <p className="text-[11px] text-pink-700">Our customer service will contact you to verify transaction ID.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Review & Submit Right */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl space-y-6 sticky top-24">
            <h3 className="text-base font-extrabold text-zinc-900 pb-3 border-b border-zinc-100">
              Order Summary ({cartItems.length} items)
            </h3>

            {/* Mini Items List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.product.thumbnail || item.product.images[0] || '/logo.jpg'}
                    alt={item.product.name}
                    className="w-12 h-14 object-cover rounded-lg bg-zinc-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Qty: {item.quantity} {item.size && `• Size: ${item.size}`}{' '}
                      {item.color && `• ${item.color}`}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-zinc-900">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-zinc-600 pt-3 border-t border-zinc-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge ({deliveryZone?.name || 'Standard'})</span>
                <span className="font-semibold text-zinc-900">{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-zinc-950 pt-3 border-t border-zinc-200">
                <span>Total Payable</span>
                <span className="text-purple-950">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-black text-sm transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Confirm Order (৳{grandTotal.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="p-4 rounded-2xl bg-zinc-50 text-[11px] text-zinc-500 space-y-1.5 border border-zinc-100">
              <div className="flex items-center gap-2 text-zinc-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Genuine Bangladeshi Service</span>
              </div>
              <p>You can inspect your clothing package before completing cash payment to the courier.</p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

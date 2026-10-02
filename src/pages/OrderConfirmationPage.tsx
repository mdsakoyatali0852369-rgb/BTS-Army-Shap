import React, { useEffect, useState } from 'react';
import { getOrderById } from '../firebase/services';
import { Order } from '../firebase/types';
import { formatPrice, formatDate } from '../utils/formatters';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  Phone,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

interface OrderConfirmationPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderId,
  navigate,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(orderId)
      .then(setOrder)
      .catch((e) => console.warn('Could not load order confirmation:', e))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 rounded-full bg-zinc-200 mx-auto" />
        <div className="h-6 bg-zinc-200 rounded w-1/3 mx-auto" />
        <div className="h-4 bg-zinc-150 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-zinc-500 mb-6">
          We couldn't retrieve the details for order #{orderId}.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-full bg-zinc-900 text-white text-xs font-bold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      
      {/* Success Hero Badge */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
          Thank you for your order!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
          Your order has been placed successfully. We are preparing your clothes with care.
        </p>
        <div className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-950 font-mono text-xs font-bold tracking-wider">
          ORDER NUMBER: {order.orderNumber}
        </div>
      </div>

      {/* Main Order Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-lg space-y-6">
        
        {/* Status & Estimated delivery info */}
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-zinc-400 block font-medium">Order Status</span>
            <span className="font-extrabold text-purple-950 text-sm">
              {order.orderStatus}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block font-medium">Estimated Delivery</span>
            <span className="font-bold text-zinc-900 text-sm">
              2-4 Business Days
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block font-medium">Payment</span>
            <span className="font-bold text-zinc-900 text-sm">
              {order.paymentMethod}
            </span>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Purchased Items ({order.items.length})
          </h3>
          <div className="divide-y divide-zinc-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center gap-3">
                <img
                  src={item.image || '/logo.jpg'}
                  alt={item.name}
                  className="w-14 h-16 object-cover rounded-xl bg-zinc-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Qty: {item.quantity} {item.size && `• Size: ${item.size}`}{' '}
                    {item.color && `• Color: ${item.color}`}
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-bold text-zinc-950">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-900" />
              <span>Delivery Address</span>
            </h4>
            <p className="text-zinc-600">{order.customer.fullName}</p>
            <p className="text-zinc-600">{order.customer.address}</p>
            <p className="text-zinc-600">
              {order.customer.upazila ? `${order.customer.upazila}, ` : ''}
              {order.customer.district}, {order.customer.division}
            </p>
            <p className="text-zinc-600 font-mono font-medium">{order.customer.phone}</p>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <div className="flex justify-between sm:justify-end gap-6 text-zinc-500">
              <span>Items Total:</span>
              <span className="font-semibold text-zinc-800">
                {formatPrice(order.total - order.deliveryCharge + order.discount)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between sm:justify-end gap-6 text-emerald-600">
                <span>Coupon Discount:</span>
                <span className="font-semibold">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between sm:justify-end gap-6 text-zinc-500">
              <span>Shipping Fee:</span>
              <span className="font-semibold text-zinc-800">
                {formatPrice(order.deliveryCharge)}
              </span>
            </div>
            <div className="flex justify-between sm:justify-end gap-6 text-base font-black text-zinc-950 pt-2 border-t border-zinc-100">
              <span>Total Amount:</span>
              <span className="text-purple-950">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`)}
            className="flex-1 py-3 rounded-xl bg-purple-950 text-white font-bold text-xs sm:text-sm hover:bg-purple-900 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Status</span>
          </button>

          <button
            onClick={() => navigate('/shop')}
            className="flex-1 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-800 font-bold text-xs sm:text-sm hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

      </div>

    </div>
  );
};

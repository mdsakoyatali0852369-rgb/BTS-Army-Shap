import React, { useState, useEffect } from 'react';
import { getOrderByOrderNumber, getOrderById } from '../firebase/services';
import { Order, OrderStatus } from '../firebase/types';
import { formatPrice, formatDate } from '../utils/formatters';
import {
  Search,
  Package,
  CheckCircle,
  Truck,
  Clock,
  Check,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

interface OrderTrackingPageProps {
  navigate: (path: string) => void;
  initialOrderNumber?: string;
}

const STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Pending', label: 'Order Placed', desc: 'Received and awaiting confirmation' },
  { status: 'Confirmed', label: 'Confirmed', desc: 'Order verified by BTS Army team' },
  { status: 'Processing', label: 'Processing', desc: 'Preparing clothes & garments' },
  { status: 'Packed', label: 'Packed', desc: 'Securely packaged for shipping' },
  { status: 'Shipped', label: 'Shipped', desc: 'Handed over to courier in Bangladesh' },
  { status: 'Delivered', label: 'Delivered', desc: 'Received at customer doorstep' },
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  navigate,
  initialOrderNumber = '',
}) => {
  const [orderQuery, setOrderQuery] = useState(initialOrderNumber);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const performLookup = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setSearched(true);
    try {
      let found = await getOrderByOrderNumber(query.trim());
      if (!found) {
        found = await getOrderById(query.trim());
      }
      setOrder(found);
      if (!found) {
        setErrorMsg('No order found with that order number. Please double-check.');
      }
    } catch {
      setErrorMsg('Error retrieving order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      performLookup(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderQuery);
  };

  // Determine active step index
  const getActiveStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled' || status === 'Returned' || status === 'Refunded') {
      return -1;
    }
    const idx = STEPS.findIndex((s) => s.status.toLowerCase() === status.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const activeIndex = order ? getActiveStepIndex(order.orderStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      {/* Search Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center mx-auto shadow-xs">
          <Truck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          Enter your Order Number (e.g. <span className="font-mono font-bold text-zinc-700">BTS-2609-12345</span>) from your SMS or confirmation.
        </p>

        <form onSubmit={handleTrackSubmit} className="max-w-md mx-auto pt-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="Enter Order Number or ID"
              required
              className="w-full pl-11 pr-24 py-3 bg-zinc-50 border border-zinc-200 rounded-full text-xs font-semibold focus:bg-white focus:border-purple-950 focus:outline-hidden shadow-xs"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
            <button
              type="submit"
              disabled={loading || !orderQuery.trim()}
              className="absolute right-1.5 px-5 py-2 rounded-full bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>
      </div>

      {/* Results / Status Card */}
      {searched && (
        <>
          {errorMsg ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-xs font-bold text-rose-800">{errorMsg}</p>
              <p className="text-[11px] text-rose-600">
                Contact our helpline at 01733047371 if you need assistance locating your package.
              </p>
            </div>
          ) : order ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl space-y-8 animate-in fade-in">
              
              {/* Order Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 gap-4">
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                    Order Details
                  </span>
                  <h3 className="text-lg font-black text-zinc-900 font-mono">
                    {order.orderNumber}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-950">
                    Current Status: {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Progress Steps Timeline */}
              <div className="py-4">
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative">
                  {STEPS.map((step, idx) => {
                    const isDone = activeIndex >= idx;
                    const isCurrent = activeIndex === idx;

                    return (
                      <div key={step.status} className="flex flex-col items-center text-center space-y-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                            isCurrent
                              ? 'bg-purple-950 text-white ring-4 ring-purple-200 scale-105'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                          }`}
                        >
                          {isDone && !isCurrent ? <Check className="w-5 h-5" /> : idx + 1}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isDone ? 'text-zinc-900' : 'text-zinc-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[10px] text-zinc-400 line-clamp-2">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status History Logs */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-2 text-xs">
                  <h4 className="font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                    Status History Updates
                  </h4>
                  <div className="divide-y divide-zinc-200">
                    {order.statusHistory.map((h, i) => (
                      <div key={i} className="py-2 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-zinc-900 mr-2">{h.status}</span>
                          <span className="text-zinc-500">{h.note}</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {formatDate(h.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safe summary (without exposing private credentials) */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-zinc-400 block font-medium">Destination</span>
                  <span className="font-bold text-zinc-800">
                    {order.customer.district}, {order.customer.division}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-medium">Items</span>
                  <span className="font-bold text-zinc-800">
                    {order.items.reduce((s, it) => s + it.quantity, 0)} Items ({order.items.length} apparel models)
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-medium">Payment Mode</span>
                  <span className="font-bold text-zinc-800">
                    {order.paymentMethod} ({formatPrice(order.total)})
                  </span>
                </div>
              </div>

            </div>
          ) : null}
        </>
      )}

    </div>
  );
};

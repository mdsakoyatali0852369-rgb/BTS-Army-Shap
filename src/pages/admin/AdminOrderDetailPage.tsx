import React, { useEffect, useState } from 'react';
import { getOrderById, updateOrderStatus } from '../../firebase/services';
import { Order, OrderStatus, PaymentStatus } from '../../firebase/types';
import { formatPrice, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Printer,
  Truck,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Phone,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface AdminOrderDetailPageProps {
  orderId: string;
  onBack: () => void;
}

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Returned',
  'Refunded',
];

export const AdminOrderDetailPage: React.FC<AdminOrderDetailPageProps> = ({
  orderId,
  onBack,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Status update
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateNotice, setUpdateNotice] = useState<string | null>(null);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
      if (data) {
        setNewStatus(data.orderStatus);
        setPaymentStatus(data.paymentStatus || 'Pending');
      }
    } catch (e) {
      console.warn('Error loading order details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setUpdating(true);
    setUpdateNotice(null);
    try {
      await updateOrderStatus(
        order.id,
        newStatus,
        statusNote.trim() || undefined,
        paymentStatus
      );
      setUpdateNotice('Order status and timeline updated successfully!');
      setStatusNote('');
      await loadOrder();
    } catch {
      setUpdateNotice('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-zinc-400">Loading order invoice...</div>;
  }

  if (!order) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm font-bold text-zinc-700">Order not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top action bar */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-purple-950 text-white font-bold text-xs flex items-center gap-2 hover:bg-purple-900 shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print Official Invoice</span>
        </button>
      </div>

      {/* Invoice Document Canvas */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-lg space-y-8 print:p-0 print:border-none print:shadow-none">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-purple-900 bg-purple-950">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900">BTS Army</h2>
              <p className="text-xs text-zinc-500">Clothing & Apparel Bangladesh</p>
              <p className="text-[11px] text-zinc-400">Rangpur, Bangladesh • 01733047371</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-950 block">
              Official Invoice
            </span>
            <div className="font-mono font-black text-lg text-zinc-900">
              {order.orderNumber}
            </div>
            <div className="text-xs text-zinc-500">
              Date: {formatDate(order.createdAt)}
            </div>
          </div>
        </div>

        {/* Customer & Shipping Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs">
          <div className="space-y-1.5">
            <h4 className="font-bold uppercase tracking-wider text-zinc-400 text-[10px]">
              Customer Information
            </h4>
            <p className="font-bold text-zinc-900 text-sm">{order.customer.fullName}</p>
            <p className="text-zinc-600 font-mono font-semibold">Phone: {order.customer.phone}</p>
            {order.customer.email && (
              <p className="text-zinc-600">Email: {order.customer.email}</p>
            )}
            {order.customer.deliveryNotes && (
              <p className="text-purple-900 italic pt-1">
                Note: "{order.customer.deliveryNotes}"
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold uppercase tracking-wider text-zinc-400 text-[10px]">
              Shipping Address
            </h4>
            <p className="text-zinc-800">{order.customer.address}</p>
            <p className="text-zinc-800 font-semibold">
              {order.customer.upazila ? `${order.customer.upazila}, ` : ''}
              {order.customer.district}, {order.customer.division}
            </p>
            <p className="text-zinc-500">
              Zone: <strong className="text-zinc-800">{order.deliveryZoneName || 'Standard'}</strong>
            </p>
            <p className="text-purple-950 font-bold pt-1">
              Payment Method: {order.paymentMethod} ({order.paymentStatus})
            </p>
          </div>
        </div>

        {/* Order Line Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-purple-950 text-white font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Garment Item</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Color</th>
                <th className="py-2.5 px-3">Unit Price</th>
                <th className="py-2.5 px-3">Qty</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {order.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50">
                  <td className="py-3 px-3">
                    <div className="font-bold text-zinc-900">{item.name}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-zinc-700">
                    {item.size || 'Standard'}
                  </td>
                  <td className="py-3 px-3 font-semibold text-zinc-700">
                    {item.color || 'Standard'}
                  </td>
                  <td className="py-3 px-3 text-zinc-800 font-mono">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 px-3 font-bold text-zinc-900">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-zinc-900 font-mono">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations */}
        <div className="flex justify-end pt-4 border-t border-zinc-200">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Items Total:</span>
              <span className="font-mono font-bold text-zinc-900">
                {formatPrice(order.total - order.deliveryCharge + order.discount)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Coupon Discount ({order.couponCode || 'PROMO'}):</span>
                <span className="font-mono font-bold">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Delivery Fee:</span>
              <span className="font-mono font-bold text-zinc-900">
                {formatPrice(order.deliveryCharge)}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-purple-950 pt-2 border-t-2 border-purple-950">
              <span>Total Payable:</span>
              <span className="font-mono font-black">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Admin Status Controller (Hidden during printing) */}
      <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4 no-print">
        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-900" />
          <span>Update Order Status & Dispatch Log</span>
        </h3>

        {updateNotice && (
          <div className="p-3 rounded-xl bg-purple-50 text-purple-950 text-xs font-semibold">
            {updateNotice}
          </div>
        )}

        <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-700 uppercase mb-1">
              Fulfillment Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white font-bold"
            >
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 uppercase mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white font-bold"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 uppercase mb-1">
              Internal Timeline Note
            </label>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Dispatched via Steadfast / Pathao"
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 rounded-xl bg-purple-950 text-white font-bold text-xs hover:bg-purple-900 disabled:opacity-50"
            >
              {updating ? 'Saving Update...' : 'Commit Status Update'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

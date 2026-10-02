import React, { useEffect, useState } from 'react';
import { getAllOrdersAdmin, updateOrderStatus } from '../../firebase/services';
import { Order, OrderStatus } from '../../firebase/types';
import { formatPrice, formatDate } from '../../utils/formatters';
import {
  Search,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Eye,
  Filter,
  PackageOpen,
} from 'lucide-react';

interface AdminOrdersPageProps {
  onOpenOrder: (orderId: string) => void;
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

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ onOpenOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const ords = await getAllOrdersAdmin();
      setOrders(ords);
    } catch (e) {
      console.warn('Error loading admin orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, `Updated by admin`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'All' && o.orderStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customer.fullName.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.toLowerCase().includes(q);
      return matchNum || matchName || matchPhone;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Order Management ({orders.length})
          </h1>
          <p className="text-xs text-zinc-500">
            Process customer orders, update tracking states, and generate invoices
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, phone, or name..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              statusFilter === 'All'
                ? 'bg-purple-950 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            All ({orders.length})
          </button>
          {ORDER_STATUSES.map((st) => {
            const count = orders.filter((o) => o.orderStatus === st).length;
            if (count === 0 && statusFilter !== st) return null;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-purple-950 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400 animate-pulse">
            Loading orders list...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <PackageOpen className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-base font-bold text-zinc-900">No orders found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {orders.length === 0
                ? 'Your store has no orders yet. Real customer orders placed on the frontend will appear here instantly!'
                : 'No orders matched your current filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Items / Total</th>
                  <th className="py-3 px-4">Status Transition</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-zinc-900 block">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {ord.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900">{ord.customer.fullName}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{ord.customer.phone}</div>
                    </td>

                    <td className="py-3 px-4 text-zinc-600">
                      <div>{ord.customer.district}, {ord.customer.division}</div>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[150px]">
                        {ord.customer.address}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-black text-zinc-900 text-sm">
                        {formatPrice(ord.total)}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {ord.items.reduce((s, it) => s + it.quantity, 0)} garments
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) =>
                          handleQuickStatusChange(ord.id, e.target.value as OrderStatus)
                        }
                        className="px-2.5 py-1 bg-purple-50 text-purple-950 font-bold border border-purple-200 rounded-lg text-xs cursor-pointer focus:outline-hidden"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                      {formatDate(ord.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenOrder(ord.id)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-bold text-[11px] hover:bg-purple-950 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

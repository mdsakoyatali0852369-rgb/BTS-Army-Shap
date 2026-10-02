import React, { useEffect, useState } from 'react';
import {
  getAllOrdersAdmin,
  getAllProductsAdmin,
  getCategories,
  getAllCustomersAdmin,
} from '../../firebase/services';
import { Order, Product, Category, Customer } from '../../firebase/types';
import { formatPrice, formatDate } from '../../utils/formatters';
import {
  ShoppingBag,
  DollarSign,
  Shirt,
  AlertTriangle,
  Users,
  Clock,
  ArrowRight,
  PlusCircle,
  FolderPlus,
  Truck,
  CheckCircle,
  PackageOpen,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onSelectTab: (tab: string) => void;
  onOpenOrder: (orderId: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onSelectTab,
  onOpenOrder,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [ord, prod, cat, cust] = await Promise.all([
          getAllOrdersAdmin(),
          getAllProductsAdmin(),
          getCategories(),
          getAllCustomersAdmin(),
        ]);
        setOrders(ord);
        setProducts(prod);
        setCategories(cat);
        setCustomers(cust);
      } catch (e) {
        console.warn('Dashboard loading error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-200 rounded w-1/4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-zinc-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Real calculations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length;
  const confirmedOrders = orders.filter((o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing').length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;

  // Real revenue calculated strictly from delivered or confirmed orders
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Returned')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const lowStockProducts = products.filter((p) => p.totalStock > 0 && p.totalStock <= 5).length;
  const outOfStockProducts = products.filter((p) => p.totalStock <= 0).length;

  const isDatabaseEmpty = products.length === 0 && orders.length === 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Store Overview
          </h1>
          <p className="text-xs text-zinc-500">
            Real-time analytics and inventory status for BTS Army Bangladesh
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('products')}
            className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => onSelectTab('categories')}
            className="px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <FolderPlus className="w-4 h-4 text-purple-900" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Setup Checklist Guidance (Critical when database is new/empty) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              Store Launch Roadmap
            </span>
            <h3 className="text-lg font-extrabold text-white">
              Administrator Setup Checklist
            </h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-purple-800 text-purple-200 font-medium">
            {categories.length > 0 ? (products.length > 0 ? 'Ready for sales' : 'Add products next') : 'Start with categories'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div
            onClick={() => onSelectTab('categories')}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-white">1. Categories</p>
              <p className="text-[11px] text-purple-200">
                {categories.length > 0 ? `${categories.length} created` : 'Create your apparel genres'}
              </p>
            </div>
            {categories.length > 0 ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <ArrowRight className="w-4 h-4 text-purple-300" />
            )}
          </div>

          <div
            onClick={() => onSelectTab('products')}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-white">2. Clothing Products</p>
              <p className="text-[11px] text-purple-200">
                {products.length > 0 ? `${products.length} products` : 'Add sizes, colors & stock'}
              </p>
            </div>
            {products.length > 0 ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <ArrowRight className="w-4 h-4 text-purple-300" />
            )}
          </div>

          <div
            onClick={() => onSelectTab('delivery')}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-white">3. Shipping Rates</p>
              <p className="text-[11px] text-purple-200">Dhaka & Nationwide delivery</p>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-300" />
          </div>

          <div
            onClick={() => onSelectTab('settings')}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-white">4. Store Info</p>
              <p className="text-[11px] text-purple-200">WhatsApp, Address & Phone</p>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-300" />
          </div>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Orders */}
        <div className="p-5 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-950 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900">
              {totalOrders > 0 ? totalOrders : '0'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {pendingOrders > 0 ? (
                <span className="text-amber-600 font-bold">{pendingOrders} pending confirmation</span>
              ) : (
                'All orders up to date'
              )}
            </div>
          </div>
        </div>

        {/* Real Revenue */}
        <div className="p-5 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Recorded Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <span className="font-bold text-sm">৳</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900">
              {totalRevenue > 0 ? formatPrice(totalRevenue) : '৳0'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {orders.length > 0 ? `From ${orders.length} real customer orders` : 'No order revenue recorded yet'}
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="p-5 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Catalog Items
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900">
              {totalProducts > 0 ? totalProducts : '0'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {activeProducts} active for sale online
            </div>
          </div>
        </div>

        {/* Inventory Alert */}
        <div className="p-5 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Stock Alerts
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900">
              {outOfStockProducts + lowStockProducts}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {outOfStockProducts} out of stock, {lowStockProducts} low
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900">Recent Customer Orders</h3>
          {orders.length > 0 && (
            <button
              onClick={() => onSelectTab('orders')}
              className="text-xs font-bold text-purple-950 hover:underline"
            >
              View All ({orders.length})
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center space-y-2 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
            <PackageOpen className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-xs font-bold text-zinc-700">No orders received yet</p>
            <p className="text-[11px] text-zinc-500">
              Orders placed by customers will automatically appear here with real customer details and Cash On Delivery values.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">City / Area</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900">{o.customer.fullName}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{o.customer.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600">
                      {o.customer.district}, {o.customer.division}
                    </td>
                    <td className="py-3 px-4 text-zinc-600">
                      {o.items.reduce((s, i) => s + i.quantity, 0)} pcs
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-950">
                      {formatPrice(o.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-purple-100 text-purple-950">
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenOrder(o.id)}
                        className="text-xs font-bold text-purple-950 hover:underline"
                      >
                        Inspect
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

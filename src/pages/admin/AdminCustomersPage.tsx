import React, { useEffect, useState } from 'react';
import { getAllCustomersAdmin, updateCustomerStatus } from '../../firebase/services';
import { Customer } from '../../firebase/types';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Users, Search, ShieldCheck, Ban, CheckCircle, PackageOpen } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getAllCustomersAdmin();
      setCustomers(list);
    } catch (e) {
      console.warn('Error loading customers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleBlock = async (cust: Customer) => {
    const newStatus = cust.status === 'blocked' ? 'active' : 'blocked';
    try {
      await updateCustomerStatus(cust.uid, newStatus);
      setCustomers((prev) =>
        prev.map((c) => (c.uid === cust.uid ? { ...c, status: newStatus } : c))
      );
    } catch (e) {
      console.error('Error updating customer status:', e);
    }
  };

  const filtered = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.displayName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
          Customer Directory ({customers.length})
        </h1>
        <p className="text-xs text-zinc-500">
          Real registered buyers and guest profiles from Bangladesh
        </p>
      </div>

      <div className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400 animate-pulse">
            Loading customers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <PackageOpen className="w-8 h-8 text-zinc-400 mx-auto" />
            <h3 className="text-base font-bold text-zinc-900">No customer profiles yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Customer accounts will populate automatically when users register or check out.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((c) => (
                  <tr key={c.uid} className="hover:bg-zinc-50/60">
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900">
                        {c.displayName || 'Customer'}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">UID: {c.uid.slice(0, 12)}...</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-zinc-800">{c.email || '—'}</div>
                      <div className="text-zinc-500 font-mono text-[11px]">{c.phone || '—'}</div>
                    </td>

                    <td className="py-3 px-4 text-zinc-500">
                      {formatDate(c.createdAt)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          c.status === 'blocked'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {c.status === 'blocked' ? 'Blocked' : 'Active'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleBlock(c)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                          c.status === 'blocked'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {c.status === 'blocked' ? 'Unblock' : 'Block'}
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

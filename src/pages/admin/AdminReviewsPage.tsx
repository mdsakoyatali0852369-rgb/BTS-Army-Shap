import React, { useEffect, useState } from 'react';
import { getAllReviewsAdmin, updateReviewApproval, deleteReview } from '../../firebase/services';
import { Review } from '../../firebase/types';
import { formatDate } from '../../utils/formatters';
import { Star, Check, X, Trash2, PackageOpen, AlertCircle } from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getAllReviewsAdmin();
      setReviews(list);
    } catch (e) {
      console.warn('Error loading reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleApproval = async (review: Review) => {
    try {
      await updateReviewApproval(review.id, !review.approved);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, approved: !r.approved } : r))
      );
    } catch (e) {
      console.error('Error updating review:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Error deleting review:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
          Customer Reviews Moderation ({reviews.length})
        </h1>
        <p className="text-xs text-zinc-500">
          Moderate real feedback submitted by store shoppers. Only approved reviews display publicly.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400 animate-pulse">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <PackageOpen className="w-8 h-8 text-zinc-400 mx-auto" />
            <h3 className="text-base font-bold text-zinc-900">No customer reviews yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              When customers review clothing items on product pages, their submissions will appear here for your moderation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Comment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-zinc-50/60">
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900">{rev.customerName}</div>
                      <div className="text-[10px] text-zinc-400">{formatDate(rev.createdAt)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-zinc-700 font-semibold max-w-[150px] truncate">
                      {rev.productName || 'Clothing Item'}
                    </td>

                    <td className="py-3 px-4 text-zinc-600 max-w-xs">
                      {rev.comment}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          rev.approved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rev.approved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleApproval(rev)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                            rev.approved
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                          title={rev.approved ? 'Hide from store' : 'Approve for store'}
                        >
                          {rev.approved ? 'Hide' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/common/EmptyState';
import { formatPrice } from '../utils/formatters';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

interface WishlistPageProps {
  navigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ navigate }) => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Heart className="w-8 h-8" />}
          title="Your Wishlist is Empty"
          description="Save clothing items you like by clicking the heart icon on any product."
          actionText="Discover Apparel"
          onAction={() => navigate('/shop')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="pb-6 border-b border-zinc-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">My Wishlist</h1>
        <p className="text-xs text-zinc-500 mt-1">
          {wishlist.length} {wishlist.length === 1 ? 'item saved' : 'items saved'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map((prod) => (
          <div
            key={prod.id}
            className="group rounded-2xl border border-zinc-200 bg-white p-3 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-3/4 w-full rounded-xl overflow-hidden bg-zinc-100 mb-3">
                <img
                  src={prod.thumbnail || prod.images[0] || '/logo.jpg'}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => removeFromWishlist(prod.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-rose-600 shadow-xs"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                {prod.category}
              </span>
              <h3
                onClick={() => navigate(`/product/${prod.id}`)}
                className="text-xs sm:text-sm font-semibold text-zinc-900 line-clamp-2 hover:text-purple-900 cursor-pointer"
              >
                {prod.name}
              </h3>
            </div>

            <div className="pt-3 border-t border-zinc-100 mt-3 space-y-2">
              <span className="text-sm font-extrabold text-zinc-900 block">
                {formatPrice(prod.salePrice || prod.price)}
              </span>

              <button
                onClick={() => {
                  if (prod.sizes?.length || prod.colors?.length) {
                    navigate(`/product/${prod.id}`);
                  } else {
                    addToCart(prod, undefined, undefined, 1, true);
                  }
                }}
                className="w-full py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move to Bag</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

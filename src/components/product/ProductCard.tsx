import React from 'react';
import { Product } from '../../firebase/types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isInWishlist(product.id);

  const isOutOfStock = product.totalStock <= 0;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;

  const displayImage = product.thumbnail || product.images[0] || '/logo.jpg';
  const hoverImage = product.images[1] || displayImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    // If the product has multiple sizes or colors, open product detail page for selection
    if (
      (product.sizes && product.sizes.length > 0) ||
      (product.colors && product.colors.length > 0)
    ) {
      onClick();
    } else {
      addToCart(product, undefined, undefined, 1, true);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl border border-zinc-200/80 bg-white p-3 hover:border-purple-300 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-3/4 w-full rounded-xl overflow-hidden bg-zinc-100 mb-3">
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Alternate Image if available */}
        {product.images[1] && (
          <img
            src={hoverImage}
            alt={`${product.name} alternate`}
            loading="lazy"
            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {isOutOfStock ? (
            <span className="bg-zinc-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          ) : (
            <>
              {hasDiscount && (
                <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                  -{discountPercent}%
                </span>
              )}
              {product.newArrival && (
                <span className="bg-purple-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  NEW
                </span>
              )}
              {product.bestSeller && (
                <span className="bg-amber-500 text-zinc-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                  BEST SELLER
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 shadow-sm ${
            wishlisted
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 hover:bg-white text-zinc-600 hover:text-rose-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Quick Add Overlay on desktop */}
        {!isOutOfStock && (
          <div className="absolute inset-x-2 bottom-2 z-10 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 hidden sm:block">
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 bg-white/95 hover:bg-purple-950 hover:text-white text-zinc-900 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1.5 backdrop-blur-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {product.sizes?.length || product.colors?.length ? 'Select Options' : 'Quick Add'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="uppercase tracking-wider truncate font-medium">
              {product.category || 'Apparel'}
            </span>
            {product.fabric && (
              <span className="truncate max-w-[100px] text-zinc-400 font-normal">
                {product.fabric}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-purple-900 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Pricing */}
        <div className="pt-2 flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-extrabold text-zinc-950">
              {formatPrice(product.salePrice || product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Mobile quick add tap */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="sm:hidden p-2 rounded-lg bg-zinc-100 hover:bg-purple-900 hover:text-white text-zinc-800 disabled:opacity-30"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

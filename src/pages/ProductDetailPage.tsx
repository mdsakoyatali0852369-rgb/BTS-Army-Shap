import React, { useEffect, useState } from 'react';
import { getProductById, getActiveProducts, getProductReviews, submitReview } from '../firebase/services';
import { Product, ProductVariant, Review } from '../firebase/types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductDetailSkeleton } from '../components/common/SkeletonLoader';
import { ProductCard } from '../components/product/ProductCard';
import { SizeGuideModal } from '../components/product/SizeGuideModal';
import { formatPrice, formatDate } from '../../src/utils/formatters';
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  Star,
  CheckCircle,
  AlertCircle,
  Share2,
} from 'lucide-react';

interface ProductDetailPageProps {
  productId: string;
  navigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  navigate,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { currentUser } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Review Form
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewAuthor, setReviewAuthor] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const prod = await getProductById(productId);
        setProduct(prod);

        if (prod) {
          const mainImg = prod.thumbnail || prod.images[0] || '/logo.jpg';
          setSelectedImage(mainImg);

          // Default pre-select size and color if single option
          if (prod.sizes && prod.sizes.length === 1) setSelectedSize(prod.sizes[0]);
          if (prod.colors && prod.colors.length === 1) setSelectedColor(prod.colors[0].name);

          // Load related products & reviews
          const [allProds, prodReviews] = await Promise.all([
            getActiveProducts(),
            getProductReviews(prod.id),
          ]);
          setRelatedProducts(
            allProds.filter((p) => p.id !== prod.id && p.category === prod.category).slice(0, 4)
          );
          setReviews(prodReviews);
        }
      } catch (e) {
        console.warn('Error loading product details:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-zinc-500 mb-6">
          This product might have been moved or is currently unavailable.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-full bg-zinc-900 text-white text-xs font-semibold"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const allImages = product.images && product.images.length > 0 ? product.images : [product.thumbnail || '/logo.jpg'];

  // Current variant lookup
  const matchedVariant: ProductVariant | undefined = product.variants?.find((v) => {
    const sMatch = !selectedSize || v.size === selectedSize;
    const cMatch = !selectedColor || v.color === selectedColor;
    return sMatch && cMatch;
  });

  const availableStock = matchedVariant ? matchedVariant.stock : product.totalStock;
  const isOutOfStock = availableStock <= 0;

  const effectivePrice =
    matchedVariant?.salePrice ||
    (matchedVariant?.price !== undefined ? matchedVariant.price : product.salePrice || product.price);

  const originalPrice = matchedVariant?.price || product.price;
  const hasDiscount = effectivePrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (directCheckout = false) => {
    setFeedbackMessage(null);

    // Validate size selection if product has sizes
    if (product.sizes?.length > 0 && !selectedSize) {
      setFeedbackMessage({ type: 'error', text: 'Please select a size first.' });
      return;
    }

    // Validate color selection if product has colors
    if (product.colors?.length > 0 && !selectedColor) {
      setFeedbackMessage({ type: 'error', text: 'Please select a color first.' });
      return;
    }

    if (quantity > availableStock) {
      setFeedbackMessage({
        type: 'error',
        text: `Only ${availableStock} pieces available in this variant.`,
      });
      return;
    }

    const res = addToCart(product, selectedSize, selectedColor, quantity, !directCheckout);
    if (!res.success) {
      setFeedbackMessage({ type: 'error', text: res.message });
    } else {
      if (directCheckout) {
        navigate('/checkout');
      } else {
        setFeedbackMessage({ type: 'success', text: 'Added to your shopping bag!' });
      }
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const authorName =
        reviewAuthor.trim() ||
        currentUser?.displayName ||
        'Verified Customer';
      await submitReview({
        productId: product.id,
        productName: product.name,
        customerId: currentUser?.uid || 'guest_buyer',
        customerName: authorName,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewNotice(
        'Thank you! Your review has been submitted for moderation and will appear once approved.'
      );
      setReviewComment('');
    } catch {
      setReviewNotice('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      
      {/* Breadcrumb */}
      <div className="text-xs text-zinc-400 font-medium">
        <span onClick={() => navigate('/')} className="hover:underline cursor-pointer">
          Home
        </span>{' '}
        / <span onClick={() => navigate('/shop')} className="hover:underline cursor-pointer">Shop</span>{' '}
        / <span onClick={() => navigate(`/category/${product.category}`)} className="hover:underline cursor-pointer">{product.category}</span>{' '}
        / <span className="text-zinc-900 font-semibold">{product.name}</span>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Images Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[500px] shrink-0 pb-2 md:pb-0">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-purple-900 shadow-md scale-98'
                      : 'border-zinc-200 hover:border-zinc-400 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Big Featured Image */}
          <div className="relative flex-1 aspect-3/4 max-h-[620px] rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200">
            <img
              src={selectedImage || allImages[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-zinc-700 hover:text-rose-600 shadow-md transition-colors"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Information & Purchase Action */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
                {product.category}
              </span>
              {product.sku && (
                <span className="text-xs text-zinc-400 font-mono">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 leading-tight">
              {product.name}
            </h1>

            {product.fabric && (
              <p className="text-xs text-zinc-500 mt-1">
                Fabric / Material: <strong className="text-zinc-800 font-semibold">{product.fabric}</strong>
              </p>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-950">
              {formatPrice(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm sm:text-base text-zinc-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ml-auto ${
                isOutOfStock
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : `In Stock (${availableStock})`}
            </span>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Select Color: <span className="text-purple-900 font-semibold">{selectedColor || 'Choose'}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-purple-900 bg-purple-50 text-purple-950 ring-2 ring-purple-900/20'
                          : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-zinc-300"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Select Size: <span className="text-purple-900 font-semibold">{selectedSize || 'Choose'}</span>
                </span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs text-purple-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-12 h-11 px-3 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-purple-950 text-white border-purple-950 shadow-sm'
                          : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">Quantity</span>
            <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100"
              >
                -
              </button>
              <span className="px-4 py-2 text-xs font-bold text-zinc-900 min-w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={quantity >= availableStock}
                className="px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {feedbackMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={isOutOfStock}
                className="py-3.5 rounded-xl border-2 border-purple-950 bg-white hover:bg-purple-50 text-purple-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={() => handleAddToCart(true)}
                disabled={isOutOfStock}
                className="py-3.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer shadow-md"
              >
                <span>Buy Now (COD)</span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5 text-xs text-zinc-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-purple-900 shrink-0" />
              <span>Nationwide delivery: 2-3 days Inside Dhaka, 3-5 days Outside Dhaka</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-900 shrink-0" />
              <span>100% Cash On Delivery — pay only after inspecting product</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-purple-900 shrink-0" />
              <span>Hassle-free 7 days size exchange guarantee</span>
            </div>
          </div>
        </div>

      </div>

      {/* Description & Specifications Tabs */}
      <div className="pt-8 border-t border-zinc-200">
        <h3 className="text-lg font-bold text-zinc-900 mb-4">Product Details & Description</h3>
        <div className="prose prose-zinc max-w-none text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line bg-zinc-50/50 p-6 rounded-2xl border border-zinc-200">
          {product.description || 'No detailed description provided for this product.'}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="pt-8 border-t border-zinc-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Customer Reviews</h3>
            <p className="text-xs text-zinc-500">
              Real feedback from verified purchasers in Bangladesh
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Reviews list */}
          <div className="lg:col-span-7 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-center">
                <p className="text-xs text-zinc-500 font-medium">
                  No approved customer reviews yet. Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900">{rev.customerName}</span>
                    <span className="text-[11px] text-zinc-400">{formatDate(rev.createdAt)}</span>
                  </div>
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
                  <p className="text-xs text-zinc-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Submit Review Form */}
          <div className="lg:col-span-5 bg-zinc-50 p-6 rounded-3xl border border-zinc-200">
            <h4 className="text-sm font-bold text-zinc-900 mb-3">Write a Review</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {!currentUser && (
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Your Name</label>
                  <input
                    type="text"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Your Experience</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about size, fabric quality, and comfort..."
                  required
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              {reviewNotice && (
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-900 text-xs">
                  {reviewNotice}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingReview || !reviewComment.trim()}
                className="w-full py-2.5 rounded-xl bg-purple-950 text-white font-bold text-xs hover:bg-purple-900 transition-colors disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-zinc-200">
          <h3 className="text-lg font-extrabold text-zinc-900 mb-6">You May Also Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => navigate(`/product/${p.id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
};

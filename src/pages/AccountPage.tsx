import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCustomerOrders } from '../firebase/services';
import { Order } from '../firebase/types';
import { formatPrice, formatDate } from '../utils/formatters';
import {
  User as UserIcon,
  ShoppingBag,
  Heart,
  LogOut,
  Mail,
  Phone,
  Package,
  CheckCircle,
  Truck,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface AccountPageProps {
  navigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ navigate }) => {
  const {
    currentUser,
    isAdmin,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
  } = useAuth();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLoadingOrders(true);
      getCustomerOrders(currentUser.uid)
        .then(setOrders)
        .catch((e) => console.warn('Could not load user orders:', e))
        .finally(() => setLoadingOrders(false));
    }
  }, [currentUser]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) throw new Error('Please enter your full name.');
        await registerWithEmail(email, password, name, phone);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(msg.replace('Firebase: ', ''));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google login failed';
      setAuthError(msg.replace('Firebase: ', ''));
    } finally {
      setAuthLoading(false);
    }
  };

  // If user is not logged in, render login / register
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center mx-auto shadow-xs">
              <UserIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
              {authMode === 'login' ? 'Customer Sign In' : 'Create an Account'}
            </h1>
            <p className="text-xs text-zinc-500">
              {authMode === 'login'
                ? 'Sign in to access your orders and saved wishlist'
                : 'Join BTS Army store for fast checkout and order tracking'}
            </p>
          </div>

          {/* Toggle Login / Register */}
          <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'register'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error notice */}
          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Md. Sakoyat Ali"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-purple-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-purple-900 focus:outline-hidden"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-purple-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-purple-900 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Social Google */}
          <div className="pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Authenticated Customer Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Account Header */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-950 font-black text-xl flex items-center justify-center border-2 border-purple-200">
            {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
              Welcome, {currentUser.displayName || 'Valued Customer'}!
            </h1>
            <p className="text-xs text-zinc-500">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 rounded-xl bg-purple-950 text-amber-400 font-bold text-xs flex items-center gap-2 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}

          <button
            onClick={() => navigate('/wishlist')}
            className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Wishlist</span>
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-xs font-semibold text-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-900" />
          <span>My Orders ({orders.length})</span>
        </h2>

        {loadingOrders ? (
          <div className="p-8 rounded-2xl bg-zinc-50 animate-pulse text-center text-xs text-zinc-400">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-800">No orders placed yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              You haven't placed any orders with this account yet. Browse our clothing catalog!
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2.5 rounded-full bg-purple-950 text-white font-bold text-xs"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="p-5 sm:p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 gap-2">
                  <div>
                    <span className="font-mono font-bold text-sm text-zinc-900">
                      {o.orderNumber}
                    </span>
                    <span className="text-xs text-zinc-400 ml-3">
                      {formatDate(o.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-950">
                      {o.orderStatus}
                    </span>
                    <span className="text-xs font-black text-zinc-900">
                      {formatPrice(o.total)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs">
                      <img
                        src={it.image || '/logo.jpg'}
                        alt={it.name}
                        className="w-10 h-12 object-cover rounded-lg bg-zinc-100"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-800 truncate">{it.name}</p>
                        <p className="text-zinc-400 text-[11px]">
                          Qty: {it.quantity} {it.size && `• ${it.size}`} {it.color && `• ${it.color}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() =>
                      navigate(`/track-order?orderNumber=${encodeURIComponent(o.orderNumber)}`)
                    }
                    className="text-xs font-bold text-purple-900 hover:text-purple-700 flex items-center gap-1 hover:underline"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Order Progress</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

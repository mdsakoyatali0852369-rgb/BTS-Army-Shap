import React from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

interface NotFoundPageProps {
  navigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-purple-900 bg-purple-950 shadow-lg">
        <img src="/logo.jpg" alt="BTS Army Logo" className="w-full h-full object-cover" />
      </div>

      <div className="space-y-2">
        <span className="text-4xl font-black text-purple-950">404</span>
        <h1 className="text-xl font-bold text-zinc-900">Page Not Found</h1>
        <p className="text-xs text-zinc-500">
          The page or product you are looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-full bg-purple-950 text-white font-bold text-xs hover:bg-purple-900 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-full border border-zinc-200 text-zinc-800 font-bold text-xs hover:bg-zinc-50 flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Shop</span>
        </button>
      </div>
    </div>
  );
};

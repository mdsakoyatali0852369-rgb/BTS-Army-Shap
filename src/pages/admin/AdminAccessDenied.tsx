import React from 'react';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminAccessDeniedProps {
  navigate: (path: string) => void;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({ navigate }) => {
  const { logout, currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-zinc-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-zinc-900">Access Denied</h1>
          <p className="text-xs text-zinc-600 leading-relaxed">
            You do not have administrative privileges to access this control panel.
          </p>
          {currentUser && (
            <p className="text-[11px] text-zinc-400 font-mono">
              Signed in as: {currentUser.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 rounded-xl bg-purple-950 text-white font-bold text-xs hover:bg-purple-900 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Store</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Try Other Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

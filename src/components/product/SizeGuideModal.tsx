import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10">
          
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
                <Ruler className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Standard Clothing Size Chart</h3>
                <p className="text-xs text-zinc-500">All measurements in inches (Asian / Bangladesh Fit)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Size Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-purple-900 text-white font-semibold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Size</th>
                  <th className="py-2.5 px-3">Chest (in)</th>
                  <th className="py-2.5 px-3">Length (in)</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Shoulder (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr className="hover:bg-purple-50/40">
                  <td className="py-2.5 px-3 font-bold text-zinc-900">S (Small)</td>
                  <td className="py-2.5 px-3 text-zinc-600">36 - 38"</td>
                  <td className="py-2.5 px-3 text-zinc-600">26 - 27"</td>
                  <td className="py-2.5 px-3 text-zinc-600">16.5"</td>
                </tr>
                <tr className="hover:bg-purple-50/40 bg-zinc-50/40">
                  <td className="py-2.5 px-3 font-bold text-zinc-900">M (Medium)</td>
                  <td className="py-2.5 px-3 text-zinc-600">38 - 40"</td>
                  <td className="py-2.5 px-3 text-zinc-600">27 - 28"</td>
                  <td className="py-2.5 px-3 text-zinc-600">17.5"</td>
                </tr>
                <tr className="hover:bg-purple-50/40">
                  <td className="py-2.5 px-3 font-bold text-zinc-900">L (Large)</td>
                  <td className="py-2.5 px-3 text-zinc-600">40 - 42"</td>
                  <td className="py-2.5 px-3 text-zinc-600">28 - 29"</td>
                  <td className="py-2.5 px-3 text-zinc-600">18.5"</td>
                </tr>
                <tr className="hover:bg-purple-50/40 bg-zinc-50/40">
                  <td className="py-2.5 px-3 font-bold text-zinc-900">XL (Extra Large)</td>
                  <td className="py-2.5 px-3 text-zinc-600">42 - 44"</td>
                  <td className="py-2.5 px-3 text-zinc-600">29 - 30"</td>
                  <td className="py-2.5 px-3 text-zinc-600">19.5"</td>
                </tr>
                <tr className="hover:bg-purple-50/40">
                  <td className="py-2.5 px-3 font-bold text-zinc-900">XXL (Double XL)</td>
                  <td className="py-2.5 px-3 text-zinc-600">44 - 46"</td>
                  <td className="py-2.5 px-3 text-zinc-600">30 - 31"</td>
                  <td className="py-2.5 px-3 text-zinc-600">20.5"</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Measuring tips */}
          <div className="mt-5 p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs text-zinc-600 space-y-1.5">
            <p className="font-bold text-purple-950">How to measure:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-zinc-800">Chest:</strong> Measure around the fullest part of your chest, keeping tape horizontal.</li>
              <li><strong className="text-zinc-800">Length:</strong> Measure from the highest point of the shoulder down to the desired hem.</li>
              <li><strong className="text-zinc-800">Exchange:</strong> If the size doesn't fit, we offer an easy 7-day exchange!</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-purple-950 transition-colors"
            >
              Got it, close size guide
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

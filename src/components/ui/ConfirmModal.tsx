'use client'
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  loading = false 
}: ConfirmModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-red-500/30 rounded-xl w-full max-w-md p-6 relative shadow-2xl shadow-red-900/20 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          disabled={loading}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-white/5 hover:bg-white/10 text-gray-300 transition"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-red-600 hover:bg-red-500 text-white transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CONFIRM KICK'}
          </button>
        </div>

      </div>
    </div>
  );
}
import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-brand-border bg-brand-surface flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-dark">{title}</h3>
          <button 
            onClick={onClose}
            className="text-brand-secondary hover:text-brand-dark transition-colors p-1 rounded-lg hover:bg-brand-border/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};


import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto transform transition-all duration-300 scale-95 opacity-0 animate-modalShow">
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="text-slate-700">{children}</div>
        {footer && <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end space-x-3">{footer}</div>}
      </div>
      {/*
        The custom keyframes animation 'modalShow' should be defined in tailwind.config.js for the 'animate-modalShow' class to work.
        Example for tailwind.config.js:
        extend: {
          keyframes: {
            modalShow: {
              '0%': { opacity: '0', transform: 'scale(0.95)' },
              '100%': { opacity: '1', transform: 'scale(1)' },
            },
          },
          animation: {
            modalShow: 'modalShow 0.3s forwards',
          },
        },
      */}
    </div>
  );
};

export default Modal;
// ===================================================================
// COMPONENTE MODAL REUTILIZÁVEL - MOBILE FIRST
// Localização: src/components/common/Modal.tsx
// Módulo: Modal responsivo com navegação adequada
// ===================================================================

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft } from 'lucide-react';

// ===================================================================
// INTERFACES
// ===================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onBack,
  title,
  subtitle,
  children,
  showBackButton = false,
  showCloseButton = true,
  size = 'lg',
  className = '',
  headerClassName = '',
  contentClassName = ''
}) => {
  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    }
  }, [onBack]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  // ===================================================================
  // EFFECTS
  // ===================================================================

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // ===================================================================
  // SIZE CLASSES
  // ===================================================================

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  };

  // ===================================================================
  // RENDER
  // ===================================================================

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 flex items-start justify-center w-full p-1 sm:p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} my-1 sm:my-2 max-h-[95vh] overflow-hidden flex flex-col ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className={`bg-gradient-to-r from-green-600 to-green-700 text-white relative ${headerClassName}`}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {showBackButton && onBack && (
                  <button
                    onClick={handleBack}
                    className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors flex-shrink-0"
                    aria-label="Voltar"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                
                <div className="flex-1 min-w-0">
                  <h1 id="modal-title" className="text-lg sm:text-xl font-semibold truncate">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-green-100 text-sm mt-1 truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors flex-shrink-0 ml-2"
                  aria-label="Fechar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className={`flex-1 overflow-y-auto p-2 sm:p-6 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal; 
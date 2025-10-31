

import React, { ReactNode } from 'react';
import Modal from './Modal';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { useTranslations } from '../../hooks/useTranslations';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'primary' | 'danger' | 'secondary';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmButtonVariant = 'primary',
  isLoading = false,
}) => {
  const t = useTranslations();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-sm text-slate-600 mb-6">{message}</div>
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelText || t('cancel')}
        </Button>
        <Button
          variant={confirmButtonVariant}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size="sm" color="text-white" /> : (confirmText || t('confirm'))}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
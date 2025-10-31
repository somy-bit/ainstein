import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

interface MFAModalProps {
  isOpen: boolean;
  onVerify: (code: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  error?: string;
}

const MFAModal: React.FC<MFAModalProps> = ({ isOpen, onVerify, onCancel, isLoading, error }) => {
  const t = useTranslations();
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the input when the modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6 && !isLoading) {
      onVerify(code);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={t('mfaTitle')}>
      <form onSubmit={handleSubmit}>
        <div className="text-center">
          <p className="text-slate-600 mb-4">{t('mfaPrompt')}</p>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-48 text-center text-2xl tracking-[.5em] font-mono bg-slate-100 border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="------"
            required
            disabled={isLoading}
          />
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading || code.length !== 6}>
            {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : t('mfaVerify')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MFAModal;
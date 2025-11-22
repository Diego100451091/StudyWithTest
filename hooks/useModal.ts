import { useState, useCallback } from 'react';
import { ModalType } from '../components/Modal';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showModal = useCallback((
    title: string,
    message: string,
    type: ModalType = 'info',
    confirmText?: string,
    cancelText?: string
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
    });
  }, []);

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm,
      confirmText,
      cancelText,
    });
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showModal(title, message, 'success');
  }, [showModal]);

  const showError = useCallback((title: string, message: string) => {
    showModal(title, message, 'error');
  }, [showModal]);

  const showWarning = useCallback((title: string, message: string) => {
    showModal(title, message, 'warning');
  }, [showModal]);

  const showInfo = useCallback((title: string, message: string) => {
    showModal(title, message, 'info');
  }, [showModal]);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    modalState,
    showModal,
    showConfirm,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeModal,
  };
};

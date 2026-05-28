import { create } from 'zustand';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDanger: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  requestConfirm: (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  isDanger: false,
  onConfirm: () => {},
  onCancel: () => {},
  requestConfirm: ({ title = 'Confirmação', message, confirmText = 'Confirmar', cancelText = 'Cancelar', isDanger = false, onConfirm, onCancel }) => 
    set({ isOpen: true, title, message, confirmText, cancelText, isDanger, onConfirm, onCancel: onCancel || (() => {}) }),
  close: () => set({ isOpen: false })
}));

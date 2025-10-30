import { useState, useCallback } from 'react';
import type { ToastData } from '../componentes/base/Toast';

export interface UseToastReturn {
  toasts: ToastData[];
  mostrarToast: (toast: Omit<ToastData, 'id'>) => string;
  cerrarToast: (id: string) => void;
  limpiarToasts: () => void;
  mostrarExito: (mensaje: string, titulo?: string) => string;
  mostrarError: (mensaje: string, titulo?: string) => string;
  mostrarAdvertencia: (mensaje: string, titulo?: string) => string;
  mostrarInfo: (mensaje: string, titulo?: string) => string;
}

const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generarId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const mostrarToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = generarId();
    const nuevoToast: ToastData = {
      id,
      ...toast
    };

    setToasts(prevToasts => [...prevToasts, nuevoToast]);
    return id;
  }, [generarId]);

  const cerrarToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const limpiarToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const mostrarExito = useCallback((mensaje: string, titulo?: string) => {
    return mostrarToast({
      tipo: 'exito',
      mensaje,
      titulo,
      duracion: 4000
    });
  }, [mostrarToast]);

  const mostrarError = useCallback((mensaje: string, titulo?: string) => {
    return mostrarToast({
      tipo: 'error',
      mensaje,
      titulo,
      duracion: 6000
    });
  }, [mostrarToast]);

  const mostrarAdvertencia = useCallback((mensaje: string, titulo?: string) => {
    return mostrarToast({
      tipo: 'advertencia',
      mensaje,
      titulo,
      duracion: 5000
    });
  }, [mostrarToast]);

  const mostrarInfo = useCallback((mensaje: string, titulo?: string) => {
    return mostrarToast({
      tipo: 'info',
      mensaje,
      titulo,
      duracion: 4000
    });
  }, [mostrarToast]);

  return {
    toasts,
    mostrarToast,
    cerrarToast,
    limpiarToasts,
    mostrarExito,
    mostrarError,
    mostrarAdvertencia,
    mostrarInfo
  };
};

export default useToast;
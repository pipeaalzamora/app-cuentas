import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: unknown;
}

/**
 * Hook para manejar estados de carga de forma consistente
 */
export function useLoading<T = unknown>(initialData?: T) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    data: initialData || null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading, error: null }));
  }, []);

  const setError = useCallback((error: string | Error | null) => {
    const errorMessage = error instanceof Error ? error.message : error;
    setState(prev => ({ 
      ...prev, 
      isLoading: false, 
      error: errorMessage 
    }));
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: false, 
      error: null, 
      data 
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: initialData || null
    });
  }, [initialData]);

  /**
   * Ejecuta una función asíncrona manejando automáticamente los estados de carga
   */
  const execute = useCallback(async <R>(
    asyncFunction: () => Promise<R>
  ): Promise<R | null> => {
    try {
      setLoading(true);
      const result = await asyncFunction();
      setData(result as T);
      return result;
    } catch (error) {
      setError(error as Error);
      return null;
    }
  }, [setLoading, setData, setError]);

  return {
    ...state,
    setLoading,
    setError,
    setData,
    reset,
    execute
  };
}

/**
 * Hook para manejar múltiples estados de carga
 */
export function useMultipleLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
    if (loading) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  }, []);

  const setError = useCallback((key: string, error: string | Error | null) => {
    const errorMessage = error instanceof Error ? error.message : error;
    setErrors(prev => ({ ...prev, [key]: errorMessage }));
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const clearError = useCallback((key: string) => {
    setErrors(prev => ({ ...prev, [key]: null }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const getError = useCallback((key: string) => {
    return errors[key] || null;
  }, [errors]);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);
  const hasAnyError = Object.values(errors).some(Boolean);

  return {
    setLoading,
    setError,
    clearError,
    isLoading,
    getError,
    isAnyLoading,
    hasAnyError,
    loadingStates,
    errors
  };
}

/**
 * Hook para manejar estados de carga con timeout
 */
export function useLoadingWithTimeout<T = unknown>(
  timeoutMs: number = 30000,
  initialData?: T
) {
  const loading = useLoading<T>(initialData);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const executeWithTimeout = useCallback(async <R>(
    asyncFunction: () => Promise<R>
  ): Promise<R | null> => {
    // Limpiar timeout anterior si existe
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Configurar nuevo timeout
    const newTimeoutId = setTimeout(() => {
      loading.setError('La operación tardó demasiado tiempo');
    }, timeoutMs);
    
    setTimeoutId(newTimeoutId);

    try {
      const result = await loading.execute(asyncFunction);
      clearTimeout(newTimeoutId);
      setTimeoutId(null);
      return result;
    } catch (error) {
      clearTimeout(newTimeoutId);
      setTimeoutId(null);
      throw error;
    }
  }, [loading, timeoutMs, timeoutId]);

  return {
    ...loading,
    executeWithTimeout
  };
}
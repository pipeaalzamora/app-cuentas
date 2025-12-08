// Tipos para eventos y handlers

import type { CuentaServicio, FiltrosCuentas } from './index';

// Tipo para info de error de React
export interface ReactErrorInfo {
  componentStack: string;
  digest?: string;
}

// Tipo para valores de inputs
export type ValorInput = string | number | boolean | Date;

// Tipo para eventos de cambio en formularios
export interface CambioFormulario<T = ValorInput> {
  campo: string;
  valor: T;
}

// Tipo para handlers de cambio de filtros
export type HandlerCambioFiltro = <K extends keyof FiltrosCuentas>(
  campo: K,
  valor: FiltrosCuentas[K]
) => void;

// Tipo para handlers de ordenamiento
export type HandlerOrdenamiento = <K extends keyof CuentaServicio>(
  campo: K
) => void;

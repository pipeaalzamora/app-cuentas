// Tipos para integración con APIs externas

import type { CuentaServicio, TipoServicio } from './index';

// Respuesta genérica de API
export interface RespuestaAPI<T = unknown> {
  success: boolean;
  data?: T;
  error?: ErrorAPI;
  metadata?: MetadataRespuesta;
}

// Error de API
export interface ErrorAPI {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Metadata de respuesta
export interface MetadataRespuesta {
  timestamp: string;
  requestId: string;
  version: string;
}

// Configuración de proveedor de servicios
export interface ConfiguracionProveedor {
  id: string;
  nombre: string;
  tipoServicio: TipoServicio;
  apiUrl: string;
  apiKey?: string;
  activo: boolean;
}

// Datos importados desde API externa
export interface DatosImportadosAPI {
  numeroFactura: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  monto: number;
  saldoAnterior?: number;
  consumoActual?: number;
  lecturaAnterior?: number;
  lecturaActual?: number;
  numeroMedidor?: string;
  metadata?: Record<string, unknown>;
}

// Request para importar datos
export interface RequestImportacion {
  proveedorId: string;
  numeroCliente: string;
  periodo?: {
    desde: Date;
    hasta: Date;
  };
}

// Resultado de importación
export interface ResultadoImportacion {
  exitosas: number;
  fallidas: number;
  cuentasImportadas: CuentaServicio[];
  errores: ErrorImportacion[];
}

// Error durante importación
export interface ErrorImportacion {
  numeroFactura?: string;
  motivo: string;
  detalles?: string;
}

// Estado de sincronización
export interface EstadoSincronizacion {
  ultimaSincronizacion?: Date;
  sincronizando: boolean;
  error?: string;
  proveedoresSincronizados: string[];
}

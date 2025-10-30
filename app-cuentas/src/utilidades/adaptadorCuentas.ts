/**
 * Adaptador para convertir entre formatos de cuentas básicas y completas
 * Mantiene compatibilidad con el formato anterior
 */

import type { CuentaServicio } from '../tipos';

/**
 * Convierte datos básicos a formato completo con valores por defecto
 */
export function adaptarCuentaBasicaACompleta(
  datosBasicos: {
    tipoServicio: string;
    monto: number;
    fechaVencimiento: Date;
    mes: number;
    año: number;
    pagada: boolean;
    observaciones?: string;
  }
): Omit<CuentaServicio, 'id' | 'fechaCreacion' | 'fechaActualizacion'> {
  const hoy = new Date();
  
  return {
    tipoServicio: datosBasicos.tipoServicio as any,
    monto: datosBasicos.monto,
    fechaVencimiento: datosBasicos.fechaVencimiento,
    mes: datosBasicos.mes,
    año: datosBasicos.año,
    pagada: datosBasicos.pagada,
    observaciones: datosBasicos.observaciones,
    
    // Valores por defecto para campos nuevos
    saldoAnterior: 0,
    consumoActual: datosBasicos.monto,
    otrosCargos: 0,
    descuentos: 0,
    fechaEmision: new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000),
    fechaCorte: new Date(hoy.getTime() - 5 * 24 * 60 * 60 * 1000),
    fechaLecturaAnterior: new Date(hoy.getTime() - 3 * 24 * 60 * 60 * 1000),
    proximaFechaLectura: new Date(datosBasicos.fechaVencimiento.getTime() + 30 * 24 * 60 * 60 * 1000)
  };
}
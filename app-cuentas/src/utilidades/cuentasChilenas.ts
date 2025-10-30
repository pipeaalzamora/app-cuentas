/**
 * Utilidades específicas para el manejo de cuentas de servicios chilenos
 */

import type { CuentaServicio, CuentaServicioBasica, CuentaServicioCompleta } from '../tipos';

/**
 * Calcula el monto total de una cuenta considerando saldo anterior, consumo, otros cargos y descuentos
 */
export function calcularMontoTotal(
  saldoAnterior: number,
  consumoActual: number,
  otrosCargos: number = 0,
  descuentos: number = 0
): number {
  return saldoAnterior + consumoActual + otrosCargos - descuentos;
}

/**
 * Calcula el consumo en unidades basado en las lecturas
 */
export function calcularConsumoUnidades(
  lecturaActual: number,
  lecturaAnterior: number
): number {
  return Math.max(0, lecturaActual - lecturaAnterior);
}

/**
 * Calcula el monto del consumo basado en unidades y precio por unidad
 */
export function calcularMontoConsumo(
  consumoUnidades: number,
  precioPorUnidad: number
): number {
  return consumoUnidades * precioPorUnidad;
}

/**
 * Convierte datos básicos a formato completo con valores por defecto
 */
export function convertirBasicaACompleta(
  datosBasicos: CuentaServicioBasica,
  fechaEmision?: Date,
  fechaCorte?: Date,
  fechaLectura?: Date
): CuentaServicioCompleta {
  const hoy = new Date();
  const fechaVencimiento = datosBasicos.fechaVencimiento;
  
  return {
    ...datosBasicos,
    saldoAnterior: 0,
    consumoActual: datosBasicos.monto,
    otrosCargos: 0,
    descuentos: 0,
    fechaEmision: fechaEmision || new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
    fechaCorte: fechaCorte || new Date(hoy.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
    fechaLectura: fechaLectura || new Date(hoy.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
    proximaFechaLectura: new Date(fechaVencimiento.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 días después del vencimiento
  };
}

/**
 * Convierte datos completos a CuentaServicio con ID y fechas de control
 */
export function convertirCompletaACuentaServicio(
  datosCompletos: CuentaServicioCompleta
): Omit<CuentaServicio, 'id' | 'fechaCreacion' | 'fechaActualizacion'> {
  const montoCalculado = calcularMontoTotal(
    datosCompletos.saldoAnterior,
    datosCompletos.consumoActual,
    datosCompletos.otrosCargos,
    datosCompletos.descuentos
  );

  return {
    tipoServicio: datosCompletos.tipoServicio,
    saldoAnterior: datosCompletos.saldoAnterior,
    consumoActual: datosCompletos.consumoActual,
    otrosCargos: datosCompletos.otrosCargos,
    descuentos: datosCompletos.descuentos,
    monto: montoCalculado,
    fechaEmision: datosCompletos.fechaEmision,
    fechaCorte: datosCompletos.fechaCorte,
    fechaLecturaAnterior: datosCompletos.fechaLectura,
    proximaFechaLectura: datosCompletos.proximaFechaLectura,
    fechaVencimiento: datosCompletos.fechaVencimiento,
    lecturaAnterior: datosCompletos.lecturaAnterior,
    lecturaActual: datosCompletos.lecturaActual,
    consumoUnidades: datosCompletos.consumoUnidades,

    unidadMedida: datosCompletos.unidadMedida,
    numeroFactura: datosCompletos.numeroFactura,
    observaciones: datosCompletos.observaciones,
    mes: datosCompletos.mes,
    año: datosCompletos.año,
    pagada: datosCompletos.pagada,
  };
}

/**
 * Obtiene la unidad de medida por defecto según el tipo de servicio
 */
export function obtenerUnidadMedidaPorDefecto(tipoServicio: string): string {
  const unidades: Record<string, string> = {
    luz: 'kWh',
    agua: 'm³',
    gas: 'm³',
    internet: 'Mbps'
  };
  return unidades[tipoServicio] || '';
}

/**
 * Valida si una cuenta tiene saldo anterior pendiente
 */
export function tieneSaldoAnterior(cuenta: CuentaServicio): boolean {
  return (cuenta.saldoAnterior || 0) > 0;
}

/**
 * Calcula los días hasta el vencimiento
 */
export function diasHastaVencimiento(fechaVencimiento: Date): number {
  const hoy = new Date();
  const diferencia = fechaVencimiento.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

/**
 * Determina si una cuenta está vencida
 */
export function estaVencida(cuenta: CuentaServicio): boolean {
  return !cuenta.pagada && diasHastaVencimiento(cuenta.fechaVencimiento) < 0;
}

/**
 * Determina si una cuenta está próxima a vencer (menos de 7 días)
 */
export function estaProximaAVencer(cuenta: CuentaServicio): boolean {
  const dias = diasHastaVencimiento(cuenta.fechaVencimiento);
  return !cuenta.pagada && dias >= 0 && dias <= 7;
}

/**
 * Obtiene el estado de una cuenta (pagada, vencida, próxima a vencer, vigente)
 */
export function obtenerEstadoCuenta(cuenta: CuentaServicio): 'pagada' | 'vencida' | 'proxima_vencer' | 'vigente' {
  if (cuenta.pagada) return 'pagada';
  if (estaVencida(cuenta)) return 'vencida';
  if (estaProximaAVencer(cuenta)) return 'proxima_vencer';
  return 'vigente';
}

/**
 * Formatea el estado de una cuenta para mostrar al usuario
 */
export function formatearEstadoCuenta(cuenta: CuentaServicio): string {
  const estado = obtenerEstadoCuenta(cuenta);
  const dias = diasHastaVencimiento(cuenta.fechaVencimiento);
  
  switch (estado) {
    case 'pagada':
      return 'Pagada';
    case 'vencida':
      return `Vencida (${Math.abs(dias)} días)`;
    case 'proxima_vencer':
      return `Vence en ${dias} días`;
    case 'vigente':
      return `Vigente (${dias} días)`;
    default:
      return 'Desconocido';
  }
}
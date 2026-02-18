/**
 * Utilidades para formatear datos según estándares chilenos
 */

/**
 * Formatea un monto en pesos chilenos
 */
export function formatearPesosChilenos(monto: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(monto);
}

/**
 * Formatea un número con separadores de miles chilenos
 */
export function formatearNumeroChileno(numero: number): string {
  return new Intl.NumberFormat('es-CL').format(numero);
}

/**
 * Formatea una fecha según el formato chileno (dd/mm/yyyy)
 */
export function formatearFechaChilena(fecha: Date): string {
  // Validación defensiva
  if (!fecha || !(fecha instanceof Date) || isNaN(fecha.getTime())) {
    return 'Fecha inválida';
  }
  
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(fecha);
}

/**
 * Formatea una fecha con hora según el formato chileno
 */
export function formatearFechaHoraChilena(fecha: Date): string {
  // Validación defensiva
  if (!fecha || !(fecha instanceof Date) || isNaN(fecha.getTime())) {
    return 'Fecha inválida';
  }
  
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(fecha);
}

/**
 * Formatea un mes y año según el formato chileno
 */
export function formatearMesAñoChileno(fecha: Date): string {
  // Validación defensiva
  if (!fecha || !(fecha instanceof Date) || isNaN(fecha.getTime())) {
    return 'Fecha inválida';
  }
  
  return new Intl.DateTimeFormat('es-CL', {
    month: 'long',
    year: 'numeric'
  }).format(fecha);
}

/**
 * Formatea solo el mes según el formato chileno
 */
export function formatearMesChileno(fecha: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    month: 'long'
  }).format(fecha);
}

/**
 * Formatea un porcentaje según el formato chileno
 */
export function formatearPorcentajeChileno(porcentaje: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(porcentaje / 100);
}

/**
 * Parsea un string de monto chileno a número
 */
export function parsearMontoChileno(montoString: string): number {
  // Remover símbolos de moneda y espacios
  const numeroLimpio = montoString
    .replace(/[$\s]/g, '')
    .replace(/\./g, '') // Remover separadores de miles
    .replace(/,/g, '.'); // Cambiar coma decimal por punto
  
  return parseFloat(numeroLimpio) || 0;
}

/**
 * Valida si un string es un monto válido en formato chileno
 */
export function validarMontoChileno(montoString: string): boolean {
  const numero = parsearMontoChileno(montoString);
  return !isNaN(numero) && numero > 0;
}

/**
 * Obtiene el nombre del mes en español chileno
 */
export function obtenerNombreMes(numeroMes: number): string {
  const fecha = new Date(2024, numeroMes - 1, 1);
  return formatearMesChileno(fecha);
}

/**
 * Formatea un rango de fechas en formato chileno
 */
export function formatearRangoFechas(fechaInicio: Date, fechaFin: Date): string {
  const inicio = formatearFechaChilena(fechaInicio);
  const fin = formatearFechaChilena(fechaFin);
  return `${inicio} - ${fin}`;
}
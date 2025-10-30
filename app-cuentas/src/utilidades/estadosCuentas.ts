import type { CuentaServicio } from '../tipos';

/**
 * Calcula los días de vencimiento de una cuenta
 * @param fechaVencimiento Fecha de vencimiento de la cuenta
 * @returns Número de días (negativo si no está vencida, positivo si está vencida)
 */
export function calcularDiasVencimiento(fechaVencimiento: Date): number {
  const hoy = new Date();
  const diferencia = hoy.getTime() - fechaVencimiento.getTime();
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
}

/**
 * Determina si una cuenta está en mora
 * @param cuenta Cuenta de servicio
 * @returns true si está en mora (más de 30 días vencida y no pagada)
 */
export function estaEnMora(cuenta: CuentaServicio): boolean {
  if (cuenta.pagada) return false;
  
  const diasVencimiento = calcularDiasVencimiento(cuenta.fechaVencimiento);
  return diasVencimiento > 30;
}

/**
 * Determina si una cuenta está próxima a vencer
 * @param cuenta Cuenta de servicio
 * @returns true si vence en los próximos 7 días
 */
export function proximaAVencer(cuenta: CuentaServicio): boolean {
  if (cuenta.pagada) return false;
  
  const diasVencimiento = calcularDiasVencimiento(cuenta.fechaVencimiento);
  return diasVencimiento >= -7 && diasVencimiento <= 0;
}

/**
 * Determina si una cuenta está vencida
 * @param cuenta Cuenta de servicio
 * @returns true si está vencida pero no en mora
 */
export function estaVencida(cuenta: CuentaServicio): boolean {
  if (cuenta.pagada) return false;
  
  const diasVencimiento = calcularDiasVencimiento(cuenta.fechaVencimiento);
  return diasVencimiento > 0 && diasVencimiento <= 30;
}

/**
 * Obtiene el estado de una cuenta
 * @param cuenta Cuenta de servicio
 * @returns Estado de la cuenta
 */
export function obtenerEstadoCuenta(cuenta: CuentaServicio): {
  estado: 'pagada' | 'pendiente' | 'vencida' | 'mora';
  diasVencimiento: number;
  descripcion: string;
  color: string;
} {
  const diasVencimiento = calcularDiasVencimiento(cuenta.fechaVencimiento);
  
  if (cuenta.pagada) {
    return {
      estado: 'pagada',
      diasVencimiento,
      descripcion: 'Pagada',
      color: 'var(--color-exito)'
    };
  }
  
  if (estaEnMora(cuenta)) {
    return {
      estado: 'mora',
      diasVencimiento,
      descripcion: `En mora (${diasVencimiento} días)`,
      color: 'var(--color-error)'
    };
  }
  
  if (estaVencida(cuenta)) {
    return {
      estado: 'vencida',
      diasVencimiento,
      descripcion: `Vencida (${diasVencimiento} días)`,
      color: 'var(--color-advertencia)'
    };
  }
  
  if (proximaAVencer(cuenta)) {
    const diasRestantes = Math.abs(diasVencimiento);
    return {
      estado: 'pendiente',
      diasVencimiento,
      descripcion: `Vence en ${diasRestantes} días`,
      color: 'var(--color-advertencia)'
    };
  }
  
  return {
    estado: 'pendiente',
    diasVencimiento,
    descripcion: 'Pendiente',
    color: 'var(--color-info)'
  };
}

/**
 * Calcula el monto total de una cuenta incluyendo saldos anteriores
 * @param cuenta Cuenta de servicio
 * @returns Monto total calculado
 */
export function calcularMontoTotal(cuenta: CuentaServicio): number {
  const saldoAnterior = cuenta.saldoAnterior || 0;
  const consumoActual = cuenta.consumoActual || cuenta.monto;
  const otrosCargos = cuenta.otrosCargos || 0;
  const descuentos = cuenta.descuentos || 0;
  
  return saldoAnterior + consumoActual + otrosCargos - descuentos;
}

/**
 * Obtiene el desglose de montos de una cuenta
 * @param cuenta Cuenta de servicio
 * @returns Desglose detallado de montos
 */
export function obtenerDesgloseMonto(cuenta: CuentaServicio): {
  saldoAnterior: number;
  consumoActual: number;
  otrosCargos: number;
  descuentos: number;
  montoTotal: number;
  tieneSaldoAnterior: boolean;
} {
  const saldoAnterior = cuenta.saldoAnterior || 0;
  const consumoActual = cuenta.consumoActual || cuenta.monto;
  const otrosCargos = cuenta.otrosCargos || 0;
  const descuentos = cuenta.descuentos || 0;
  const montoTotal = calcularMontoTotal(cuenta);
  
  return {
    saldoAnterior,
    consumoActual,
    otrosCargos,
    descuentos,
    montoTotal,
    tieneSaldoAnterior: saldoAnterior > 0
  };
}

/**
 * Filtra cuentas por estado
 * @param cuentas Array de cuentas
 * @param estado Estado a filtrar
 * @returns Cuentas filtradas
 */
export function filtrarPorEstado(
  cuentas: CuentaServicio[], 
  estado: 'pagada' | 'pendiente' | 'vencida' | 'mora' | 'proximas'
): CuentaServicio[] {
  return cuentas.filter(cuenta => {
    switch (estado) {
      case 'pagada':
        return cuenta.pagada;
      case 'pendiente':
        return !cuenta.pagada && !estaVencida(cuenta) && !estaEnMora(cuenta);
      case 'vencida':
        return estaVencida(cuenta);
      case 'mora':
        return estaEnMora(cuenta);
      case 'proximas':
        return proximaAVencer(cuenta);
      default:
        return true;
    }
  });
}

/**
 * Obtiene estadísticas de estados de cuentas
 * @param cuentas Array de cuentas
 * @returns Estadísticas de estados
 */
export function obtenerEstadisticasEstados(cuentas: CuentaServicio[]): {
  total: number;
  pagadas: number;
  pendientes: number;
  vencidas: number;
  enMora: number;
  proximasAVencer: number;
  conSaldoAnterior: number;
  montoTotalPendiente: number;
  montoTotalVencido: number;
  montoTotalMora: number;
} {
  const estadisticas = {
    total: cuentas.length,
    pagadas: 0,
    pendientes: 0,
    vencidas: 0,
    enMora: 0,
    proximasAVencer: 0,
    conSaldoAnterior: 0,
    montoTotalPendiente: 0,
    montoTotalVencido: 0,
    montoTotalMora: 0
  };
  
  cuentas.forEach(cuenta => {
    const montoTotal = calcularMontoTotal(cuenta);
    
    if (cuenta.pagada) {
      estadisticas.pagadas++;
    } else {
      if (estaEnMora(cuenta)) {
        estadisticas.enMora++;
        estadisticas.montoTotalMora += montoTotal;
      } else if (estaVencida(cuenta)) {
        estadisticas.vencidas++;
        estadisticas.montoTotalVencido += montoTotal;
      } else {
        estadisticas.pendientes++;
        estadisticas.montoTotalPendiente += montoTotal;
      }
      
      if (proximaAVencer(cuenta)) {
        estadisticas.proximasAVencer++;
      }
    }
    
    if ((cuenta.tieneSaldoAnterior) || (cuenta.saldoAnterior && cuenta.saldoAnterior > 0)) {
      estadisticas.conSaldoAnterior++;
    }
  });
  
  return estadisticas;
}

/**
 * Ordena cuentas por prioridad (mora > vencidas > próximas a vencer > pendientes > pagadas)
 * @param cuentas Array de cuentas
 * @returns Cuentas ordenadas por prioridad
 */
export function ordenarPorPrioridad(cuentas: CuentaServicio[]): CuentaServicio[] {
  return [...cuentas].sort((a, b) => {
    // Función para obtener prioridad numérica
    const obtenerPrioridad = (cuenta: CuentaServicio): number => {
      if (cuenta.pagada) return 5;
      if (estaEnMora(cuenta)) return 1;
      if (estaVencida(cuenta)) return 2;
      if (proximaAVencer(cuenta)) return 3;
      return 4;
    };
    
    const prioridadA = obtenerPrioridad(a);
    const prioridadB = obtenerPrioridad(b);
    
    if (prioridadA !== prioridadB) {
      return prioridadA - prioridadB;
    }
    
    // Si tienen la misma prioridad, ordenar por fecha de vencimiento
    return a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime();
  });
}
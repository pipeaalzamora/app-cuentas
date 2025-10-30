import type { 
  CuentaServicio, 
  EstadisticasMensuales, 
  TipoServicio
} from '../tipos';

/**
 * Servicio para realizar cálculos y generar estadísticas de cuentas de servicios
 */
export class ServicioCalculosEstadisticas {

  /**
   * Calcula el total de gastos para un conjunto de cuentas
   */
  calcularTotalGastos(cuentas: CuentaServicio[]): number {
    return cuentas.reduce((total, cuenta) => total + cuenta.monto, 0);
  }

  /**
   * Calcula los gastos agrupados por tipo de servicio
   */
  calcularGastosPorServicio(cuentas: CuentaServicio[]): Record<TipoServicio, number> {
    const gastos: Record<TipoServicio, number> = {
      luz: 0,
      agua: 0,
      gas: 0,
      internet: 0
    };

    cuentas.forEach(cuenta => {
      gastos[cuenta.tipoServicio] += cuenta.monto;
    });

    return gastos;
  }

  /**
   * Agrupa cuentas por período mensual
   */
  agruparPorMes(cuentas: CuentaServicio[]): Map<string, CuentaServicio[]> {
    const grupos = new Map<string, CuentaServicio[]>();

    cuentas.forEach(cuenta => {
      const claveMes = `${cuenta.año}-${cuenta.mes.toString().padStart(2, '0')}`;
      
      if (!grupos.has(claveMes)) {
        grupos.set(claveMes, []);
      }
      
      grupos.get(claveMes)!.push(cuenta);
    });

    return grupos;
  }

  /**
   * Agrupa cuentas por año
   */
  agruparPorAño(cuentas: CuentaServicio[]): Map<number, CuentaServicio[]> {
    const grupos = new Map<number, CuentaServicio[]>();

    cuentas.forEach(cuenta => {
      if (!grupos.has(cuenta.año)) {
        grupos.set(cuenta.año, []);
      }
      
      grupos.get(cuenta.año)!.push(cuenta);
    });

    return grupos;
  }

  /**
   * Filtra cuentas por período específico
   */
  filtrarPorPeriodo(
    cuentas: CuentaServicio[], 
    año: number, 
    mes?: number, 
    mesInicio?: number, 
    mesFin?: number
  ): CuentaServicio[] {
    return cuentas.filter(cuenta => {
      // Filtrar por año
      if (cuenta.año !== año) return false;

      // Si se especifica un mes específico
      if (mes !== undefined) {
        return cuenta.mes === mes;
      }

      // Si se especifica un rango de meses
      if (mesInicio !== undefined && mesFin !== undefined) {
        return cuenta.mes >= mesInicio && cuenta.mes <= mesFin;
      }

      // Si solo se especifica mes de inicio
      if (mesInicio !== undefined) {
        return cuenta.mes >= mesInicio;
      }

      // Si solo se especifica mes de fin
      if (mesFin !== undefined) {
        return cuenta.mes <= mesFin;
      }

      // Si no se especifica mes, incluir todo el año
      return true;
    });
  }

  /**
   * Calcula estadísticas mensuales para un período específico
   */
  calcularEstadisticasMensuales(
    cuentas: CuentaServicio[], 
    año: number, 
    mes: number
  ): EstadisticasMensuales {
    // Filtrar cuentas del mes actual
    const cuentasMes = this.filtrarPorPeriodo(cuentas, año, mes);
    
    // Calcular totales
    const totalGastos = this.calcularTotalGastos(cuentasMes);
    const gastosPorServicio = this.calcularGastosPorServicio(cuentasMes);

    // Calcular promedio mensual (basado en los últimos 12 meses)
    const promedioMensual = this.calcularPromedioMensual(cuentas, año, mes);

    // Calcular comparativa con mes anterior
    const comparativaAnterior = this.calcularComparativaMesAnterior(cuentas, año, mes);

    return {
      mes,
      año,
      totalGastos,
      gastosPorServicio,
      promedioMensual,
      comparativaAnterior
    };
  }

  /**
   * Calcula el promedio mensual basado en los últimos 12 meses
   */
  calcularPromedioMensual(cuentas: CuentaServicio[], añoActual: number, mesActual: number): number {
    const mesesParaPromedio: Array<{año: number, mes: number}> = [];
    
    // Generar los últimos 12 meses
    for (let i = 0; i < 12; i++) {
      let año = añoActual;
      let mes = mesActual - i;
      
      if (mes <= 0) {
        mes += 12;
        año -= 1;
      }
      
      mesesParaPromedio.push({ año, mes });
    }

    // Calcular total de gastos para cada mes
    const totalesMensuales = mesesParaPromedio.map(({ año, mes }) => {
      const cuentasMes = this.filtrarPorPeriodo(cuentas, año, mes);
      return this.calcularTotalGastos(cuentasMes);
    });

    // Filtrar meses con datos (mayor a 0) para el promedio
    const totalesConDatos = totalesMensuales.filter(total => total > 0);
    
    if (totalesConDatos.length === 0) return 0;
    
    return totalesConDatos.reduce((sum, total) => sum + total, 0) / totalesConDatos.length;
  }

  /**
   * Calcula el porcentaje de cambio respecto al mes anterior
   */
  calcularComparativaMesAnterior(cuentas: CuentaServicio[], año: number, mes: number): number {
    // Calcular mes anterior
    let añoAnterior = año;
    let mesAnterior = mes - 1;
    
    if (mesAnterior === 0) {
      mesAnterior = 12;
      añoAnterior -= 1;
    }

    // Obtener totales
    const totalMesActual = this.calcularTotalGastos(
      this.filtrarPorPeriodo(cuentas, año, mes)
    );
    
    const totalMesAnterior = this.calcularTotalGastos(
      this.filtrarPorPeriodo(cuentas, añoAnterior, mesAnterior)
    );

    // Si no hay datos del mes anterior, retornar 0
    if (totalMesAnterior === 0) return 0;

    // Calcular porcentaje de cambio
    return ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100;
  }

  /**
   * Genera estadísticas para múltiples meses
   */
  generarEstadisticasMultiplesMeses(
    cuentas: CuentaServicio[], 
    año: number, 
    mesInicio: number = 1, 
    mesFin: number = 12
  ): EstadisticasMensuales[] {
    const estadisticas: EstadisticasMensuales[] = [];

    for (let mes = mesInicio; mes <= mesFin; mes++) {
      const estadisticasMes = this.calcularEstadisticasMensuales(cuentas, año, mes);
      estadisticas.push(estadisticasMes);
    }

    return estadisticas;
  }

  /**
   * Calcula estadísticas anuales
   */
  calcularEstadisticasAnuales(cuentas: CuentaServicio[], año: number): {
    año: number;
    totalAnual: number;
    promedioMensual: number;
    gastosPorServicio: Record<TipoServicio, number>;
    mesConMayorGasto: { mes: number; total: number };
    mesConMenorGasto: { mes: number; total: number };
    tendenciaMensual: Array<{ mes: number; total: number }>;
  } {
    const cuentasAño = this.filtrarPorPeriodo(cuentas, año);
    
    // Calcular totales
    const totalAnual = this.calcularTotalGastos(cuentasAño);
    const gastosPorServicio = this.calcularGastosPorServicio(cuentasAño);

    // Calcular tendencia mensual
    const tendenciaMensual: Array<{ mes: number; total: number }> = [];
    let mesConMayorGasto = { mes: 1, total: 0 };
    let mesConMenorGasto = { mes: 1, total: Infinity };

    for (let mes = 1; mes <= 12; mes++) {
      const cuentasMes = this.filtrarPorPeriodo(cuentas, año, mes);
      const totalMes = this.calcularTotalGastos(cuentasMes);
      
      tendenciaMensual.push({ mes, total: totalMes });

      // Actualizar mayor y menor (solo si hay gastos)
      if (totalMes > 0) {
        if (totalMes > mesConMayorGasto.total) {
          mesConMayorGasto = { mes, total: totalMes };
        }
        if (totalMes < mesConMenorGasto.total) {
          mesConMenorGasto = { mes, total: totalMes };
        }
      }
    }

    // Si no hay gastos en ningún mes
    if (mesConMenorGasto.total === Infinity) {
      mesConMenorGasto = { mes: 1, total: 0 };
    }

    const promedioMensual = totalAnual / 12;

    return {
      año,
      totalAnual,
      promedioMensual,
      gastosPorServicio,
      mesConMayorGasto,
      mesConMenorGasto,
      tendenciaMensual
    };
  }

  /**
   * Calcula comparativas entre años
   */
  calcularComparativaAnual(
    cuentas: CuentaServicio[], 
    añoActual: number, 
    añoComparacion: number
  ): {
    añoActual: number;
    añoComparacion: number;
    totalActual: number;
    totalComparacion: number;
    diferencia: number;
    porcentajeCambio: number;
    comparativaPorServicio: Record<TipoServicio, {
      actual: number;
      comparacion: number;
      diferencia: number;
      porcentajeCambio: number;
    }>;
  } {
    const cuentasActual = this.filtrarPorPeriodo(cuentas, añoActual);
    const cuentasComparacion = this.filtrarPorPeriodo(cuentas, añoComparacion);

    const totalActual = this.calcularTotalGastos(cuentasActual);
    const totalComparacion = this.calcularTotalGastos(cuentasComparacion);
    
    const diferencia = totalActual - totalComparacion;
    const porcentajeCambio = totalComparacion > 0 ? (diferencia / totalComparacion) * 100 : 0;

    // Comparativa por servicio
    const gastosActual = this.calcularGastosPorServicio(cuentasActual);
    const gastosComparacion = this.calcularGastosPorServicio(cuentasComparacion);

    const comparativaPorServicio: Record<TipoServicio, {
      actual: number;
      comparacion: number;
      diferencia: number;
      porcentajeCambio: number;
    }> = {} as any;

    (['luz', 'agua', 'gas', 'internet'] as TipoServicio[]).forEach(servicio => {
      const actual = gastosActual[servicio];
      const comparacion = gastosComparacion[servicio];
      const diff = actual - comparacion;
      const pctChange = comparacion > 0 ? (diff / comparacion) * 100 : 0;

      comparativaPorServicio[servicio] = {
        actual,
        comparacion,
        diferencia: diff,
        porcentajeCambio: pctChange
      };
    });

    return {
      añoActual,
      añoComparacion,
      totalActual,
      totalComparacion,
      diferencia,
      porcentajeCambio,
      comparativaPorServicio
    };
  }

  /**
   * Obtiene el ranking de servicios por gasto
   */
  obtenerRankingServicios(cuentas: CuentaServicio[]): Array<{
    servicio: TipoServicio;
    total: number;
    porcentaje: number;
    cantidadCuentas: number;
    promedioMonto: number;
  }> {
    const gastosPorServicio = this.calcularGastosPorServicio(cuentas);
    const totalGeneral = this.calcularTotalGastos(cuentas);

    const ranking = (['luz', 'agua', 'gas', 'internet'] as TipoServicio[])
      .map(servicio => {
        const cuentasServicio = cuentas.filter(c => c.tipoServicio === servicio);
        const total = gastosPorServicio[servicio];
        const porcentaje = totalGeneral > 0 ? (total / totalGeneral) * 100 : 0;
        const cantidadCuentas = cuentasServicio.length;
        const promedioMonto = cantidadCuentas > 0 ? total / cantidadCuentas : 0;

        return {
          servicio,
          total,
          porcentaje,
          cantidadCuentas,
          promedioMonto
        };
      })
      .sort((a, b) => b.total - a.total); // Ordenar por total descendente

    return ranking;
  }

  /**
   * Calcula métricas de resumen rápido
   */
  calcularResumenRapido(cuentas: CuentaServicio[]): {
    totalCuentas: number;
    totalGastos: number;
    cuentasPagadas: number;
    cuentasPendientes: number;
    servicioMasCaro: { servicio: TipoServicio; total: number } | null;
    promedioGastoMensual: number;
  } {
    const totalCuentas = cuentas.length;
    const totalGastos = this.calcularTotalGastos(cuentas);
    const cuentasPagadas = cuentas.filter(c => c.pagada).length;
    const cuentasPendientes = totalCuentas - cuentasPagadas;

    // Encontrar servicio más caro
    const ranking = this.obtenerRankingServicios(cuentas);
    const servicioMasCaro = ranking.length > 0 && ranking[0].total > 0 
      ? { servicio: ranking[0].servicio, total: ranking[0].total }
      : null;

    // Calcular promedio mensual (asumiendo distribución uniforme)
    const mesesUnicos = new Set(cuentas.map(c => `${c.año}-${c.mes}`)).size;
    const promedioGastoMensual = mesesUnicos > 0 ? totalGastos / mesesUnicos : 0;

    return {
      totalCuentas,
      totalGastos,
      cuentasPagadas,
      cuentasPendientes,
      servicioMasCaro,
      promedioGastoMensual
    };
  }
}

// Instancia singleton del servicio
export const servicioCalculosEstadisticas = new ServicioCalculosEstadisticas();
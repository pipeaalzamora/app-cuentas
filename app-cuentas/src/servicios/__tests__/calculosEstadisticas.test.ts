import { describe, it, expect, beforeEach } from 'vitest';
import { servicioCalculosEstadisticas } from '../calculosEstadisticas';
import type { CuentaServicio } from '../../tipos';

describe('servicioCalculosEstadisticas', () => {
  let cuentasPrueba: CuentaServicio[];

  beforeEach(() => {
    cuentasPrueba = [
      {
        id: '1',
        tipoServicio: 'luz',
        monto: 150.50,
        fechaVencimiento: new Date('2024-01-15'),
        mes: 1,
        año: 2024,
        pagada: true,
        fechaCreacion: new Date('2024-01-01')
      },
      {
        id: '2',
        tipoServicio: 'agua',
        monto: 80.25,
        fechaVencimiento: new Date('2024-01-20'),
        mes: 1,
        año: 2024,
        pagada: false,
        fechaCreacion: new Date('2024-01-02')
      },
      {
        id: '3',
        tipoServicio: 'gas',
        monto: 120.75,
        fechaVencimiento: new Date('2024-02-10'),
        mes: 2,
        año: 2024,
        pagada: true,
        fechaCreacion: new Date('2024-02-01')
      },
      {
        id: '4',
        tipoServicio: 'internet',
        monto: 200.00,
        fechaVencimiento: new Date('2024-02-25'),
        mes: 2,
        año: 2024,
        pagada: true,
        fechaCreacion: new Date('2024-02-02')
      },
      {
        id: '5',
        tipoServicio: 'luz',
        monto: 165.30,
        fechaVencimiento: new Date('2024-02-15'),
        mes: 2,
        año: 2024,
        pagada: false,
        fechaCreacion: new Date('2024-02-03')
      }
    ];
  });

  describe('calcularTotalGastos', () => {
    it('debería calcular el total de gastos correctamente', () => {
      const total = servicioCalculosEstadisticas.calcularTotalGastos(cuentasPrueba);
      expect(total).toBe(716.80); // 150.50 + 80.25 + 120.75 + 200.00 + 165.30
    });

    it('debería retornar 0 para array vacío', () => {
      const total = servicioCalculosEstadisticas.calcularTotalGastos([]);
      expect(total).toBe(0);
    });

    it('debería manejar cuentas con monto 0', () => {
      const cuentasConCero = [
        ...cuentasPrueba,
        {
          id: '6',
          tipoServicio: 'agua' as const,
          monto: 0,
          fechaVencimiento: new Date('2024-03-15'),
          mes: 3,
          año: 2024,
          pagada: true,
          fechaCreacion: new Date('2024-03-01')
        }
      ];
      
      const total = servicioCalculosEstadisticas.calcularTotalGastos(cuentasConCero);
      expect(total).toBe(716.80);
    });
  });

  describe('calcularGastosPorServicio', () => {
    it('debería agrupar gastos por tipo de servicio', () => {
      const gastosPorServicio = servicioCalculosEstadisticas.calcularGastosPorServicio(cuentasPrueba);
      
      expect(gastosPorServicio.luz).toBe(315.80); // 150.50 + 165.30
      expect(gastosPorServicio.agua).toBe(80.25);
      expect(gastosPorServicio.gas).toBe(120.75);
      expect(gastosPorServicio.internet).toBe(200.00);
    });

    it('debería retornar 0 para servicios no presentes', () => {
      const cuentasSoloLuz = cuentasPrueba.filter(c => c.tipoServicio === 'luz');
      const gastosPorServicio = servicioCalculosEstadisticas.calcularGastosPorServicio(cuentasSoloLuz);
      
      expect(gastosPorServicio.luz).toBe(315.80);
      expect(gastosPorServicio.agua).toBe(0);
      expect(gastosPorServicio.gas).toBe(0);
      expect(gastosPorServicio.internet).toBe(0);
    });
  });

  describe('filtrarPorPeriodo', () => {
    it('debería filtrar por año', () => {
      const cuentas2024 = servicioCalculosEstadisticas.filtrarPorPeriodo(cuentasPrueba, 2024);
      expect(cuentas2024).toHaveLength(5);
    });

    it('debería filtrar por año y mes específico', () => {
      const cuentasEnero = servicioCalculosEstadisticas.filtrarPorPeriodo(cuentasPrueba, 2024, 1);
      expect(cuentasEnero).toHaveLength(2);
      expect(cuentasEnero.every(c => c.mes === 1 && c.año === 2024)).toBe(true);
    });

    it('debería filtrar por rango de meses', () => {
      const cuentasRango = servicioCalculosEstadisticas.filtrarPorPeriodo(cuentasPrueba, 2024, undefined, 1, 2);
      expect(cuentasRango).toHaveLength(5);
      expect(cuentasRango.every(c => c.mes >= 1 && c.mes <= 2 && c.año === 2024)).toBe(true);
    });

    it('debería retornar array vacío si no hay coincidencias', () => {
      const cuentas2023 = servicioCalculosEstadisticas.filtrarPorPeriodo(cuentasPrueba, 2023);
      expect(cuentas2023).toHaveLength(0);
    });
  });

  describe('calcularEstadisticasMensuales', () => {
    it('debería calcular estadísticas mensuales correctamente', () => {
      const estadisticas = servicioCalculosEstadisticas.calcularEstadisticasMensuales(cuentasPrueba, 2024, 1);
      
      expect(estadisticas.mes).toBe(1);
      expect(estadisticas.año).toBe(2024);
      expect(estadisticas.totalGastos).toBe(230.75); // 150.50 + 80.25
      expect(estadisticas.gastosPorServicio.luz).toBe(150.50);
      expect(estadisticas.gastosPorServicio.agua).toBe(80.25);
      expect(estadisticas.gastosPorServicio.gas).toBe(0);
      expect(estadisticas.gastosPorServicio.internet).toBe(0);
    });

    it('debería calcular promedio mensual basado en datos históricos', () => {
      const estadisticas = servicioCalculosEstadisticas.calcularEstadisticasMensuales(cuentasPrueba, 2024, 2);
      
      // Promedio debería ser calculado con los datos disponibles
      expect(estadisticas.promedioMensual).toBeGreaterThan(0);
    });
  });

  describe('calcularPromedioMensual', () => {
    it('debería calcular promedio mensual correctamente', () => {
      const promedio = servicioCalculosEstadisticas.calcularPromedioMensual(cuentasPrueba, 2024, 2);
      
      // Promedio de enero (230.75) y febrero (486.05) = 358.40
      expect(promedio).toBeCloseTo(358.40, 2);
    });

    it('debería retornar 0 si no hay datos', () => {
      const promedio = servicioCalculosEstadisticas.calcularPromedioMensual([], 2024, 12);
      expect(promedio).toBe(0);
    });

    it('debería manejar un solo mes de datos', () => {
      const cuentasUnMes = cuentasPrueba.filter(c => c.mes === 1);
      const promedio = servicioCalculosEstadisticas.calcularPromedioMensual(cuentasUnMes, 2024, 1);
      
      expect(promedio).toBe(230.75);
    });
  });

  describe('obtenerRankingServicios', () => {
    it('debería generar ranking ordenado por gasto total', () => {
      const ranking = servicioCalculosEstadisticas.obtenerRankingServicios(cuentasPrueba);
      
      expect(ranking).toHaveLength(4);
      expect(ranking[0].servicio).toBe('luz'); // Mayor gasto: 315.80
      expect(ranking[0].total).toBe(315.80);
      expect(ranking[0].cantidadCuentas).toBe(2);
      expect(ranking[0].promedioMonto).toBeCloseTo(157.90, 2);
      
      // Verificar que está ordenado descendentemente
      for (let i = 0; i < ranking.length - 1; i++) {
        expect(ranking[i].total).toBeGreaterThanOrEqual(ranking[i + 1].total);
      }
    });

    it('debería calcular porcentajes correctamente', () => {
      const ranking = servicioCalculosEstadisticas.obtenerRankingServicios(cuentasPrueba);
      
      const totalGeneral = ranking.reduce((sum, item) => sum + item.total, 0);
      expect(totalGeneral).toBeCloseTo(716.80, 2);
      
      // Verificar que los porcentajes suman 100%
      const sumaPorcentajes = ranking.reduce((sum, item) => sum + item.porcentaje, 0);
      expect(sumaPorcentajes).toBeCloseTo(100, 1);
    });
  });

  describe('calcularResumenRapido', () => {
    it('debería generar resumen rápido correctamente', () => {
      const resumen = servicioCalculosEstadisticas.calcularResumenRapido(cuentasPrueba);
      
      expect(resumen.totalCuentas).toBe(5);
      expect(resumen.cuentasPagadas).toBe(3);
      expect(resumen.cuentasPendientes).toBe(2);
      expect(resumen.totalGastos).toBe(716.80);
      expect(resumen.servicioMasCaro?.servicio).toBe('luz');
      expect(resumen.servicioMasCaro?.total).toBe(315.80);
    });

    it('debería manejar array vacío', () => {
      const resumen = servicioCalculosEstadisticas.calcularResumenRapido([]);
      
      expect(resumen.totalCuentas).toBe(0);
      expect(resumen.cuentasPagadas).toBe(0);
      expect(resumen.cuentasPendientes).toBe(0);
      expect(resumen.totalGastos).toBe(0);
      expect(resumen.servicioMasCaro).toBeNull();
    });
  });

  describe('generarEstadisticasMultiplesMeses', () => {
    it('debería generar estadísticas para múltiples meses', () => {
      const estadisticas = servicioCalculosEstadisticas.generarEstadisticasMultiplesMeses(
        cuentasPrueba, 
        2024, 
        1, 
        2
      );
      
      expect(estadisticas).toHaveLength(2);
      expect(estadisticas[0].mes).toBe(1);
      expect(estadisticas[0].totalGastos).toBe(230.75);
      expect(estadisticas[1].mes).toBe(2);
      expect(estadisticas[1].totalGastos).toBe(486.05);
    });
  });

  describe('calcularEstadisticasAnuales', () => {
    it('debería calcular estadísticas anuales correctamente', () => {
      const estadisticas = servicioCalculosEstadisticas.calcularEstadisticasAnuales(cuentasPrueba, 2024);
      
      expect(estadisticas.año).toBe(2024);
      expect(estadisticas.totalAnual).toBe(716.80);
      expect(estadisticas.promedioMensual).toBeCloseTo(358.40, 2);
      expect(estadisticas.mesConMayorGasto.mes).toBe(2);
      expect(estadisticas.mesConMenorGasto.mes).toBe(1);
    });
  });
});
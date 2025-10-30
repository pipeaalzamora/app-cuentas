import { describe, it, expect, beforeEach } from 'vitest';
import { servicioCalculosEstadisticas } from '../calculosEstadisticas';
import type { CuentaServicio } from '../../tipos';

describe('servicioCalculosEstadisticas - Tests Básicos', () => {
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
      }
    ];
  });

  describe('Cálculos básicos', () => {
    it('debería calcular el total de gastos correctamente', () => {
      const total = servicioCalculosEstadisticas.calcularTotalGastos(cuentasPrueba);
      expect(total).toBe(351.50); // 150.50 + 80.25 + 120.75
    });

    it('debería retornar 0 para array vacío', () => {
      const total = servicioCalculosEstadisticas.calcularTotalGastos([]);
      expect(total).toBe(0);
    });

    it('debería agrupar gastos por tipo de servicio', () => {
      const gastosPorServicio = servicioCalculosEstadisticas.calcularGastosPorServicio(cuentasPrueba);
      
      expect(gastosPorServicio.luz).toBe(150.50);
      expect(gastosPorServicio.agua).toBe(80.25);
      expect(gastosPorServicio.gas).toBe(120.75);
      expect(gastosPorServicio.internet).toBe(0);
    });

    it('debería filtrar por año', () => {
      const cuentas2024 = servicioCalculosEstadisticas.filtrarPorPeriodo(cuentasPrueba, 2024);
      expect(cuentas2024).toHaveLength(3);
    });

    it('debería filtrar por año y mes específico', () => {
      const cuentasEnero = servicioCalculosEstadisticas.filtrarPorPeriodo(cuentasPrueba, 2024, 1);
      expect(cuentasEnero).toHaveLength(2);
      expect(cuentasEnero.every(c => c.mes === 1 && c.año === 2024)).toBe(true);
    });

    it('debería calcular estadísticas mensuales correctamente', () => {
      const estadisticas = servicioCalculosEstadisticas.calcularEstadisticasMensuales(cuentasPrueba, 2024, 1);
      
      expect(estadisticas.mes).toBe(1);
      expect(estadisticas.año).toBe(2024);
      expect(estadisticas.totalGastos).toBe(230.75); // 150.50 + 80.25
      expect(estadisticas.gastosPorServicio.luz).toBe(150.50);
      expect(estadisticas.gastosPorServicio.agua).toBe(80.25);
    });

    it('debería generar ranking de servicios', () => {
      const ranking = servicioCalculosEstadisticas.obtenerRankingServicios(cuentasPrueba);
      
      expect(ranking).toHaveLength(4); // luz, agua, gas, internet (internet con 0)
      expect(ranking[0].servicio).toBe('luz'); // Mayor gasto
      expect(ranking[0].total).toBe(150.50);
      
      // Verificar que está ordenado descendentemente
      for (let i = 0; i < ranking.length - 1; i++) {
        expect(ranking[i].total).toBeGreaterThanOrEqual(ranking[i + 1].total);
      }
    });

    it('debería calcular resumen rápido correctamente', () => {
      const resumen = servicioCalculosEstadisticas.calcularResumenRapido(cuentasPrueba);
      
      expect(resumen.totalCuentas).toBe(3);
      expect(resumen.cuentasPagadas).toBe(2);
      expect(resumen.cuentasPendientes).toBe(1);
      expect(resumen.totalGastos).toBe(351.50);
      expect(resumen.servicioMasCaro?.servicio).toBe('luz');
    });
  });
});
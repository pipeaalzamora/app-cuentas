import { describe, it, expect } from 'vitest';
import {
  validarMonto,
  validarAño,
  validarMes,
  validarFechaFutura,
  formatearErroresValidacion
} from '../validacion';

describe('Utilidades de Validación - Tests Básicos', () => {
  describe('validarMonto', () => {
    it('debería validar montos positivos', () => {
      expect(validarMonto(100)).toBe(true);
      expect(validarMonto(0.01)).toBe(true);
      expect(validarMonto(1000.50)).toBe(true);
    });

    it('debería rechazar montos inválidos', () => {
      expect(validarMonto(0)).toBe(false);
      expect(validarMonto(-50)).toBe(false);
      expect(validarMonto(NaN)).toBe(false);
      expect(validarMonto(Infinity)).toBe(false);
    });
  });

  describe('validarAño', () => {
    it('debería validar años en rango válido', () => {
      expect(validarAño(2024)).toBe(true);
      expect(validarAño(2025)).toBe(true);
    });

    it('debería rechazar años fuera de rango', () => {
      expect(validarAño(2019)).toBe(false);
      expect(validarAño(2040)).toBe(false);
    });
  });

  describe('validarMes', () => {
    it('debería validar meses válidos', () => {
      for (let mes = 1; mes <= 12; mes++) {
        expect(validarMes(mes)).toBe(true);
      }
    });

    it('debería rechazar meses inválidos', () => {
      expect(validarMes(0)).toBe(false);
      expect(validarMes(13)).toBe(false);
      expect(validarMes(-1)).toBe(false);
    });
  });

  describe('validarFechaFutura', () => {
    it('debería validar fecha de hoy', () => {
      const hoy = new Date();
      expect(validarFechaFutura(hoy)).toBe(true);
    });

    it('debería validar fecha futura', () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 1);
      expect(validarFechaFutura(fechaFutura)).toBe(true);
    });

    it('debería rechazar fecha pasada', () => {
      const fechaPasada = new Date();
      fechaPasada.setDate(fechaPasada.getDate() - 1);
      expect(validarFechaFutura(fechaPasada)).toBe(false);
    });
  });

  describe('formatearErroresValidacion', () => {
    it('debería formatear un solo error', () => {
      const errores = { monto: 'El monto debe ser positivo' };
      const mensaje = formatearErroresValidacion(errores);
      expect(mensaje).toBe('El monto debe ser positivo');
    });

    it('debería formatear múltiples errores', () => {
      const errores = {
        monto: 'El monto debe ser positivo',
        tipoServicio: 'Tipo de servicio inválido'
      };
      const mensaje = formatearErroresValidacion(errores);
      expect(mensaje).toContain('Se encontraron 2 errores:');
      expect(mensaje).toContain('• El monto debe ser positivo');
      expect(mensaje).toContain('• Tipo de servicio inválido');
    });
  });
});
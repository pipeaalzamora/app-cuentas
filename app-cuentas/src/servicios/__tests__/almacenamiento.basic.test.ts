import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServicioAlmacenamiento } from '../almacenamiento';

describe('ServicioAlmacenamiento - Tests Básicos', () => {
  let servicio: ServicioAlmacenamiento;
  
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    servicio = new ServicioAlmacenamiento();
  });

  describe('Funcionalidad básica', () => {
    it('debería crear una instancia del servicio', () => {
      expect(servicio).toBeInstanceOf(ServicioAlmacenamiento);
    });

    it('debería guardar una cuenta correctamente', () => {
      const datosCuenta = {
        tipoServicio: 'luz' as const,
        monto: 150.50,
        fechaVencimiento: new Date('2024-12-15'),
        mes: 12,
        año: 2024,
        pagada: false
      };

      const cuentaGuardada = servicio.guardarCuenta(datosCuenta);

      expect(cuentaGuardada).toMatchObject(datosCuenta);
      expect(cuentaGuardada.id).toBeDefined();
      expect(cuentaGuardada.fechaCreacion).toBeInstanceOf(Date);
    });

    it('debería validar datos antes de guardar', () => {
      const datosInvalidos = {
        tipoServicio: 'servicio_invalido' as any,
        monto: -50,
        fechaVencimiento: new Date('2024-12-15'),
        mes: 13,
        año: 2024,
        pagada: false
      };

      expect(() => servicio.guardarCuenta(datosInvalidos)).toThrow();
    });

    it('debería verificar integridad de datos', () => {
      const resultado = servicio.verificarIntegridad();
      expect(resultado).toHaveProperty('valido');
      expect(resultado).toHaveProperty('errores');
      expect(Array.isArray(resultado.errores)).toBe(true);
    });

    it('debería exportar datos en formato JSON', () => {
      const datosExportados = servicio.exportarDatos();
      expect(() => JSON.parse(datosExportados)).not.toThrow();
      
      const datos = JSON.parse(datosExportados);
      expect(datos).toHaveProperty('cuentas');
      expect(datos).toHaveProperty('configuracion');
      expect(datos).toHaveProperty('version');
    });

    it('debería obtener estadísticas básicas', () => {
      const estadisticas = servicio.obtenerEstadisticas();
      
      expect(estadisticas).toHaveProperty('totalCuentas');
      expect(estadisticas).toHaveProperty('cuentasPagadas');
      expect(estadisticas).toHaveProperty('cuentasPendientes');
      expect(estadisticas).toHaveProperty('serviciosUnicos');
      expect(typeof estadisticas.totalCuentas).toBe('number');
    });
  });
});
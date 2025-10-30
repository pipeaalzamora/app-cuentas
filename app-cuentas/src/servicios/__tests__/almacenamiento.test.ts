import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServicioAlmacenamiento } from '../almacenamiento';

describe('ServicioAlmacenamiento', () => {
  let servicio: ServicioAlmacenamiento;
  
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    vi.clearAllMocks();
    // Usar la instancia singleton
    servicio = new ServicioAlmacenamiento();
  });

  describe('guardarCuenta', () => {
    it('debería guardar una nueva cuenta correctamente', () => {
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
      expect(cuentaGuardada.fechaActualizacion).toBeUndefined();
    });

    it('debería generar IDs únicos para cada cuenta', () => {
      const datosCuenta = {
        tipoServicio: 'agua' as const,
        monto: 80.25,
        fechaVencimiento: new Date('2024-12-20'),
        mes: 12,
        año: 2024,
        pagada: false
      };

      const cuenta1 = servicio.guardarCuenta(datosCuenta);
      const cuenta2 = servicio.guardarCuenta(datosCuenta);

      expect(cuenta1.id).not.toBe(cuenta2.id);
    });

    it('debería validar los datos antes de guardar', () => {
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
  });

  describe('obtenerCuentas', () => {
    beforeEach(() => {
      // Agregar algunas cuentas de prueba
      servicio.guardarCuenta({
        tipoServicio: 'luz',
        monto: 150,
        fechaVencimiento: new Date('2024-12-15'),
        mes: 12,
        año: 2024,
        pagada: false
      });

      servicio.guardarCuenta({
        tipoServicio: 'agua',
        monto: 80,
        fechaVencimiento: new Date('2024-11-20'),
        mes: 11,
        año: 2024,
        pagada: true
      });

      servicio.guardarCuenta({
        tipoServicio: 'gas',
        monto: 120,
        fechaVencimiento: new Date('2024-12-10'),
        mes: 12,
        año: 2024,
        pagada: false
      });
    });

    it('debería obtener todas las cuentas sin filtros', () => {
      const cuentas = servicio.obtenerCuentas();
      expect(cuentas).toHaveLength(3);
    });

    it('debería filtrar por mes', () => {
      const cuentasEnero = servicio.obtenerCuentas({ mes: 12 });
      expect(cuentasEnero).toHaveLength(2);
      expect(cuentasEnero.every(c => c.mes === 12)).toBe(true);
    });

    it('debería filtrar por año', () => {
      const cuentas2024 = servicio.obtenerCuentas({ año: 2024 });
      expect(cuentas2024).toHaveLength(3);
    });

    it('debería filtrar por tipo de servicio', () => {
      const cuentasLuz = servicio.obtenerCuentas({ tipoServicio: 'luz' });
      expect(cuentasLuz).toHaveLength(1);
      expect(cuentasLuz[0].tipoServicio).toBe('luz');
    });

    it('debería filtrar por estado de pago', () => {
      const cuentasPagadas = servicio.obtenerCuentas({ pagada: true });
      expect(cuentasPagadas).toHaveLength(1);
      expect(cuentasPagadas[0].pagada).toBe(true);
    });

    it('debería aplicar múltiples filtros', () => {
      const cuentasFiltradas = servicio.obtenerCuentas({ 
        mes: 12, 
        pagada: false 
      });
      expect(cuentasFiltradas).toHaveLength(2);
      expect(cuentasFiltradas.every(c => c.mes === 12 && !c.pagada)).toBe(true);
    });
  });

  describe('actualizarCuenta', () => {
    let cuentaId: string;

    beforeEach(() => {
      const cuenta = servicio.guardarCuenta({
        tipoServicio: 'internet',
        monto: 200,
        fechaVencimiento: new Date('2024-12-25'),
        mes: 12,
        año: 2024,
        pagada: false
      });
      cuentaId = cuenta.id;
    });

    it('debería actualizar una cuenta existente', () => {
      const cuentaActualizada = servicio.actualizarCuenta(cuentaId, {
        monto: 250,
        pagada: true
      });

      expect(cuentaActualizada.monto).toBe(250);
      expect(cuentaActualizada.pagada).toBe(true);
      expect(cuentaActualizada.fechaActualizacion).toBeInstanceOf(Date);
    });

    it('debería lanzar error si la cuenta no existe', () => {
      expect(() => {
        servicio.actualizarCuenta('id_inexistente', { monto: 100 });
      }).toThrow('No se encontró la cuenta con ID: id_inexistente');
    });

    it('debería validar los datos actualizados', () => {
      expect(() => {
        servicio.actualizarCuenta(cuentaId, { monto: -100 });
      }).toThrow();
    });
  });

  describe('eliminarCuenta', () => {
    let cuentaId: string;

    beforeEach(() => {
      const cuenta = servicio.guardarCuenta({
        tipoServicio: 'gas',
        monto: 90,
        fechaVencimiento: new Date('2024-12-30'),
        mes: 12,
        año: 2024,
        pagada: false
      });
      cuentaId = cuenta.id;
    });

    it('debería eliminar una cuenta existente', () => {
      const eliminada = servicio.eliminarCuenta(cuentaId);
      expect(eliminada).toBe(true);

      const cuentas = servicio.obtenerCuentas();
      expect(cuentas.find(c => c.id === cuentaId)).toBeUndefined();
    });

    it('debería retornar false si la cuenta no existe', () => {
      const eliminada = servicio.eliminarCuenta('id_inexistente');
      expect(eliminada).toBe(false);
    });
  });

  describe('verificarIntegridad', () => {
    it('debería retornar válido para datos correctos', () => {
      servicio.guardarCuenta({
        tipoServicio: 'luz',
        monto: 150,
        fechaVencimiento: new Date('2024-12-15'),
        mes: 12,
        año: 2024,
        pagada: false
      });

      const resultado = servicio.verificarIntegridad();
      expect(resultado.valido).toBe(true);
      expect(resultado.errores).toHaveLength(0);
    });

    it('debería detectar datos corruptos', () => {
      // Simular datos corruptos en localStorage
      localStorage.setItem('gestor-cuentas-servicios', 'datos_invalidos');

      const resultado = servicio.verificarIntegridad();
      expect(resultado.valido).toBe(false);
      expect(resultado.errores.length).toBeGreaterThan(0);
    });
  });

  describe('exportarDatos', () => {
    it('debería exportar datos en formato JSON', () => {
      servicio.guardarCuenta({
        tipoServicio: 'agua',
        monto: 75,
        fechaVencimiento: new Date('2024-12-18'),
        mes: 12,
        año: 2024,
        pagada: true
      });

      const datosExportados = servicio.exportarDatos();
      const datos = JSON.parse(datosExportados);

      expect(datos).toHaveProperty('cuentas');
      expect(datos).toHaveProperty('configuracion');
      expect(datos).toHaveProperty('version');
      expect(datos.cuentas).toHaveLength(1);
    });
  });

  describe('importarDatos', () => {
    it('debería importar datos válidos correctamente', () => {
      const datosImportar = {
        cuentas: [{
          id: 'test_id',
          tipoServicio: 'internet',
          monto: 300,
          fechaVencimiento: '2024-12-20T00:00:00.000Z',
          mes: 12,
          año: 2024,
          pagada: false,
          fechaCreacion: '2024-12-01T00:00:00.000Z'
        }],
        configuracion: {
          monedaDefault: '$',
          recordatoriosActivos: true,
          temaOscuro: false
        },
        version: '1.0.0'
      };

      const resultado = servicio.importarDatos(JSON.stringify(datosImportar));

      expect(resultado.exito).toBe(true);
      expect(resultado.cuentasImportadas).toBe(1);

      const cuentas = servicio.obtenerCuentas();
      expect(cuentas).toHaveLength(1);
      expect(cuentas[0].tipoServicio).toBe('internet');
    });

    it('debería rechazar datos inválidos', () => {
      const datosInvalidos = '{"datos": "invalidos"}';

      const resultado = servicio.importarDatos(datosInvalidos);

      expect(resultado.exito).toBe(false);
      expect(resultado.mensaje).toContain('Error al importar datos');
    });
  });

  describe('obtenerEstadisticas', () => {
    beforeEach(() => {
      servicio.guardarCuenta({
        tipoServicio: 'luz',
        monto: 150,
        fechaVencimiento: new Date('2024-12-15'),
        mes: 12,
        año: 2024,
        pagada: true
      });

      servicio.guardarCuenta({
        tipoServicio: 'agua',
        monto: 80,
        fechaVencimiento: new Date('2024-11-20'),
        mes: 11,
        año: 2024,
        pagada: false
      });
    });

    it('debería calcular estadísticas correctamente', () => {
      const estadisticas = servicio.obtenerEstadisticas();

      expect(estadisticas.totalCuentas).toBe(2);
      expect(estadisticas.cuentasPagadas).toBe(1);
      expect(estadisticas.cuentasPendientes).toBe(1);
      expect(estadisticas.serviciosUnicos).toBe(2);
      expect(estadisticas.rangoFechas.inicio).toBeInstanceOf(Date);
      expect(estadisticas.rangoFechas.fin).toBeInstanceOf(Date);
    });
  });
});
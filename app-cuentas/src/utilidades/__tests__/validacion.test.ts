import { describe, it, expect } from 'vitest';
import {
  validarDatos,
  validarSeguro,
  formatearErroresValidacion,
  validarFechaFutura,
  validarMonto,
  validarAño,
  validarMes,
  validarIntegridadCuenta,
  validarIntegridadCuentas,
  sanitizarCuentas,
  validarEstructuraAlmacenamiento
} from '../validacion';
import { esquemaCuentaServicio } from '../../tipos/esquemas';

describe('Utilidades de Validación', () => {
  describe('validarDatos', () => {
    it('debería validar datos correctos', () => {
      const datosCuenta = {
        tipoServicio: 'luz',
        monto: 150.50,
        fechaVencimiento: new Date('2024-12-15'),
        mes: 12,
        año: 2024,
        pagada: false,
        id: 'test_id',
        fechaCreacion: new Date()
      };

      const resultado = validarDatos(esquemaCuentaServicio, datosCuenta);
      
      expect(resultado.exito).toBe(true);
      expect(resultado.datos).toBeDefined();
      expect(resultado.errores).toBeUndefined();
    });

    it('debería detectar datos inválidos', () => {
      const datosInvalidos = {
        tipoServicio: 'servicio_invalido',
        monto: -50,
        fechaVencimiento: 'fecha_invalida',
        mes: 13,
        año: 1999
      };

      const resultado = validarDatos(esquemaCuentaServicio, datosInvalidos);
      
      expect(resultado.exito).toBe(false);
      expect(resultado.errores).toBeDefined();
      expect(Object.keys(resultado.errores!).length).toBeGreaterThan(0);
    });

    it('debería proporcionar mensajes de error específicos', () => {
      const datosInvalidos = {
        tipoServicio: 'invalido',
        monto: -100
      };

      const resultado = validarDatos(esquemaCuentaServicio, datosInvalidos);
      
      expect(resultado.errores).toBeDefined();
      expect(resultado.mensajeError).toBe('Datos de entrada inválidos');
    });
  });

  describe('validarSeguro', () => {
    it('debería retornar datos válidos', () => {
      const datosCuenta = {
        tipoServicio: 'agua',
        monto: 80.25,
        fechaVencimiento: new Date('2024-12-20'),
        mes: 12,
        año: 2024,
        pagada: true,
        id: 'test_id',
        fechaCreacion: new Date()
      };

      const resultado = validarSeguro(esquemaCuentaServicio, datosCuenta);
      
      expect(resultado).not.toBeNull();
      expect(resultado?.tipoServicio).toBe('agua');
    });

    it('debería retornar null para datos inválidos', () => {
      const datosInvalidos = {
        tipoServicio: 'invalido',
        monto: -50
      };

      const resultado = validarSeguro(esquemaCuentaServicio, datosInvalidos);
      
      expect(resultado).toBeNull();
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

  describe('validarFechaFutura', () => {
    it('debería validar fecha futura', () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 1);
      
      expect(validarFechaFutura(fechaFutura)).toBe(true);
    });

    it('debería validar fecha de hoy', () => {
      const hoy = new Date();
      expect(validarFechaFutura(hoy)).toBe(true);
    });

    it('debería rechazar fecha pasada', () => {
      const fechaPasada = new Date();
      fechaPasada.setDate(fechaPasada.getDate() - 1);
      
      expect(validarFechaFutura(fechaPasada)).toBe(false);
    });
  });

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
      expect(validarMonto('100')).toBe(false);
    });
  });

  describe('validarAño', () => {
    const añoActual = new Date().getFullYear();

    it('debería validar años en rango válido', () => {
      expect(validarAño(2024)).toBe(true);
      expect(validarAño(añoActual)).toBe(true);
      expect(validarAño(añoActual + 5)).toBe(true);
    });

    it('debería rechazar años fuera de rango', () => {
      expect(validarAño(2019)).toBe(false);
      expect(validarAño(añoActual + 11)).toBe(false);
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
      expect(validarMes(1.5)).toBe(false);
    });
  });

  describe('validarIntegridadCuenta', () => {
    const cuentaValida = {
      id: 'test_id',
      tipoServicio: 'luz',
      monto: 150,
      fechaVencimiento: new Date('2024-12-15'),
      fechaCreacion: new Date('2024-12-01'),
      mes: 12,
      año: 2024,
      pagada: false
    };

    it('debería validar cuenta correcta', () => {
      const resultado = validarIntegridadCuenta(cuentaValida);
      
      expect(resultado.valida).toBe(true);
      expect(resultado.errores).toHaveLength(0);
    });

    it('debería detectar ID faltante', () => {
      const cuentaSinId = { ...cuentaValida, id: undefined };
      const resultado = validarIntegridadCuenta(cuentaSinId);
      
      expect(resultado.valida).toBe(false);
      expect(resultado.errores).toContain('ID de cuenta inválido o faltante');
    });

    it('debería detectar tipo de servicio inválido', () => {
      const cuentaTipoInvalido = { ...cuentaValida, tipoServicio: 'invalido' };
      const resultado = validarIntegridadCuenta(cuentaTipoInvalido);
      
      expect(resultado.valida).toBe(false);
      expect(resultado.errores.some(e => e.includes('Tipo de servicio inválido'))).toBe(true);
    });

    it('debería detectar monto inválido', () => {
      const cuentaMontoInvalido = { ...cuentaValida, monto: -50 };
      const resultado = validarIntegridadCuenta(cuentaMontoInvalido);
      
      expect(resultado.valida).toBe(false);
      expect(resultado.errores).toContain('Monto inválido: debe ser un número positivo');
    });

    it('debería detectar fechas inválidas', () => {
      const cuentaFechaInvalida = { ...cuentaValida, fechaVencimiento: 'fecha_invalida' };
      const resultado = validarIntegridadCuenta(cuentaFechaInvalida);
      
      expect(resultado.valida).toBe(false);
      expect(resultado.errores).toContain('Fecha de vencimiento inválida');
    });
  });

  describe('validarIntegridadCuentas', () => {
    const cuentasValidas = [
      {
        id: 'cuenta_1',
        tipoServicio: 'luz',
        monto: 150,
        fechaVencimiento: new Date('2024-12-15'),
        fechaCreacion: new Date('2024-12-01'),
        mes: 12,
        año: 2024,
        pagada: false
      },
      {
        id: 'cuenta_2',
        tipoServicio: 'agua',
        monto: 80,
        fechaVencimiento: new Date('2024-12-20'),
        fechaCreacion: new Date('2024-12-02'),
        mes: 12,
        año: 2024,
        pagada: true
      }
    ];

    it('debería validar array de cuentas válidas', () => {
      const resultado = validarIntegridadCuentas(cuentasValidas);
      
      expect(resultado.validas).toBe(2);
      expect(resultado.invalidas).toBe(0);
      expect(resultado.errores).toHaveLength(0);
      expect(resultado.duplicados).toHaveLength(0);
    });

    it('debería detectar cuentas inválidas', () => {
      const cuentasConInvalidas = [
        ...cuentasValidas,
        { id: 'cuenta_3', tipoServicio: 'invalido', monto: -50 }
      ];
      
      const resultado = validarIntegridadCuentas(cuentasConInvalidas);
      
      expect(resultado.validas).toBe(2);
      expect(resultado.invalidas).toBe(1);
      expect(resultado.errores).toHaveLength(1);
    });

    it('debería detectar IDs duplicados', () => {
      const cuentasConDuplicados = [
        ...cuentasValidas,
        { ...cuentasValidas[0], monto: 200 } // Mismo ID que la primera
      ];
      
      const resultado = validarIntegridadCuentas(cuentasConDuplicados);
      
      expect(resultado.duplicados).toContain('cuenta_1');
    });

    it('debería manejar datos no válidos', () => {
      const resultado = validarIntegridadCuentas('no_es_array' as any);
      
      expect(resultado.validas).toBe(0);
      expect(resultado.invalidas).toBe(0);
      expect(resultado.errores[0].errores).toContain('Los datos deben ser un array');
    });
  });

  describe('sanitizarCuentas', () => {
    it('debería reparar cuentas con problemas menores', () => {
      const cuentasConProblemas = [
        {
          // Sin ID
          tipoServicio: 'luz',
          monto: 150,
          fechaVencimiento: '2024-12-15',
          fechaCreacion: '2024-12-01',
          mes: 12,
          año: 2024,
          pagada: 'false' // String en lugar de boolean
        }
      ];
      
      const resultado = sanitizarCuentas(cuentasConProblemas);
      
      expect(resultado.cuentasReparadas).toHaveLength(1);
      expect(resultado.cuentasDescartadas).toBe(0);
      expect(resultado.cuentasReparadas[0].id).toBeDefined();
      expect(resultado.cuentasReparadas[0].pagada).toBe(false);
    });

    it('debería descartar cuentas irreparables', () => {
      const cuentasIrreparables = [
        {
          tipoServicio: 'servicio_completamente_invalido',
          monto: 'no_es_numero',
          fechaVencimiento: 'fecha_invalida',
          mes: 'no_es_numero',
          año: 'no_es_numero'
        }
      ];
      
      const resultado = sanitizarCuentas(cuentasIrreparables);
      
      // La función puede intentar reparar algunos campos, pero debería descartar si hay demasiados errores
      expect(resultado.cuentasDescartadas).toBeGreaterThan(0);
      expect(resultado.reparaciones.length).toBeGreaterThan(0);
    });
  });

  describe('validarEstructuraAlmacenamiento', () => {
    const estructuraValida = {
      cuentas: [],
      configuracion: {
        monedaDefault: '$',
        recordatoriosActivos: true,
        temaOscuro: false
      },
      version: '1.0.0'
    };

    it('debería validar estructura correcta', () => {
      const resultado = validarEstructuraAlmacenamiento(estructuraValida);
      
      expect(resultado.valida).toBe(true);
      expect(resultado.errores).toHaveLength(0);
    });

    it('debería detectar propiedades faltantes', () => {
      const estructuraIncompleta = {
        cuentas: []
        // Faltan configuracion y version
      };
      
      const resultado = validarEstructuraAlmacenamiento(estructuraIncompleta);
      
      // Debería ser válida pero con advertencias
      expect(resultado.valida).toBe(true);
      expect(resultado.advertencias).toContain('Falta la configuración de usuario');
      expect(resultado.advertencias).toContain('Falta información de versión');
    });

    it('debería detectar tipos incorrectos', () => {
      const estructuraTiposIncorrectos = {
        cuentas: 'no_es_array',
        configuracion: 'no_es_objeto',
        version: 123
      };
      
      const resultado = validarEstructuraAlmacenamiento(estructuraTiposIncorrectos);
      
      expect(resultado.valida).toBe(false);
      expect(resultado.errores).toContain('La propiedad "cuentas" debe ser un array');
      expect(resultado.errores).toContain('La configuración debe ser un objeto');
      expect(resultado.errores).toContain('La versión debe ser una cadena de texto');
    });

    it('debería manejar datos completamente inválidos', () => {
      const resultado = validarEstructuraAlmacenamiento(null);
      
      expect(resultado.valida).toBe(false);
      expect(resultado.errores).toContain('Los datos deben ser un objeto válido');
    });
  });
});
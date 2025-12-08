import type { 
  CuentaServicio, 
  AlmacenamientoLocal, 
  ConfiguracionUsuario,
  FiltrosCuentas 
} from '../tipos';
import { 
  esquemaAlmacenamientoLocal, 
  esquemaCuentaServicio,
  esquemaConfiguracionUsuario 
} from '../tipos/esquemas';

/**
 * Servicio para manejar el almacenamiento local de cuentas de servicios
 * Implementa persistencia en localStorage con validación de datos
 */
export class ServicioAlmacenamiento {
  private static readonly CLAVE_ALMACENAMIENTO = 'gestor-cuentas-servicios';
  private static readonly VERSION_ACTUAL = '1.0.0';

  /**
   * Configuración por defecto para nuevos usuarios
   */
  private static readonly CONFIGURACION_DEFAULT: ConfiguracionUsuario = {
    monedaDefault: 'CLP',
    recordatoriosActivos: true,
    temaOscuro: false
  };

  /**
   * Obtiene todos los datos del almacenamiento local
   */
  private obtenerDatosCompletos(): AlmacenamientoLocal {
    try {
      const datosString = localStorage.getItem(ServicioAlmacenamiento.CLAVE_ALMACENAMIENTO);
      
      if (!datosString) {
        // Primera vez - crear estructura inicial
        const datosIniciales: AlmacenamientoLocal = {
          cuentas: [],
          configuracion: ServicioAlmacenamiento.CONFIGURACION_DEFAULT,
          version: ServicioAlmacenamiento.VERSION_ACTUAL
        };
        this.guardarDatosCompletos(datosIniciales);
        return datosIniciales;
      }

      const datosParseados = JSON.parse(datosString);
      
      // Convertir fechas de string a Date
      if (datosParseados.cuentas) {
        datosParseados.cuentas = datosParseados.cuentas.map((cuenta: Record<string, unknown>) => {
          const fechaVencimiento = cuenta.fechaVencimiento as string | number | Date;
          const fechaCreacion = cuenta.fechaCreacion as string | number | Date;
          const fechaActualizacion = cuenta.fechaActualizacion as string | number | Date | undefined;
          const fechaEmision = cuenta.fechaEmision as string | number | Date | undefined;
          const fechaCorte = cuenta.fechaCorte as string | number | Date | undefined;
          const fechaLectura = cuenta.fechaLectura as string | number | Date | undefined;
          const proximaFechaLectura = cuenta.proximaFechaLectura as string | number | Date | undefined;
          
          return {
            ...cuenta,
            fechaVencimiento: new Date(fechaVencimiento),
            fechaCreacion: new Date(fechaCreacion),
            fechaActualizacion: fechaActualizacion ? new Date(fechaActualizacion) : undefined,
            // Nuevos campos de fecha (con valores por defecto para compatibilidad)
            fechaEmision: fechaEmision ? new Date(fechaEmision) : new Date(fechaCreacion || fechaVencimiento),
            fechaCorte: fechaCorte ? new Date(fechaCorte) : new Date(fechaVencimiento),
            fechaLectura: fechaLectura ? new Date(fechaLectura) : new Date(fechaVencimiento),
            proximaFechaLectura: proximaFechaLectura ? new Date(proximaFechaLectura) : undefined,
            // Campos numéricos con valores por defecto
            saldoAnterior: cuenta.saldoAnterior || 0,
            consumoActual: cuenta.consumoActual || cuenta.monto || 0,
            otrosCargos: cuenta.otrosCargos || 0,
            descuentos: cuenta.descuentos || 0
          };
        });
      }

      // Validar estructura de datos
      const datosValidados = esquemaAlmacenamientoLocal.parse(datosParseados);
      
      // Migrar versión si es necesario
      return this.migrarVersion(datosValidados);
      
    } catch (error) {
      console.error('Error al obtener datos del almacenamiento:', error);
      
      // En caso de error, crear estructura limpia
      const datosLimpios: AlmacenamientoLocal = {
        cuentas: [],
        configuracion: ServicioAlmacenamiento.CONFIGURACION_DEFAULT,
        version: ServicioAlmacenamiento.VERSION_ACTUAL
      };
      
      this.guardarDatosCompletos(datosLimpios);
      return datosLimpios;
    }
  }

  /**
   * Guarda todos los datos en el almacenamiento local
   */
  private guardarDatosCompletos(datos: AlmacenamientoLocal): void {
    try {
      // Validar antes de guardar
      const datosValidados = esquemaAlmacenamientoLocal.parse(datos);
      
      const datosString = JSON.stringify(datosValidados, null, 2);
      localStorage.setItem(ServicioAlmacenamiento.CLAVE_ALMACENAMIENTO, datosString);
    } catch (error) {
      console.error('Error al guardar datos en almacenamiento:', error);
      throw new Error('No se pudieron guardar los datos. Verifique que el navegador permita almacenamiento local.');
    }
  }

  /**
   * Migra datos de versiones anteriores si es necesario
   */
  private migrarVersion(datos: AlmacenamientoLocal): AlmacenamientoLocal {
    if (datos.version === ServicioAlmacenamiento.VERSION_ACTUAL) {
      return datos;
    }

    // Aquí se implementarían migraciones futuras
    console.log(`Migrando datos de versión ${datos.version} a ${ServicioAlmacenamiento.VERSION_ACTUAL}`);
    
    const datosMigrados: AlmacenamientoLocal = {
      ...datos,
      version: ServicioAlmacenamiento.VERSION_ACTUAL
    };

    this.guardarDatosCompletos(datosMigrados);
    return datosMigrados;
  }

  /**
   * Genera un ID único para una nueva cuenta
   */
  private generarId(): string {
    return `cuenta_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Guarda una nueva cuenta de servicio
   */
  guardarCuenta(datosCuenta: Omit<CuentaServicio, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): CuentaServicio {
    const datos = this.obtenerDatosCompletos();
    
    const nuevaCuenta: CuentaServicio = {
      ...datosCuenta,
      id: this.generarId(),
      fechaCreacion: new Date(),
      fechaActualizacion: undefined
    };

    // Validar la nueva cuenta
    const cuentaValidada = esquemaCuentaServicio.parse(nuevaCuenta);
    
    datos.cuentas.push(cuentaValidada);
    this.guardarDatosCompletos(datos);
    
    return cuentaValidada;
  }

  /**
   * Actualiza una cuenta existente
   */
  actualizarCuenta(id: string, datosActualizados: Partial<Omit<CuentaServicio, 'id' | 'fechaCreacion'>>): CuentaServicio {
    const datos = this.obtenerDatosCompletos();
    
    const indice = datos.cuentas.findIndex(cuenta => cuenta.id === id);
    if (indice === -1) {
      throw new Error(`No se encontró la cuenta con ID: ${id}`);
    }

    const cuentaActualizada: CuentaServicio = {
      ...datos.cuentas[indice],
      ...datosActualizados,
      fechaActualizacion: new Date()
    };

    // Validar la cuenta actualizada
    const cuentaValidada = esquemaCuentaServicio.parse(cuentaActualizada);
    
    datos.cuentas[indice] = cuentaValidada;
    this.guardarDatosCompletos(datos);
    
    return cuentaValidada;
  }

  /**
   * Obtiene todas las cuentas con filtros opcionales
   */
  obtenerCuentas(filtros?: FiltrosCuentas): CuentaServicio[] {
    const datos = this.obtenerDatosCompletos();
    let cuentas = datos.cuentas;

    if (filtros) {
      cuentas = cuentas.filter(cuenta => {
        if (filtros.mes !== undefined && cuenta.mes !== filtros.mes) return false;
        if (filtros.año !== undefined && cuenta.año !== filtros.año) return false;
        if (filtros.tipoServicio !== undefined && cuenta.tipoServicio !== filtros.tipoServicio) return false;
        if (filtros.pagada !== undefined && cuenta.pagada !== filtros.pagada) return false;
        return true;
      });
    }

    return cuentas;
  }

  /**
   * Obtiene una cuenta específica por ID
   */
  obtenerCuentaPorId(id: string): CuentaServicio | null {
    const datos = this.obtenerDatosCompletos();
    return datos.cuentas.find(cuenta => cuenta.id === id) || null;
  }

  /**
   * Elimina una cuenta por ID
   */
  eliminarCuenta(id: string): boolean {
    const datos = this.obtenerDatosCompletos();
    
    const indiceInicial = datos.cuentas.length;
    datos.cuentas = datos.cuentas.filter(cuenta => cuenta.id !== id);
    
    if (datos.cuentas.length === indiceInicial) {
      return false; // No se encontró la cuenta
    }

    this.guardarDatosCompletos(datos);
    return true;
  }

  /**
   * Elimina múltiples cuentas por IDs
   */
  eliminarCuentas(ids: string[]): number {
    const datos = this.obtenerDatosCompletos();
    
    const cuentasIniciales = datos.cuentas.length;
    datos.cuentas = datos.cuentas.filter(cuenta => !ids.includes(cuenta.id));
    
    const cuentasEliminadas = cuentasIniciales - datos.cuentas.length;
    
    if (cuentasEliminadas > 0) {
      this.guardarDatosCompletos(datos);
    }
    
    return cuentasEliminadas;
  }

  /**
   * Obtiene la configuración del usuario
   */
  obtenerConfiguracion(): ConfiguracionUsuario {
    const datos = this.obtenerDatosCompletos();
    return datos.configuracion;
  }

  /**
   * Actualiza la configuración del usuario
   */
  actualizarConfiguracion(nuevaConfiguracion: Partial<ConfiguracionUsuario>): ConfiguracionUsuario {
    const datos = this.obtenerDatosCompletos();
    
    const configuracionActualizada = {
      ...datos.configuracion,
      ...nuevaConfiguracion
    };

    // Validar la configuración
    const configuracionValidada = esquemaConfiguracionUsuario.parse(configuracionActualizada);
    
    datos.configuracion = configuracionValidada;
    this.guardarDatosCompletos(datos);
    
    return configuracionValidada;
  }

  /**
   * Exporta todos los datos como JSON para respaldo
   */
  exportarDatos(): string {
    const datos = this.obtenerDatosCompletos();
    return JSON.stringify(datos, null, 2);
  }

  /**
   * Importa datos desde un JSON de respaldo
   */
  importarDatos(datosJson: string, sobrescribir: boolean = false): { exito: boolean; mensaje: string; cuentasImportadas?: number } {
    try {
      const datosImportados = JSON.parse(datosJson);
      
      // Convertir fechas si es necesario
      if (datosImportados.cuentas) {
        datosImportados.cuentas = datosImportados.cuentas.map((cuenta: Record<string, unknown>) => {
          const fechaVencimiento = cuenta.fechaVencimiento as string | number | Date;
          const fechaCreacion = cuenta.fechaCreacion as string | number | Date;
          const fechaActualizacion = cuenta.fechaActualizacion as string | number | Date | undefined;
          const fechaEmision = cuenta.fechaEmision as string | number | Date | undefined;
          const fechaCorte = cuenta.fechaCorte as string | number | Date | undefined;
          const fechaLectura = cuenta.fechaLectura as string | number | Date | undefined;
          const proximaFechaLectura = cuenta.proximaFechaLectura as string | number | Date | undefined;
          
          return {
            ...cuenta,
            fechaVencimiento: new Date(fechaVencimiento),
            fechaCreacion: new Date(fechaCreacion),
            fechaActualizacion: fechaActualizacion ? new Date(fechaActualizacion) : undefined,
            // Nuevos campos de fecha con valores por defecto
            fechaEmision: fechaEmision ? new Date(fechaEmision) : new Date(fechaCreacion || fechaVencimiento),
            fechaCorte: fechaCorte ? new Date(fechaCorte) : new Date(fechaVencimiento),
            fechaLectura: fechaLectura ? new Date(fechaLectura) : new Date(fechaVencimiento),
            proximaFechaLectura: proximaFechaLectura ? new Date(proximaFechaLectura) : undefined,
            // Campos numéricos con valores por defecto
            saldoAnterior: cuenta.saldoAnterior || 0,
            consumoActual: cuenta.consumoActual || cuenta.monto || 0,
            otrosCargos: cuenta.otrosCargos || 0,
            descuentos: cuenta.descuentos || 0
          };
        });
      }

      // Validar estructura
      const datosValidados = esquemaAlmacenamientoLocal.parse(datosImportados);
      
      if (sobrescribir) {
        // Reemplazar todos los datos
        this.guardarDatosCompletos(datosValidados);
        return {
          exito: true,
          mensaje: `Datos importados exitosamente. ${datosValidados.cuentas.length} cuentas cargadas.`,
          cuentasImportadas: datosValidados.cuentas.length
        };
      } else {
        // Fusionar con datos existentes
        const datosActuales = this.obtenerDatosCompletos();
        
        // Evitar duplicados por ID
        const idsExistentes = new Set(datosActuales.cuentas.map(c => c.id));
        const cuentasNuevas = datosValidados.cuentas.filter(c => !idsExistentes.has(c.id));
        
        datosActuales.cuentas.push(...cuentasNuevas);
        
        // Mantener configuración actual, solo actualizar si no existe
        if (!datosActuales.configuracion) {
          datosActuales.configuracion = datosValidados.configuracion;
        }
        
        this.guardarDatosCompletos(datosActuales);
        
        return {
          exito: true,
          mensaje: `${cuentasNuevas.length} cuentas nuevas importadas exitosamente.`,
          cuentasImportadas: cuentasNuevas.length
        };
      }
      
    } catch (error) {
      console.error('Error al importar datos:', error);
      return {
        exito: false,
        mensaje: `Error al importar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Limpia todos los datos del almacenamiento
   */
  limpiarDatos(): void {
    const datosLimpios: AlmacenamientoLocal = {
      cuentas: [],
      configuracion: ServicioAlmacenamiento.CONFIGURACION_DEFAULT,
      version: ServicioAlmacenamiento.VERSION_ACTUAL
    };
    
    this.guardarDatosCompletos(datosLimpios);
  }

  /**
   * Verifica la integridad de los datos almacenados
   */
  verificarIntegridad(): { valido: boolean; errores: string[] } {
    try {
      const datos = this.obtenerDatosCompletos();
      esquemaAlmacenamientoLocal.parse(datos);
      
      return {
        valido: true,
        errores: []
      };
    } catch (error) {
      const errores = error instanceof Error ? [error.message] : ['Error de validación desconocido'];
      
      return {
        valido: false,
        errores
      };
    }
  }

  /**
   * Obtiene estadísticas básicas del almacenamiento
   */
  obtenerEstadisticas(): {
    totalCuentas: number;
    cuentasPagadas: number;
    cuentasPendientes: number;
    serviciosUnicos: number;
    rangoFechas: { inicio?: Date; fin?: Date };
  } {
    const cuentas = this.obtenerCuentas();
    
    const cuentasPagadas = cuentas.filter(c => c.pagada).length;
    const serviciosUnicos = new Set(cuentas.map(c => c.tipoServicio)).size;
    
    const fechas = cuentas.map(c => c.fechaVencimiento).sort((a, b) => a.getTime() - b.getTime());
    
    return {
      totalCuentas: cuentas.length,
      cuentasPagadas,
      cuentasPendientes: cuentas.length - cuentasPagadas,
      serviciosUnicos,
      rangoFechas: {
        inicio: fechas[0],
        fin: fechas[fechas.length - 1]
      }
    };
  }
}

// Instancia singleton del servicio
export const servicioAlmacenamiento = new ServicioAlmacenamiento();
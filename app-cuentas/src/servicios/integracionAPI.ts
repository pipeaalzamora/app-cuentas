// Servicio para integración con APIs externas de servicios

import type {
  ConfiguracionProveedor,
  DatosImportadosAPI,
  RequestImportacion,
  ResultadoImportacion,
  RespuestaAPI,
  EstadoSincronizacion,
  ErrorImportacion
} from '../tipos';
import type { CuentaServicio } from '../tipos';
import { servicioAlmacenamiento } from './almacenamiento';

class ServicioIntegracionAPI {
  private proveedores: Map<string, ConfiguracionProveedor> = new Map();
  private estadoSincronizacion: EstadoSincronizacion = {
    sincronizando: false,
    proveedoresSincronizados: []
  };

  /**
   * Registra un nuevo proveedor de servicios
   */
  registrarProveedor(proveedor: ConfiguracionProveedor): void {
    this.proveedores.set(proveedor.id, proveedor);
    this.guardarProveedores();
  }

  /**
   * Obtiene todos los proveedores registrados
   */
  obtenerProveedores(): ConfiguracionProveedor[] {
    return Array.from(this.proveedores.values());
  }

  /**
   * Obtiene un proveedor específico
   */
  obtenerProveedor(id: string): ConfiguracionProveedor | undefined {
    return this.proveedores.get(id);
  }

  /**
   * Actualiza configuración de un proveedor
   */
  actualizarProveedor(id: string, actualizacion: Partial<ConfiguracionProveedor>): void {
    const proveedor = this.proveedores.get(id);
    if (proveedor) {
      this.proveedores.set(id, { ...proveedor, ...actualizacion });
      this.guardarProveedores();
    }
  }

  /**
   * Elimina un proveedor
   */
  eliminarProveedor(id: string): boolean {
    const eliminado = this.proveedores.delete(id);
    if (eliminado) {
      this.guardarProveedores();
    }
    return eliminado;
  }

  /**
   * Importa datos desde un proveedor específico
   */
  async importarDatos(request: RequestImportacion): Promise<ResultadoImportacion> {
    const proveedor = this.proveedores.get(request.proveedorId);
    
    if (!proveedor) {
      throw new Error(`Proveedor no encontrado: ${request.proveedorId}`);
    }

    if (!proveedor.activo) {
      throw new Error(`Proveedor desactivado: ${proveedor.nombre}`);
    }

    try {
      this.estadoSincronizacion.sincronizando = true;
      
      // Simular llamada a API externa
      const datosImportados = await this.llamarAPIProveedor(proveedor, request);
      
      // Convertir datos importados a cuentas
      const resultado = await this.procesarDatosImportados(datosImportados, proveedor);
      
      // Actualizar estado de sincronización
      this.estadoSincronizacion.ultimaSincronizacion = new Date();
      if (!this.estadoSincronizacion.proveedoresSincronizados.includes(proveedor.id)) {
        this.estadoSincronizacion.proveedoresSincronizados.push(proveedor.id);
      }
      
      return resultado;
    } catch (error) {
      this.estadoSincronizacion.error = error instanceof Error ? error.message : 'Error desconocido';
      throw error;
    } finally {
      this.estadoSincronizacion.sincronizando = false;
    }
  }

  /**
   * Sincroniza datos de todos los proveedores activos
   */
  async sincronizarTodos(): Promise<Map<string, ResultadoImportacion>> {
    const resultados = new Map<string, ResultadoImportacion>();
    const proveedoresActivos = Array.from(this.proveedores.values()).filter(p => p.activo);

    for (const proveedor of proveedoresActivos) {
      try {
        const resultado = await this.importarDatos({
          proveedorId: proveedor.id,
          numeroCliente: '' // Debería obtenerse de configuración del usuario
        });
        resultados.set(proveedor.id, resultado);
      } catch (error) {
        resultados.set(proveedor.id, {
          exitosas: 0,
          fallidas: 1,
          cuentasImportadas: [],
          errores: [{
            motivo: error instanceof Error ? error.message : 'Error desconocido'
          }]
        });
      }
    }

    return resultados;
  }

  /**
   * Obtiene el estado actual de sincronización
   */
  obtenerEstadoSincronizacion(): EstadoSincronizacion {
    return { ...this.estadoSincronizacion };
  }

  /**
   * Llama a la API del proveedor (método privado para implementar)
   */
  private async llamarAPIProveedor(
    proveedor: ConfiguracionProveedor,
    request: RequestImportacion
  ): Promise<DatosImportadosAPI[]> {
    // Esta es una implementación de ejemplo
    // En producción, aquí iría la lógica específica para cada proveedor
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (proveedor.apiKey) {
      headers['Authorization'] = `Bearer ${proveedor.apiKey}`;
    }

    const url = new URL(proveedor.apiUrl);
    url.searchParams.append('numeroCliente', request.numeroCliente);
    
    if (request.periodo) {
      url.searchParams.append('desde', request.periodo.desde.toISOString());
      url.searchParams.append('hasta', request.periodo.hasta.toISOString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Error en API: ${response.status} ${response.statusText}`);
    }

    const data: RespuestaAPI<DatosImportadosAPI[]> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error?.message || 'Error al obtener datos');
    }

    return data.data;
  }

  /**
   * Procesa datos importados y los convierte a cuentas
   */
  private async procesarDatosImportados(
    datosImportados: DatosImportadosAPI[],
    proveedor: ConfiguracionProveedor
  ): Promise<ResultadoImportacion> {
    const cuentasImportadas: CuentaServicio[] = [];
    const errores: ErrorImportacion[] = [];
    let exitosas = 0;
    let fallidas = 0;

    for (const dato of datosImportados) {
      try {
        const cuenta = this.convertirACuenta(dato, proveedor);
        const cuentaGuardada = await servicioAlmacenamiento.guardarCuenta(cuenta);
        cuentasImportadas.push(cuentaGuardada);
        exitosas++;
      } catch (error) {
        fallidas++;
        errores.push({
          numeroFactura: dato.numeroFactura,
          motivo: error instanceof Error ? error.message : 'Error desconocido',
          detalles: JSON.stringify(dato)
        });
      }
    }

    return {
      exitosas,
      fallidas,
      cuentasImportadas,
      errores
    };
  }

  /**
   * Convierte datos importados a formato de cuenta
   */
  private convertirACuenta(
    dato: DatosImportadosAPI,
    proveedor: ConfiguracionProveedor
  ): Omit<CuentaServicio, 'id' | 'fechaCreacion' | 'fechaActualizacion'> {
    const fechaVencimiento = new Date(dato.fechaVencimiento);
    
    return {
      servicio: proveedor.servicio,
      monto: dato.monto,
      fechaVencimiento,
      mes: fechaVencimiento.getMonth(),
      año: fechaVencimiento.getFullYear(),
      pagada: false,
      saldoAnterior: dato.saldoAnterior,
      consumoActual: dato.consumoActual,
      montoTotal: dato.monto,
      fechaEmision: dato.fechaEmision,
      numeroFactura: dato.numeroFactura,
      numeroMedidor: dato.numeroMedidor,
      lecturaAnterior: dato.lecturaAnterior,
      lecturaActual: dato.lecturaActual,
      consumoUnidades: dato.lecturaActual && dato.lecturaAnterior 
        ? dato.lecturaActual - dato.lecturaAnterior 
        : undefined
    };
  }

  /**
   * Guarda proveedores en localStorage
   */
  private guardarProveedores(): void {
    const proveedoresArray = Array.from(this.proveedores.values());
    localStorage.setItem('proveedores-api', JSON.stringify(proveedoresArray));
  }

  /**
   * Carga proveedores desde localStorage
   */
  cargarProveedores(): void {
    try {
      const datos = localStorage.getItem('proveedores-api');
      if (datos) {
        const proveedoresArray: ConfiguracionProveedor[] = JSON.parse(datos);
        proveedoresArray.forEach(proveedor => {
          this.proveedores.set(proveedor.id, proveedor);
        });
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  }

  /**
   * Valida la conexión con un proveedor
   */
  async validarConexion(proveedorId: string): Promise<boolean> {
    const proveedor = this.proveedores.get(proveedorId);
    
    if (!proveedor) {
      return false;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (proveedor.apiKey) {
        headers['Authorization'] = `Bearer ${proveedor.apiKey}`;
      }

      const response = await fetch(`${proveedor.apiUrl}/health`, {
        method: 'GET',
        headers
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

export const servicioIntegracionAPI = new ServicioIntegracionAPI();

// Cargar proveedores al inicializar
servicioIntegracionAPI.cargarProveedores();

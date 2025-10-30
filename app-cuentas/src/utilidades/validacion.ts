import { ZodError, type ZodSchema } from 'zod';

// Tipo para resultado de validación
export interface ResultadoValidacion<T> {
  exito: boolean;
  datos?: T;
  errores?: Record<string, string>;
  mensajeError?: string;
}

/**
 * Valida datos usando un esquema Zod y retorna un resultado estructurado
 */
export function validarDatos<T>(
  esquema: ZodSchema<T>,
  datos: unknown
): ResultadoValidacion<T> {
  try {
    const datosValidados = esquema.parse(datos);
    return {
      exito: true,
      datos: datosValidados
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errores: Record<string, string> = {};
      
      error.issues.forEach((err) => {
        const campo = err.path.join('.');
        errores[campo] = err.message;
      });

      return {
        exito: false,
        errores,
        mensajeError: 'Datos de entrada inválidos'
      };
    }

    return {
      exito: false,
      mensajeError: 'Error de validación desconocido'
    };
  }
}

/**
 * Valida datos de forma segura y retorna solo los datos válidos o null
 */
export function validarSeguro<T>(
  esquema: ZodSchema<T>,
  datos: unknown
): T | null {
  const resultado = validarDatos(esquema, datos);
  return resultado.exito ? resultado.datos! : null;
}

/**
 * Formatea errores de validación para mostrar al usuario
 */
export function formatearErroresValidacion(errores: Record<string, string>): string {
  const mensajes = Object.values(errores);
  if (mensajes.length === 1) {
    return mensajes[0];
  }
  
  return `Se encontraron ${mensajes.length} errores:\n${mensajes.map(msg => `• ${msg}`).join('\n')}`;
}

/**
 * Valida que una fecha no sea anterior a la fecha actual
 */
export function validarFechaFutura(fecha: Date): boolean {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
  return fecha >= hoy;
}

/**
 * Valida que un monto sea un número válido y positivo
 */
export function validarMonto(monto: unknown): boolean {
  return typeof monto === 'number' && 
         !isNaN(monto) && 
         isFinite(monto) && 
         monto > 0;
}

/**
 * Valida que un año esté en el rango permitido
 */
export function validarAño(año: number): boolean {
  const añoActual = new Date().getFullYear();
  return año >= 2020 && año <= añoActual + 10;
}

/**
 * Valida que un mes esté en el rango 1-12
 */
export function validarMes(mes: number): boolean {
  return Number.isInteger(mes) && mes >= 1 && mes <= 12;
}

/**
 * Valida la integridad de una cuenta de servicio
 */
export function validarIntegridadCuenta(cuenta: any): { valida: boolean; errores: string[] } {
  const errores: string[] = [];

  if (!cuenta || typeof cuenta !== 'object') {
    errores.push('La cuenta debe ser un objeto válido');
    return { valida: false, errores };
  }

  // Validar ID
  if (!cuenta.id || typeof cuenta.id !== 'string') {
    errores.push('ID de cuenta inválido o faltante');
  }

  // Validar tipo de servicio
  const tiposValidos = ['luz', 'agua', 'gas', 'internet'];
  if (!tiposValidos.includes(cuenta.tipoServicio)) {
    errores.push(`Tipo de servicio inválido: ${cuenta.tipoServicio}`);
  }

  // Validar monto
  if (!validarMonto(cuenta.monto)) {
    errores.push('Monto inválido: debe ser un número positivo');
  }

  // Validar fechas
  try {
    const fechaVencimiento = new Date(cuenta.fechaVencimiento);
    if (isNaN(fechaVencimiento.getTime())) {
      errores.push('Fecha de vencimiento inválida');
    }

    const fechaCreacion = new Date(cuenta.fechaCreacion);
    if (isNaN(fechaCreacion.getTime())) {
      errores.push('Fecha de creación inválida');
    }

    if (cuenta.fechaActualizacion) {
      const fechaActualizacion = new Date(cuenta.fechaActualizacion);
      if (isNaN(fechaActualizacion.getTime())) {
        errores.push('Fecha de actualización inválida');
      }
    }
  } catch (error) {
    errores.push('Error al validar fechas');
  }

  // Validar mes y año
  if (!validarMes(cuenta.mes)) {
    errores.push(`Mes inválido: ${cuenta.mes}`);
  }

  if (!validarAño(cuenta.año)) {
    errores.push(`Año inválido: ${cuenta.año}`);
  }

  // Validar estado de pago
  if (typeof cuenta.pagada !== 'boolean') {
    errores.push('Estado de pago debe ser verdadero o falso');
  }

  return {
    valida: errores.length === 0,
    errores
  };
}

/**
 * Valida la integridad de un conjunto de cuentas
 */
export function validarIntegridadCuentas(cuentas: any[]): { 
  validas: number; 
  invalidas: number; 
  errores: Array<{ indice: number; errores: string[] }>;
  duplicados: string[];
} {
  if (!Array.isArray(cuentas)) {
    return {
      validas: 0,
      invalidas: 0,
      errores: [{ indice: -1, errores: ['Los datos deben ser un array'] }],
      duplicados: []
    };
  }

  const errores: Array<{ indice: number; errores: string[] }> = [];
  const idsVistos = new Set<string>();
  const duplicados: string[] = [];
  let validas = 0;

  cuentas.forEach((cuenta, indice) => {
    const resultado = validarIntegridadCuenta(cuenta);
    
    if (!resultado.valida) {
      errores.push({ indice, errores: resultado.errores });
    } else {
      validas++;
    }

    // Verificar duplicados de ID
    if (cuenta.id) {
      if (idsVistos.has(cuenta.id)) {
        duplicados.push(cuenta.id);
      } else {
        idsVistos.add(cuenta.id);
      }
    }
  });

  return {
    validas,
    invalidas: cuentas.length - validas,
    errores,
    duplicados
  };
}

/**
 * Sanitiza y repara datos de cuentas cuando sea posible
 */
export function sanitizarCuentas(cuentas: any[]): { 
  cuentasReparadas: any[]; 
  cuentasDescartadas: number;
  reparaciones: string[];
} {
  if (!Array.isArray(cuentas)) {
    return {
      cuentasReparadas: [],
      cuentasDescartadas: 0,
      reparaciones: ['Datos no válidos: se esperaba un array']
    };
  }

  const cuentasReparadas: any[] = [];
  const reparaciones: string[] = [];
  let descartadas = 0;

  cuentas.forEach((cuenta, indice) => {
    try {
      const cuentaReparada = { ...cuenta };
      let reparada = false;

      // Reparar ID faltante
      if (!cuentaReparada.id) {
        cuentaReparada.id = `cuenta_reparada_${Date.now()}_${indice}`;
        reparaciones.push(`Cuenta ${indice}: ID generado automáticamente`);
        reparada = true;
      }

      // Reparar fechas
      try {
        if (cuentaReparada.fechaVencimiento) {
          cuentaReparada.fechaVencimiento = new Date(cuentaReparada.fechaVencimiento);
        }
        if (cuentaReparada.fechaCreacion) {
          cuentaReparada.fechaCreacion = new Date(cuentaReparada.fechaCreacion);
        }
        if (cuentaReparada.fechaActualizacion) {
          cuentaReparada.fechaActualizacion = new Date(cuentaReparada.fechaActualizacion);
        }
      } catch (error) {
        reparaciones.push(`Cuenta ${indice}: Error al reparar fechas`);
      }

      // Reparar estado de pago
      if (typeof cuentaReparada.pagada !== 'boolean') {
        cuentaReparada.pagada = false;
        reparaciones.push(`Cuenta ${indice}: Estado de pago establecido como falso`);
        reparada = true;
      }

      // Validar si la cuenta reparada es válida
      const validacion = validarIntegridadCuenta(cuentaReparada);
      
      if (validacion.valida || reparada) {
        cuentasReparadas.push(cuentaReparada);
      } else {
        descartadas++;
        reparaciones.push(`Cuenta ${indice}: Descartada por errores irreparables: ${validacion.errores.join(', ')}`);
      }
    } catch (error) {
      descartadas++;
      reparaciones.push(`Cuenta ${indice}: Error durante reparación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  });

  return {
    cuentasReparadas,
    cuentasDescartadas: descartadas,
    reparaciones
  };
}

/**
 * Valida la estructura del almacenamiento local
 */
export function validarEstructuraAlmacenamiento(datos: any): { 
  valida: boolean; 
  errores: string[];
  advertencias: string[];
} {
  const errores: string[] = [];
  const advertencias: string[] = [];

  if (!datos || typeof datos !== 'object') {
    errores.push('Los datos deben ser un objeto válido');
    return { valida: false, errores, advertencias };
  }

  // Validar estructura básica
  if (!Object.prototype.hasOwnProperty.call(datos, 'cuentas')) {
    errores.push('Falta la propiedad "cuentas"');
  } else if (!Array.isArray(datos.cuentas)) {
    errores.push('La propiedad "cuentas" debe ser un array');
  }

  if (!Object.prototype.hasOwnProperty.call(datos, 'configuracion')) {
    advertencias.push('Falta la configuración de usuario');
  } else if (typeof datos.configuracion !== 'object') {
    errores.push('La configuración debe ser un objeto');
  }

  if (!Object.prototype.hasOwnProperty.call(datos, 'version')) {
    advertencias.push('Falta información de versión');
  } else if (typeof datos.version !== 'string') {
    errores.push('La versión debe ser una cadena de texto');
  }

  // Validar cuentas si existen
  if (Array.isArray(datos.cuentas)) {
    const validacionCuentas = validarIntegridadCuentas(datos.cuentas);
    
    if (validacionCuentas.invalidas > 0) {
      advertencias.push(`${validacionCuentas.invalidas} cuentas tienen errores de integridad`);
    }

    if (validacionCuentas.duplicados.length > 0) {
      errores.push(`Se encontraron IDs duplicados: ${validacionCuentas.duplicados.join(', ')}`);
    }
  }

  return {
    valida: errores.length === 0,
    errores,
    advertencias
  };
}
import { z } from 'zod';

// Esquema para tipo de servicio
export const esquemaTipoServicio = z.enum(['luz', 'agua', 'gas', 'internet']);

// Esquema para validación de CuentaServicio (expandido con campos opcionales)
export const esquemaCuentaServicio = z.object({
  id: z.string().min(1, 'ID es requerido'),
  tipoServicio: esquemaTipoServicio,
  
  // Montos y saldos (opcionales para compatibilidad)
  saldoAnterior: z.number().min(0, 'El saldo anterior no puede ser negativo').default(0).optional(),
  consumoActual: z.number().positive('El consumo actual debe ser mayor a cero').optional(),
  otrosCargos: z.number().min(0, 'Otros cargos no pueden ser negativos').default(0).optional(),
  descuentos: z.number().min(0, 'Los descuentos no pueden ser negativos').default(0).optional(),
  monto: z.number().positive('El monto total debe ser mayor a cero'),
  
  // Fechas del ciclo de facturación (opcionales para compatibilidad)
  fechaEmision: z.date().optional(),
  fechaCorte: z.date().optional(),
  fechaLectura: z.date().optional(),
  proximaFechaLectura: z.date().optional(),
  fechaVencimiento: z.date(),
  
  // Datos de consumo (opcionales para servicios no medidos como internet)
  lecturaAnterior: z.number().min(0).optional(),
  lecturaActual: z.number().min(0).optional(),
  consumoUnidades: z.number().min(0).optional(),
  precioPorUnidad: z.number().positive().optional(),
  unidadMedida: z.string().optional(),
  
  // Información adicional
  numeroFactura: z.string().optional(),
  numeroCliente: z.string().optional(),
  observaciones: z.string().optional(),
  
  // Campos de control
  mes: z.number()
    .int('El mes debe ser un número entero')
    .min(1, 'El mes debe ser entre 1 y 12')
    .max(12, 'El mes debe ser entre 1 y 12'),
  año: z.number()
    .int('El año debe ser un número entero')
    .min(2020, 'El año debe ser mayor a 2020')
    .max(2050, 'El año debe ser menor a 2050'),
  pagada: z.boolean().default(false),
  fechaCreacion: z.date().default(() => new Date()),
  fechaActualizacion: z.date().optional()
});

// Esquema para formulario básico (modo simple)
export const esquemaFormularioCuentaBasica = z.object({
  tipoServicio: esquemaTipoServicio,
  monto: z.number()
    .positive('El monto debe ser mayor a cero')
    .max(99999999, 'El monto no puede exceder 99,999,999'),
  fechaVencimiento: z.date(),
  fechaEmision: z.date(),
  fechaCorte: z.date(),
  proximaFechaLectura: z.date(),
  mes: z.number()
    .int('El mes debe ser un número entero')
    .min(1, 'El mes debe ser entre 1 y 12')
    .max(12, 'El mes debe ser entre 1 y 12'),
  pagada: z.boolean().default(false),
  observaciones: z.string().optional()
});

// Esquema para formulario completo (modo avanzado)
export const esquemaFormularioCuentaCompleta = z.object({
  tipoServicio: esquemaTipoServicio,
  
  // Montos y saldos
  saldoAnterior: z.number().min(0, 'El saldo anterior no puede ser negativo').default(0),
  consumoActual: z.number().positive('El consumo actual debe ser mayor a cero'),
  otrosCargos: z.number().min(0, 'Otros cargos no pueden ser negativos').default(0),
  descuentos: z.number().min(0, 'Los descuentos no pueden ser negativos').default(0),
  
  // Fechas del ciclo de facturación
  fechaEmision: z.date(),
  fechaCorte: z.date(),
  fechaLectura: z.date(),
  proximaFechaLectura: z.date().optional(),
  fechaVencimiento: z.date(),
  
  // Datos de consumo (opcionales)
  lecturaAnterior: z.number().min(0).optional(),
  lecturaActual: z.number().min(0).optional(),
  consumoUnidades: z.number().min(0).optional(),
  precioPorUnidad: z.number().positive().optional(),
  unidadMedida: z.string().optional(),
  
  // Información adicional
  numeroFactura: z.string().optional(),
  numeroCliente: z.string().optional(),
  observaciones: z.string().optional(),
  
  // Campos de control
  mes: z.number()
    .int('El mes debe ser un número entero')
    .min(1, 'El mes debe ser entre 1 y 12')
    .max(12, 'El mes debe ser entre 1 y 12'),
  año: z.number()
    .int('El año debe ser un número entero')
    .min(2020, 'El año debe ser mayor a 2020')
    .max(2050, 'El año debe ser menor a 2050'),
  pagada: z.boolean().default(false)
});

// Mantener compatibilidad con el esquema anterior
export const esquemaFormularioCuenta = esquemaFormularioCuentaBasica;

// Esquema para configuración de usuario
export const esquemaConfiguracionUsuario = z.object({
  monedaDefault: z.string().min(1, 'La moneda es requerida').default('$'),
  recordatoriosActivos: z.boolean().default(true),
  temaOscuro: z.boolean().default(false)
});

// Esquema para período de reporte
export const esquemaPeriodoReporte = z.object({
  mes: z.number()
    .int()
    .min(1, 'El mes debe ser entre 1 y 12')
    .max(12, 'El mes debe ser entre 1 y 12')
    .optional(),
  año: z.number()
    .int()
    .min(2020, 'El año debe ser mayor a 2020')
    .max(2050, 'El año debe ser menor a 2050'),
  mesInicio: z.number()
    .int()
    .min(1, 'El mes de inicio debe ser entre 1 y 12')
    .max(12, 'El mes de inicio debe ser entre 1 y 12')
    .optional(),
  mesFin: z.number()
    .int()
    .min(1, 'El mes de fin debe ser entre 1 y 12')
    .max(12, 'El mes de fin debe ser entre 1 y 12')
    .optional()
}).refine((data) => {
  // Validar que mesInicio sea menor o igual a mesFin si ambos están presentes
  if (data.mesInicio && data.mesFin) {
    return data.mesInicio <= data.mesFin;
  }
  return true;
}, {
  message: 'El mes de inicio debe ser menor o igual al mes de fin',
  path: ['mesFin']
});

// Esquema para configuración de reporte
export const esquemaConfiguracionReporte = z.object({
  tipo: z.enum(['mensual', 'planilla', 'anual']),
  periodo: esquemaPeriodoReporte,
  incluirGraficos: z.boolean().default(true)
});

// Esquema para filtros de cuentas
export const esquemaFiltrosCuentas = z.object({
  mes: z.number()
    .int()
    .min(1, 'El mes debe ser entre 1 y 12')
    .max(12, 'El mes debe ser entre 1 y 12')
    .optional(),
  año: z.number()
    .int()
    .min(2020, 'El año debe ser mayor a 2020')
    .max(2050, 'El año debe ser menor a 2050')
    .optional(),
  tipoServicio: esquemaTipoServicio.optional(),
  pagada: z.boolean().optional()
});

// Esquema para almacenamiento local
export const esquemaAlmacenamientoLocal = z.object({
  cuentas: z.array(esquemaCuentaServicio),
  configuracion: esquemaConfiguracionUsuario,
  version: z.string().min(1, 'La versión es requerida')
});

// Esquema para estadísticas mensuales
export const esquemaEstadisticasMensuales = z.object({
  mes: z.number()
    .int()
    .min(1, 'El mes debe ser entre 1 y 12')
    .max(12, 'El mes debe ser entre 1 y 12'),
  año: z.number()
    .int()
    .min(2020, 'El año debe ser mayor a 2020')
    .max(2050, 'El año debe ser menor a 2050'),
  totalGastos: z.number().min(0, 'El total de gastos no puede ser negativo'),
  gastosPorServicio: z.record(esquemaTipoServicio, z.number().min(0)),
  promedioMensual: z.number().min(0, 'El promedio mensual no puede ser negativo'),
  comparativaAnterior: z.number() // Puede ser negativo (disminución)
});

// Tipos inferidos de los esquemas
export type CuentaServicioValidada = z.infer<typeof esquemaCuentaServicio>;
export type FormularioCuentaValidada = z.infer<typeof esquemaFormularioCuenta>;
export type ConfiguracionUsuarioValidada = z.infer<typeof esquemaConfiguracionUsuario>;
export type ConfiguracionReporteValidada = z.infer<typeof esquemaConfiguracionReporte>;
export type FiltrosCuentasValidadas = z.infer<typeof esquemaFiltrosCuentas>;
export type AlmacenamientoLocalValidado = z.infer<typeof esquemaAlmacenamientoLocal>;
export type EstadisticasMensualesValidadas = z.infer<typeof esquemaEstadisticasMensuales>;
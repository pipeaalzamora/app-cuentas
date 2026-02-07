// Tipos para predicción de gastos futuros

import type { TipoServicio } from './index';

// Predicción individual por servicio
export interface PrediccionServicio {
  servicio: TipoServicio;
  montoPredicho: number;
  confianza: number; // 0-1, donde 1 es máxima confianza
  tendencia: 'ascendente' | 'descendente' | 'estable';
  variacionPorcentual: number;
}

// Predicción mensual completa
export interface PrediccionMensual {
  mes: number;
  año: number;
  totalPredicho: number;
  prediccionesPorServicio: PrediccionServicio[];
  confianzaGeneral: number;
  basadoEnMeses: number; // Cantidad de meses históricos usados
}

// Datos históricos para análisis
export interface DatosHistoricos {
  mes: number;
  año: number;
  servicio: TipoServicio;
  monto: number;
}

// Estadísticas de tendencia
export interface EstadisticasTendencia {
  promedio: number;
  mediana: number;
  desviacionEstandar: number;
  minimo: number;
  maximo: number;
  tendenciaLineal: {
    pendiente: number;
    intercepto: number;
  };
}

// Configuración para predicción
export interface ConfiguracionPrediccion {
  mesesHistoricos: number; // Cantidad de meses a considerar
  factorEstacionalidad: boolean; // Considerar estacionalidad
  ajustarInflacion: boolean; // Ajustar por inflación estimada
  tasaInflacionAnual?: number; // Tasa de inflación anual (ej: 0.05 = 5%)
}

// Resultado de análisis de patrones
export interface AnalisisPatrones {
  tienePatronEstacional: boolean;
  mesesPico: number[]; // Meses con mayor consumo
  mesesBajo: number[]; // Meses con menor consumo
  variabilidad: 'alta' | 'media' | 'baja';
}

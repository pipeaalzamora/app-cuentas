// Tipos para el Desglosador de Gastos del Bebé

export type TipoGastoBebe = 
  | 'alimentacion' 
  | 'panales' 
  | 'ropa' 
  | 'salud' 
  | 'muebles' 
  | 'juguetes' 
  | 'guarderia' 
  | 'educacion' 
  | 'higiene' 
  | 'otro';

export interface GastoBebe {
  id: string;
  descripcion: string;
  monto: number;
  cantidad: number;
  tipo: TipoGastoBebe;
  fecha: Date;
  notas?: string;
  enlaceProducto?: string;
}

export interface DesgloseBebe {
  id: string;
  presupuestoMensual: number;
  gastos: GastoBebe[];
  fechaCreacion: Date;
  mes: number;
  año: number;
  nombre?: string;
}

export interface ResumenDesgloseBebe {
  presupuestoMensual: number;
  totalGastos: number;
  saldoRestante: number;
  gastosPorTipo: Record<TipoGastoBebe, number>;
  porcentajeGastado: number;
}

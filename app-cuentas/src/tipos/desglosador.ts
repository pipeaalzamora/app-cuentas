// Tipos para el Desglosador de Sueldo

export type TipoGasto = 'pago' | 'compra' | 'suscripcion' | 'cuenta' | 'deuda' | 'otro';

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  tipo: TipoGasto;
  fecha: Date;
  categoria?: string;
}

export interface DesgloseSueldo {
  id: string;
  sueldoInicial: number;
  gastos: Gasto[];
  fechaCreacion: Date;
  mes: number;
  año: number;
  nombre?: string;
}

export interface ResumenDesglose {
  sueldoInicial: number;
  totalGastos: number;
  saldoRestante: number;
  gastosPorTipo: Record<TipoGasto, number>;
  porcentajeGastado: number;
}

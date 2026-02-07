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

export interface GastoBebeRef {
  id: string;
  descripcion: string;
  monto: number;
  cantidad: number;
  tipo: string;
  fecha: Date;
  desgloseBebeId: string;
}

export interface GastoGeneralRef {
  id: string;
  titulo: string;
  monto: number;
  cantidad: number;
  fecha: Date;
}

export interface DesgloseSueldo {
  id: string;
  sueldoInicial: number;
  gastos: Gasto[];
  gastosBebe: GastoBebeRef[];
  gastosGenerales: GastoGeneralRef[];
  fechaCreacion: Date;
  mes: number;
  año: number;
  nombre?: string;
}

export interface ResumenDesglose {
  sueldoInicial: number;
  totalGastos: number;
  totalGastosBebe: number;
  totalGastosGenerales: number;
  totalDescuentos: number;
  saldoRestante: number;
  gastosPorTipo: Record<TipoGasto, number>;
  porcentajeGastado: number;
}

export interface GastoCalculadora {
  id: string;
  titulo: string;
  monto: number;
  cantidad: number;
  fecha: Date;
}

export interface CalculadoraGastos {
  id: string;
  gastos: GastoCalculadora[];
  fechaCreacion: Date;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ResumenCalculadora {
  totalGastos: number;
  cantidadGastos: number;
}

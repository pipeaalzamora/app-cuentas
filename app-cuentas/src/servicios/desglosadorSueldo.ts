import type { DesgloseSueldo, ResumenDesglose, TipoGasto } from '../tipos/desglosador';

const STORAGE_KEY = 'desgloses-sueldo';

class ServicioDesglosadorSueldo {
  obtenerDesgloses(): DesgloseSueldo[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const desgloses = JSON.parse(data);
    return desgloses.map((d: any) => ({
      ...d,
      fechaCreacion: new Date(d.fechaCreacion),
      gastos: d.gastos.map((g: any) => ({
        ...g,
        fecha: new Date(g.fecha)
      }))
    }));
  }

  guardarDesglose(desglose: DesgloseSueldo): void {
    const desgloses = this.obtenerDesgloses();
    const index = desgloses.findIndex(d => d.id === desglose.id);
    
    if (index >= 0) {
      desgloses[index] = desglose;
    } else {
      desgloses.push(desglose);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(desgloses));
  }

  eliminarDesglose(id: string): void {
    const desgloses = this.obtenerDesgloses().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(desgloses));
  }

  calcularResumen(desglose: DesgloseSueldo): ResumenDesglose {
    const totalGastos = desglose.gastos.reduce((sum, g) => sum + g.monto, 0);
    const saldoRestante = desglose.sueldoInicial - totalGastos;
    
    const gastosPorTipo: Record<TipoGasto, number> = {
      pago: 0,
      compra: 0,
      suscripcion: 0,
      cuenta: 0,
      deuda: 0,
      otro: 0
    };
    
    desglose.gastos.forEach(g => {
      gastosPorTipo[g.tipo] += g.monto;
    });
    
    return {
      sueldoInicial: desglose.sueldoInicial,
      totalGastos,
      saldoRestante,
      gastosPorTipo,
      porcentajeGastado: desglose.sueldoInicial > 0 ? (totalGastos / desglose.sueldoInicial) * 100 : 0
    };
  }
}

export const servicioDesglosadorSueldo = new ServicioDesglosadorSueldo();
export { ServicioDesglosadorSueldo };

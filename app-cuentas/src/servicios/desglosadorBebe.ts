import type { DesgloseBebe, ResumenDesgloseBebe, TipoGastoBebe } from '../tipos/desglosadorBebe';

const STORAGE_KEY = 'desgloses-bebe';

class ServicioDesglosadorBebe {
  obtenerDesgloses(): DesgloseBebe[] {
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

  guardarDesglose(desglose: DesgloseBebe): void {
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

  calcularResumen(desglose: DesgloseBebe): ResumenDesgloseBebe {
    const totalGastos = desglose.gastos.reduce((sum, g) => sum + (g.monto * g.cantidad), 0);
    const saldoRestante = desglose.presupuestoMensual - totalGastos;
    
    const gastosPorTipo: Record<TipoGastoBebe, number> = {
      alimentacion: 0,
      panales: 0,
      ropa: 0,
      salud: 0,
      muebles: 0,
      juguetes: 0,
      guarderia: 0,
      educacion: 0,
      higiene: 0,
      otro: 0
    };
    
    desglose.gastos.forEach(g => {
      gastosPorTipo[g.tipo] += (g.monto * g.cantidad);
    });
    
    return {
      presupuestoMensual: desglose.presupuestoMensual,
      totalGastos,
      saldoRestante,
      gastosPorTipo,
      porcentajeGastado: desglose.presupuestoMensual > 0 ? (totalGastos / desglose.presupuestoMensual) * 100 : 0
    };
  }
}

export const servicioDesglosadorBebe = new ServicioDesglosadorBebe();
export { ServicioDesglosadorBebe };

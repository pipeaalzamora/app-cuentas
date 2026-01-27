import type { DesgloseBebe, ResumenDesgloseBebe, TipoGastoBebe } from '../tipos/desglosadorBebe';
import { desgloseBebeAPI } from './desgloseBebeAPI';

class ServicioDesglosadorBebe {
  async obtenerDesgloses(): Promise<DesgloseBebe[]> {
    try {
      const desgloses = await desgloseBebeAPI.obtenerTodos();
      return desgloses.map((d: any) => ({
        ...d,
        fechaCreacion: new Date(d.fechaCreacion),
        gastos: d.gastos.map((g: any) => ({
          ...g,
          fecha: new Date(g.fecha)
        }))
      }));
    } catch (error) {
      console.error('Error al obtener desgloses bebé:', error);
      return [];
    }
  }

  async guardarDesglose(desglose: DesgloseBebe): Promise<DesgloseBebe> {
    try {
      // Verificar si ya existe
      const desgloses = await this.obtenerDesgloses();
      const existe = desgloses.some(d => d.id === desglose.id);
      
      if (existe) {
        return await desgloseBebeAPI.actualizar(desglose.id, desglose);
      } else {
        return await desgloseBebeAPI.crear(desglose);
      }
    } catch (error) {
      console.error('Error al guardar desglose bebé:', error);
      throw error;
    }
  }

  async eliminarDesglose(id: string): Promise<void> {
    try {
      await desgloseBebeAPI.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar desglose bebé:', error);
      throw error;
    }
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

import type { DesgloseSueldo, ResumenDesglose, TipoGasto } from '../tipos/desglosador';
import { desgloseSueldoAPI } from './desgloseSueldoAPI';

class ServicioDesglosadorSueldo {
  async obtenerDesgloses(): Promise<DesgloseSueldo[]> {
    try {
      const desgloses = await desgloseSueldoAPI.obtenerTodos();
      return desgloses.map((d: any) => ({
        ...d,
        fechaCreacion: new Date(d.fechaCreacion),
        gastos: d.gastos.map((g: any) => ({
          ...g,
          fecha: new Date(g.fecha)
        }))
      }));
    } catch (error) {
      console.error('Error al obtener desgloses:', error);
      return [];
    }
  }

  async guardarDesglose(desglose: DesgloseSueldo): Promise<DesgloseSueldo> {
    try {
      // Verificar si ya existe
      const desgloses = await this.obtenerDesgloses();
      const existe = desgloses.some(d => d.id === desglose.id);
      
      if (existe) {
        return await desgloseSueldoAPI.actualizar(desglose.id, desglose);
      } else {
        return await desgloseSueldoAPI.crear(desglose);
      }
    } catch (error) {
      console.error('Error al guardar desglose:', error);
      throw error;
    }
  }

  async eliminarDesglose(id: string): Promise<void> {
    try {
      await desgloseSueldoAPI.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar desglose:', error);
      throw error;
    }
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

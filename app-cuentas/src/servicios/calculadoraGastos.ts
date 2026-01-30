import type { CalculadoraGastos, ResumenCalculadora } from '../tipos/calculadoraGastos';
import { calculadoraGastosAPI } from './calculadoraGastosAPI';

class ServicioCalculadoraGastos {
  async obtenerCalculadora(): Promise<CalculadoraGastos | null> {
    try {
      const calculadora = await calculadoraGastosAPI.obtener();
      return {
        ...calculadora,
        fechaCreacion: new Date(calculadora.fechaCreacion),
        gastos: calculadora.gastos?.map((g: any) => ({
          ...g,
          fecha: new Date(g.fecha)
        })) || []
      };
    } catch (error) {
      console.error('Error al obtener calculadora:', error);
      return null;
    }
  }

  calcularResumen(calculadora: CalculadoraGastos): ResumenCalculadora {
    const totalGastos = calculadora.gastos.reduce((sum, g) => sum + (g.monto * g.cantidad), 0);
    
    return {
      totalGastos,
      cantidadGastos: calculadora.gastos.length
    };
  }
}

export const servicioCalculadoraGastos = new ServicioCalculadoraGastos();
export { ServicioCalculadoraGastos };

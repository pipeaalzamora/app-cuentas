import api from './api';

export const desgloseBebeAPI = {
  // Obtener todos los desgloses
  obtenerTodos: async () => {
    const response = await api.get('/desglose-bebe');
    return response.data;
  },

  // Obtener un desglose por ID
  obtenerPorId: async (id: string) => {
    const response = await api.get(`/desglose-bebe/${id}`);
    return response.data;
  },

  // Crear un desglose
  crear: async (desglose: { presupuestoMensual: number; mes: number; año: number; nombre?: string }) => {
    const response = await api.post('/desglose-bebe', desglose);
    return response.data;
  },

  // Actualizar un desglose
  actualizar: async (id: string, desglose: { presupuestoMensual: number; mes: number; año: number; nombre?: string }) => {
    const response = await api.put(`/desglose-bebe/${id}`, desglose);
    return response.data;
  },

  // Eliminar un desglose
  eliminar: async (id: string) => {
    const response = await api.delete(`/desglose-bebe/${id}`);
    return response.data;
  },

  // Agregar un gasto
  agregarGasto: async (id: string, gasto: { 
    descripcion: string; 
    monto: number; 
    cantidad: number;
    tipo: string;
    notas?: string;
    enlaceProducto?: string;
  }) => {
    const response = await api.post(`/desglose-bebe/${id}/gastos`, gasto);
    return response.data;
  },

  // Eliminar un gasto
  eliminarGasto: async (id: string, gastoId: string) => {
    const response = await api.delete(`/desglose-bebe/${id}/gastos/${gastoId}`);
    return response.data;
  },
};

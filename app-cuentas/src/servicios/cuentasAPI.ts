import api from './api';
import type { CuentaServicio } from '../tipos';

export const cuentasAPI = {
  // Obtener todas las cuentas
  obtenerTodas: async (mes?: number, año?: number) => {
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes.toString());
    if (año) params.append('año', año.toString());
    
    const response = await api.get(`/cuentas?${params.toString()}`);
    return response.data;
  },

  // Obtener una cuenta por ID
  obtenerPorId: async (id: string) => {
    const response = await api.get(`/cuentas/${id}`);
    return response.data;
  },

  // Crear una cuenta
  crear: async (cuenta: Omit<CuentaServicio, 'id'>) => {
    const response = await api.post('/cuentas', cuenta);
    return response.data;
  },

  // Actualizar una cuenta
  actualizar: async (id: string, cuenta: Partial<CuentaServicio>) => {
    const response = await api.put(`/cuentas/${id}`, cuenta);
    return response.data;
  },

  // Eliminar una cuenta
  eliminar: async (id: string) => {
    const response = await api.delete(`/cuentas/${id}`);
    return response.data;
  },
};

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { CuentaServicio, TipoServicio } from '../../tipos';
import { servicioCalculosEstadisticas } from '../../servicios/calculosEstadisticas';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface GraficoDistribucionServiciosProps {
  cuentas: CuentaServicio[];
  altura?: number;
}

export const GraficoDistribucionServicios: React.FC<GraficoDistribucionServiciosProps> = ({
  cuentas,
  altura = 300
}) => {
  const gastosPorServicio = servicioCalculosEstadisticas.calcularGastosPorServicio(cuentas);
  const totalGastos = servicioCalculosEstadisticas.calcularTotalGastos(cuentas);

  // Colores para cada servicio
  const coloresServicios: Record<TipoServicio, string> = {
    luz: '#f59e0b', // Amarillo/Naranja
    agua: '#3b82f6', // Azul
    gas: '#ef4444', // Rojo
    internet: '#10b981' // Verde
  };

  // Filtrar servicios que tienen gastos
  const serviciosConGastos = (Object.keys(gastosPorServicio) as TipoServicio[])
    .filter(servicio => gastosPorServicio[servicio] > 0);

  // Si no hay gastos, mostrar mensaje
  if (serviciosConGastos.length === 0) {
    return (
      <div 
        style={{ 
          height: altura, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#64748b',
          fontSize: '14px'
        }}
      >
        No hay datos para mostrar
      </div>
    );
  }

  const data = {
    labels: serviciosConGastos.map(servicio => {
      const nombres: Record<TipoServicio, string> = {
        luz: 'Luz',
        agua: 'Agua',
        gas: 'Gas',
        internet: 'Internet'
      };
      return nombres[servicio];
    }),
    datasets: [
      {
        data: serviciosConGastos.map(servicio => gastosPorServicio[servicio]),
        backgroundColor: serviciosConGastos.map(servicio => coloresServicios[servicio]),
        borderColor: serviciosConGastos.map(servicio => coloresServicios[servicio]),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Distribución de Gastos por Servicio',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const valor = context.parsed;
            const porcentaje = totalGastos > 0 ? ((valor / totalGastos) * 100).toFixed(1) : '0';
            return `${context.label}: $${valor.toLocaleString('es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} (${porcentaje}%)`;
          }
        }
      }
    },
    cutout: '60%', // Para hacer el gráfico de dona
    elements: {
      arc: {
        borderRadius: 4
      }
    }
  };

  return (
    <div style={{ height: altura }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { CuentaServicio, TipoServicio } from '../../tipos';
import { servicioCalculosEstadisticas } from '../../servicios/calculosEstadisticas';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GraficoComparativoMensualProps {
  cuentas: CuentaServicio[];
  año: number;
  meses: number[]; // Array de meses a comparar (ej: [10, 11, 12] para Oct, Nov, Dic)
  altura?: number;
}

export const GraficoComparativoMensual: React.FC<GraficoComparativoMensualProps> = ({
  cuentas,
  año,
  meses,
  altura = 300
}) => {
  const nombresMeses: Record<number, string> = {
    1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
    7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'
  };

  const coloresServicios: Record<TipoServicio, string> = {
    luz: '#f59e0b',
    agua: '#3b82f6',
    gas: '#ef4444',
    internet: '#10b981'
  };

  const nombresServicios: Record<TipoServicio, string> = {
    luz: 'Luz',
    agua: 'Agua',
    gas: 'Gas',
    internet: 'Internet'
  };

  // Generar datasets para cada servicio
  const servicios: TipoServicio[] = ['luz', 'agua', 'gas', 'internet'];
  
  const datasets = servicios.map(servicio => {
    const datosPorMes = meses.map(mes => {
      const cuentasMes = servicioCalculosEstadisticas.filtrarPorPeriodo(cuentas, año, mes);
      const gastosPorServicio = servicioCalculosEstadisticas.calcularGastosPorServicio(cuentasMes);
      return gastosPorServicio[servicio];
    });

    return {
      label: nombresServicios[servicio],
      data: datosPorMes,
      backgroundColor: coloresServicios[servicio],
      borderColor: coloresServicios[servicio],
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false
    };
  });

  const data = {
    labels: meses.map(mes => nombresMeses[mes]),
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: `Comparativa Mensual por Servicio - ${año}`,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: unknown) {
            const ctx = context as { parsed: { y: number }; dataset: { label?: string } };
            const valor = ctx.parsed.y;
            return `${ctx.dataset.label}: $${valor.toLocaleString('es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Mes'
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Monto ($)'
        },
        beginAtZero: true,
        stacked: false,
        ticks: {
          callback: function(value: string | number) {
            return '$' + value.toLocaleString('es-AR');
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div style={{ height: altura }}>
      <Bar data={data} options={options} />
    </div>
  );
};

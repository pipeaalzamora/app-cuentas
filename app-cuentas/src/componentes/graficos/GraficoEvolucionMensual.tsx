import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { CuentaServicio } from '../../tipos';
import { servicioCalculosEstadisticas } from '../../servicios/calculosEstadisticas';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GraficoEvolucionMensualProps {
  cuentas: CuentaServicio[];
  año: number;
  altura?: number;
}

export const GraficoEvolucionMensual: React.FC<GraficoEvolucionMensualProps> = ({
  cuentas,
  año,
  altura = 300
}) => {
  // Generar datos para los 12 meses del año
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const datosEvolucion = meses.map((_, index) => {
    const mes = index + 1;
    const cuentasMes = servicioCalculosEstadisticas.filtrarPorPeriodo(cuentas, año, mes);
    return servicioCalculosEstadisticas.calcularTotalGastos(cuentasMes);
  });

  const data = {
    labels: meses,
    datasets: [
      {
        label: `Gastos ${año}`,
        data: datosEvolucion,
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(37, 99, 235)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
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
          }
        }
      },
      title: {
        display: true,
        text: `Evolución de Gastos Mensuales - ${año}`,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const valor = context.parsed.y;
            return `${context.dataset.label}: $${valor.toLocaleString('es-AR', {
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
        ticks: {
          callback: function(value: any) {
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
      <Line data={data} options={options} />
    </div>
  );
};
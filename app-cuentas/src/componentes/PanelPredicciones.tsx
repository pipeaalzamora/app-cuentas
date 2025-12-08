// Componente para mostrar predicciones de gastos futuros
import { useMemo } from 'react';
import { useCuentas } from '../utilidades/hooks';
import { servicioPrediccionGastos } from '../servicios/prediccionGastos';
import type { PrediccionMensual, TipoServicio } from '../tipos';
import './PanelPredicciones.css';

export const PanelPredicciones: React.FC = () => {
  const { cuentas } = useCuentas();

  // Calcular predicción para el próximo mes
  const prediccionProximoMes = useMemo<PrediccionMensual>(() => {
    return servicioPrediccionGastos.predecirProximoMes(cuentas, {
      mesesHistoricos: 6,
      factorEstacionalidad: true,
      ajustarInflacion: false
    });
  }, [cuentas]);

  // Calcular predicciones para los próximos 3 meses
  const prediccionesMultiples = useMemo<PrediccionMensual[]>(() => {
    return servicioPrediccionGastos.predecirMultiplesMeses(cuentas, 3, {
      mesesHistoricos: 6,
      factorEstacionalidad: true
    });
  }, [cuentas]);

  const formatearMoneda = (monto: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto);
  };

  const formatearMes = (mes: number): string => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes];
  };

  const obtenerIconoServicio = (servicio: TipoServicio): string => {
    const iconos: Record<TipoServicio, string> = {
      luz: '💡',
      agua: '💧',
      gas: '🔥',
      internet: '🌐'
    };
    return iconos[servicio];
  };

  const obtenerColorTendencia = (tendencia: 'ascendente' | 'descendente' | 'estable'): string => {
    const colores = {
      ascendente: '#e74c3c',
      descendente: '#27ae60',
      estable: '#3498db'
    };
    return colores[tendencia];
  };

  const obtenerIconoTendencia = (tendencia: 'ascendente' | 'descendente' | 'estable'): string => {
    const iconos = {
      ascendente: '↗',
      descendente: '↘',
      estable: '→'
    };
    return iconos[tendencia];
  };

  const obtenerNivelConfianza = (confianza: number): string => {
    if (confianza >= 0.8) return 'Alta';
    if (confianza >= 0.5) return 'Media';
    return 'Baja';
  };

  const obtenerColorConfianza = (confianza: number): string => {
    if (confianza >= 0.8) return '#27ae60';
    if (confianza >= 0.5) return '#f39c12';
    return '#e74c3c';
  };

  if (cuentas.length < 3) {
    return (
      <div className="panel-predicciones">
        <div className="predicciones-sin-datos">
          <p>Se necesitan al menos 3 meses de datos históricos para generar predicciones confiables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-predicciones">
      <div className="predicciones-header">
        <h2>Predicción de Gastos Futuros</h2>
        <p className="predicciones-descripcion">
          Basado en {prediccionProximoMes.basadoEnMeses} meses de histórico
        </p>
      </div>

      {/* Predicción del próximo mes */}
      <div className="prediccion-destacada">
        <div className="prediccion-titulo">
          <h3>{formatearMes(prediccionProximoMes.mes)} {prediccionProximoMes.año}</h3>
          <span 
            className="prediccion-confianza"
            style={{ color: obtenerColorConfianza(prediccionProximoMes.confianzaGeneral) }}
          >
            Confianza: {obtenerNivelConfianza(prediccionProximoMes.confianzaGeneral)} 
            ({Math.round(prediccionProximoMes.confianzaGeneral * 100)}%)
          </span>
        </div>
        
        <div className="prediccion-total">
          <span className="prediccion-label">Total Estimado:</span>
          <span className="prediccion-monto">{formatearMoneda(prediccionProximoMes.totalPredicho)}</span>
        </div>

        <div className="prediccion-servicios">
          {prediccionProximoMes.prediccionesPorServicio.map(pred => (
            <div key={pred.tipoServicio} className="prediccion-servicio-item">
              <div className="servicio-info">
                <span className="servicio-icono">{obtenerIconoServicio(pred.tipoServicio)}</span>
                <span className="servicio-nombre">{pred.tipoServicio.toUpperCase()}</span>
              </div>
              
              <div className="servicio-prediccion">
                <span className="servicio-monto">{formatearMoneda(pred.montoPredicho)}</span>
                <span 
                  className="servicio-tendencia"
                  style={{ color: obtenerColorTendencia(pred.tendencia) }}
                >
                  {obtenerIconoTendencia(pred.tendencia)} {pred.tendencia}
                </span>
              </div>
              
              {pred.variacionPorcentual !== 0 && (
                <div className="servicio-variacion">
                  <span style={{ color: pred.variacionPorcentual > 0 ? '#e74c3c' : '#27ae60' }}>
                    {pred.variacionPorcentual > 0 ? '+' : ''}
                    {pred.variacionPorcentual.toFixed(1)}% vs promedio
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Predicciones para los próximos meses */}
      <div className="predicciones-futuras">
        <h3>Proyección Trimestral</h3>
        <div className="predicciones-lista">
          {prediccionesMultiples.map((pred, index) => (
            <div key={`${pred.año}-${pred.mes}`} className="prediccion-mes-card">
              <div className="prediccion-mes-header">
                <h4>{formatearMes(pred.mes)} {pred.año}</h4>
                <span className="prediccion-mes-numero">Mes +{index + 1}</span>
              </div>
              
              <div className="prediccion-mes-total">
                {formatearMoneda(pred.totalPredicho)}
              </div>
              
              <div className="prediccion-mes-confianza">
                <div 
                  className="confianza-barra"
                  style={{ 
                    width: `${pred.confianzaGeneral * 100}%`,
                    backgroundColor: obtenerColorConfianza(pred.confianzaGeneral)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="predicciones-info">
        <p className="info-texto">
          💡 Las predicciones se basan en patrones históricos, tendencias y estacionalidad. 
          Los valores reales pueden variar según cambios en consumo, tarifas o condiciones externas.
        </p>
      </div>
    </div>
  );
};

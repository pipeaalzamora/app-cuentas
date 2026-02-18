import React, { useMemo } from 'react';
import { useCuentas } from '../contextos/CuentasContext';
import { servicioCalculosEstadisticas } from '../servicios/calculosEstadisticas';
import { TarjetaModerna } from './base/TarjetaModerna';
import { BotonModerno } from './base/BotonModerno';
import { GraficoEvolucionMensual, GraficoDistribucionServicios } from './graficos';
import { formatearPesosChilenos } from '../utilidades/formatoChileno';
import { obtenerEstadisticasEstados, filtrarPorEstado, ordenarPorPrioridad } from '../utilidades/estadosCuentas';
import type { TipoServicio } from '../tipos';
import './DashboardModerno.css';

interface DashboardModernoProps {
  onNavegar?: (seccion: string) => void;
}

export const DashboardModerno: React.FC<DashboardModernoProps> = ({ onNavegar }) => {
  const { cuentas } = useCuentas();

  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  const añoActual = fechaActual.getFullYear();

  const estadisticasMesActual = useMemo(() => {
    return servicioCalculosEstadisticas.calcularEstadisticasMensuales(
      cuentas,
      añoActual,
      mesActual
    );
  }, [cuentas, añoActual, mesActual]);

  const resumenRapido = useMemo(() => {
    const cuentasMesActual = servicioCalculosEstadisticas.filtrarPorPeriodo(
      cuentas,
      añoActual,
      mesActual
    );
    return servicioCalculosEstadisticas.calcularResumenRapido(cuentasMesActual);
  }, [cuentas, añoActual, mesActual]);

  const estadisticasEstados = useMemo(() => {
    return obtenerEstadisticasEstados(cuentas);
  }, [cuentas]);

  const cuentasPrioritarias = useMemo(() => {
    const enMora = filtrarPorEstado(cuentas, 'mora');
    const vencidas = filtrarPorEstado(cuentas, 'vencida');
    const proximas = filtrarPorEstado(cuentas, 'proximas');
    return ordenarPorPrioridad([...enMora, ...vencidas, ...proximas]).slice(0, 5);
  }, [cuentas]);

  const rankingServicios = useMemo(() => {
    const cuentasMesActual = servicioCalculosEstadisticas.filtrarPorPeriodo(
      cuentas,
      añoActual,
      mesActual
    );
    return servicioCalculosEstadisticas.obtenerRankingServicios(cuentasMesActual);
  }, [cuentas, añoActual, mesActual]);

  const iconosServicios: Record<TipoServicio, string> = {
    luz: '💡',
    agua: '💧',
    gas: '🔥',
    internet: '🌐'
  };

  const nombreMes = new Date(añoActual, mesActual - 1).toLocaleDateString('es-AR', {
    month: 'long'
  });

  const manejarNavegacion = (seccion: string) => {
    if (onNavegar) {
      onNavegar(seccion);
    }
  };

  return (
    <div className="dashboard-moderno">
      {/* Header con animación */}
      <div className="dashboard-moderno__header">
        <div className="dashboard-moderno__titulo">
          <h1 className="animate-fade-in">Dashboard</h1>
          <p className="dashboard-moderno__subtitulo">
            Resumen de {nombreMes} {añoActual}
          </p>
        </div>
      </div>

      {/* Tarjetas de Resumen Compactas */}
      <div className="dashboard-moderno__resumen">
        <TarjetaModerna variant="glass" hover glow>
          <div className="tarjeta-stat">
            <div className="tarjeta-stat__icono">💰</div>
            <div className="tarjeta-stat__contenido">
              <h4>Total del Mes</h4>
              <p className="tarjeta-stat__valor">
                {formatearPesosChilenos(estadisticasMesActual.totalGastos)}
              </p>
              {estadisticasMesActual.comparativaAnterior !== 0 && (
                <span className={`tarjeta-stat__cambio ${estadisticasMesActual.comparativaAnterior > 0 ? 'negativo' : 'positivo'}`}>
                  {estadisticasMesActual.comparativaAnterior > 0 ? '↑' : '↓'} 
                  {Math.abs(estadisticasMesActual.comparativaAnterior).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </TarjetaModerna>

        <TarjetaModerna variant="glass" hover glow>
          <div className="tarjeta-stat">
            <div className="tarjeta-stat__icono">📋</div>
            <div className="tarjeta-stat__contenido">
              <h4>Cuentas Registradas</h4>
              <p className="tarjeta-stat__valor">{resumenRapido.totalCuentas}</p>
              <span className="tarjeta-stat__detalle">
                {resumenRapido.cuentasPagadas} pagadas • {resumenRapido.cuentasPendientes} pendientes
              </span>
            </div>
          </div>
        </TarjetaModerna>

        <TarjetaModerna variant="glass" hover glow>
          <div className="tarjeta-stat">
            <div className="tarjeta-stat__icono">📊</div>
            <div className="tarjeta-stat__contenido">
              <h4>Promedio Mensual</h4>
              <p className="tarjeta-stat__valor">
                {formatearPesosChilenos(estadisticasMesActual.promedioMensual)}
              </p>
              <span className="tarjeta-stat__detalle">Últimos 12 meses</span>
            </div>
          </div>
        </TarjetaModerna>

        {resumenRapido.servicioMasCaro && (
          <TarjetaModerna variant="glass" hover glow>
            <div className="tarjeta-stat">
              <div className="tarjeta-stat__icono">
                {iconosServicios[resumenRapido.servicioMasCaro.servicio]}
              </div>
              <div className="tarjeta-stat__contenido">
                <h4>Servicio Más Caro</h4>
                <p className="tarjeta-stat__valor">
                  {formatearPesosChilenos(resumenRapido.servicioMasCaro.total)}
                </p>
                <span className="tarjeta-stat__detalle">
                  {resumenRapido.servicioMasCaro.servicio.charAt(0).toUpperCase() + 
                   resumenRapido.servicioMasCaro.servicio.slice(1)}
                </span>
              </div>
            </div>
          </TarjetaModerna>
        )}
      </div>

      {/* Alertas */}
      {(estadisticasEstados.enMora > 0 || estadisticasEstados.vencidas > 0) && (
        <div className="dashboard-moderno__alertas">
          {estadisticasEstados.vencidas > 0 && (
            <TarjetaModerna variant="glass" hover className="alerta-vencida">
              <div className="alerta-moderna">
                <div className="alerta-moderna__icono">🔴</div>
                <div className="alerta-moderna__contenido">
                  <h4>Cuentas Vencidas</h4>
                  <p>{estadisticasEstados.vencidas} cuenta(s) - {formatearPesosChilenos(estadisticasEstados.montoTotalVencido)}</p>
                </div>
                <BotonModerno 
                  variant="glass" 
                  size="sm"
                  onClick={() => manejarNavegacion('cuentas')}
                >
                  Ver Detalles
                </BotonModerno>
              </div>
            </TarjetaModerna>
          )}

          {estadisticasEstados.enMora > 0 && (
            <TarjetaModerna variant="glass" hover className="alerta-mora">
              <div className="alerta-moderna">
                <div className="alerta-moderna__icono">⚠️</div>
                <div className="alerta-moderna__contenido">
                  <h4>Cuentas en Mora</h4>
                  <p>{estadisticasEstados.enMora} cuenta(s) - {formatearPesosChilenos(estadisticasEstados.montoTotalMora)}</p>
                </div>
                <BotonModerno 
                  variant="glass" 
                  size="sm"
                  onClick={() => manejarNavegacion('cuentas')}
                >
                  Ver Detalles
                </BotonModerno>
              </div>
            </TarjetaModerna>
          )}
        </div>
      )}

      {/* Gráficos con Glass Effect */}
      <div className="dashboard-moderno__graficos">
        <TarjetaModerna variant="glass" hover>
          <TarjetaModerna.Header icon="📈">
            Evolución Mensual
          </TarjetaModerna.Header>
          <TarjetaModerna.Body>
            <GraficoEvolucionMensual
              cuentas={cuentas}
              año={añoActual}
              altura={300}
            />
          </TarjetaModerna.Body>
        </TarjetaModerna>

        <TarjetaModerna variant="glass" hover>
          <TarjetaModerna.Header icon="🎯">
            Distribución por Servicio
          </TarjetaModerna.Header>
          <TarjetaModerna.Body>
            <GraficoDistribucionServicios
              cuentas={servicioCalculosEstadisticas.filtrarPorPeriodo(cuentas, añoActual, mesActual)}
              altura={300}
            />
          </TarjetaModerna.Body>
        </TarjetaModerna>
      </div>

      {/* Ranking de Servicios con Degradados */}
      {rankingServicios.length > 0 && (
        <TarjetaModerna variant="glass" hover>
          <TarjetaModerna.Header icon="💰">
            Gastos por Servicio - {nombreMes}
          </TarjetaModerna.Header>
          <TarjetaModerna.Body>
            <div className="ranking-servicios">
              {rankingServicios.map((servicio, index) => {
                return (
                  <div key={servicio.servicio} className="ranking-item">
                    <div className="ranking-item__posicion">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="ranking-item__icono">
                      {iconosServicios[servicio.servicio]}
                    </div>
                    <div className="ranking-item__info">
                      <h4>{servicio.servicio.charAt(0).toUpperCase() + servicio.servicio.slice(1)}</h4>
                      <p>{servicio.cantidadCuentas} cuenta(s) • Promedio: {formatearPesosChilenos(servicio.promedioMonto)}</p>
                    </div>
                    <div className="ranking-item__monto">
                      {formatearPesosChilenos(servicio.total)}
                    </div>
                  </div>
                );
              })}
            </div>
          </TarjetaModerna.Body>
        </TarjetaModerna>
      )}
    </div>
  );
};

export default DashboardModerno;

import React, { useMemo } from 'react';
import { useCuentas } from '../contextos/CuentasContext';
import { servicioCalculosEstadisticas } from '../servicios/calculosEstadisticas';
import Tarjeta from './base/Tarjeta';
import { GraficoEvolucionMensual, GraficoDistribucionServicios } from './graficos';
import { formatearPesosChilenos, formatearNumeroChileno } from '../utilidades/formatoChileno';
import { obtenerEstadisticasEstados, filtrarPorEstado, ordenarPorPrioridad, obtenerDesgloseMonto, obtenerEstadoCuenta } from '../utilidades/estadosCuentas';
import { obtenerNombreMes } from '../utilidades/formatoChileno';
import type { TipoServicio, CuentaServicio } from '../tipos';
import './PanelPrincipal.css';

interface TarjetaNavegacionProps {
  titulo: string;
  descripcion: string;
  icono: string;
  onClick: () => void;
  color?: string;
}

const TarjetaNavegacion: React.FC<TarjetaNavegacionProps> = ({
  titulo,
  descripcion,
  icono,
  onClick,
  color = 'var(--color-primario)'
}) => (
  <Tarjeta className="tarjeta-navegacion" onClick={onClick}>
    <div className="tarjeta-navegacion-icono" style={{ backgroundColor: color }}>
      {icono}
    </div>
    <div className="tarjeta-navegacion-contenido">
      <h3>{titulo}</h3>
      <p>{descripcion}</p>
    </div>
  </Tarjeta>
);

interface TarjetaResumenProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  color?: string;
  icono?: string;
}

const TarjetaResumen: React.FC<TarjetaResumenProps> = ({
  titulo,
  valor,
  subtitulo,
  color = 'var(--color-primario)',
  icono
}) => (
  <Tarjeta className="tarjeta-resumen">
    <div className="tarjeta-resumen-header">
      <h4>{titulo}</h4>
      {icono && (
        <div className="tarjeta-resumen-icono" style={{ color }}>
          {icono}
        </div>
      )}
    </div>
    <div className="tarjeta-resumen-valor" style={{ color }}>
      {typeof valor === 'number' ? formatearNumeroChileno(valor) : valor}
    </div>
    {subtitulo && (
      <div className="tarjeta-resumen-subtitulo">
        {subtitulo}
      </div>
    )}
  </Tarjeta>
);

interface PanelPrincipalProps {
  onNavegar?: (seccion: string) => void;
}

export const PanelPrincipal: React.FC<PanelPrincipalProps> = ({ onNavegar }) => {
  const { cuentas } = useCuentas();

  // Obtener mes y año actual
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  const añoActual = fechaActual.getFullYear();

  // Calcular estadísticas del mes actual
  const estadisticasMesActual = useMemo(() => {
    return servicioCalculosEstadisticas.calcularEstadisticasMensuales(
      cuentas,
      añoActual,
      mesActual
    );
  }, [cuentas, añoActual, mesActual]);

  // Calcular resumen rápido
  const resumenRapido = useMemo(() => {
    const cuentasMesActual = servicioCalculosEstadisticas.filtrarPorPeriodo(
      cuentas,
      añoActual,
      mesActual
    );
    return servicioCalculosEstadisticas.calcularResumenRapido(cuentasMesActual);
  }, [cuentas, añoActual, mesActual]);

  // Estadísticas de estados
  const estadisticasEstados = useMemo(() => {
    return obtenerEstadisticasEstados(cuentas);
  }, [cuentas]);

  // Cuentas prioritarias (en mora, vencidas, próximas a vencer)
  const cuentasPrioritarias = useMemo(() => {
    const enMora = filtrarPorEstado(cuentas, 'mora');
    const vencidas = filtrarPorEstado(cuentas, 'vencida');
    const proximas = filtrarPorEstado(cuentas, 'proximas');

    return ordenarPorPrioridad([...enMora, ...vencidas, ...proximas]).slice(0, 5);
  }, [cuentas]);

  // Obtener ranking de servicios del mes actual
  const rankingServicios = useMemo(() => {
    const cuentasMesActual = servicioCalculosEstadisticas.filtrarPorPeriodo(
      cuentas,
      añoActual,
      mesActual
    );
    return servicioCalculosEstadisticas.obtenerRankingServicios(cuentasMesActual);
  }, [cuentas, añoActual, mesActual]);

  // Colores por tipo de servicio
  const coloresServicios: Record<TipoServicio, string> = {
    luz: 'var(--color-luz)',
    agua: 'var(--color-agua)',
    gas: 'var(--color-gas)',
    internet: 'var(--color-internet)'
  };

  // Iconos por tipo de servicio
  const iconosServicios: Record<TipoServicio, string> = {
    luz: '💡',
    agua: '💧',
    gas: '🔥',
    internet: '🌐'
  };

  // Nombres de servicios
  const nombresServicios: Record<TipoServicio, string> = {
    luz: 'Electricidad',
    agua: 'Agua Potable',
    gas: 'Gas Natural',
    internet: 'Internet/Telefonía'
  };

  // Para compatibilidad con las constantes usadas en el código
  const ICONOS_SERVICIOS = iconosServicios;
  const NOMBRES_SERVICIOS = nombresServicios;

  const manejarNavegacion = (seccion: string) => {
    if (onNavegar) {
      onNavegar(seccion);
    }
  };

  const nombreMes = new Date(añoActual, mesActual - 1).toLocaleDateString('es-AR', {
    month: 'long'
  });

  return (
    <div className="panel-principal">
      {/* Header del Dashboard */}
      <div className="panel-principal-header">
        <div>
          <h1>Dashboard</h1>
          <p className="panel-principal-subtitulo">
            Resumen de {nombreMes} {añoActual}
          </p>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="panel-principal-resumen">
        <TarjetaResumen
          titulo="Total del Mes"
          valor={formatearPesosChilenos(estadisticasMesActual.totalGastos)}
          subtitulo={
            estadisticasMesActual.comparativaAnterior !== 0
              ? `${estadisticasMesActual.comparativaAnterior > 0 ? '+' : ''}${estadisticasMesActual.comparativaAnterior.toFixed(1)}% vs mes anterior`
              : 'Sin datos del mes anterior'
          }
          color="var(--color-primario)"
          icono="💰"
        />

        <TarjetaResumen
          titulo="Cuentas Registradas"
          valor={resumenRapido.totalCuentas}
          subtitulo={`${resumenRapido.cuentasPagadas} pagadas, ${resumenRapido.cuentasPendientes} pendientes`}
          color="var(--color-info)"
          icono="📋"
        />

        <TarjetaResumen
          titulo="Promedio Mensual"
          valor={formatearPesosChilenos(estadisticasMesActual.promedioMensual)}
          subtitulo="Últimos 12 meses"
          color="var(--color-exito)"
          icono="📊"
        />

        {resumenRapido.servicioMasCaro && (
          <TarjetaResumen
            titulo="Servicio Más Caro"
            valor={formatearPesosChilenos(resumenRapido.servicioMasCaro.total)}
            subtitulo={resumenRapido.servicioMasCaro.servicio.charAt(0).toUpperCase() + resumenRapido.servicioMasCaro.servicio.slice(1)}
            color={coloresServicios[resumenRapido.servicioMasCaro.servicio]}
            icono={iconosServicios[resumenRapido.servicioMasCaro.servicio]}
          />
        )}
      </div>

      {/* Alertas y Cuentas Prioritarias */}
      {(estadisticasEstados.enMora > 0 || estadisticasEstados.vencidas > 0 || estadisticasEstados.proximasAVencer > 0) && (
        <div className="alertas-prioritarias">
          {/* Alertas de Estado */}
          <div className="alertas-estado">
            {estadisticasEstados.enMora > 0 && (
              <Tarjeta className="alerta-mora">
                <div className="alerta-contenido">
                  <div className="alerta-icono">⚠️</div>
                  <div className="alerta-info">
                    <h4>Cuentas en Mora</h4>
                    <p>{estadisticasEstados.enMora} cuenta(s) - {formatearPesosChilenos(estadisticasEstados.montoTotalMora)}</p>
                  </div>
                </div>
              </Tarjeta>
            )}

            {estadisticasEstados.vencidas > 0 && (
              <Tarjeta className="alerta-vencida">
                <div className="alerta-contenido">
                  <div className="alerta-icono">📅</div>
                  <div className="alerta-info">
                    <h4>Cuentas Vencidas</h4>
                    <p>{estadisticasEstados.vencidas} cuenta(s) - {formatearPesosChilenos(estadisticasEstados.montoTotalVencido)}</p>
                  </div>
                </div>
              </Tarjeta>
            )}

            {estadisticasEstados.proximasAVencer > 0 && (
              <Tarjeta className="alerta-proxima">
                <div className="alerta-contenido">
                  <div className="alerta-icono">⏰</div>
                  <div className="alerta-info">
                    <h4>Próximas a Vencer</h4>
                    <p>{estadisticasEstados.proximasAVencer} cuenta(s) en los próximos 7 días</p>
                  </div>
                </div>
              </Tarjeta>
            )}
          </div>

          {/* Cuentas Prioritarias */}
          {cuentasPrioritarias.length > 0 && (
            <Tarjeta>
              <Tarjeta.Header>
                <h3>Cuentas que Requieren Atención</h3>
              </Tarjeta.Header>
              <Tarjeta.Body>
                <div className="cuentas-prioritarias-lista">
                  {cuentasPrioritarias.map((cuenta: CuentaServicio) => {
                    const desglose = obtenerDesgloseMonto(cuenta);
                    const estado = obtenerEstadoCuenta(cuenta);

                    return (
                      <div key={cuenta.id} className="cuenta-prioritaria-item">
                        <div className="cuenta-prioritaria-info">
                          <div className="cuenta-prioritaria-servicio">
                            {ICONOS_SERVICIOS[cuenta.tipoServicio]} {NOMBRES_SERVICIOS[cuenta.tipoServicio]}
                          </div>
                          <div className="cuenta-prioritaria-periodo">
                            {obtenerNombreMes(cuenta.mes)} {cuenta.año}
                          </div>
                          <div className="cuenta-prioritaria-estado" style={{ color: estado.color }}>
                            {estado.descripcion}
                          </div>
                        </div>
                        <div className="cuenta-prioritaria-monto">
                          <div className="monto-principal">
                            {formatearPesosChilenos(desglose.montoTotal)}
                          </div>
                          {desglose.tieneSaldoAnterior && (
                            <div className="monto-detalle">
                              Incluye saldo anterior: {formatearPesosChilenos(desglose.saldoAnterior)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Tarjeta.Body>
            </Tarjeta>
          )}
        </div>
      )}

      {/* Información de Saldos Anteriores */}
      {estadisticasEstados.conSaldoAnterior > 0 && (
        <Tarjeta className="info-saldos-anteriores">
          <Tarjeta.Header>
            <h3>💰 Información de Saldos Anteriores</h3>
          </Tarjeta.Header>
          <Tarjeta.Body>
            <p>
              Tienes <strong>{estadisticasEstados.conSaldoAnterior}</strong> cuenta(s) con saldo anterior pendiente.
              Estas cuentas incluyen montos de períodos anteriores que no fueron pagados completamente.
            </p>
          </Tarjeta.Body>
        </Tarjeta>
      )}

      {/* Gráficos de Resumen */}
      <div className="panel-principal-graficos">
        <Tarjeta className="grafico-container">
          <h3>Evolución Mensual</h3>
          <GraficoEvolucionMensual
            cuentas={cuentas}
            año={añoActual}
            altura={250}
          />
        </Tarjeta>

        <Tarjeta className="grafico-container">
          <h3>Distribución por Servicio - {nombreMes}</h3>
          <GraficoDistribucionServicios
            cuentas={servicioCalculosEstadisticas.filtrarPorPeriodo(cuentas, añoActual, mesActual)}
            altura={250}
          />
        </Tarjeta>
      </div>

      {/* Desglose por Servicios */}
      {rankingServicios.length > 0 && (
        <div className="panel-principal-servicios">
          <div className="servicios-header">
            <h3>💰 Gastos por Servicio - {nombreMes}</h3>
            <span className="servicios-subtitle">Distribución del gasto mensual</span>
          </div>
          <div className="servicios-lista">
            {rankingServicios.map((servicio, index) => {
              const getMedalla = (pos: number): string => {
                if (pos === 0) return '🥇';
                if (pos === 1) return '🥈';
                if (pos === 2) return '🥉';
                return `#${pos + 1}`;
              };

              return (
                <div key={servicio.servicio} className="servicio-fila">
                  <div className="servicio-ranking">
                    <div className="servicio-posicion">
                      {getMedalla(index)}
                    </div>
                    <div
                      className="servicio-icono"
                      style={{ backgroundColor: coloresServicios[servicio.servicio] }}
                    >
                      {iconosServicios[servicio.servicio]}
                    </div>
                  </div>

                  <div className="servicio-contenido">
                    <div className="servicio-info">
                      <h4 className="servicio-nombre">
                        {servicio.servicio.charAt(0).toUpperCase() + servicio.servicio.slice(1)}
                      </h4>
                      <div className="servicio-estadisticas">
                        <span className="servicio-cuentas">
                          {servicio.cantidadCuentas} cuenta{servicio.cantidadCuentas !== 1 ? 's' : ''}
                        </span>
                        <span className="servicio-separador">•</span>
                        <span className="servicio-promedio">
                          Promedio: {formatearPesosChilenos(servicio.promedioMonto)}
                        </span>
                      </div>
                    </div>

                    <div className="servicio-progreso-container">
                      <div className="servicio-barra">
                        <div
                          className="servicio-progreso"
                          style={{
                            width: `${servicio.porcentaje}%`,
                            backgroundColor: coloresServicios[servicio.servicio]
                          }}
                        />
                      </div>
                      <span className="servicio-porcentaje">
                        {servicio.porcentaje.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="servicio-monto">
                    {formatearPesosChilenos(servicio.total)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tarjetas de Navegación Rápida */}
      <div className="panel-principal-navegacion">
        <h3>Acciones Rápidas</h3>
        <div className="navegacion-grid">
          <TarjetaNavegacion
            titulo="Gestionar Cuentas"
            descripcion="Ver, agregar y editar cuentas de servicios"
            icono="📝"
            onClick={() => manejarNavegacion('cuentas')}
            color="var(--color-primario)"
          />

          <TarjetaNavegacion
            titulo="Ver Estadísticas"
            descripcion="Análisis detallado y gráficos avanzados"
            icono="📈"
            onClick={() => manejarNavegacion('estadisticas')}
            color="var(--color-info)"
          />

          <TarjetaNavegacion
            titulo="Generar Reportes"
            descripcion="Crear y descargar reportes en PDF"
            icono="📄"
            onClick={() => manejarNavegacion('reportes')}
            color="var(--color-exito)"
          />

          <TarjetaNavegacion
            titulo="Configuración"
            descripcion="Ajustar preferencias y configuración"
            icono="⚙️"
            onClick={() => manejarNavegacion('configuracion')}
            color="var(--color-secundario)"
          />
        </div>
      </div>
    </div>
  );
};

export default PanelPrincipal;
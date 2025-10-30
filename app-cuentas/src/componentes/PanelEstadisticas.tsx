import React, { useState, useMemo, memo, useCallback } from 'react';
import { useCuentas } from '../contextos/CuentasContext';
import { servicioCalculosEstadisticas } from '../servicios/calculosEstadisticas';
import { 
  GraficoEvolucionMensual, 
  GraficoDistribucionServicios, 
  GraficoComparativoMensual 
} from './graficos';
import Tarjeta from './base/Tarjeta';
import Boton from './base/Boton';
import { SkeletonEstadisticas, SkeletonGrafico } from './base/Skeleton';
import { useLoading } from '../utilidades/useLoading';
import { formatearPesosChilenos, obtenerNombreMes } from '../utilidades/formatoChileno';
import type { TipoServicio } from '../tipos';
import './PanelEstadisticas.css';

interface FiltrosPeriodo {
  año: number;
  mes?: number;
  mesInicio?: number;
  mesFin?: number;
}

const PanelEstadisticas: React.FC = () => {
  const { cuentas, cargando } = useCuentas();
  const añoActual = new Date().getFullYear();
  const mesActual = new Date().getMonth() + 1;

  const [filtros, setFiltros] = useState<FiltrosPeriodo>({
    año: añoActual,
    mes: mesActual
  });

  const [vistaComparativa, setVistaComparativa] = useState<'trimestre' | 'semestre' | 'año'>('trimestre');
  const { isLoading: calculandoEstadisticas } = useLoading();

  // Filtrar cuentas según los filtros seleccionados
  const cuentasFiltradas = useMemo(() => {
    if (filtros.mes) {
      return servicioCalculosEstadisticas.filtrarPorPeriodo(cuentas, filtros.año, filtros.mes);
    } else if (filtros.mesInicio && filtros.mesFin) {
      return servicioCalculosEstadisticas.filtrarPorPeriodo(
        cuentas, 
        filtros.año, 
        undefined, 
        filtros.mesInicio, 
        filtros.mesFin
      );
    } else {
      return servicioCalculosEstadisticas.filtrarPorPeriodo(cuentas, filtros.año);
    }
  }, [cuentas, filtros]);

  // Calcular estadísticas del período actual
  const estadisticasActuales = useMemo(() => {
    if (filtros.mes) {
      return servicioCalculosEstadisticas.calcularEstadisticasMensuales(cuentas, filtros.año, filtros.mes);
    } else {
      // Para períodos más largos, calcular estadísticas agregadas
      const totalGastos = servicioCalculosEstadisticas.calcularTotalGastos(cuentasFiltradas);
      const gastosPorServicio = servicioCalculosEstadisticas.calcularGastosPorServicio(cuentasFiltradas);
      const promedioMensual = servicioCalculosEstadisticas.calcularPromedioMensual(cuentas, filtros.año, mesActual);
      
      // Calcular comparativa con período anterior
      const añoAnterior = filtros.año - 1;
      const cuentasAñoAnterior = servicioCalculosEstadisticas.filtrarPorPeriodo(cuentas, añoAnterior);
      const totalAñoAnterior = servicioCalculosEstadisticas.calcularTotalGastos(cuentasAñoAnterior);
      const comparativaAnterior = totalAñoAnterior > 0 ? ((totalGastos - totalAñoAnterior) / totalAñoAnterior) * 100 : 0;

      return {
        mes: 0, // Indica que es un período completo
        año: filtros.año,
        totalGastos,
        gastosPorServicio,
        promedioMensual,
        comparativaAnterior
      };
    }
  }, [cuentas, cuentasFiltradas, filtros, mesActual]);

  // Calcular ranking de servicios
  const rankingServicios = useMemo(() => {
    return servicioCalculosEstadisticas.obtenerRankingServicios(cuentasFiltradas);
  }, [cuentasFiltradas]);

  // Calcular resumen rápido
  const resumenRapido = useMemo(() => {
    return servicioCalculosEstadisticas.calcularResumenRapido(cuentasFiltradas);
  }, [cuentasFiltradas]);

  // Generar meses para comparativa
  const mesesComparativa = useMemo(() => {
    const mesActualNum = mesActual;
    switch (vistaComparativa) {
      case 'trimestre':
        return [mesActualNum - 2, mesActualNum - 1, mesActualNum].filter(m => m > 0);
      case 'semestre':
        return Array.from({ length: 6 }, (_, i) => mesActualNum - 5 + i).filter(m => m > 0);
      case 'año':
        return Array.from({ length: 12 }, (_, i) => i + 1);
      default:
        return [mesActualNum];
    }
  }, [mesActual, vistaComparativa]);

  const handleCambioFiltro = useCallback((campo: keyof FiltrosPeriodo, valor: number | undefined) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      // Limpiar otros filtros de período cuando se cambia uno
      ...(campo === 'mes' && valor ? { mesInicio: undefined, mesFin: undefined } : {}),
      ...(campo === 'mesInicio' || campo === 'mesFin' ? { mes: undefined } : {})
    }));
  }, []);

  const formatearMoneda = useCallback((monto: number): string => {
    return formatearPesosChilenos(monto);
  }, []);

  const formatearPorcentaje = useCallback((porcentaje: number): string => {
    const signo = porcentaje > 0 ? '+' : '';
    return `${signo}${porcentaje.toFixed(1)}%`;
  }, []);

  const obtenerColorComparativa = (porcentaje: number): string => {
    if (porcentaje > 0) return 'var(--color-error)';
    if (porcentaje < 0) return 'var(--color-exito)';
    return 'var(--color-texto)';
  };

  if (cargando || calculandoEstadisticas) {
    return (
      <div className="panel-estadisticas">
        <Tarjeta className="filtros-periodo">
          <h3>Filtros de Período</h3>
          <div className="filtros-grid">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} style={{ height: '60px', backgroundColor: '#f0f0f0', borderRadius: '4px' }} />
            ))}
          </div>
        </Tarjeta>
        
        <SkeletonEstadisticas />
        
        <div className="graficos-principales">
          <Tarjeta className="grafico-card">
            <SkeletonGrafico height={350} />
          </Tarjeta>
          <Tarjeta className="grafico-card">
            <SkeletonGrafico height={350} />
          </Tarjeta>
        </div>
        
        <Tarjeta className="grafico-comparativo">
          <SkeletonGrafico height={400} />
        </Tarjeta>
      </div>
    );
  }

  return (
    <div className="panel-estadisticas">
      {/* Filtros de período */}
      <Tarjeta className="filtros-periodo">
        <h3>Filtros de Período</h3>
        <div className="filtros-grid">
          <div className="filtro-grupo">
            <label htmlFor="año">Año:</label>
            <select
              id="año"
              value={filtros.año}
              onChange={(e) => handleCambioFiltro('año', parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => añoActual - 2 + i).map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label htmlFor="mes">Mes específico:</label>
            <select
              id="mes"
              value={filtros.mes || ''}
              onChange={(e) => handleCambioFiltro('mes', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">Todo el año</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                <option key={mes} value={mes}>
                  {obtenerNombreMes(mes)}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <Boton
              variante={!filtros.mes ? 'primary' : 'outline'}
              onClick={() => setFiltros(prev => ({ ...prev, mes: undefined }))}
              tamaño="sm"
            >
              Ver año completo
            </Boton>
          </div>
        </div>
      </Tarjeta>

      {/* Métricas principales */}
      <MetricasPrincipales
        estadisticas={estadisticasActuales}
        resumen={resumenRapido}
        formatearMoneda={formatearMoneda}
        formatearPorcentaje={formatearPorcentaje}
        obtenerColorComparativa={obtenerColorComparativa}
      />

      {/* Gráficos principales */}
      <div className="graficos-principales">
        <Tarjeta className="grafico-card">
          <GraficoEvolucionMensual 
            cuentas={cuentas} 
            año={filtros.año}
            altura={350}
          />
        </Tarjeta>

        <Tarjeta className="grafico-card">
          <GraficoDistribucionServicios 
            cuentas={cuentasFiltradas}
            altura={350}
          />
        </Tarjeta>
      </div>

      {/* Gráfico comparativo */}
      <Tarjeta className="grafico-comparativo">
        <div className="comparativo-header">
          <h3>Comparativa Mensual</h3>
          <div className="vista-controles">
            <Boton
              variante={vistaComparativa === 'trimestre' ? 'primary' : 'outline'}
              onClick={() => setVistaComparativa('trimestre')}
              tamaño="sm"
            >
              Trimestre
            </Boton>
            <Boton
              variante={vistaComparativa === 'semestre' ? 'primary' : 'outline'}
              onClick={() => setVistaComparativa('semestre')}
              tamaño="sm"
            >
              Semestre
            </Boton>
            <Boton
              variante={vistaComparativa === 'año' ? 'primary' : 'outline'}
              onClick={() => setVistaComparativa('año')}
              tamaño="sm"
            >
              Año
            </Boton>
          </div>
        </div>
        <GraficoComparativoMensual
          cuentas={cuentas}
          año={filtros.año}
          meses={mesesComparativa}
          altura={400}
        />
      </Tarjeta>

      {/* Ranking de servicios */}
      <RankingServicios
        ranking={rankingServicios}
        formatearMoneda={formatearMoneda}
      />
    </div>
  );
};

// Componente memoizado para métricas principales
const MetricasPrincipales = memo<{
  estadisticas: any;
  resumen: any;
  formatearMoneda: (monto: number) => string;
  formatearPorcentaje: (porcentaje: number) => string;
  obtenerColorComparativa: (porcentaje: number) => string;
}>(({ estadisticas, resumen, formatearMoneda, formatearPorcentaje, obtenerColorComparativa }) => (
  <div className="metricas-principales">
    <Tarjeta className="metrica-card">
      <div className="metrica-contenido">
        <h4>Total del Período</h4>
        <div className="metrica-valor">{formatearMoneda(estadisticas.totalGastos)}</div>
        <div 
          className="metrica-comparativa"
          style={{ color: obtenerColorComparativa(estadisticas.comparativaAnterior) }}
        >
          {formatearPorcentaje(estadisticas.comparativaAnterior)} vs período anterior
        </div>
      </div>
    </Tarjeta>

    <Tarjeta className="metrica-card">
      <div className="metrica-contenido">
        <h4>Promedio Mensual</h4>
        <div className="metrica-valor">{formatearMoneda(estadisticas.promedioMensual)}</div>
        <div className="metrica-descripcion">Basado en últimos 12 meses</div>
      </div>
    </Tarjeta>

    <Tarjeta className="metrica-card">
      <div className="metrica-contenido">
        <h4>Total de Cuentas</h4>
        <div className="metrica-valor">{resumen.totalCuentas}</div>
        <div className="metrica-descripcion">
          {resumen.cuentasPagadas} pagadas, {resumen.cuentasPendientes} pendientes
        </div>
      </div>
    </Tarjeta>

    <Tarjeta className="metrica-card">
      <div className="metrica-contenido">
        <h4>Servicio Principal</h4>
        <div className="metrica-valor">
          {resumen.servicioMasCaro?.servicio.toUpperCase() || 'N/A'}
        </div>
        <div className="metrica-descripcion">
          {resumen.servicioMasCaro ? formatearMoneda(resumen.servicioMasCaro.total) : 'Sin datos'}
        </div>
      </div>
    </Tarjeta>
  </div>
));

MetricasPrincipales.displayName = 'MetricasPrincipales';

// Componente memoizado para ranking de servicios
const RankingServicios = memo<{
  ranking: any[];
  formatearMoneda: (monto: number) => string;
}>(({ ranking, formatearMoneda }) => {
  const getIconoServicio = (servicio: TipoServicio): string => {
    const iconos: Record<TipoServicio, string> = {
      luz: '💡',
      agua: '💧',
      gas: '🔥',
      internet: '🌐'
    };
    return iconos[servicio] || '📋';
  };

  const getMedalla = (posicion: number): string => {
    if (posicion === 1) return '🥇';
    if (posicion === 2) return '🥈';
    if (posicion === 3) return '🥉';
    return posicion.toString();
  };

  return (
    <Tarjeta className="ranking-servicios">
      <div className="ranking-header">
        <h3>🏆 Ranking de Servicios</h3>
        <span className="ranking-subtitle">Por gasto total</span>
      </div>
      <div className="ranking-lista">
        {ranking.map((item, index) => (
          <div key={item.servicio} className="ranking-item">
            <div className="ranking-posicion">
              {index < 3 ? getMedalla(index + 1) : index + 1}
            </div>
            <div className="ranking-icono">
              {getIconoServicio(item.servicio)}
            </div>
            <div className="ranking-info">
              <div className="ranking-servicio">
                {item.servicio.charAt(0).toUpperCase() + item.servicio.slice(1)}
              </div>
              <div className="ranking-detalles">
                {formatearMoneda(item.total)} 
                <span className="ranking-porcentaje">({item.porcentaje.toFixed(1)}%)</span>
              </div>
              <div className="ranking-cuentas">
                {item.cantidadCuentas} cuentas • Promedio: {formatearMoneda(item.promedioMonto)}
              </div>
            </div>
            <div className="ranking-barra">
              <div 
                className="ranking-progreso"
                style={{ 
                  width: `${item.porcentaje}%`,
                  backgroundColor: getColorServicio(item.servicio)
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Tarjeta>
  );
});

RankingServicios.displayName = 'RankingServicios';

// Función auxiliar para obtener color del servicio
const getColorServicio = (servicio: TipoServicio): string => {
  const colores: Record<TipoServicio, string> = {
    luz: '#f59e0b',
    agua: '#3b82f6',
    gas: '#ef4444',
    internet: '#10b981'
  };
  return colores[servicio];
};

export default memo(PanelEstadisticas);
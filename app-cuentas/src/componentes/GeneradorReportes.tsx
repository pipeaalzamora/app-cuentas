import React, { useState } from 'react';
import type { ConfiguracionReporte, TipoReporte } from '../tipos';
import { servicioGeneradorPDF } from '../servicios/generadorPDF';
import { useCuentas } from '../contextos/CuentasContext';
import useToast from '../utilidades/useToast';
import Boton from './base/Boton';
import Tarjeta from './base/Tarjeta';
import './GeneradorReportes.css';

export const GeneradorReportes: React.FC = () => {
  const { cuentas } = useCuentas();
  const { mostrarToast } = useToast();
  
  const [configuracion, setConfiguracion] = useState<ConfiguracionReporte>({
    tipo: 'mensual',
    periodo: {
      año: new Date().getFullYear(),
      mes: new Date().getMonth() + 1
    },
    incluirGraficos: true
  });
  
  const [generando, setGenerando] = useState(false);

  // Obtener años disponibles de las cuentas
  const añosDisponibles = Array.from(
    new Set(cuentas.map(cuenta => cuenta.año))
  ).sort((a, b) => b - a);

  // Si no hay años disponibles, usar el año actual
  if (añosDisponibles.length === 0) {
    añosDisponibles.push(new Date().getFullYear());
  }

  const handleTipoChange = (tipo: TipoReporte) => {
    setConfiguracion(prev => ({
      ...prev,
      tipo,
      // Resetear mes si es reporte anual
      periodo: {
        ...prev.periodo,
        mes: tipo === 'anual' ? undefined : prev.periodo.mes || new Date().getMonth() + 1
      }
    }));
  };

  const handleAñoChange = (año: number) => {
    setConfiguracion(prev => ({
      ...prev,
      periodo: {
        ...prev.periodo,
        año
      }
    }));
  };

  const handleMesChange = (mes: number) => {
    setConfiguracion(prev => ({
      ...prev,
      periodo: {
        ...prev.periodo,
        mes
      }
    }));
  };

  const handleIncluirGraficosChange = (incluir: boolean) => {
    setConfiguracion(prev => ({
      ...prev,
      incluirGraficos: incluir
    }));
  };

  const generarReporte = async () => {
    try {
      setGenerando(true);
      
      // Validar configuración
      const validacion = servicioGeneradorPDF.validarConfiguracion(configuracion);
      if (!validacion.valido) {
        mostrarToast({
          tipo: 'error',
          mensaje: `Error en la configuración: ${validacion.errores.join(', ')}`
        });
        return;
      }

      // Filtrar cuentas relevantes para mostrar información
      let cuentasRelevantes = cuentas;
      if (configuracion.periodo.mes) {
        cuentasRelevantes = cuentas.filter(cuenta => 
          cuenta.año === configuracion.periodo.año && 
          cuenta.mes === configuracion.periodo.mes
        );
      } else {
        cuentasRelevantes = cuentas.filter(cuenta => 
          cuenta.año === configuracion.periodo.año
        );
      }

      if (cuentasRelevantes.length === 0) {
        mostrarToast({
          tipo: 'advertencia',
          mensaje: 'No hay cuentas disponibles para el período seleccionado'
        });
        return;
      }

      // Generar y descargar reporte
      await servicioGeneradorPDF.generarYDescargarReporte(cuentas, configuracion);
      
      mostrarToast({
        tipo: 'exito',
        mensaje: `Reporte ${configuracion.tipo} generado exitosamente`
      });
      
    } catch (error) {
      console.error('Error al generar reporte:', error);
      mostrarToast({
        tipo: 'error',
        mensaje: `Error al generar el reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    } finally {
      setGenerando(false);
    }
  };

  const obtenerDescripcionReporte = () => {
    const { tipo, periodo } = configuracion;
    
    switch (tipo) {
      case 'mensual':
        return `Reporte completo con todas las cuentas, estadísticas y gráficos del mes ${periodo.mes}/${periodo.año}`;
      case 'planilla':
        return `Lista de cuentas pendientes de pago del mes ${periodo.mes}/${periodo.año} en formato checklist`;
      case 'anual':
        return `Resumen anual con estadísticas y comparativas del año ${periodo.año}`;
      default:
        return '';
    }
  };

  const obtenerCantidadCuentas = () => {
    if (configuracion.periodo.mes) {
      return cuentas.filter(cuenta => 
        cuenta.año === configuracion.periodo.año && 
        cuenta.mes === configuracion.periodo.mes
      ).length;
    } else {
      return cuentas.filter(cuenta => 
        cuenta.año === configuracion.periodo.año
      ).length;
    }
  };

  return (
    <div className="generador-reportes">
      <Tarjeta>
        <div className="generador-header">
          <h2>Generador de Reportes PDF</h2>
          <p>Genera reportes personalizados de tus cuentas de servicios</p>
        </div>

        <div className="configuracion-reporte">
          {/* Tipo de reporte */}
          <div className="campo-grupo">
            <label className="campo-label">Tipo de Reporte</label>
            <div className="tipos-reporte">
              <button
                type="button"
                className={`tipo-boton ${configuracion.tipo === 'mensual' ? 'activo' : ''}`}
                onClick={() => handleTipoChange('mensual')}
              >
                <div className="tipo-icono">📊</div>
                <div className="tipo-info">
                  <span className="tipo-nombre">Reporte Mensual</span>
                  <span className="tipo-descripcion">Completo con estadísticas</span>
                </div>
              </button>
              
              <button
                type="button"
                className={`tipo-boton ${configuracion.tipo === 'planilla' ? 'activo' : ''}`}
                onClick={() => handleTipoChange('planilla')}
              >
                <div className="tipo-icono">✅</div>
                <div className="tipo-info">
                  <span className="tipo-nombre">Planilla de Pagos</span>
                  <span className="tipo-descripcion">Lista de cuentas pendientes</span>
                </div>
              </button>
              
              <button
                type="button"
                className={`tipo-boton ${configuracion.tipo === 'anual' ? 'activo' : ''}`}
                onClick={() => handleTipoChange('anual')}
              >
                <div className="tipo-icono">📈</div>
                <div className="tipo-info">
                  <span className="tipo-nombre">Reporte Anual</span>
                  <span className="tipo-descripcion">Resumen del año completo</span>
                </div>
              </button>
            </div>
          </div>

          {/* Período */}
          <div className="periodo-grupo">
            <div className="campo-grupo">
              <label className="campo-label">Año</label>
              <select
                value={configuracion.periodo.año}
                onChange={(e) => handleAñoChange(Number(e.target.value))}
                className="periodo-select"
              >
                {añosDisponibles.map(año => (
                  <option key={año} value={año}>{año}</option>
                ))}
              </select>
            </div>

            {configuracion.tipo !== 'anual' && (
              <div className="campo-grupo">
                <label className="campo-label">Mes</label>
                <select
                  value={configuracion.periodo.mes || 1}
                  onChange={(e) => handleMesChange(Number(e.target.value))}
                  className="periodo-select"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                    <option key={mes} value={mes}>
                      {new Date(2024, mes - 1).toLocaleDateString('es-AR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Opciones adicionales */}
          {configuracion.tipo === 'mensual' && (
            <div className="campo-grupo">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={configuracion.incluirGraficos}
                  onChange={(e) => handleIncluirGraficosChange(e.target.checked)}
                />
                <span className="checkbox-checkmark"></span>
                Incluir gráficos en el reporte
              </label>
            </div>
          )}
        </div>

        {/* Vista previa de la configuración */}
        <div className="vista-previa">
          <h3>Vista Previa</h3>
          <div className="previa-info">
            <div className="previa-item">
              <span className="previa-label">Tipo:</span>
              <span className="previa-valor">{configuracion.tipo.charAt(0).toUpperCase() + configuracion.tipo.slice(1)}</span>
            </div>
            <div className="previa-item">
              <span className="previa-label">Período:</span>
              <span className="previa-valor">
                {configuracion.tipo === 'anual' 
                  ? configuracion.periodo.año
                  : `${configuracion.periodo.mes}/${configuracion.periodo.año}`
                }
              </span>
            </div>
            <div className="previa-item">
              <span className="previa-label">Cuentas:</span>
              <span className="previa-valor">{obtenerCantidadCuentas()} cuentas</span>
            </div>
          </div>
          <p className="previa-descripcion">{obtenerDescripcionReporte()}</p>
        </div>

        {/* Botón de generación */}
        <div className="acciones-reporte">
          <Boton
            variante="primary"
            onClick={generarReporte}
            disabled={generando || obtenerCantidadCuentas() === 0}
            className="boton-generar"
          >
            {generando ? 'Generando...' : 'Generar y Descargar PDF'}
          </Boton>
          
          {obtenerCantidadCuentas() === 0 && (
            <p className="mensaje-sin-datos">
              No hay cuentas disponibles para el período seleccionado
            </p>
          )}
        </div>
      </Tarjeta>
    </div>
  );
};
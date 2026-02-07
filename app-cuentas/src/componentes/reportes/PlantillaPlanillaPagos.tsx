import React from 'react';
import type { CuentaServicio, TipoServicio } from '../../tipos';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import './PlantillaPlanillaPagos.css';

interface PlantillaPlanillaPagosProps {
  cuentas: CuentaServicio[];
  mes: number;
  año: number;
}

const NOMBRES_SERVICIOS: Record<TipoServicio, string> = {
  luz: 'Luz',
  agua: 'Agua',
  gas: 'Gas',
  internet: 'Internet'
};

const COLORES_SERVICIOS: Record<TipoServicio, string> = {
  luz: '#fbbf24',
  agua: '#3b82f6',
  gas: '#ef4444',
  internet: '#8b5cf6'
};

export const PlantillaPlanillaPagos: React.FC<PlantillaPlanillaPagosProps> = ({
  cuentas,
  mes,
  año
}) => {
  const fechaGeneracion = new Date();
  const nombreMes = format(new Date(año, mes - 1), 'MMMM yyyy', { locale: es });
  
  // Filtrar solo cuentas pendientes del período
  const cuentasPendientes = cuentas.filter(cuenta => 
    cuenta.mes === mes && 
    cuenta.año === año && 
    !cuenta.pagada
  );

  // Ordenar por fecha de vencimiento
  const cuentasOrdenadas = cuentasPendientes.sort((a, b) => 
    a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime()
  );

  // Calcular totales
  const totalPendiente = cuentasOrdenadas.reduce((sum, cuenta) => sum + cuenta.monto, 0);
  const totalPorServicio = cuentasOrdenadas.reduce((acc, cuenta) => {
    acc[cuenta.servicio] = (acc[cuenta.servicio] || 0) + cuenta.monto;
    return acc;
  }, {} as Record<TipoServicio, number>);

  // Generar calendario del mes
  const inicioMes = startOfMonth(new Date(año, mes - 1));
  const finMes = endOfMonth(new Date(año, mes - 1));
  const diasMes = eachDayOfInterval({ start: inicioMes, end: finMes });

  // Agrupar cuentas por día
  const cuentasPorDia = cuentasOrdenadas.reduce((acc, cuenta) => {
    const dia = cuenta.fechaVencimiento.getDate();
    if (!acc[dia]) {
      acc[dia] = [];
    }
    acc[dia].push(cuenta);
    return acc;
  }, {} as Record<number, CuentaServicio[]>);

  return (
    <div className="plantilla-planilla-pagos">
      {/* Encabezado */}
      <header className="planilla-header">
        <h1>Planilla de Cuentas a Pagar</h1>
        <div className="planilla-info">
          <p><strong>Período:</strong> {nombreMes}</p>
          <p><strong>Fecha de generación:</strong> {format(fechaGeneracion, 'dd/MM/yyyy HH:mm', { locale: es })}</p>
        </div>
      </header>

      {/* Resumen de totales */}
      <section className="resumen-totales">
        <div className="total-general">
          <span className="total-label">Total a Pagar:</span>
          <span className="total-valor">${totalPendiente.toLocaleString('es-AR')}</span>
        </div>
        <div className="totales-por-servicio">
          {Object.entries(totalPorServicio).map(([servicio, total]) => (
            <div key={servicio} className="servicio-total">
              <div 
                className="servicio-color" 
                style={{ backgroundColor: COLORES_SERVICIOS[servicio as TipoServicio] }}
              ></div>
              <span className="servicio-nombre">{NOMBRES_SERVICIOS[servicio as TipoServicio]}</span>
              <span className="servicio-monto">${total.toLocaleString('es-AR')}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Lista de cuentas con checkboxes */}
      <section className="lista-cuentas">
        <h2>Cuentas Pendientes ({cuentasOrdenadas.length})</h2>
        
        <div className="cuentas-checklist">
          {cuentasOrdenadas.map((cuenta) => (
            <div key={cuenta.id} className="cuenta-item">
              <div className="checkbox-container">
                <input 
                  type="checkbox" 
                  id={`cuenta-${cuenta.id}`}
                  className="cuenta-checkbox"
                />
                <label htmlFor={`cuenta-${cuenta.id}`} className="checkbox-label"></label>
              </div>
              
              <div className="cuenta-info">
                <div className="cuenta-principal">
                  <div className="servicio-info">
                    <div 
                      className="servicio-indicator"
                      style={{ backgroundColor: COLORES_SERVICIOS[cuenta.servicio] }}
                    ></div>
                    <span className="servicio-nombre">{NOMBRES_SERVICIOS[cuenta.servicio]}</span>
                  </div>
                  <span className="cuenta-monto">${cuenta.monto.toLocaleString('es-AR')}</span>
                </div>
                
                <div className="cuenta-detalles">
                  <div className="fechas-principales">
                    <span className="fecha-vencimiento">
                      Vence: {format(cuenta.fechaVencimiento, 'dd/MM/yyyy', { locale: es })}
                    </span>
                    <span className="dias-restantes">
                      {(() => {
                        const hoy = new Date();
                        const diasRestantes = Math.ceil((cuenta.fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                        if (diasRestantes < 0) {
                          return `Vencida (${Math.abs(diasRestantes)} días)`;
                        } else if (diasRestantes === 0) {
                          return 'Vence hoy';
                        } else if (diasRestantes <= 3) {
                          return `${diasRestantes} días`;
                        } else {
                          return `${diasRestantes} días`;
                        }
                      })()}
                    </span>
                  </div>
                  
                  <div className="fechas-adicionales">
                    {cuenta.fechaEmision && (
                      <span className="fecha-emision">
                        Emisión: {format(cuenta.fechaEmision, 'dd/MM/yyyy', { locale: es })}
                      </span>
                    )}
                    {cuenta.fechaCorte && (
                      <span className="fecha-corte">
                        Corte: {format(cuenta.fechaCorte, 'dd/MM/yyyy', { locale: es })}
                      </span>
                    )}
                    {cuenta.proximaFechaLectura && (
                      <span className="proxima-lectura">
                        Próx. Lectura: {format(cuenta.proximaFechaLectura, 'dd/MM/yyyy', { locale: es })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Calendario visual */}
      <section className="calendario-visual">
        <h2>Calendario de Vencimientos</h2>
        <div className="calendario-grid">
          <div className="calendario-header">
            <div className="dia-semana">Dom</div>
            <div className="dia-semana">Lun</div>
            <div className="dia-semana">Mar</div>
            <div className="dia-semana">Mié</div>
            <div className="dia-semana">Jue</div>
            <div className="dia-semana">Vie</div>
            <div className="dia-semana">Sáb</div>
          </div>
          
          <div className="calendario-dias">
            {/* Días vacíos al inicio del mes */}
            {Array.from({ length: inicioMes.getDay() }, (_, i) => (
              <div key={`empty-${i}`} className="dia-vacio"></div>
            ))}
            
            {/* Días del mes */}
            {diasMes.map(dia => {
              const numeroDia = dia.getDate();
              const cuentasDia = cuentasPorDia[numeroDia] || [];
              const tieneCuentas = cuentasDia.length > 0;
              
              return (
                <div key={numeroDia} className={`dia-calendario ${tieneCuentas ? 'con-cuentas' : ''}`}>
                  <span className="numero-dia">{numeroDia}</span>
                  {tieneCuentas && (
                    <div className="cuentas-dia">
                      {cuentasDia.map(cuenta => (
                        <div 
                          key={cuenta.id}
                          className="cuenta-punto"
                          style={{ backgroundColor: COLORES_SERVICIOS[cuenta.servicio] }}
                          title={`${NOMBRES_SERVICIOS[cuenta.servicio]}: $${cuenta.monto.toLocaleString('es-AR')}`}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leyenda */}
      <section className="leyenda">
        <h3>Leyenda de Servicios</h3>
        <div className="leyenda-items">
          {Object.entries(NOMBRES_SERVICIOS).map(([tipo, nombre]) => (
            <div key={tipo} className="leyenda-item">
              <div 
                className="leyenda-color"
                style={{ backgroundColor: COLORES_SERVICIOS[tipo as TipoServicio] }}
              ></div>
              <span>{nombre}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Resumen final */}
      <section className="resumen-final">
        <div className="resumen-grid">
          <div className="resumen-item">
            <span className="resumen-label">Total de cuentas:</span>
            <span className="resumen-valor">{cuentasOrdenadas.length}</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-label">Monto total:</span>
            <span className="resumen-valor">${totalPendiente.toLocaleString('es-AR')}</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-label">Cuentas pagadas:</span>
            <span className="resumen-valor">_____ / {cuentasOrdenadas.length}</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-label">Monto pagado:</span>
            <span className="resumen-valor">$ ______________</span>
          </div>
        </div>
      </section>

      {/* Pie de página */}
      <footer className="planilla-footer">
        <p>Generado automáticamente por Sistema de Gestión de Cuentas de Servicios</p>
        <p>Página 1 de 1</p>
      </footer>
    </div>
  );
};
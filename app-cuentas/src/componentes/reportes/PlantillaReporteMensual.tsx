import React from "react";
import type {
  CuentaServicio,
  EstadisticasMensuales,
  TipoServicio,
} from "../../tipos";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "./PlantillaReporteMensual.css";

interface PlantillaReporteMensualProps {
  cuentas: CuentaServicio[];
  estadisticas: EstadisticasMensuales;
  incluirGraficos?: boolean;
}

const NOMBRES_SERVICIOS: Record<TipoServicio, string> = {
  luz: "Luz",
  agua: "Agua",
  gas: "Gas",
  internet: "Internet",
};

export const PlantillaReporteMensual: React.FC<
  PlantillaReporteMensualProps
> = ({ cuentas, estadisticas, incluirGraficos = true }) => {
  const fechaGeneracion = new Date();
  const nombreMes = format(
    new Date(estadisticas.año, estadisticas.mes - 1),
    "MMMM yyyy",
    { locale: es }
  );

  // Agrupar cuentas por servicio
  const cuentasPorServicio = cuentas.reduce((acc, cuenta) => {
    if (!acc[cuenta.servicio]) {
      acc[cuenta.servicio] = [];
    }
    acc[cuenta.servicio].push(cuenta);
    return acc;
  }, {} as Record<TipoServicio, CuentaServicio[]>);

  // Calcular totales por estado de pago
  const cuentasPagadas = cuentas.filter((c) => c.pagada);
  const cuentasPendientes = cuentas.filter((c) => !c.pagada);
  const totalPagado = cuentasPagadas.reduce((sum, c) => sum + c.monto, 0);
  const totalPendiente = cuentasPendientes.reduce((sum, c) => sum + c.monto, 0);

  return (
    <div className="plantilla-reporte-mensual">
      {/* Encabezado */}
      <header className="reporte-header">
        <h1>Reporte Mensual de Cuentas de Servicios</h1>
        <div className="reporte-info">
          <p>
            <strong>Período:</strong> {nombreMes}
          </p>
          <p>
            <strong>Fecha de generación:</strong>{" "}
            {format(fechaGeneracion, "dd/MM/yyyy HH:mm", { locale: es })}
          </p>
        </div>
      </header>

      {/* Resumen ejecutivo */}
      <section className="resumen-ejecutivo">
        <h2>Resumen Ejecutivo</h2>
        <div className="metricas-grid">
          <div className="metrica">
            <span className="metrica-label">Total de Gastos</span>
            <span className="metrica-valor">
              ${estadisticas.totalGastos.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="metrica">
            <span className="metrica-label">Promedio Mensual</span>
            <span className="metrica-valor">
              ${estadisticas.promedioMensual.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="metrica">
            <span className="metrica-label">Comparativa Anterior</span>
            <span
              className={`metrica-valor ${
                estadisticas.comparativaAnterior >= 0 ? "positivo" : "negativo"
              }`}
            >
              {estadisticas.comparativaAnterior >= 0 ? "+" : ""}
              {estadisticas.comparativaAnterior.toFixed(1)}%
            </span>
          </div>
          <div className="metrica">
            <span className="metrica-label">Total de Cuentas</span>
            <span className="metrica-valor">{cuentas.length}</span>
          </div>
        </div>
      </section>

      {/* Estado de pagos */}
      <section className="estado-pagos">
        <h2>Estado de Pagos</h2>
        <div className="pagos-grid">
          <div className="pago-item pagado">
            <span className="pago-label">
              Pagadas ({cuentasPagadas.length})
            </span>
            <span className="pago-valor">
              ${totalPagado.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="pago-item pendiente">
            <span className="pago-label">
              Pendientes ({cuentasPendientes.length})
            </span>
            <span className="pago-valor">
              ${totalPendiente.toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      </section>

      {/* Detalle por servicio */}
      <section className="detalle-servicios">
        <h2>Detalle por Servicio</h2>
        {Object.entries(estadisticas.gastosPorServicio).map(
          ([servicioKey, total]) => {
            const servicio = servicioKey as TipoServicio;
            const cuentasServicio = cuentasPorServicio[servicio] || [];
            const porcentaje =
              estadisticas.totalGastos > 0
                ? (total / estadisticas.totalGastos) * 100
                : 0;

            if (total === 0) return null;

            return (
              <div key={servicio} className="servicio-detalle">
                <div className="servicio-header">
                  <h3>{NOMBRES_SERVICIOS[servicio]}</h3>
                  <div className="servicio-totales">
                    <span className="servicio-total">
                      ${total.toLocaleString("es-AR")}
                    </span>
                    <span className="servicio-porcentaje">
                      ({porcentaje.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <table className="cuentas-tabla">
                  <thead>
                    <tr>
                      <th>Fecha Emisión</th>
                      <th>Fecha Vencimiento</th>
                      <th>Fecha Corte</th>
                      <th>Próx. Lectura</th>
                      <th>Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuentasServicio
                      .sort(
                        (a: CuentaServicio, b: CuentaServicio) =>
                          a.fechaVencimiento.getTime() -
                          b.fechaVencimiento.getTime()
                      )
                      .map((cuenta: CuentaServicio) => (
                        <tr
                          key={cuenta.id}
                          className={cuenta.pagada ? "pagada" : "pendiente"}
                        >
                          <td>
                            {cuenta.fechaEmision
                              ? format(cuenta.fechaEmision, "dd/MM/yyyy", {
                                  locale: es,
                                })
                              : "-"}
                          </td>
                          <td>
                            {format(cuenta.fechaVencimiento, "dd/MM/yyyy", {
                              locale: es,
                            })}
                          </td>
                          <td>
                            {cuenta.fechaCorte
                              ? format(cuenta.fechaCorte, "dd/MM/yyyy", {
                                  locale: es,
                                })
                              : "-"}
                          </td>
                          <td>
                            {cuenta.proximaFechaLectura
                              ? format(
                                  cuenta.proximaFechaLectura,
                                  "dd/MM/yyyy",
                                  { locale: es }
                                )
                              : "-"}
                          </td>
                          <td>${cuenta.monto.toLocaleString("es-AR")}</td>
                          <td>
                            <span
                              className={`estado-badge ${
                                cuenta.pagada ? "pagada" : "pendiente"
                              }`}
                            >
                              {cuenta.pagada ? "Pagada" : "Pendiente"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            );
          }
        )}
      </section>

      {/* Gráficos placeholder - se implementarán en la siguiente fase */}
      {incluirGraficos && (
        <section className="graficos-seccion">
          <h2>Gráficos y Análisis</h2>
          <div className="grafico-placeholder">
            <p>Los gráficos se incluirán en la versión final del PDF</p>
          </div>
        </section>
      )}

      {/* Pie de página */}
      <footer className="reporte-footer">
        <p>
          Generado automáticamente por Sistema de Gestión de Cuentas de
          Servicios
        </p>
        <p>Página 1 de 1</p>
      </footer>
    </div>
  );
};

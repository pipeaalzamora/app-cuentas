import React, { useState, useMemo, useCallback, memo } from 'react';
import { useCuentas } from '../contextos/CuentasContext';
import Boton from './base/Boton';
import Tarjeta from './base/Tarjeta';
import ConfirmacionEliminar from './base/ConfirmacionEliminar';
import { SkeletonTabla } from './base/Skeleton';
import type { CuentaServicio, FiltrosCuentas, CampoOrdenamiento, DireccionOrdenamiento, TipoServicio } from '../tipos';
import { useDebounce } from '../utilidades/useDebounce';
import { formatearPesosChilenos, formatearFechaChilena, formatearMesAñoChileno, obtenerNombreMes } from '../utilidades/formatoChileno';
import './ListaCuentas.css';

interface ListaCuentasProps {
  onEditarCuenta?: (cuenta: CuentaServicio) => void;
}

const ListaCuentas: React.FC<ListaCuentasProps> = ({ onEditarCuenta }) => {
  const {
    cuentasFiltradas,
    filtros,
    establecerFiltros,
    limpiarFiltros,
    eliminarCuenta,
    cargando,
    error
  } = useCuentas();

  // Estados locales para filtros y ordenamiento
  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosCuentas>(filtros);
  const [ordenamiento, setOrdenamiento] = useState<{
    campo: CampoOrdenamiento;
    direccion: DireccionOrdenamiento;
  }>({
    campo: 'fechaVencimiento',
    direccion: 'desc'
  });

  // Debounce para filtros para optimizar rendimiento
  const filtrosDebounced = useDebounce(filtrosLocales, 300);

  // Estado para confirmación de eliminación
  const [cuentaAEliminar, setCuentaAEliminar] = useState<CuentaServicio | null>(null);

  // Obtener años únicos para el filtro
  const añosDisponibles = useMemo(() => {
    const años = new Set(cuentasFiltradas.map(cuenta => cuenta.año));
    return Array.from(años).sort((a, b) => b - a);
  }, [cuentasFiltradas]);

  // Aplicar ordenamiento a las cuentas filtradas
  const cuentasOrdenadas = useMemo(() => {
    return [...cuentasFiltradas].sort((a, b) => {
      let valorA: string | number | boolean | Date = a[ordenamiento.campo];
      let valorB: string | number | boolean | Date = b[ordenamiento.campo];

      // Convertir fechas a timestamps para comparación
      if (valorA instanceof Date) valorA = valorA.getTime();
      if (valorB instanceof Date) valorB = valorB.getTime();

      // Convertir strings a minúsculas para comparación
      if (typeof valorA === 'string') valorA = valorA.toLowerCase();
      if (typeof valorB === 'string') valorB = valorB.toLowerCase();

      let resultado = 0;
      if (valorA < valorB) resultado = -1;
      if (valorA > valorB) resultado = 1;

      return ordenamiento.direccion === 'desc' ? -resultado : resultado;
    });
  }, [cuentasFiltradas, ordenamiento]);

  // Manejar cambios en filtros con debounce
  const manejarCambioFiltro = useCallback((campo: keyof FiltrosCuentas, valor: string | number | boolean | undefined) => {
    const nuevosFiltros = {
      ...filtrosLocales,
      [campo]: valor === '' || valor === undefined ? undefined : valor
    };
    setFiltrosLocales(nuevosFiltros);
  }, [filtrosLocales]);

  // Aplicar filtros debounced
  React.useEffect(() => {
    establecerFiltros(filtrosDebounced);
  }, [filtrosDebounced, establecerFiltros]);

  // Manejar cambio de ordenamiento
  const manejarOrdenamiento = useCallback((campo: CampoOrdenamiento) => {
    setOrdenamiento(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Limpiar todos los filtros
  const manejarLimpiarFiltros = useCallback(() => {
    setFiltrosLocales({});
    limpiarFiltros();
  }, [limpiarFiltros]);

  // Manejar eliminación de cuenta
  const manejarEliminarCuenta = async () => {
    if (!cuentaAEliminar) return;

    try {
      await eliminarCuenta(cuentaAEliminar.id);
      setCuentaAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
    }
  };

  // Obtener icono de ordenamiento
  const obtenerIconoOrdenamiento = (campo: CampoOrdenamiento) => {
    if (ordenamiento.campo !== campo) {
      return <span className="lista-cuentas__icono-ordenamiento">↕️</span>;
    }
    return (
      <span className="lista-cuentas__icono-ordenamiento">
        {ordenamiento.direccion === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Obtener color por tipo de servicio
  const obtenerColorServicio = (servicio: string) => {
    const colores = {
      luz: 'var(--color-luz)',
      agua: 'var(--color-agua)',
      gas: 'var(--color-gas)',
      internet: 'var(--color-internet)'
    };
    return colores[servicio as keyof typeof colores] || 'var(--color-secundario)';
  };

  // Formatear monto en pesos chilenos
  const formatearMonto = useCallback((monto: number) => {
    return formatearPesosChilenos(monto);
  }, []);

  if (cargando) {
    return (
      <div className="lista-cuentas">
        <Tarjeta className="lista-cuentas__filtros">
          <Tarjeta.Header>
            <h3>Filtros</h3>
          </Tarjeta.Header>
          <Tarjeta.Body>
            <div className="lista-cuentas__filtros-grid">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="lista-cuentas__filtro">
                  <div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ height: '36px', backgroundColor: '#f0f0f0', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          </Tarjeta.Body>
        </Tarjeta>
        <Tarjeta className="lista-cuentas__tabla-container" padding="none">
          <Tarjeta.Body>
            <SkeletonTabla rows={5} columns={7} />
          </Tarjeta.Body>
        </Tarjeta>
      </div>
    );
  }

  if (error) {
    return (
      <Tarjeta>
        <Tarjeta.Body>
          <div className="lista-cuentas__error">
            <p>Error: {error}</p>
          </div>
        </Tarjeta.Body>
      </Tarjeta>
    );
  }

  return (
    <div className="lista-cuentas">
      {/* Filtros */}
      <Tarjeta className="lista-cuentas__filtros">
        <Tarjeta.Header>
          <h3>Filtros</h3>
        </Tarjeta.Header>
        <Tarjeta.Body>
          <div className="lista-cuentas__filtros-grid">
            {/* Filtro por año */}
            <div className="lista-cuentas__filtro">
              <label htmlFor="filtro-año">Año:</label>
              <select
                id="filtro-año"
                value={filtrosLocales.año || ''}
                onChange={(e) => manejarCambioFiltro('año', e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">Todos los años</option>
                {añosDisponibles.map(año => (
                  <option key={año} value={año}>{año}</option>
                ))}
              </select>
            </div>

            {/* Filtro por mes */}
            <div className="lista-cuentas__filtro">
              <label htmlFor="filtro-mes">Mes:</label>
              <select
                id="filtro-mes"
                value={filtrosLocales.mes || ''}
                onChange={(e) => manejarCambioFiltro('mes', e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">Todos los meses</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                  <option key={mes} value={mes}>
                    {obtenerNombreMes(mes)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por tipo de servicio */}
            <div className="lista-cuentas__filtro">
              <label htmlFor="filtro-servicio">Servicio:</label>
              <select
                id="filtro-servicio"
                value={filtrosLocales.servicio || ''}
                onChange={(e) => manejarCambioFiltro('servicio', (e.target.value as TipoServicio) || undefined)}
              >
                <option value="">Todos los servicios</option>
                <option value="luz">Luz</option>
                <option value="agua">Agua</option>
                <option value="gas">Gas</option>
                <option value="internet">Internet</option>
              </select>
            </div>

            {/* Filtro por estado de pago */}
            <div className="lista-cuentas__filtro">
              <label htmlFor="filtro-pagada">Estado:</label>
              <select
                id="filtro-pagada"
                value={filtrosLocales.pagada !== undefined ? filtrosLocales.pagada.toString() : ''}
                onChange={(e) => manejarCambioFiltro('pagada', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <option value="">Todas</option>
                <option value="true">Pagadas</option>
                <option value="false">Pendientes</option>
              </select>
            </div>
          </div>

          <div className="lista-cuentas__filtros-acciones">
            <Boton
              variante="outline"
              tamaño="sm"
              onClick={manejarLimpiarFiltros}
            >
              Limpiar filtros
            </Boton>
            <span className="lista-cuentas__contador">
              {cuentasOrdenadas.length} cuenta{cuentasOrdenadas.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Tarjeta.Body>
      </Tarjeta>

      {/* Tabla de cuentas */}
      <Tarjeta className="lista-cuentas__tabla-container" padding="none">
        <Tarjeta.Body>
          {cuentasOrdenadas.length === 0 ? (
            <div className="lista-cuentas__vacia">
              <p>No se encontraron cuentas con los filtros aplicados.</p>
            </div>
          ) : (
            <div className="lista-cuentas__tabla-wrapper">
              <table className="lista-cuentas__tabla">
                <thead>
                  <tr>
                    <th>
                      <button
                        className="lista-cuentas__header-boton"
                        onClick={() => manejarOrdenamiento('servicio')}
                      >
                        Servicio {obtenerIconoOrdenamiento('servicio')}
                      </button>
                    </th>
                    <th>
                      <button
                        className="lista-cuentas__header-boton"
                        onClick={() => manejarOrdenamiento('monto')}
                      >
                        Monto {obtenerIconoOrdenamiento('monto')}
                      </button>
                    </th>
                    <th>
                      <button
                        className="lista-cuentas__header-boton"
                        onClick={() => manejarOrdenamiento('fechaVencimiento')}
                      >
                        Vencimiento {obtenerIconoOrdenamiento('fechaVencimiento')}
                      </button>
                    </th>
                    <th>Período</th>
                    <th>Estado</th>
                    <th>
                      <button
                        className="lista-cuentas__header-boton"
                        onClick={() => manejarOrdenamiento('fechaCreacion')}
                      >
                        Creada {obtenerIconoOrdenamiento('fechaCreacion')}
                      </button>
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentasOrdenadas.map((cuenta) => (
                    <FilaCuenta
                      key={cuenta.id}
                      cuenta={cuenta}
                      onEditar={onEditarCuenta}
                      onEliminar={setCuentaAEliminar}
                      obtenerColorServicio={obtenerColorServicio}
                      formatearMonto={formatearMonto}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Tarjeta.Body>
      </Tarjeta>

      {/* Modal de confirmación de eliminación */}
      {cuentaAEliminar && (
        <ConfirmacionEliminar
          abierto={true}
          titulo="Eliminar cuenta"
          mensaje={`¿Estás seguro de que deseas eliminar la cuenta de ${cuentaAEliminar.servicio} de ${formatearMonto(cuentaAEliminar.monto)}?`}
          onConfirmar={manejarEliminarCuenta}
          onCerrar={() => setCuentaAEliminar(null)}
          tipo="eliminar"
        />
      )}
    </div>
  );
};

// Componente memoizado para las filas de la tabla
const FilaCuenta = memo<{
  cuenta: CuentaServicio;
  onEditar?: (cuenta: CuentaServicio) => void;
  onEliminar: (cuenta: CuentaServicio) => void;
  obtenerColorServicio: (tipo: string) => string;
  formatearMonto: (monto: number) => string;
}>(({ cuenta, onEditar, onEliminar, obtenerColorServicio, formatearMonto }) => (
  <tr className="lista-cuentas__fila">
    <td>
      <div className="lista-cuentas__servicio">
        <span
          className="lista-cuentas__servicio-indicador"
          style={{ backgroundColor: obtenerColorServicio(cuenta.servicio) }}
        />
        <span className="lista-cuentas__servicio-texto">
          {cuenta.servicio.charAt(0).toUpperCase() + cuenta.servicio.slice(1)}
        </span>
      </div>
    </td>
    <td className="lista-cuentas__monto">
      {formatearMonto(cuenta.monto)}
    </td>
    <td>
      {formatearFechaChilena(cuenta.fechaVencimiento)}
    </td>
    <td>
      {formatearMesAñoChileno(new Date(cuenta.año, cuenta.mes - 1, 1))}
    </td>
    <td>
      <span className={`lista-cuentas__estado lista-cuentas__estado--${cuenta.pagada ? 'pagada' : 'pendiente'}`}>
        {cuenta.pagada ? 'Pagada' : 'Pendiente'}
      </span>
    </td>
    <td className="lista-cuentas__fecha-creacion">
      {formatearFechaChilena(cuenta.fechaCreacion)}
    </td>
    <td>
      <div className="lista-cuentas__acciones">
        {onEditar && (
          <Boton
            variante="outline"
            tamaño="sm"
            onClick={() => onEditar(cuenta)}
            title="Editar cuenta"
          >
            ✏️
          </Boton>
        )}
        <Boton
          variante="outline"
          tamaño="sm"
          onClick={() => onEliminar(cuenta)}
          title="Eliminar cuenta"
        >
          🗑️
        </Boton>
      </div>
    </td>
  </tr>
));

FilaCuenta.displayName = 'FilaCuenta';

export default memo(ListaCuentas);
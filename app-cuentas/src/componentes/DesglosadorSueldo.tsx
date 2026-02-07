import React, { useState, useEffect } from 'react';
import type { DesgloseSueldo, Gasto, TipoGasto } from '../tipos/desglosador';
import type { TipoGastoBebe } from '../tipos/desglosadorBebe';
import { servicioDesglosadorSueldo } from '../servicios/desglosadorSueldo';
import { desgloseSueldoAPI } from '../servicios/desgloseSueldoAPI';
import { desgloseBebeAPI } from '../servicios/desgloseBebeAPI';
import { calculadoraGastosAPI } from '../servicios/calculadoraGastosAPI';
import { servicioGeneradorPDF } from '../servicios/generadorPDF';
import { Boton, Input, Tarjeta, Modal } from './index';
import { usePeriodo } from '../contextos/PeriodoContext';
import './DesglosadorSueldo.css';

const formatearPesosChilenos = (monto: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(monto);
};

const formatearNumeroConPuntos = (valor: string): string => {
  const numero = valor.replace(/\D/g, '');
  if (!numero) return '';
  return new Intl.NumberFormat('es-CL').format(parseInt(numero));
};

const limpiarNumero = (valor: string): string => {
  return valor.replace(/\D/g, '');
};

const DesglosadorSueldo: React.FC = () => {
  const { mes: mesGlobal, año: añoGlobal, cambiarPeriodo } = usePeriodo();
  const [desgloseActual, setDesgloseActual] = useState<DesgloseSueldo | null>(null);
  const [todosDesgloses, setTodosDesgloses] = useState<DesgloseSueldo[]>([]);
  const [sueldoInicial, setSueldoInicial] = useState<string>('');
  const [presupuestoBebe, setPresupuestoBebe] = useState<string>('');
  const [crearDesgloseBebe, setCrearDesgloseBebe] = useState<boolean>(true);
  const [nombreDesglose, setNombreDesglose] = useState<string>('');
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
  const [mostrarEditarSueldo, setMostrarEditarSueldo] = useState(false);
  const [mostrarConfirmacionEliminarTodos, setMostrarConfirmacionEliminarTodos] = useState(false);
  const [nuevoSueldo, setNuevoSueldo] = useState<string>('');
  const [gastoEditando, setGastoEditando] = useState<string | null>(null);
  
  // Categoría de gasto seleccionada
  const [categoriaGasto, setCategoriaGasto] = useState<'propio' | 'bebe' | 'general'>('propio');
  
  // Form gasto propio
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [tipo, setTipo] = useState<TipoGasto>('otro');
  
  // Form gasto bebé
  const [descripcionBebe, setDescripcionBebe] = useState('');
  const [montoBebe, setMontoBebe] = useState('');
  const [cantidadBebe, setCantidadBebe] = useState('1');
  const [tipoBebe, setTipoBebe] = useState<string>('otro');
  const [notasBebe, setNotasBebe] = useState('');
  const [enlaceProductoBebe, setEnlaceProductoBebe] = useState('');
  
  // Form gasto general
  const [tituloGeneral, setTituloGeneral] = useState('');
  const [montoGeneral, setMontoGeneral] = useState('');
  const [cantidadGeneral, setCantidadGeneral] = useState('1');

  useEffect(() => {
    cargarDesgloses();
  }, []);

  useEffect(() => {
    // Cuando cambia el periodo global, cargar el desglose correspondiente
    if (todosDesgloses.length > 0) {
      cargarDesglosePorPeriodo(mesGlobal, añoGlobal);
    }
  }, [mesGlobal, añoGlobal, todosDesgloses.length]);

  const cargarDesgloses = async () => {
    try {
      const desgloses = await servicioDesglosadorSueldo.obtenerDesgloses();
      setTodosDesgloses(desgloses);
      
      // Cargar el desglose del periodo global
      cargarDesglosePorPeriodo(mesGlobal, añoGlobal, desgloses);
    } catch (error) {
      console.error('Error al cargar desgloses:', error);
    }
  };

  const cargarDesglosePorPeriodo = (mes: number, año: number, desgloses?: DesgloseSueldo[]) => {
    const listaDesgloses = desgloses || todosDesgloses;
    const desglose = listaDesgloses.find(d => d.mes === mes && d.año === año);
    
    if (desglose) {
      setDesgloseActual(desglose);
      setSueldoInicial(desglose.sueldoInicial.toString());
      setNombreDesglose(desglose.nombre || '');
    } else {
      setDesgloseActual(null);
    }
  };

  const iniciarDesglose = async () => {
    const sueldoLimpio = limpiarNumero(sueldoInicial);
    const sueldo = parseFloat(sueldoLimpio);
    if (isNaN(sueldo) || sueldo <= 0) return;

    const presupuestoLimpio = limpiarNumero(presupuestoBebe);
    const presupuesto = presupuestoLimpio ? parseFloat(presupuestoLimpio) : 0;

    const nuevoDesglose: any = {
      sueldoInicial: sueldo,
      mes: mesGlobal,
      año: añoGlobal,
      nombre: nombreDesglose || `Desglose ${mesGlobal}/${añoGlobal}`
    };

    if (crearDesgloseBebe && presupuesto > 0) {
      nuevoDesglose.crearDesgloseBebe = true;
      nuevoDesglose.presupuestoBebe = presupuesto;
    }

    try {
      const creado = await desgloseSueldoAPI.crear(nuevoDesglose);
      setDesgloseActual(creado.desglose || creado);
      await cargarDesgloses();
    } catch (error) {
      console.error('Error al iniciar desglose:', error);
    }
  };

  const agregarGasto = async () => {
    if (!desgloseActual) return;

    try {
      if (categoriaGasto === 'propio') {
        // Agregar gasto propio
        if (!descripcion || !monto) return;
        const montoLimpio = limpiarNumero(monto);
        const montoNum = parseFloat(montoLimpio);
        if (isNaN(montoNum) || montoNum <= 0) return;

        const nuevoGasto = {
          descripcion,
          monto: montoNum,
          tipo
        };

        await desgloseSueldoAPI.agregarGasto(desgloseActual.id, nuevoGasto);
        
        // Reset form
        setDescripcion('');
        setMonto('');
        setTipo('otro');
      } else if (categoriaGasto === 'bebe') {
        // Agregar gasto de bebé
        if (!descripcionBebe || !montoBebe || !cantidadBebe) return;
        const montoLimpio = limpiarNumero(montoBebe);
        const montoNum = parseFloat(montoLimpio);
        const cantidadNum = parseInt(cantidadBebe);
        
        if (isNaN(montoNum) || montoNum <= 0) return;
        if (isNaN(cantidadNum) || cantidadNum <= 0) return;

        const nuevoGastoBebe = {
          descripcion: descripcionBebe,
          monto: montoNum,
          cantidad: cantidadNum,
          tipo: tipoBebe as TipoGastoBebe,
          notas: notasBebe || undefined,
          enlaceProducto: enlaceProductoBebe || undefined
        };

        // Buscar o crear desglose de bebé para este mes/año
        const desglosesBebe = await desgloseBebeAPI.obtenerTodos();
        let desgloseBebe = desglosesBebe.find((d: any) => d.mes === desgloseActual.mes && d.año === desgloseActual.año);
        
        if (!desgloseBebe) {
          // Crear desglose de bebé si no existe con un presupuesto inicial
          desgloseBebe = await desgloseBebeAPI.crear({
            presupuestoMensual: 500000, // Presupuesto inicial por defecto
            mes: desgloseActual.mes,
            año: desgloseActual.año,
            nombre: `Gastos Bebé ${desgloseActual.mes}/${desgloseActual.año}`
          });
        }

        await desgloseBebeAPI.agregarGasto(desgloseBebe.id, nuevoGastoBebe);
        
        // Reset form
        setDescripcionBebe('');
        setMontoBebe('');
        setCantidadBebe('1');
        setTipoBebe('otro');
        setNotasBebe('');
        setEnlaceProductoBebe('');
      } else if (categoriaGasto === 'general') {
        // Agregar gasto general
        if (!tituloGeneral || !montoGeneral || !cantidadGeneral) return;
        const montoLimpio = limpiarNumero(montoGeneral);
        const montoNum = parseFloat(montoLimpio);
        const cantidadNum = parseInt(cantidadGeneral);
        
        if (isNaN(montoNum) || montoNum <= 0) return;
        if (isNaN(cantidadNum) || cantidadNum <= 0) return;

        const nuevoGastoGeneral = {
          titulo: tituloGeneral,
          monto: montoNum,
          cantidad: cantidadNum
        };

        await calculadoraGastosAPI.agregarGasto(nuevoGastoGeneral);
        
        // Reset form
        setTituloGeneral('');
        setMontoGeneral('');
        setCantidadGeneral('1');
      }
      
      // Recargar el desglose actualizado
      await cargarDesgloses();
      setMostrarFormGasto(false);
    } catch (error) {
      console.error('Error al agregar gasto:', error);
    }
  };

  const eliminarGasto = async (gastoId: string) => {
    if (!desgloseActual) return;

    try {
      await desgloseSueldoAPI.eliminarGasto(desgloseActual.id, gastoId);
      
      // Recargar el desglose actualizado
      await cargarDesgloses();
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
    }
  };

  const iniciarEdicionGasto = (gasto: Gasto) => {
    setGastoEditando(gasto.id);
    setDescripcion(gasto.descripcion);
    setMonto(formatearNumeroConPuntos(gasto.monto.toString()));
    setTipo(gasto.tipo);
    setMostrarFormGasto(true);
  };

  const actualizarGasto = async () => {
    if (!desgloseActual || !gastoEditando || !descripcion || !monto) return;

    const montoLimpio = limpiarNumero(monto);
    const montoNum = parseFloat(montoLimpio);
    if (isNaN(montoNum) || montoNum <= 0) return;

    try {
      // Primero eliminar el gasto viejo
      await desgloseSueldoAPI.eliminarGasto(desgloseActual.id, gastoEditando);
      
      // Luego agregar el gasto actualizado
      const gastoActualizado = {
        descripcion,
        monto: montoNum,
        tipo
      };
      await desgloseSueldoAPI.agregarGasto(desgloseActual.id, gastoActualizado);
      
      // Recargar el desglose
      await cargarDesgloses();
      
      // Reset form
      setDescripcion('');
      setMonto('');
      setTipo('otro');
      setGastoEditando(null);
      setMostrarFormGasto(false);
    } catch (error) {
      console.error('Error al actualizar gasto:', error);
    }
  };

  const cancelarEdicion = () => {
    setDescripcion('');
    setMonto('');
    setTipo('otro');
    setDescripcionBebe('');
    setMontoBebe('');
    setCantidadBebe('1');
    setTipoBebe('otro');
    setNotasBebe('');
    setEnlaceProductoBebe('');
    setTituloGeneral('');
    setMontoGeneral('');
    setCantidadGeneral('1');
    setGastoEditando(null);
    setMostrarFormGasto(false);
    setCategoriaGasto('propio');
  };

  const generarPDF = () => {
    if (!desgloseActual) return;
    
    const resumen = servicioDesglosadorSueldo.calcularResumen(desgloseActual);
    servicioGeneradorPDF.generarReporteDesglose(desgloseActual, resumen);
  };

  const editarSueldo = async () => {
    if (!desgloseActual) return;
    
    const sueldoLimpio = limpiarNumero(nuevoSueldo);
    const sueldo = parseFloat(sueldoLimpio);
    if (isNaN(sueldo) || sueldo <= 0) return;

    const desgloseActualizado = {
      sueldoInicial: sueldo,
      mes: desgloseActual.mes,
      año: desgloseActual.año,
      nombre: desgloseActual.nombre
    };

    try {
      await desgloseSueldoAPI.actualizar(desgloseActual.id, desgloseActualizado);
      await cargarDesgloses();
      setMostrarEditarSueldo(false);
      setNuevoSueldo('');
    } catch (error) {
      console.error('Error al editar sueldo:', error);
    }
  };

  const eliminarTodosDesgloses = async () => {
    try {
      await desgloseSueldoAPI.eliminarTodos();
      setTodosDesgloses([]);
      setDesgloseActual(null);
      setMostrarConfirmacionEliminarTodos(false);
    } catch (error) {
      console.error('Error al eliminar todos los desgloses:', error);
    }
  };

  const cambiarDesglose = async (mes: number, año: number) => {
    // Actualizar el periodo global
    cambiarPeriodo(mes, año);
    
    const desglose = todosDesgloses.find(d => d.mes === mes && d.año === año);
    if (desglose) {
      setDesgloseActual(desglose);
    } else {
      // Si no existe, crear uno nuevo para ese mes/año
      const nuevoDesglose = {
        sueldoInicial: desgloseActual?.sueldoInicial || 0,
        mes,
        año,
        nombre: `Desglose ${mes}/${año}`
      };
      try {
        const creado = await desgloseSueldoAPI.crear(nuevoDesglose);
        setDesgloseActual(creado);
        await cargarDesgloses();
      } catch (error) {
        console.error('Error al cambiar desglose:', error);
      }
    }
  };

  const generarOpcionesMeses = () => {
    const opciones: { mes: number; año: number; label: string; existe: boolean }[] = [];
    const hoy = new Date();
    const añoActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;
    
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Generar opciones desde diciembre 2025 hasta 3 meses en el futuro
    const añoInicio = 2025;
    const mesInicio = 12; // Diciembre
    const añoFin = añoActual;
    const mesFin = mesActual + 3; // 3 meses hacia adelante
    
    // Calcular el año final considerando los meses adicionales
    const añoFinal = añoFin + Math.floor(mesFin / 12);
    const mesFinal = mesFin % 12 || 12;
    
    for (let año = añoFinal; año >= añoInicio; año--) {
      let mesMax = año === añoFinal ? mesFinal : 12;
      let mesMin = año === añoInicio ? mesInicio : 1;
      
      for (let mes = mesMax; mes >= mesMin; mes--) {
        const existe = todosDesgloses.some(d => d.mes === mes && d.año === año);
        opciones.push({
          mes,
          año,
          label: `${meses[mes - 1]} ${año}`,
          existe
        });
      }
    }
    
    return opciones;
  };

  const resumen = desgloseActual ? servicioDesglosadorSueldo.calcularResumen(desgloseActual) : null;

  if (!desgloseActual) {
    return (
      <div className="desglosador-container">
        <Tarjeta>
          <h2>Desglosador de Sueldo</h2>
          <p>Ingresa tu sueldo para comenzar a registrar tus gastos</p>
          
          <div className="form-inicio">
            <Input
              type="text"
              value={nombreDesglose}
              onChange={(e) => setNombreDesglose(e.target.value)}
              placeholder="Nombre del desglose (opcional)"
              etiqueta="Nombre"
            />
            <Input
              type="text"
              value={sueldoInicial}
              onChange={(e) => {
                const limpio = limpiarNumero(e.target.value);
                setSueldoInicial(limpio ? formatearNumeroConPuntos(limpio) : '');
              }}
              placeholder="Ej: 1.500.000"
              etiqueta="Sueldo Inicial"
            />
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={crearDesgloseBebe}
                  onChange={(e) => setCrearDesgloseBebe(e.target.checked)}
                />
                <span>Crear desglose de bebé automáticamente</span>
              </label>
            </div>
            {crearDesgloseBebe && (
              <Input
                type="text"
                value={presupuestoBebe}
                onChange={(e) => {
                  const limpio = limpiarNumero(e.target.value);
                  setPresupuestoBebe(limpio ? formatearNumeroConPuntos(limpio) : '');
                }}
                placeholder="Ej: 150.000"
                etiqueta="Presupuesto para el Bebé"
              />
            )}
            <Boton onClick={iniciarDesglose} variante="primary">
              Iniciar Desglose
            </Boton>
          </div>
        </Tarjeta>
      </div>
    );
  }

  return (
    <div className="desglosador-container">
      <Tarjeta>
        <div className="desglosador-header">
          <div className="header-info">
            <h2>{desgloseActual.nombre}</h2>
            <div className="selector-periodo">
              <select 
                value={`${desgloseActual.mes}-${desgloseActual.año}`}
                onChange={(e) => {
                  const [mes, año] = e.target.value.split('-').map(Number);
                  cambiarDesglose(mes, año);
                }}
                className="select-periodo"
              >
                {generarOpcionesMeses().map(opcion => (
                  <option 
                    key={`${opcion.mes}-${opcion.año}`} 
                    value={`${opcion.mes}-${opcion.año}`}
                  >
                    {opcion.label} {opcion.existe ? '✓' : '(nuevo)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="header-acciones">
            <Boton 
              onClick={() => setMostrarConfirmacionEliminarTodos(true)} 
              variante="outline"
              style={{ color: '#dc2626' }}
            >
              Eliminar Todos
            </Boton>
            <Boton 
              onClick={() => {
                setNuevoSueldo(formatearNumeroConPuntos(desgloseActual.sueldoInicial.toString()));
                setMostrarEditarSueldo(true);
              }} 
              variante="outline"
            >
              Editar Sueldo
            </Boton>
            <Boton onClick={generarPDF} variante="secondary">
              Descargar PDF
            </Boton>
          </div>
        </div>

        <div className="resumen-sueldo">
          <div className="resumen-item">
            <span className="label">Sueldo Inicial:</span>
            <span className="valor positivo">{formatearPesosChilenos(resumen?.sueldoInicial || 0)}</span>
          </div>
          <div className="resumen-item">
            <span className="label">Gastos Propios:</span>
            <span className="valor negativo">-{formatearPesosChilenos(resumen?.totalGastos || 0)}</span>
          </div>
          <div className="resumen-item">
            <span className="label">Gastos Bebé:</span>
            <span className="valor negativo">-{formatearPesosChilenos(resumen?.totalGastosBebe || 0)}</span>
          </div>
          <div className="resumen-item">
            <span className="label">Gastos Generales:</span>
            <span className="valor negativo">-{formatearPesosChilenos(resumen?.totalGastosGenerales || 0)}</span>
          </div>
          <div className="resumen-item">
            <span className="label">Total Descuentos:</span>
            <span className="valor negativo">-{formatearPesosChilenos(resumen?.totalDescuentos || 0)}</span>
          </div>
          <div className="resumen-item destacado">
            <span className="label">Saldo Restante:</span>
            <span className={`valor ${(resumen?.saldoRestante || 0) >= 0 ? 'positivo' : 'negativo'}`}>
              {formatearPesosChilenos(resumen?.saldoRestante || 0)}
            </span>
          </div>
          <div className="resumen-item">
            <span className="label">Gastado:</span>
            <span className="valor">{resumen?.porcentajeGastado.toFixed(1)}%</span>
          </div>
        </div>

        <div className="barra-progreso">
          <div 
            className="barra-progreso-fill"
            style={{ width: `${Math.min(resumen?.porcentajeGastado || 0, 100)}%` }}
          />
        </div>

        <div className="acciones">
          <Boton onClick={() => setMostrarFormGasto(true)} variante="primary">
            + Agregar Gasto
          </Boton>
        </div>

        <div className="lista-gastos">
          <h3>Gastos Propios ({desgloseActual.gastos.length})</h3>
          {desgloseActual.gastos.length === 0 ? (
            <p className="sin-gastos">No hay gastos propios registrados</p>
          ) : (
            <div className="gastos-grid">
              {desgloseActual.gastos.map(gasto => (
                <div key={gasto.id} className="gasto-item">
                  <div className="gasto-info">
                    <span className={`gasto-tipo tipo-${gasto.tipo}`}>{gasto.tipo}</span>
                    <span className="gasto-descripcion">{gasto.descripcion}</span>
                    <span className="gasto-fecha">
                      {gasto.fecha.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="gasto-acciones">
                    <span className="gasto-monto">-{formatearPesosChilenos(gasto.monto)}</span>
                    <button 
                      className="btn-editar"
                      onClick={() => iniciarEdicionGasto(gasto)}
                      aria-label="Editar gasto"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-eliminar"
                      onClick={() => eliminarGasto(gasto.id)}
                      aria-label="Eliminar gasto"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {desgloseActual.gastosBebe && desgloseActual.gastosBebe.length > 0 && (
          <div className="lista-gastos">
            <h3>Gastos del Bebé ({desgloseActual.gastosBebe.length})</h3>
            <div className="gastos-grid">
              {desgloseActual.gastosBebe.map(gasto => (
                <div key={gasto.id} className="gasto-item gasto-bebe">
                  <div className="gasto-info">
                    <span className="gasto-tipo tipo-bebe">👶 {gasto.tipo}</span>
                    <span className="gasto-descripcion">{gasto.descripcion}</span>
                    <span className="gasto-fecha">
                      Cantidad: {gasto.cantidad} | {new Date(gasto.fecha).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="gasto-acciones">
                    <span className="gasto-monto">-{formatearPesosChilenos(gasto.monto * gasto.cantidad)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {desgloseActual.gastosGenerales && desgloseActual.gastosGenerales.length > 0 && (
          <div className="lista-gastos">
            <h3>Gastos Generales ({desgloseActual.gastosGenerales.length})</h3>
            <div className="gastos-grid">
              {desgloseActual.gastosGenerales.map(gasto => (
                <div key={gasto.id} className="gasto-item gasto-general">
                  <div className="gasto-info">
                    <span className="gasto-tipo tipo-general">💰 General</span>
                    <span className="gasto-descripcion">{gasto.titulo}</span>
                    <span className="gasto-fecha">
                      Cantidad: {gasto.cantidad} | {new Date(gasto.fecha).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="gasto-acciones">
                    <span className="gasto-monto">-{formatearPesosChilenos(gasto.monto * gasto.cantidad)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Tarjeta>

      {mostrarFormGasto && (
        <Modal
          abierto={mostrarFormGasto}
          titulo={gastoEditando ? "Editar Gasto" : "Agregar Gasto"}
          onCerrar={cancelarEdicion}
        >
          <Modal.Body>
            <div className="form-gasto">
              {/* Selector de categoría */}
              <div className="categoria-selector" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Categoría de Gasto
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setCategoriaGasto('propio')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: categoriaGasto === 'propio' ? '2px solid #3b82f6' : '1px solid #ddd',
                      borderRadius: '8px',
                      background: categoriaGasto === 'propio' ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      fontWeight: categoriaGasto === 'propio' ? '600' : '400'
                    }}
                  >
                    💰 Gasto Propio
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoriaGasto('bebe')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: categoriaGasto === 'bebe' ? '2px solid #3b82f6' : '1px solid #ddd',
                      borderRadius: '8px',
                      background: categoriaGasto === 'bebe' ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      fontWeight: categoriaGasto === 'bebe' ? '600' : '400'
                    }}
                  >
                    👶 Gasto Bebé
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoriaGasto('general')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: categoriaGasto === 'general' ? '2px solid #3b82f6' : '1px solid #ddd',
                      borderRadius: '8px',
                      background: categoriaGasto === 'general' ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      fontWeight: categoriaGasto === 'general' ? '600' : '400'
                    }}
                  >
                    🧮 Gasto General
                  </button>
                </div>
              </div>

              {/* Formulario Gasto Propio */}
              {categoriaGasto === 'propio' && (
                <>
                  <Input
                    type="text"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción del gasto"
                    etiqueta="Descripción"
                  />
                  <Input
                    type="text"
                    value={monto}
                    onChange={(e) => {
                      const limpio = limpiarNumero(e.target.value);
                      setMonto(limpio ? formatearNumeroConPuntos(limpio) : '');
                    }}
                    placeholder="Ej: 50.000"
                    etiqueta="Monto"
                  />
                  <select 
                    value={tipo} 
                    onChange={(e) => setTipo(e.target.value as TipoGasto)}
                    className="select-tipo"
                  >
                    <option value="pago">Pago</option>
                    <option value="compra">Compra</option>
                    <option value="suscripcion">Suscripción</option>
                    <option value="cuenta">Cuenta</option>
                    <option value="deuda">Deuda</option>
                    <option value="otro">Otro</option>
                  </select>
                </>
              )}

              {/* Formulario Gasto Bebé */}
              {categoriaGasto === 'bebe' && (
                <>
                  <select 
                    value={tipoBebe} 
                    onChange={(e) => setTipoBebe(e.target.value)}
                    className="select-tipo"
                    style={{ marginBottom: '1rem' }}
                  >
                    <option value="alimentacion">🍼 Alimentación</option>
                    <option value="panales">👶 Pañales</option>
                    <option value="ropa">👕 Ropa</option>
                    <option value="salud">🏥 Salud</option>
                    <option value="muebles">🛏️ Muebles</option>
                    <option value="juguetes">🧸 Juguetes</option>
                    <option value="guarderia">🏫 Guardería</option>
                    <option value="educacion">📚 Educación</option>
                    <option value="higiene">💇 Higiene</option>
                    <option value="otro">📦 Otro</option>
                  </select>
                  <Input
                    type="text"
                    value={descripcionBebe}
                    onChange={(e) => setDescripcionBebe(e.target.value)}
                    placeholder="Descripción del gasto"
                    etiqueta="Descripción"
                  />
                  <div className="form-multiplicador">
                    <Input
                      type="text"
                      value={montoBebe}
                      onChange={(e) => {
                        const limpio = limpiarNumero(e.target.value);
                        setMontoBebe(limpio ? formatearNumeroConPuntos(limpio) : '');
                      }}
                      placeholder="Ej: 15.000"
                      etiqueta="Precio unitario"
                    />
                    <span className="multiplicador-simbolo">×</span>
                    <Input
                      type="number"
                      value={cantidadBebe}
                      onChange={(e) => setCantidadBebe(e.target.value)}
                      placeholder="1"
                      etiqueta="Cantidad"
                    />
                    <div className="total-calculado">
                      <span className="label-total">Total:</span>
                      <span className="valor-total">
                        {montoBebe && cantidadBebe ? formatearPesosChilenos(parseFloat(limpiarNumero(montoBebe)) * parseInt(cantidadBebe || '1')) : '$0'}
                      </span>
                    </div>
                  </div>
                  <Input
                    type="text"
                    value={notasBebe}
                    onChange={(e) => setNotasBebe(e.target.value)}
                    placeholder="Notas adicionales (opcional)"
                    etiqueta="Notas"
                  />
                  <Input
                    type="url"
                    value={enlaceProductoBebe}
                    onChange={(e) => setEnlaceProductoBebe(e.target.value)}
                    placeholder="https://www.ejemplo.com/producto"
                    etiqueta="Link del producto (opcional)"
                  />
                </>
              )}

              {/* Formulario Gasto General */}
              {categoriaGasto === 'general' && (
                <>
                  <Input
                    type="text"
                    value={tituloGeneral}
                    onChange={(e) => setTituloGeneral(e.target.value)}
                    placeholder="Ej: Supermercado, Bencina, etc."
                    etiqueta="Título del gasto"
                  />
                  <div className="form-multiplicador">
                    <Input
                      type="text"
                      value={montoGeneral}
                      onChange={(e) => {
                        const limpio = limpiarNumero(e.target.value);
                        setMontoGeneral(limpio ? formatearNumeroConPuntos(limpio) : '');
                      }}
                      placeholder="Ej: 50.000"
                      etiqueta="Monto"
                    />
                    <span className="multiplicador-simbolo">×</span>
                    <Input
                      type="number"
                      value={cantidadGeneral}
                      onChange={(e) => setCantidadGeneral(e.target.value)}
                      placeholder="1"
                      etiqueta="Cantidad"
                    />
                    <div className="total-calculado">
                      <span className="label-total">Total:</span>
                      <span className="valor-total">
                        {montoGeneral && cantidadGeneral ? formatearPesosChilenos(parseFloat(limpiarNumero(montoGeneral)) * parseInt(cantidadGeneral || '1')) : '$0'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Boton onClick={cancelarEdicion} variante="outline">
              Cancelar
            </Boton>
            <Boton onClick={gastoEditando ? actualizarGasto : agregarGasto} variante="primary">
              {gastoEditando ? "Actualizar" : "Agregar"}
            </Boton>
          </Modal.Footer>
        </Modal>
      )}

      {mostrarEditarSueldo && (
        <Modal
          abierto={mostrarEditarSueldo}
          titulo="Editar Sueldo Inicial"
          onCerrar={() => setMostrarEditarSueldo(false)}
        >
          <Modal.Body>
            <div className="form-gasto">
              <Input
                type="text"
                value={nuevoSueldo}
                onChange={(e) => {
                  const limpio = limpiarNumero(e.target.value);
                  setNuevoSueldo(limpio ? formatearNumeroConPuntos(limpio) : '');
                }}
                placeholder="Ej: 1.500.000"
                etiqueta="Sueldo Inicial"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Boton onClick={() => setMostrarEditarSueldo(false)} variante="outline">
              Cancelar
            </Boton>
            <Boton onClick={editarSueldo} variante="primary">
              Guardar
            </Boton>
          </Modal.Footer>
        </Modal>
      )}

      {mostrarConfirmacionEliminarTodos && (
        <Modal
          abierto={mostrarConfirmacionEliminarTodos}
          titulo="Eliminar Todos los Desgloses de Sueldo"
          onCerrar={() => setMostrarConfirmacionEliminarTodos(false)}
        >
          <Modal.Body>
            <p>¿Estás seguro de que deseas eliminar TODOS los desgloses de sueldo?</p>
            <p style={{ color: '#dc2626', marginTop: '1rem' }}>
              Esta acción no se puede deshacer y eliminará todos tus registros de sueldo.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Boton onClick={() => setMostrarConfirmacionEliminarTodos(false)} variante="outline">
              Cancelar
            </Boton>
            <Boton onClick={eliminarTodosDesgloses} variante="primary" style={{ backgroundColor: '#dc2626' }}>
              Eliminar Todos
            </Boton>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default DesglosadorSueldo;

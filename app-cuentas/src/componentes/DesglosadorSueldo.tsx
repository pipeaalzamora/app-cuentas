import React, { useState, useEffect } from 'react';
import type { DesgloseSueldo, Gasto, TipoGasto } from '../tipos/desglosador';
import { servicioDesglosadorSueldo } from '../servicios/desglosadorSueldo';
import { desgloseSueldoAPI } from '../servicios/desgloseSueldoAPI';
import { servicioGeneradorPDF } from '../servicios/generadorPDF';
import { Boton, Input, Tarjeta, Modal } from './index';
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
  const [desgloseActual, setDesgloseActual] = useState<DesgloseSueldo | null>(null);
  const [todosDesgloses, setTodosDesgloses] = useState<DesgloseSueldo[]>([]);
  const [sueldoInicial, setSueldoInicial] = useState<string>('');
  const [nombreDesglose, setNombreDesglose] = useState<string>('');
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
  const [mostrarEditarSueldo, setMostrarEditarSueldo] = useState(false);
  const [nuevoSueldo, setNuevoSueldo] = useState<string>('');
  const [gastoEditando, setGastoEditando] = useState<string | null>(null);
  
  // Form gasto
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [tipo, setTipo] = useState<TipoGasto>('otro');

  useEffect(() => {
    cargarDesgloses();
  }, []);

  const cargarDesgloses = async () => {
    try {
      const desgloses = await servicioDesglosadorSueldo.obtenerDesgloses();
      setTodosDesgloses(desgloses);
      
      // Intentar cargar el último desglose visto desde localStorage
      const ultimoDesgloseId = localStorage.getItem('ultimoDesgloseSueldoId');
      let desgloseAMostrar = null;
      
      if (ultimoDesgloseId) {
        desgloseAMostrar = desgloses.find(d => d.id === ultimoDesgloseId);
      }
      
      // Si no hay último desglose guardado, buscar el del mes actual
      if (!desgloseAMostrar) {
        const hoy = new Date();
        desgloseAMostrar = desgloses.find(
          d => d.mes === hoy.getMonth() + 1 && d.año === hoy.getFullYear()
        );
      }
      
      if (desgloseAMostrar) {
        setDesgloseActual(desgloseAMostrar);
        setSueldoInicial(desgloseAMostrar.sueldoInicial.toString());
        setNombreDesglose(desgloseAMostrar.nombre || '');
      }
    } catch (error) {
      console.error('Error al cargar desgloses:', error);
    }
  };

  const iniciarDesglose = async () => {
    const sueldoLimpio = limpiarNumero(sueldoInicial);
    const sueldo = parseFloat(sueldoLimpio);
    if (isNaN(sueldo) || sueldo <= 0) return;

    const hoy = new Date();
    const nuevoDesglose = {
      sueldoInicial: sueldo,
      mes: hoy.getMonth() + 1,
      año: hoy.getFullYear(),
      nombre: nombreDesglose || `Desglose ${hoy.getMonth() + 1}/${hoy.getFullYear()}`
    };

    try {
      const creado = await desgloseSueldoAPI.crear(nuevoDesglose);
      setDesgloseActual(creado);
      localStorage.setItem('ultimoDesgloseSueldoId', creado.id);
    } catch (error) {
      console.error('Error al iniciar desglose:', error);
    }
  };

  const agregarGasto = async () => {
    if (!desgloseActual || !descripcion || !monto) return;

    const montoLimpio = limpiarNumero(monto);
    const montoNum = parseFloat(montoLimpio);
    if (isNaN(montoNum) || montoNum <= 0) return;

    const nuevoGasto = {
      descripcion,
      monto: montoNum,
      tipo
    };

    try {
      await desgloseSueldoAPI.agregarGasto(desgloseActual.id, nuevoGasto);
      
      // Recargar el desglose actualizado
      await cargarDesgloses();
      
      // Reset form
      setDescripcion('');
      setMonto('');
      setTipo('otro');
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
    setGastoEditando(null);
    setMostrarFormGasto(false);
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

  const cambiarDesglose = async (mes: number, año: number) => {
    const desglose = todosDesgloses.find(d => d.mes === mes && d.año === año);
    if (desglose) {
      setDesgloseActual(desglose);
      localStorage.setItem('ultimoDesgloseSueldoId', desglose.id);
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
        localStorage.setItem('ultimoDesgloseSueldoId', creado.id);
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
            />
            <Input
              type="text"
              value={sueldoInicial}
              onChange={(e) => {
                const limpio = limpiarNumero(e.target.value);
                setSueldoInicial(limpio ? formatearNumeroConPuntos(limpio) : '');
              }}
              placeholder="Ej: 1.500.000"
            />
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
            <span className="label">Total Gastos:</span>
            <span className="valor negativo">-{formatearPesosChilenos(resumen?.totalGastos || 0)}</span>
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
          <h3>Gastos Registrados ({desgloseActual.gastos.length})</h3>
          {desgloseActual.gastos.length === 0 ? (
            <p className="sin-gastos">No hay gastos registrados</p>
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
      </Tarjeta>

      {mostrarFormGasto && (
        <Modal
          abierto={mostrarFormGasto}
          titulo={gastoEditando ? "Editar Gasto" : "Agregar Gasto"}
          onCerrar={cancelarEdicion}
        >
          <Modal.Body>
            <div className="form-gasto">
              <Input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del gasto"
              />
              <Input
                type="text"
                value={monto}
                onChange={(e) => {
                  const limpio = limpiarNumero(e.target.value);
                  setMonto(limpio ? formatearNumeroConPuntos(limpio) : '');
                }}
                placeholder="Ej: 50.000"
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
    </div>
  );
};

export default DesglosadorSueldo;

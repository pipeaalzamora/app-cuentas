import React, { useState, useEffect } from 'react';
import type { DesgloseSueldo, Gasto, TipoGasto } from '../tipos/desglosador';
import { servicioDesglosadorSueldo } from '../servicios/desglosadorSueldo';
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
  
  // Form gasto
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [tipo, setTipo] = useState<TipoGasto>('otro');

  useEffect(() => {
    cargarDesgloses();
  }, []);

  const cargarDesgloses = () => {
    const desgloses = servicioDesglosadorSueldo.obtenerDesgloses();
    setTodosDesgloses(desgloses);
    
    const hoy = new Date();
    const desgloseMesActual = desgloses.find(
      d => d.mes === hoy.getMonth() + 1 && d.año === hoy.getFullYear()
    );
    
    if (desgloseMesActual) {
      setDesgloseActual(desgloseMesActual);
      setSueldoInicial(desgloseMesActual.sueldoInicial.toString());
      setNombreDesglose(desgloseMesActual.nombre || '');
    }
  };

  const iniciarDesglose = () => {
    const sueldoLimpio = limpiarNumero(sueldoInicial);
    const sueldo = parseFloat(sueldoLimpio);
    if (isNaN(sueldo) || sueldo <= 0) return;

    const hoy = new Date();
    const nuevoDesglose: DesgloseSueldo = {
      id: crypto.randomUUID(),
      sueldoInicial: sueldo,
      gastos: [],
      fechaCreacion: hoy,
      mes: hoy.getMonth() + 1,
      año: hoy.getFullYear(),
      nombre: nombreDesglose || `Desglose ${hoy.getMonth() + 1}/${hoy.getFullYear()}`
    };

    servicioDesglosadorSueldo.guardarDesglose(nuevoDesglose);
    setDesgloseActual(nuevoDesglose);
  };

  const agregarGasto = () => {
    if (!desgloseActual || !descripcion || !monto) return;

    const montoLimpio = limpiarNumero(monto);
    const montoNum = parseFloat(montoLimpio);
    if (isNaN(montoNum) || montoNum <= 0) return;

    const nuevoGasto: Gasto = {
      id: crypto.randomUUID(),
      descripcion,
      monto: montoNum,
      tipo,
      fecha: new Date()
    };

    const desgloseActualizado = {
      ...desgloseActual,
      gastos: [...desgloseActual.gastos, nuevoGasto]
    };

    servicioDesglosadorSueldo.guardarDesglose(desgloseActualizado);
    setDesgloseActual(desgloseActualizado);
    
    // Reset form
    setDescripcion('');
    setMonto('');
    setTipo('otro');
    setMostrarFormGasto(false);
  };

  const eliminarGasto = (id: string) => {
    if (!desgloseActual) return;

    const desgloseActualizado = {
      ...desgloseActual,
      gastos: desgloseActual.gastos.filter(g => g.id !== id)
    };

    servicioDesglosadorSueldo.guardarDesglose(desgloseActualizado);
    setDesgloseActual(desgloseActualizado);
  };

  const generarPDF = () => {
    if (!desgloseActual) return;
    
    const resumen = servicioDesglosadorSueldo.calcularResumen(desgloseActual);
    servicioGeneradorPDF.generarReporteDesglose(desgloseActual, resumen);
  };

  const editarSueldo = () => {
    if (!desgloseActual) return;
    
    const sueldoLimpio = limpiarNumero(nuevoSueldo);
    const sueldo = parseFloat(sueldoLimpio);
    if (isNaN(sueldo) || sueldo <= 0) return;

    const desgloseActualizado = {
      ...desgloseActual,
      sueldoInicial: sueldo
    };

    servicioDesglosadorSueldo.guardarDesglose(desgloseActualizado);
    setDesgloseActual(desgloseActualizado);
    setMostrarEditarSueldo(false);
    setNuevoSueldo('');
  };

  const cambiarDesglose = (mes: number, año: number) => {
    const desglose = todosDesgloses.find(d => d.mes === mes && d.año === año);
    if (desglose) {
      setDesgloseActual(desglose);
    }
  };

  const crearNuevoDesglose = () => {
    setSueldoInicial('');
    setNombreDesglose('');
    setDesgloseActual(null);
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
                {todosDesgloses.map(d => (
                  <option key={d.id} value={`${d.mes}-${d.año}`}>
                    {d.nombre || `${d.mes}/${d.año}`}
                  </option>
                ))}
              </select>
              <Boton onClick={crearNuevoDesglose} variante="outline" tamaño="sm">
                + Nuevo Mes
              </Boton>
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
                      className="btn-eliminar"
                      onClick={() => eliminarGasto(gasto.id)}
                      aria-label="Eliminar gasto"
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
          titulo="Agregar Gasto"
          onCerrar={() => setMostrarFormGasto(false)}
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
            <Boton onClick={() => setMostrarFormGasto(false)} variante="outline">
              Cancelar
            </Boton>
            <Boton onClick={agregarGasto} variante="primary">
              Agregar
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

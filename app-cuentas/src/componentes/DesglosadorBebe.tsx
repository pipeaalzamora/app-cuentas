import React, { useState, useEffect } from 'react';
import type { DesgloseBebe, GastoBebe, TipoGastoBebe } from '../tipos/desglosadorBebe';
import { servicioDesglosadorBebe } from '../servicios/desglosadorBebe';
import { servicioGeneradorPDF } from '../servicios/generadorPDF';
import { Boton, Input, Tarjeta, Modal } from './index';
import './DesglosadorBebe.css';

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

const DesglosadorBebe: React.FC = () => {
  const [desgloseActual, setDesgloseActual] = useState<DesgloseBebe | null>(null);
  const [todosDesgloses, setTodosDesgloses] = useState<DesgloseBebe[]>([]);
  const [presupuesto, setPresupuesto] = useState<string>('');
  const [nombreDesglose, setNombreDesglose] = useState<string>('');
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
  const [mostrarEditarPresupuesto, setMostrarEditarPresupuesto] = useState(false);
  const [nuevoPresupuesto, setNuevoPresupuesto] = useState<string>('');
  
  // Form gasto
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [tipo, setTipo] = useState<TipoGastoBebe>('otro');
  const [notas, setNotas] = useState('');
  const [enlaceProducto, setEnlaceProducto] = useState('');

  useEffect(() => {
    cargarDesgloses();
  }, []);

  const cargarDesgloses = () => {
    const desgloses = servicioDesglosadorBebe.obtenerDesgloses();
    setTodosDesgloses(desgloses);
    
    const hoy = new Date();
    const desgloseMesActual = desgloses.find(
      d => d.mes === hoy.getMonth() + 1 && d.año === hoy.getFullYear()
    );
    
    if (desgloseMesActual) {
      setDesgloseActual(desgloseMesActual);
      setPresupuesto(desgloseMesActual.presupuestoMensual.toString());
      setNombreDesglose(desgloseMesActual.nombre || '');
    }
  };

  const iniciarDesglose = () => {
    const presupuestoLimpio = limpiarNumero(presupuesto);
    const presupuestoNum = parseFloat(presupuestoLimpio);
    if (isNaN(presupuestoNum) || presupuestoNum <= 0) return;

    const hoy = new Date();
    const nuevoDesglose: DesgloseBebe = {
      id: crypto.randomUUID(),
      presupuestoMensual: presupuestoNum,
      gastos: [],
      fechaCreacion: hoy,
      mes: hoy.getMonth() + 1,
      año: hoy.getFullYear(),
      nombre: nombreDesglose || `Gastos Bebé ${hoy.getMonth() + 1}/${hoy.getFullYear()}`
    };

    servicioDesglosadorBebe.guardarDesglose(nuevoDesglose);
    setDesgloseActual(nuevoDesglose);
    cargarDesgloses();
  };

  const agregarGasto = () => {
    if (!desgloseActual || !descripcion || !monto || !cantidad) return;

    const montoLimpio = limpiarNumero(monto);
    const montoNum = parseFloat(montoLimpio);
    const cantidadNum = parseInt(cantidad);
    
    if (isNaN(montoNum) || montoNum <= 0) return;
    if (isNaN(cantidadNum) || cantidadNum <= 0) return;

    const nuevoGasto: GastoBebe = {
      id: crypto.randomUUID(),
      descripcion,
      monto: montoNum,
      cantidad: cantidadNum,
      tipo,
      fecha: new Date(),
      notas: notas || undefined,
      enlaceProducto: enlaceProducto || undefined
    };

    const desgloseActualizado = {
      ...desgloseActual,
      gastos: [...desgloseActual.gastos, nuevoGasto]
    };

    servicioDesglosadorBebe.guardarDesglose(desgloseActualizado);
    setDesgloseActual(desgloseActualizado);
    
    // Reset form
    setDescripcion('');
    setMonto('');
    setCantidad('1');
    setTipo('otro');
    setNotas('');
    setEnlaceProducto('');
    setMostrarFormGasto(false);
  };

  const eliminarGasto = (id: string) => {
    if (!desgloseActual) return;

    const desgloseActualizado = {
      ...desgloseActual,
      gastos: desgloseActual.gastos.filter(g => g.id !== id)
    };

    servicioDesglosadorBebe.guardarDesglose(desgloseActualizado);
    setDesgloseActual(desgloseActualizado);
  };

  const editarPresupuesto = () => {
    if (!desgloseActual) return;
    
    const presupuestoLimpio = limpiarNumero(nuevoPresupuesto);
    const presupuestoNum = parseFloat(presupuestoLimpio);
    if (isNaN(presupuestoNum) || presupuestoNum <= 0) return;

    const desgloseActualizado = {
      ...desgloseActual,
      presupuestoMensual: presupuestoNum
    };

    servicioDesglosadorBebe.guardarDesglose(desgloseActualizado);
    setDesgloseActual(desgloseActualizado);
    setMostrarEditarPresupuesto(false);
    setNuevoPresupuesto('');
  };

  const cambiarDesglose = (mes: number, año: number) => {
    const desglose = todosDesgloses.find(d => d.mes === mes && d.año === año);
    if (desglose) {
      setDesgloseActual(desglose);
    } else {
      const nuevoDesglose: DesgloseBebe = {
        id: crypto.randomUUID(),
        presupuestoMensual: desgloseActual?.presupuestoMensual || 0,
        gastos: [],
        fechaCreacion: new Date(),
        mes,
        año,
        nombre: `Gastos Bebé ${mes}/${año}`
      };
      servicioDesglosadorBebe.guardarDesglose(nuevoDesglose);
      setDesgloseActual(nuevoDesglose);
      cargarDesgloses();
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
    
    const añoInicio = 2025;
    const mesInicio = 12;
    const añoFin = añoActual;
    const mesFin = mesActual + 3;
    
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

  const generarPDF = () => {
    if (!desgloseActual) return;
    
    const resumen = servicioDesglosadorBebe.calcularResumen(desgloseActual);
    servicioGeneradorPDF.generarReporteDesgloseBebe(desgloseActual, resumen);
  };

  const resumen = desgloseActual ? servicioDesglosadorBebe.calcularResumen(desgloseActual) : null;

  const obtenerIconoCategoria = (tipo: TipoGastoBebe): string => {
    const iconos: Record<TipoGastoBebe, string> = {
      alimentacion: '🍼',
      panales: '👶',
      ropa: '👕',
      salud: '🏥',
      muebles: '🛏️',
      juguetes: '🧸',
      guarderia: '🏫',
      educacion: '📚',
      higiene: '💇',
      otro: '📦'
    };
    return iconos[tipo];
  };

  const obtenerNombreCategoria = (tipo: TipoGastoBebe): string => {
    const nombres: Record<TipoGastoBebe, string> = {
      alimentacion: 'Alimentación',
      panales: 'Pañales',
      ropa: 'Ropa',
      salud: 'Salud',
      muebles: 'Muebles',
      juguetes: 'Juguetes',
      guarderia: 'Guardería',
      educacion: 'Educación',
      higiene: 'Higiene',
      otro: 'Otro'
    };
    return nombres[tipo];
  };

  if (!desgloseActual) {
    return (
      <div className="desglosador-bebe-container">
        <Tarjeta>
          <div className="bebe-header-inicio">
            <span className="bebe-icono-grande">👶</span>
            <h2>Gastos del Bebé</h2>
          </div>
          <p>Ingresa el presupuesto mensual para los gastos de tu bebé</p>
          
          <div className="form-inicio">
            <Input
              type="text"
              value={nombreDesglose}
              onChange={(e) => setNombreDesglose(e.target.value)}
              placeholder="Nombre (opcional)"
            />
            <Input
              type="text"
              value={presupuesto}
              onChange={(e) => {
                const limpio = limpiarNumero(e.target.value);
                setPresupuesto(limpio ? formatearNumeroConPuntos(limpio) : '');
              }}
              placeholder="Ej: 500.000"
              etiqueta="Presupuesto Mensual"
            />
            <Boton onClick={iniciarDesglose} variante="primary">
              Iniciar Seguimiento
            </Boton>
          </div>
        </Tarjeta>
      </div>
    );
  }

  return (
    <div className="desglosador-bebe-container">
      <Tarjeta>
        <div className="desglosador-header">
          <div className="header-info">
            <div className="titulo-con-icono">
              <span className="bebe-icono">👶</span>
              <h2>{desgloseActual.nombre}</h2>
            </div>
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
                setNuevoPresupuesto(formatearNumeroConPuntos(desgloseActual.presupuestoMensual.toString()));
                setMostrarEditarPresupuesto(true);
              }} 
              variante="outline"
            >
              Editar Presupuesto
            </Boton>
            <Boton onClick={generarPDF} variante="secondary">
              Descargar PDF
            </Boton>
          </div>
        </div>

        <div className="resumen-sueldo">
          <div className="resumen-item">
            <span className="label">Presupuesto:</span>
            <span className="valor positivo">{formatearPesosChilenos(resumen?.presupuestoMensual || 0)}</span>
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
            className="barra-progreso-fill bebe"
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
                    <span className={`gasto-tipo tipo-${gasto.tipo}`}>
                      {obtenerIconoCategoria(gasto.tipo)} {obtenerNombreCategoria(gasto.tipo)}
                    </span>
                    <span className="gasto-descripcion">{gasto.descripcion}</span>
                    {gasto.cantidad > 1 && (
                      <span className="gasto-cantidad">
                        {formatearPesosChilenos(gasto.monto)} × {gasto.cantidad} = {formatearPesosChilenos(gasto.monto * gasto.cantidad)}
                      </span>
                    )}
                    {gasto.notas && <span className="gasto-notas">📝 {gasto.notas}</span>}
                    {gasto.enlaceProducto && (
                      <a 
                        href={gasto.enlaceProducto} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="gasto-enlace"
                      >
                        🔗 Ver producto
                      </a>
                    )}
                    <span className="gasto-fecha">
                      {gasto.fecha.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="gasto-acciones">
                    <span className="gasto-monto">-{formatearPesosChilenos(gasto.monto * gasto.cantidad)}</span>
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
          titulo="Agregar Gasto del Bebé"
          onCerrar={() => setMostrarFormGasto(false)}
        >
          <Modal.Body>
            <div className="form-gasto">
              <select 
                value={tipo} 
                onChange={(e) => setTipo(e.target.value as TipoGastoBebe)}
                className="select-tipo"
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
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del gasto"
              />
              <div className="form-multiplicador">
                <Input
                  type="text"
                  value={monto}
                  onChange={(e) => {
                    const limpio = limpiarNumero(e.target.value);
                    setMonto(limpio ? formatearNumeroConPuntos(limpio) : '');
                  }}
                  placeholder="Ej: 15.000"
                  etiqueta="Precio unitario"
                />
                <span className="multiplicador-simbolo">×</span>
                <Input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="1"
                  etiqueta="Cantidad"
                />
                <div className="total-calculado">
                  <span className="label-total">Total:</span>
                  <span className="valor-total">
                    {monto && cantidad ? formatearPesosChilenos(parseFloat(limpiarNumero(monto)) * parseInt(cantidad || '1')) : '$0'}
                  </span>
                </div>
              </div>
              <Input
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas adicionales (opcional)"
              />
              <Input
                type="url"
                value={enlaceProducto}
                onChange={(e) => setEnlaceProducto(e.target.value)}
                placeholder="https://www.ejemplo.com/producto"
                etiqueta="Link del producto (opcional)"
              />
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

      {mostrarEditarPresupuesto && (
        <Modal
          abierto={mostrarEditarPresupuesto}
          titulo="Editar Presupuesto Mensual"
          onCerrar={() => setMostrarEditarPresupuesto(false)}
        >
          <Modal.Body>
            <div className="form-gasto">
              <Input
                type="text"
                value={nuevoPresupuesto}
                onChange={(e) => {
                  const limpio = limpiarNumero(e.target.value);
                  setNuevoPresupuesto(limpio ? formatearNumeroConPuntos(limpio) : '');
                }}
                placeholder="Ej: 500.000"
                etiqueta="Presupuesto Mensual"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Boton onClick={() => setMostrarEditarPresupuesto(false)} variante="outline">
              Cancelar
            </Boton>
            <Boton onClick={editarPresupuesto} variante="primary">
              Guardar
            </Boton>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default DesglosadorBebe;

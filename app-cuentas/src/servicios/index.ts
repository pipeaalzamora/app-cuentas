// Servicios para el Sistema de Gestión de Cuentas de Servicios

// Exportaciones de servicios
export { ServicioAlmacenamiento, servicioAlmacenamiento } from './almacenamiento';
export { ServicioCalculosEstadisticas, servicioCalculosEstadisticas } from './calculosEstadisticas';
export { ServicioGeneradorPDF, servicioGeneradorPDF } from './generadorPDF';
export { ServicioDesglosadorSueldo, servicioDesglosadorSueldo } from './desglosadorSueldo';
export { ServicioDesglosadorBebe, servicioDesglosadorBebe } from './desglosadorBebe';

// Exportaciones de servicios API
export { default as api } from './api';
export { cuentasAPI } from './cuentasAPI';
export { desgloseSueldoAPI } from './desgloseSueldoAPI';
export { desgloseBebeAPI } from './desgloseBebeAPI';
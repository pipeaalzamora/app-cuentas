import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  variant = 'text',
  animation = 'pulse',
  className = ''
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  const classes = [
    'skeleton',
    `skeleton-${variant}`,
    `skeleton-${animation}`,
    className
  ].filter(Boolean).join(' ');

  return <div className={classes} style={style} />;
};

// Componentes de skeleton específicos para la aplicación
export const SkeletonCuentaCard: React.FC = () => (
  <div className="skeleton-cuenta-card">
    <div className="skeleton-cuenta-header">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="skeleton-cuenta-info">
        <Skeleton width="60%" height="1.2rem" />
        <Skeleton width="40%" height="1rem" />
      </div>
    </div>
    <div className="skeleton-cuenta-body">
      <Skeleton width="80%" height="1rem" />
      <Skeleton width="50%" height="1rem" />
    </div>
  </div>
);

export const SkeletonTabla: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="skeleton-tabla">
    <div className="skeleton-tabla-header">
      {Array.from({ length: columns }, (_, i) => (
        <Skeleton key={i} height="2rem" />
      ))}
    </div>
    <div className="skeleton-tabla-body">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="skeleton-tabla-fila">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton key={colIndex} height="1.5rem" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonGrafico: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div className="skeleton-grafico">
    <Skeleton width="100%" height={height} variant="rectangular" />
    <div className="skeleton-grafico-leyenda">
      <Skeleton width="20%" height="1rem" />
      <Skeleton width="25%" height="1rem" />
      <Skeleton width="18%" height="1rem" />
    </div>
  </div>
);

export const SkeletonEstadisticas: React.FC = () => (
  <div className="skeleton-estadisticas">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="skeleton-estadistica-card">
        <Skeleton width="100%" height="3rem" variant="rectangular" />
        <Skeleton width="60%" height="1.2rem" />
        <Skeleton width="40%" height="1rem" />
      </div>
    ))}
  </div>
);

export default Skeleton;
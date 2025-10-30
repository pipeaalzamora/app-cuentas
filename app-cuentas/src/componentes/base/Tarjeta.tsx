import React from 'react';
import './Tarjeta.css';

export interface TarjetaProps extends React.HTMLAttributes<HTMLDivElement> {
  variante?: 'default' | 'elevada' | 'borde';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  hover?: boolean;
  children: React.ReactNode;
}

export interface TarjetaHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface TarjetaBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface TarjetaFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Tarjeta: React.FC<TarjetaProps> & {
  Header: React.FC<TarjetaHeaderProps>;
  Body: React.FC<TarjetaBodyProps>;
  Footer: React.FC<TarjetaFooterProps>;
} = ({
  variante = 'default',
  padding = 'md',
  hover = false,
  children,
  className = '',
  ...props
}) => {
  const clases = [
    'tarjeta',
    `tarjeta--${variante}`,
    `tarjeta--padding-${padding}`,
    hover && 'tarjeta--hover',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={clases} {...props}>
      {children}
    </div>
  );
};

const TarjetaHeader: React.FC<TarjetaHeaderProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`tarjeta__header ${className}`} {...props}>
      {children}
    </div>
  );
};

const TarjetaBody: React.FC<TarjetaBodyProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`tarjeta__body ${className}`} {...props}>
      {children}
    </div>
  );
};

const TarjetaFooter: React.FC<TarjetaFooterProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`tarjeta__footer ${className}`} {...props}>
      {children}
    </div>
  );
};

Tarjeta.Header = TarjetaHeader;
Tarjeta.Body = TarjetaBody;
Tarjeta.Footer = TarjetaFooter;

export default Tarjeta;
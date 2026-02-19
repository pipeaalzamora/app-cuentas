import React from 'react';
import './TarjetaModerna.css';

interface TarjetaModernaProps {
  children: React.ReactNode;
  variant?: 'glass' | 'gradient' | 'elevated' | 'neumorphic';
  gradient?: 'primary' | 'secondary' | 'accent' | 'luz' | 'agua' | 'gas' | 'internet';
  hover?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

interface TarjetaModernaHeaderProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

interface TarjetaModernaBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TarjetaModernaFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface TarjetaModernaComposed extends React.FC<TarjetaModernaProps> {
  Header: React.FC<TarjetaModernaHeaderProps>;
  Body: React.FC<TarjetaModernaBodyProps>;
  Footer: React.FC<TarjetaModernaFooterProps>;
}

export const TarjetaModerna = (({
  children,
  variant = 'elevated',
  gradient,
  hover = true,
  glow = false,
  className = '',
  onClick
}) => {
  const classes = [
    'tarjeta-moderna',
    `tarjeta-moderna--${variant}`,
    gradient && `tarjeta-moderna--gradient-${gradient}`,
    hover && 'tarjeta-moderna--hover',
    glow && 'tarjeta-moderna--glow',
    onClick && 'tarjeta-moderna--clickable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}) as TarjetaModernaComposed;

export const TarjetaModernaHeader: React.FC<TarjetaModernaHeaderProps> = ({
  children,
  icon,
  className = ''
}) => (
  <div className={`tarjeta-moderna__header ${className}`}>
    {icon && <div className="tarjeta-moderna__icon">{icon}</div>}
    <div className="tarjeta-moderna__title">{children}</div>
  </div>
);

export const TarjetaModernaBody: React.FC<TarjetaModernaBodyProps> = ({
  children,
  className = ''
}) => (
  <div className={`tarjeta-moderna__body ${className}`}>
    {children}
  </div>
);

export const TarjetaModernaFooter: React.FC<TarjetaModernaFooterProps> = ({
  children,
  className = ''
}) => (
  <div className={`tarjeta-moderna__footer ${className}`}>
    {children}
  </div>
);

TarjetaModerna.Header = TarjetaModernaHeader;
TarjetaModerna.Body = TarjetaModernaBody;
TarjetaModerna.Footer = TarjetaModernaFooter;

export default TarjetaModerna;

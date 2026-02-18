import React from 'react';
import './BotonModerno.css';

interface BotonModernoProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  gradient?: boolean;
  glow?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const BotonModerno: React.FC<BotonModernoProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  gradient = false,
  glow = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const classes = [
    'boton-moderno',
    `boton-moderno--${variant}`,
    `boton-moderno--${size}`,
    fullWidth && 'boton-moderno--full',
    gradient && 'boton-moderno--gradient',
    glow && 'boton-moderno--glow',
    loading && 'boton-moderno--loading',
    disabled && 'boton-moderno--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <span className="boton-moderno__spinner" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="boton-moderno__icon boton-moderno__icon--left">
          {icon}
        </span>
      )}
      
      <span className="boton-moderno__text">{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="boton-moderno__icon boton-moderno__icon--right">
          {icon}
        </span>
      )}
    </button>
  );
};

export default BotonModerno;

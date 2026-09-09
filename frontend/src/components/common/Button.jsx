import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false, 
  type = 'button',
  className = '',
  icon: Icon
}) => {
  const baseStyle = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm";
  
  const variants = {
    primary: "bg-edwin-midnight hover:bg-edwin-navy text-white focus:ring-edwin-midnight",
    secondary: "bg-edwin-dawn hover:bg-white text-edwin-midnight focus:ring-edwin-dawn",
    sand: "bg-edwin-dawn text-edwin-midnight hover:bg-white focus:ring-edwin-dawn font-extrabold",
    outline: "border border-edwin-border bg-white hover:bg-edwin-surface text-edwin-midnight focus:ring-edwin-navy",
    ghost: "bg-transparent hover:bg-edwin-surface text-edwin-midnight shadow-none"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

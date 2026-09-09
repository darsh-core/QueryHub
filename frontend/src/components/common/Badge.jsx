import React from 'react';

export const Badge = ({ children, variant = 'sand', size = 'md', className = '' }) => {
  const variants = {
    sand: "bg-edwin-dawn text-edwin-midnight border-edwin-dawn font-bold shadow-xs",
    primary: "bg-edwin-midnight text-white border-edwin-midnight",
    secondary: "bg-edwin-surface text-edwin-midnight border-edwin-border font-medium",
    success: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    warning: "bg-amber-100 text-amber-900 border-amber-300 font-bold"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-bold"
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

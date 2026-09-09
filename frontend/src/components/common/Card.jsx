import React from 'react';

export const Card = ({ children, title, subtitle, action, className = "", headerClassName = "" }) => {
  return (
    <div className={`bg-brand-surface border border-brand-border rounded-xl shadow-sm overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className={`px-6 py-4 border-b border-brand-border flex items-center justify-between ${headerClassName}`}>
          <div>
            {title && <h3 className="text-lg font-semibold text-brand-dark">{title}</h3>}
            {subtitle && <p className="text-xs text-brand-secondary mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-brand-600 mb-3`} />
      {label && <p className="text-sm font-medium text-slate-600">{label}</p>}
    </div>
  );
};

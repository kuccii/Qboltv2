import React from 'react';

interface Chip {
  label: string;
  value?: string | number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

interface HeaderStripProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  chips?: Chip[];
  status?: { kind: 'live' | 'offline'; text?: string };
}

const HeaderStrip: React.FC<HeaderStripProps> = ({ title, subtitle, right, chips = [], status }) => {
  return (
    <div className="px-6 pt-5">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
            )}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {chips.map((chip, idx) => {
                  const color = chip.variant === 'success' ? 'border-green-200 dark:border-green-800/60 text-green-700 dark:text-green-300'
                    : chip.variant === 'warning' ? 'border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300'
                    : chip.variant === 'error' ? 'border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300'
                    : chip.variant === 'info' ? 'border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
                  return (
                    <div key={`${chip.label}-${idx}`} className={`text-xs px-2 py-1 rounded border bg-white dark:bg-gray-800 ${color}`}>
                      <span>{chip.label}</span>
                      {chip.value !== undefined && <span className="font-medium ml-1">{chip.value}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {status && (
              <div className={`text-xs px-2 py-1 rounded border ${status.kind === 'live' 
                ? 'text-green-700 border-green-200 dark:text-green-300 dark:border-green-800/60' 
                : 'text-gray-500 border-gray-200 dark:text-gray-400 dark:border-gray-700'}`}>
                {status.text || (status.kind === 'live' ? 'Live' : 'Offline')}
              </div>
            )}
            {right}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderStrip;




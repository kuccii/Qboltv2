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
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-700 rounded-xl p-4 md:p-5 shadow-lg border border-primary-500 dark:border-primary-600">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-primary-100 dark:text-primary-200 mt-1">{subtitle}</p>
            )}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {chips.map((chip, idx) => {
                  const color = chip.variant === 'success' ? 'border-green-300 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : chip.variant === 'warning' ? 'border-amber-300 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                    : chip.variant === 'error' ? 'border-red-300 dark:border-red-400 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    : chip.variant === 'info' ? 'border-primary-300 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200'
                    : 'border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 text-white';
                  return (
                    <div key={`${chip.label}-${idx}`} className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${color}`}>
                      <span>{chip.label}</span>
                      {chip.value !== undefined && <span className="font-bold ml-1">{chip.value}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {status && (
              <div className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${status.kind === 'live' 
                ? 'text-green-800 border-green-300 bg-green-50 dark:text-green-200 dark:border-green-400 dark:bg-green-900/30' 
                : 'text-gray-700 border-gray-300 bg-gray-50 dark:text-gray-300 dark:border-gray-400 dark:bg-gray-800/50'}`}>
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




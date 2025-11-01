// Theme toggle component for dark/light mode switching
import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false, 
  size = 'md' 
}) => {
  const { theme, actualTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor size={iconSizes[size]} />;
    }
    return actualTheme === 'dark' ? 
      <Moon size={iconSizes[size]} /> : 
      <Sun size={iconSizes[size]} />;
  };

  const getTooltipText = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system theme';
      case 'system':
        return 'Switch to light mode';
      default:
        return 'Toggle theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        rounded-lg
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300
        transition-all duration-200
        flex items-center justify-center
        group relative
        ${className}
      `}
      title={getTooltipText()}
      aria-label={getTooltipText()}
    >
      <div className="transition-transform duration-200 group-hover:scale-110">
        {getIcon()}
      </div>
      
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {theme === 'system' ? 'System' : actualTheme === 'dark' ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;


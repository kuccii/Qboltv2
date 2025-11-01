// Enhanced form field component with better validation UX
import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select';
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  success?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  className?: string;
  inputClassName?: string;
  showPasswordToggle?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  success,
  helpText,
  options = [],
  min,
  max,
  minLength,
  maxLength,
  pattern,
  className = '',
  inputClassName = '',
  showPasswordToggle = false,
  autoComplete,
  autoFocus = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  const shouldShowError = error && (hasInteracted || isFocused);
  const shouldShowSuccess = success && !error && hasInteracted;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasInteracted(true);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const getInputType = () => {
    if (type === 'password' && showPasswordToggle) {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const getStatusIcon = () => {
    if (shouldShowError) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    if (shouldShowSuccess) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (helpText) {
      return <Info className="w-5 h-5 text-gray-400" />;
    }
    return null;
  };

  const getInputClasses = () => {
    const baseClasses = `
      w-full px-3 py-2 border rounded-lg transition-colors
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      ${inputClassName}
    `;

    if (shouldShowError) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/20`;
    }
    
    if (shouldShowSuccess) {
      return `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50 dark:bg-green-900/20`;
    }

    return `${baseClasses} border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`;
  };

  const renderInput = () => {
    const commonProps = {
      ref: inputRef as any,
      id: name,
      name,
      value,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      placeholder,
      required,
      disabled,
      autoComplete,
      className: getInputClasses(),
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            minLength={minLength}
            maxLength={maxLength}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            {...commonProps}
            type={getInputType()}
            min={min}
            max={max}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label
        htmlFor={name}
        className={`block text-sm font-medium ${
          shouldShowError
            ? 'text-red-700 dark:text-red-400'
            : shouldShowSuccess
            ? 'text-green-700 dark:text-green-400'
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input container */}
      <div className="relative">
        {renderInput()}

        {/* Password toggle */}
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={disabled}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {/* Status icon */}
        {getStatusIcon() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getStatusIcon()}
          </div>
        )}
      </div>

      {/* Help text */}
      {helpText && !shouldShowError && !shouldShowSuccess && (
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Info size={14} />
          {helpText}
        </p>
      )}

      {/* Error message */}
      {shouldShowError && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      {/* Success message */}
      {shouldShowSuccess && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <CheckCircle size={14} />
          {success}
        </p>
      )}

      {/* Character count */}
      {maxLength && typeof value === 'string' && (
        <div className="text-right">
          <span className={`text-xs ${
            value.length > maxLength * 0.9
              ? 'text-red-500'
              : value.length > maxLength * 0.7
              ? 'text-yellow-500'
              : 'text-gray-400'
          }`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

export default FormField;


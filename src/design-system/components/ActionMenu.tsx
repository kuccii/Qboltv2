import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: React.ReactNode;
  triggerText?: string;
  variant?: 'button' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  className?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  trigger,
  triggerText = 'Actions',
  variant = 'button',
  size = 'md',
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'icon':
        return 'p-2 rounded-md hover:bg-gray-100';
      case 'text':
        return 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md';
      default:
        return 'bg-white border border-gray-300 hover:bg-gray-50 rounded-md';
    }
  };

  const renderTrigger = () => {
    if (trigger) {
      return (
        <div onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>
      );
    }

    return (
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 font-medium transition-colors',
          getSizeClasses(),
          getVariantClasses(),
          className
        )}
      >
        {variant === 'icon' ? (
          <MoreHorizontal className="h-4 w-4" />
        ) : (
          <>
            {triggerText}
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>
    );
  };

  return (
    <div className="relative">
      {renderTrigger()}

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            'absolute z-50 mt-1 min-w-[200px] bg-white border border-gray-200 rounded-md shadow-lg',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="py-1">
            {items.map((item, index) => {
              if (item.separator) {
                return <div key={`separator-${index}`} className="border-t border-gray-100 my-1" />;
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick();
                      setIsOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-2 text-left text-sm transition-colors',
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : item.destructive
                      ? 'text-red-700 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {item.icon && (
                    <div className="flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


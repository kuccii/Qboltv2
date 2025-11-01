// Custom hook for accessibility features
import React, { useEffect, useRef, useState } from 'react';

interface UseAccessibilityOptions {
  announceChanges?: boolean;
  manageFocus?: boolean;
  trapFocus?: boolean;
}

export const useAccessibility = (options: UseAccessibilityOptions = {}) => {
  const { announceChanges = true, manageFocus = true, trapFocus = false } = options;
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Announce changes to screen readers
  const announce = (message: string) => {
    if (!announceChanges) return;
    
    setAnnouncements(prev => [...prev, message]);
    
    // Remove announcement after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 5000);
  };

  // Focus management
  const focusElement = (element: HTMLElement | null) => {
    if (!element) return;
    
    element.focus();
    announce(`Focused on ${element.textContent || element.getAttribute('aria-label') || 'element'}`);
  };

  const focusFirst = () => {
    if (!containerRef.current) return;
    
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusElement(focusableElements[0]);
    }
  };

  const focusLast = () => {
    if (!containerRef.current) return;
    
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusElement(focusableElements[focusableElements.length - 1]);
    }
  };

  const focusNext = () => {
    if (!containerRef.current) return;
    
    const focusableElements = getFocusableElements(containerRef.current);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
      focusElement(focusableElements[currentIndex + 1]);
    } else if (focusableElements.length > 0) {
      focusElement(focusableElements[0]);
    }
  };

  const focusPrevious = () => {
    if (!containerRef.current) return;
    
    const focusableElements = getFocusableElements(containerRef.current);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex > 0) {
      focusElement(focusableElements[currentIndex - 1]);
    } else if (focusableElements.length > 0) {
      focusElement(focusableElements[focusableElements.length - 1]);
    }
  };

  // Get focusable elements within a container
  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  };

  // Keyboard navigation
  useEffect(() => {
    if (!manageFocus || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab navigation
      if (event.key === 'Tab') {
        if (trapFocus && containerRef.current) {
          const focusableElements = getFocusableElements(containerRef.current);
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              event.preventDefault();
              focusElement(lastElement);
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              event.preventDefault();
              focusElement(firstElement);
            }
          }
        }
      }

      // Arrow key navigation
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        focusNext();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        focusPrevious();
      }

      // Home and End keys
      if (event.key === 'Home') {
        event.preventDefault();
        focusFirst();
      } else if (event.key === 'End') {
        event.preventDefault();
        focusLast();
      }

      // Escape key
      if (event.key === 'Escape') {
        // Restore previous focus if available
        if (previousFocusRef.current) {
          focusElement(previousFocusRef.current);
          previousFocusRef.current = null;
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [manageFocus, trapFocus]);

  // Store previous focus when opening modals/dropdowns
  const storePreviousFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  };

  // Restore previous focus
  const restorePreviousFocus = () => {
    if (previousFocusRef.current) {
      focusElement(previousFocusRef.current);
      previousFocusRef.current = null;
    }
  };

  // Screen reader announcements
  const Announcements = () => {
    return React.createElement('div', {
      'aria-live': 'polite',
      'aria-atomic': 'true',
      className: 'sr-only',
      role: 'status'
    }, announcements.map((announcement, index) => 
      React.createElement('div', { key: index }, announcement)
    ));
  };

  return {
    containerRef,
    announce,
    focusElement,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    storePreviousFocus,
    restorePreviousFocus,
    Announcements
  };
};

// Hook for managing ARIA attributes
export const useAriaAttributes = (options: {
  label?: string;
  description?: string;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  live?: 'polite' | 'assertive' | 'off';
}) => {
  const {
    label,
    description,
    expanded,
    selected,
    disabled,
    required,
    invalid,
    live
  } = options;

  const getAriaAttributes = () => {
    const attributes: { [key: string]: string | boolean } = {};

    if (label) attributes['aria-label'] = label;
    if (description) attributes['aria-describedby'] = description;
    if (expanded !== undefined) attributes['aria-expanded'] = expanded;
    if (selected !== undefined) attributes['aria-selected'] = selected;
    if (disabled) attributes['aria-disabled'] = disabled;
    if (required) attributes['aria-required'] = required;
    if (invalid) attributes['aria-invalid'] = invalid;
    if (live) attributes['aria-live'] = live;

    return attributes;
  };

  return { getAriaAttributes };
};

// Hook for managing focus trap
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the trap
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements(containerRef.current);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus when trap is deactivated
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };
  }, [isActive]);

  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  };

  return { containerRef };
};

// Hook for managing keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: { [key: string]: () => void }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifier = event.ctrlKey || event.metaKey ? 'ctrl+' : '';
      const shift = event.shiftKey ? 'shift+' : '';
      const alt = event.altKey ? 'alt+' : '';
      
      const shortcutKey = `${alt}${shift}${modifier}${key}`;
      
      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        shortcuts[shortcutKey]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

// Hook for managing screen reader announcements
export const useScreenReaderAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, `${priority}:${message}`]);
    
    // Remove announcement after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 5000);
  };

  const Announcements = () => {
    return React.createElement('div', {
      'aria-live': 'polite',
      'aria-atomic': 'true',
      className: 'sr-only',
      role: 'status'
    }, announcements.map((announcement, index) => {
      const [priority, message] = announcement.split(':');
      return React.createElement('div', { 
        key: index, 
        'aria-live': priority 
      }, message);
    }));
  };

  return { announce, Announcements };
};

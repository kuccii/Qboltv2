// Keyboard shortcuts hook for enhanced UX
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastNotifications } from '../contexts/ToastContext';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: string;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { info } = useToastNotifications();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'h',
      ctrlKey: true,
      action: () => navigate('/app'),
      description: 'Go to Dashboard',
      category: 'Navigation'
    },
    {
      key: 'p',
      ctrlKey: true,
      action: () => navigate('/app/prices'),
      description: 'Go to Price Tracking',
      category: 'Navigation'
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => navigate('/app/suppliers'),
      description: 'Go to Suppliers',
      category: 'Navigation'
    },
    {
      key: 'r',
      ctrlKey: true,
      action: () => navigate('/app/price-reporting'),
      description: 'Go to Price Reporting',
      category: 'Navigation'
    },
    {
      key: 'l',
      ctrlKey: true,
      action: () => navigate('/app/logistics'),
      description: 'Go to Logistics',
      category: 'Navigation'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => navigate('/app/financing'),
      description: 'Go to Financing',
      category: 'Navigation'
    },
    {
      key: 'd',
      ctrlKey: true,
      action: () => navigate('/app/documents'),
      description: 'Go to Documents',
      category: 'Navigation'
    },
    {
      key: 'a',
      ctrlKey: true,
      action: () => navigate('/app/admin'),
      description: 'Go to Admin',
      category: 'Navigation'
    },

    // Search shortcuts
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search',
      category: 'Search'
    },
    {
      key: 'Escape',
      action: () => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      },
      description: 'Clear focus',
      category: 'Search'
    },

    // Data shortcuts
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        const newButton = document.querySelector('button:contains("New"), button:contains("Add"), button:contains("Create")') as HTMLButtonElement;
        if (newButton) {
          newButton.click();
        }
      },
      description: 'Create new item',
      category: 'Data'
    },
    {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        const saveButton = document.querySelector('button:contains("Save"), button:contains("Submit")') as HTMLButtonElement;
        if (saveButton) {
          saveButton.click();
        }
      },
      description: 'Save current form',
      category: 'Data'
    },
    {
      key: 'r',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        const refreshButton = document.querySelector('button[title*="refresh" i], button:contains("Refresh")') as HTMLButtonElement;
        if (refreshButton) {
          refreshButton.click();
        } else {
          window.location.reload();
        }
      },
      description: 'Refresh data',
      category: 'Data'
    },

    // View shortcuts
    {
      key: 't',
      ctrlKey: true,
      action: () => {
        // Toggle theme - this would need to be implemented in your theme context
        const themeToggle = document.querySelector('[data-theme-toggle]') as HTMLButtonElement;
        if (themeToggle) {
          themeToggle.click();
        }
      },
      description: 'Toggle theme',
      category: 'View'
    },
    {
      key: 'f',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        const filterButton = document.querySelector('button:contains("Filter"), button[title*="filter" i]') as HTMLButtonElement;
        if (filterButton) {
          filterButton.click();
        }
      },
      description: 'Toggle filters',
      category: 'View'
    },
    {
      key: 'h',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        showShortcutsHelp();
      },
      description: 'Show shortcuts help',
      category: 'View'
    },

    // Utility shortcuts
    {
      key: '?',
      action: () => {
        showShortcutsHelp();
      },
      description: 'Show shortcuts help',
      category: 'Help'
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open modals or dropdowns
        const modals = document.querySelectorAll('[role="dialog"], .modal, .dropdown');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[aria-label="close"], .close, [data-dismiss]') as HTMLButtonElement;
          if (closeButton) {
            closeButton.click();
          }
        });
      },
      description: 'Close modals/dropdowns',
      category: 'Utility'
    }
  ];

  const showShortcutsHelp = useCallback(() => {
    const helpContent = shortcuts.reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    }, {} as Record<string, KeyboardShortcut[]>);

    const helpText = Object.entries(helpContent)
      .map(([category, categoryShortcuts]) => {
        const categoryText = categoryShortcuts
          .map(shortcut => {
            const keys = [];
            if (shortcut.ctrlKey) keys.push('Ctrl');
            if (shortcut.shiftKey) keys.push('Shift');
            if (shortcut.altKey) keys.push('Alt');
            if (shortcut.metaKey) keys.push('Cmd');
            keys.push(shortcut.key);
            
            return `${keys.join(' + ')}: ${shortcut.description}`;
          })
          .join('\n');
        
        return `${category}:\n${categoryText}`;
      })
      .join('\n\n');

    info('Keyboard Shortcuts', helpText, { duration: 10000 });
  }, [shortcuts, info]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.metaKey === event.metaKey
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return {
    shortcuts,
    showShortcutsHelp
  };
};

// Hook for specific page shortcuts
export const usePageShortcuts = (pageShortcuts: KeyboardShortcut[]) => {
  const navigate = useNavigate();
  const { info } = useToastNotifications();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      const matchingShortcut = pageShortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.metaKey === event.metaKey
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pageShortcuts]);

  return {
    shortcuts: pageShortcuts
  };
};


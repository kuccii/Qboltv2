import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    text: string;
    onClick: () => void;
  };
  skipable?: boolean;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  steps: TourStep[];
  industry?: 'construction' | 'agriculture';
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onComplete,
  steps,
  industry = 'construction'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];

  // Update target element and positioning when step changes
  useEffect(() => {
    if (!isOpen || !currentStepData) return;

    const element = document.querySelector(currentStepData.target) as HTMLElement;
    setTargetElement(element);

    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // Create overlay that highlights the target element
      const highlightRect = {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height,
      };

      setOverlayStyle({
        position: 'absolute',
        top: highlightRect.top - 8,
        left: highlightRect.left - 8,
        width: highlightRect.width + 16,
        height: highlightRect.height + 16,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '2px solid #3B82F6',
        borderRadius: '8px',
        zIndex: 1000,
        pointerEvents: 'none',
      });

      // Position tooltip
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      let tooltipTop = highlightRect.top + scrollTop;
      let tooltipLeft = highlightRect.left + scrollLeft;

      // Adjust position based on step position preference
      switch (currentStepData.position) {
        case 'top':
          tooltipTop = highlightRect.top + scrollTop - tooltipHeight - 16;
          tooltipLeft = highlightRect.left + scrollLeft + (highlightRect.width - tooltipWidth) / 2;
          break;
        case 'bottom':
          tooltipTop = highlightRect.top + scrollTop + highlightRect.height + 16;
          tooltipLeft = highlightRect.left + scrollLeft + (highlightRect.width - tooltipWidth) / 2;
          break;
        case 'left':
          tooltipTop = highlightRect.top + scrollTop + (highlightRect.height - tooltipHeight) / 2;
          tooltipLeft = highlightRect.left + scrollLeft - tooltipWidth - 16;
          break;
        case 'right':
          tooltipTop = highlightRect.top + scrollTop + (highlightRect.height - tooltipHeight) / 2;
          tooltipLeft = highlightRect.left + scrollLeft + highlightRect.width + 16;
          break;
      }

      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (tooltipLeft < 16) tooltipLeft = 16;
      if (tooltipLeft + tooltipWidth > viewportWidth - 16) {
        tooltipLeft = viewportWidth - tooltipWidth - 16;
      }
      if (tooltipTop < 16) tooltipTop = 16;
      if (tooltipTop + tooltipHeight > viewportHeight - 16) {
        tooltipTop = viewportHeight - tooltipHeight - 16;
      }

      setTooltipStyle({
        position: 'absolute',
        top: tooltipTop,
        left: tooltipLeft,
        width: tooltipWidth,
        zIndex: 1001,
      });

      // Scroll element into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [isOpen, currentStep, currentStepData]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen || !currentStepData) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
        onClick={onClose}
      >
        {/* Highlight overlay */}
        <div style={overlayStyle} />
      </div>

      {/* Tooltip */}
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6"
        style={tooltipStyle}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                {currentStep + 1}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentStepData.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {currentStepData.description}
          </p>
          
          {currentStepData.action && (
            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <button
                onClick={currentStepData.action.onClick}
                className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                <ArrowRight size={16} />
                {currentStepData.action.text}
              </button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStepData.skipable && (
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
              >
                Skip tour
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle size={16} />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Predefined tour steps for different pages
export const getDashboardTourSteps = (industry: 'construction' | 'agriculture'): TourStep[] => [
  {
    id: 'welcome',
    title: 'Welcome to Qivook!',
    description: `This is your ${industry} industry dashboard. Here you'll find key metrics, price trends, and supplier information tailored to your business needs.`,
    target: '[data-tour="dashboard-header"]',
    position: 'bottom',
    skipable: true,
  },
  {
    id: 'kpi-cards',
    title: 'Key Performance Indicators',
    description: 'These cards show your most important metrics at a glance. Click on any card to dive deeper into the data.',
    target: '[data-tour="kpi-cards"]',
    position: 'bottom',
  },
  {
    id: 'price-chart',
    title: 'Price Trends',
    description: 'Track material prices over time. Use the filters above to focus on specific materials or regions.',
    target: '[data-tour="price-chart"]',
    position: 'top',
  },
  {
    id: 'suppliers',
    title: 'Top Suppliers',
    description: 'Discover verified suppliers in your industry. Click on any supplier to view their profile and contact information.',
    target: '[data-tour="suppliers"]',
    position: 'left',
  },
  {
    id: 'filters',
    title: 'Filters & Personalization',
    description: 'Use these filters to customize your dashboard view. Your preferences will be saved automatically.',
    target: '[data-tour="filters"]',
    position: 'bottom',
  },
];

export const getPriceTrackingTourSteps = (industry: 'construction' | 'agriculture'): TourStep[] => [
  {
    id: 'price-overview',
    title: 'Price Tracking Overview',
    description: `Monitor ${industry === 'construction' ? 'construction material' : 'agricultural input'} prices across East Africa in real-time.`,
    target: '[data-tour="price-header"]',
    position: 'bottom',
    skipable: true,
  },
  {
    id: 'chart-controls',
    title: 'Chart Controls',
    description: 'Use these controls to filter by time range, region, and materials. You can compare multiple materials at once.',
    target: '[data-tour="chart-controls"]',
    position: 'bottom',
  },
  {
    id: 'price-chart',
    title: 'Interactive Price Chart',
    description: 'Hover over the chart to see detailed price information. Click and drag to zoom into specific time periods.',
    target: '[data-tour="price-chart"]',
    position: 'top',
  },
  {
    id: 'price-changes',
    title: 'Price Changes',
    description: 'See the latest price movements and trends. Green indicates price increases, red indicates decreases.',
    target: '[data-tour="price-changes"]',
    position: 'right',
  },
];

export const getSupplierDirectoryTourSteps = (industry: 'construction' | 'agriculture'): TourStep[] => [
  {
    id: 'directory-overview',
    title: 'Supplier Directory',
    description: `Find and connect with verified ${industry} suppliers across East Africa. Use filters to narrow down your search.`,
    target: '[data-tour="directory-header"]',
    position: 'bottom',
    skipable: true,
  },
  {
    id: 'search-filters',
    title: 'Search & Filters',
    description: 'Use the search bar and filters to find suppliers by material, region, verification status, and rating.',
    target: '[data-tour="search-filters"]',
    position: 'bottom',
  },
  {
    id: 'supplier-list',
    title: 'Supplier List',
    description: 'Browse through verified suppliers. Click on any supplier card to view their detailed profile and contact information.',
    target: '[data-tour="supplier-list"]',
    position: 'top',
  },
  {
    id: 'compare-tray',
    title: 'Comparison Tool',
    description: 'Select multiple suppliers to compare them side by side. This helps you make informed decisions.',
    target: '[data-tour="compare-tray"]',
    position: 'top',
  },
];

export default OnboardingTour;

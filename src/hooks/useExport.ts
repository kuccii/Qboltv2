import { useState, useCallback } from 'react';

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  includeMetadata?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
}

export interface ExportData {
  data: any[];
  filename: string;
  metadata?: {
    exportedAt: string;
    totalRecords: number;
    filters?: Record<string, any>;
  };
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Convert data to CSV format
  const convertToCSV = useCallback((data: any[], filename: string): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }, []);

  // Convert data to JSON format
  const convertToJSON = useCallback((data: any[], metadata?: any): string => {
    return JSON.stringify({
      data,
      metadata: {
        exportedAt: new Date().toISOString(),
        totalRecords: data.length,
        ...metadata
      }
    }, null, 2);
  }, []);

  // Download file
  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Export data
  const exportData = useCallback(async (
    data: any[],
    filename: string,
    options: ExportOptions
  ): Promise<void> => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      let content: string;
      let mimeType: string;
      let fileExtension: string;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      switch (options.format) {
        case 'csv':
          content = convertToCSV(data, filename);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'json':
          content = convertToJSON(data, options.includeMetadata ? {
            filters: options.filters,
            dateRange: options.dateRange
          } : undefined);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
        case 'xlsx':
          // For XLSX, we would use a library like xlsx
          // For now, we'll export as CSV
          content = convertToCSV(data, filename);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'pdf':
          // For PDF, we would use a library like jsPDF
          // For now, we'll export as JSON
          content = convertToJSON(data, options.includeMetadata ? {
            filters: options.filters,
            dateRange: options.dateRange
          } : undefined);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      clearInterval(progressInterval);
      setExportProgress(100);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const finalFilename = `${filename}_${timestamp}.${fileExtension}`;

      downloadFile(content, finalFilename, mimeType);

      // Reset progress after a short delay
      setTimeout(() => {
        setExportProgress(0);
        setIsExporting(false);
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress(0);
      setIsExporting(false);
      throw error;
    }
  }, [convertToCSV, convertToJSON, downloadFile]);

  // Export specific data types
  const exportSuppliers = useCallback(async (suppliers: any[], options: ExportOptions = { format: 'csv' }) => {
    const filename = 'suppliers';
    return exportData(suppliers, filename, options);
  }, [exportData]);

  const exportPrices = useCallback(async (prices: any[], options: ExportOptions = { format: 'csv' }) => {
    const filename = 'price_data';
    return exportData(prices, filename, options);
  }, [exportData]);

  const exportLogistics = useCallback(async (logistics: any[], options: ExportOptions = { format: 'csv' }) => {
    const filename = 'logistics_data';
    return exportData(logistics, filename, options);
  }, [exportData]);

  // Import data
  const importData = useCallback(async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (data.data && Array.isArray(data.data)) {
            resolve(data.data);
          } else if (Array.isArray(data)) {
            resolve(data);
          } else {
            reject(new Error('Invalid file format'));
          }
        } catch (error) {
          reject(new Error('Failed to parse file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }, []);

  return {
    isExporting,
    exportProgress,
    exportData,
    exportSuppliers,
    exportPrices,
    exportLogistics,
    importData,
  };
}

// Utility functions for specific export formats
export const exportFormats = {
  csv: {
    name: 'CSV',
    description: 'Comma-separated values',
    mimeType: 'text/csv',
    extension: 'csv'
  },
  xlsx: {
    name: 'Excel',
    description: 'Microsoft Excel format',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx'
  },
  pdf: {
    name: 'PDF',
    description: 'Portable Document Format',
    mimeType: 'application/pdf',
    extension: 'pdf'
  },
  json: {
    name: 'JSON',
    description: 'JavaScript Object Notation',
    mimeType: 'application/json',
    extension: 'json'
  }
};

// Predefined export templates
export const exportTemplates = {
  suppliers: {
    name: 'Supplier Directory',
    description: 'Export supplier information with contact details and ratings',
    fields: ['name', 'industry', 'location', 'materials', 'score', 'verified', 'contact']
  },
  prices: {
    name: 'Price Data',
    description: 'Export price information with trends and changes',
    fields: ['material', 'price', 'currency', 'unit', 'region', 'timestamp', 'change', 'changePercent']
  },
  logistics: {
    name: 'Logistics Routes',
    description: 'Export logistics routes with costs and durations',
    fields: ['route', 'from', 'to', 'distance', 'duration', 'cost', 'carrier', 'status']
  }
};

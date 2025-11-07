import React, { useEffect, useState, useCallback } from 'react';
import { 
  TrendingUp, 
  Filter, 
  Download, 
  AlertCircle,
  RefreshCw,
  BarChart3,
  Map,
  Upload,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  FileText,
  Camera,
  DollarSign,
  Calendar,
  MapPin,
  Package,
  Info,
  Clock
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import PriceChart from '../components/PriceChart';
import StatusBadge from '../components/StatusBadge';
// Removed mock data import - using real data from API
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { unifiedApi } from '../services/unifiedApi';
import {
  AppLayout,
  PageHeader,
  PageLayout,
  SectionLayout,
  SelectInput,
  ActionMenu,
  RailLayout,
  Chip
} from '../design-system';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface PriceReport {
  id: string;
  region: string;
  material: string;
  price: number;
  currency: string;
  date: string;
  notes: string;
  evidence: string[];
  status: 'draft' | 'submitted' | 'verified';
  createdAt: string;
}

const PriceReporting: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentIndustry, industryConfig, getIndustryTerm } = useIndustry();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [region, setRegion] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [priceValue, setPriceValue] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [agree, setAgree] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [reportType, setReportType] = useState<'price' | 'demand' | 'supply'>('price');
  
  // Draft management
  const [draftReports, setDraftReports] = useLocalStorage<PriceReport[]>('price-report-drafts', []);
  const [recentPrices, setRecentPrices] = useState<any[]>([]);
  const [showContextPanel, setShowContextPanel] = useState(true);
  
  // Auto-save draft
  const saveDraft = useCallback(() => {
    if (region && material && priceValue) {
      const draft: PriceReport = {
        id: `draft-${Date.now()}`,
        region,
        material,
        price: parseFloat(priceValue) || 0,
        currency,
        date: date || new Date().toISOString().split('T')[0],
        notes,
        evidence: evidenceFiles.map(f => f.name),
        status: 'draft',
        createdAt: new Date().toISOString()
      };
      
      setDraftReports(prev => {
        const filtered = prev.filter(d => d.id !== draft.id);
        return [...filtered, draft].slice(-5); // Keep last 5 drafts
      });
    }
  }, [region, material, priceValue, currency, date, notes, evidenceFiles, setDraftReports]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  // Load recent prices for context from backend
  useEffect(() => {
    const fetchRecentPrices = async () => {
      try {
        const industryMaterials = currentIndustry === 'construction' 
          ? ['cement', 'steel', 'timber', 'sand']
          : ['fertilizer', 'seeds', 'pesticides', 'equipment'];
        
        const trends = await unifiedApi.analytics.getPriceTrends({
          period: '30d',
          materials: industryMaterials,
        });
        
        if (trends && trends.length > 0) {
          // Convert trends to price format for display
          const recent = trends.slice(-10).reverse().map((trend: any) => ({
            date: trend.date,
            ...industryMaterials.reduce((acc, mat) => {
              if (trend[mat]) acc[mat] = trend[mat];
              return acc;
            }, {} as any)
          }));
          setRecentPrices(recent);
        } else {
          setRecentPrices([]);
        }
      } catch (err) {
        console.error('Failed to fetch recent prices:', err);
        setRecentPrices([]);
      }
    };
    
    fetchRecentPrices();
  }, [currentIndustry]);

  const steps = [
    { id: 1, title: 'Location & Material', description: 'Select region and material type' },
    { id: 2, title: 'Price Details', description: 'Enter price and date information' },
    { id: 3, title: 'Evidence & Notes', description: 'Upload evidence and add notes' },
    { id: 4, title: 'Review & Submit', description: 'Review and submit your report' }
  ];

  const regions = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale'];
  const materials = currentIndustry === 'construction' 
    ? ['Cement', 'Steel', 'Timber', 'Sand', 'Gravel', 'Bricks', 'Roofing Materials']
    : ['Fertilizer', 'Seeds', 'Pesticides', 'Feed', 'Machinery', 'Tools', 'Equipment'];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!region || !material || !priceValue || !agree) {
      alert('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Extract country from region (assuming format like "Nairobi, Kenya")
      const country = region.includes(',') ? region.split(',')[1].trim() : region.split(' ')[0];
      
      // Upload evidence files to Supabase Storage if needed
      const evidenceUrls: string[] = [];
      // TODO: Implement file upload to Supabase Storage
      // For now, store file names
      const evidenceFileNames = evidenceFiles.map(f => f.name);

      await unifiedApi.prices.submitReport({
        material: material,
        location: region,
        country: country,
        price: parseFloat(priceValue),
        currency: currency,
        unit: 'per ton', // Default unit
        evidence_url: evidenceUrls // Will be populated after file upload
      });

      // Success - clear form
      setRegion('');
      setMaterial('');
      setPriceValue('');
      setDate('');
      setNotes('');
      setEvidenceFiles([]);
      setAgree(false);
      setCurrentStep(1);
      
      alert('Price report submitted successfully! It will be reviewed before publishing.');
    } catch (err) {
      console.error('Failed to submit report:', err);
      alert(err instanceof Error ? err.message : 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Region *
              </label>
              <SelectInput
                value={region}
                onChange={setRegion}
                options={regions.map(r => ({ value: r, label: r }))}
                placeholder="Select region"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Material Type *
              </label>
              <SelectInput
                value={material}
                onChange={setMaterial}
                options={materials.map(m => ({ value: m, label: m }))}
                placeholder="Select material"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'price', label: 'Price Report', icon: DollarSign },
                  { value: 'demand', label: 'Demand Report', icon: TrendingUp },
                  { value: 'supply', label: 'Supply Report', icon: Package }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setReportType(value as any)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      reportType === value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-2" />
                    <div className="text-sm font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Value *
                </label>
                <input
                  type="number"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  placeholder="Enter price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <SelectInput
                  value={currency}
                  onChange={setCurrency}
                  options={[
                    { value: 'USD', label: 'USD' },
                    { value: 'KES', label: 'KES' },
                    { value: 'EUR', label: 'EUR' }
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Observation *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Price Guidelines</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Report the actual market price you observed. Include any bulk discounts or special conditions in your notes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Evidence Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload photos, receipts, or documents as evidence
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => setEvidenceFiles(Array.from(e.target.files || []))}
                  className="mt-2"
                />
              </div>
              {evidenceFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {evidenceFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      <button
                        onClick={() => setEvidenceFiles(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional context, conditions, or observations..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Report Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Region:</span>
                  <span className="ml-2 font-medium">{region}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Material:</span>
                  <span className="ml-2 font-medium">{material}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="ml-2 font-medium">{priceValue} {currency}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="ml-2 font-medium">{date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="agree" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                I confirm that the information provided is accurate and I have the right to share this data.
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderContextPanel = () => (
    <div className="space-y-6">
      {/* Recent Prices */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Recent Prices</h3>
        <div className="space-y-2">
          {recentPrices.slice(0, 5).map((price, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{price.material}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{price.region}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{price.price}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{price.currency}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Draft Reports */}
      {draftReports.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Draft Reports</h3>
          <div className="space-y-2">
            {draftReports.slice(-3).map((draft) => (
              <div key={draft.id} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{draft.material}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{draft.region}</div>
                  </div>
                  <Chip label="Draft" size="sm" variant="warning" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reporting Guidelines */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Reporting Guidelines</h4>
        <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
          <li>• Report actual market prices you observed</li>
          <li>• Include bulk discounts in notes</li>
          <li>• Upload evidence when possible</li>
          <li>• Be specific about location and date</li>
        </ul>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <PageHeader
        title="Price Reporting"
        subtitle="Report market prices to help the community stay informed"
        breadcrumbs={[{ label: 'Market Intelligence' }, { label: 'Price Reporting' }]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowContextPanel(!showContextPanel)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              {showContextPanel ? 'Hide' : 'Show'} Context
            </button>
            <ActionMenu
              items={[
                { id: 'save-draft', label: 'Save Draft', icon: <Save className="h-4 w-4" />, onClick: saveDraft },
                { id: 'export', label: 'Export Data', icon: <Download className="h-4 w-4" />, onClick: () => console.log('Export') }
              ]}
              size="sm"
            />
          </div>
        }
      />

      <PageLayout maxWidth="full" padding="none">
        <div className="flex h-screen">
          {/* Main Wizard */}
          <div className={`flex-1 ${showContextPanel ? 'mr-80' : ''}`}>
            <div className="h-full flex flex-col">
              {/* Progress Steps */}
              <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          currentStep >= step.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {step.id}
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${
                            currentStep >= step.id
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {step.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {step.description}
                          </div>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`w-12 h-0.5 mx-4 ${
                            currentStep > step.id
                              ? 'bg-primary-600'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  {renderStepContent()}
                </div>
              </div>

              {/* Navigation */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveDraft}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Save className="h-4 w-4" />
                      Save Draft
                    </button>

                    {currentStep < steps.length ? (
                      <button
                        onClick={handleNext}
                        disabled={!region || !material || (currentStep === 2 && (!priceValue || !date))}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={!agree || submitting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Submit Report
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Context Panel */}
          {showContextPanel && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 overflow-y-auto">
              {renderContextPanel()}
            </div>
          )}
        </div>
      </PageLayout>
    </AppLayout>
  );
};

export default PriceReporting;
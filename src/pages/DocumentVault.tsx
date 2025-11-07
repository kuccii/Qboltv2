import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Download,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Clock,
  MapPin,
  Building2,
  Award,
  Info,
  FileCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GraduationCap,
  Globe,
  Shield,
  Briefcase,
  Truck,
  FileX,
  Eye,
  Star,
  Plus,
  CheckCircle,
  XCircle,
  Calendar,
  Bell,
  Filter,
  ListChecks,
  Save
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { unifiedApi } from '../services/unifiedApi';
import HeaderStrip from '../components/HeaderStrip';
import { useToast } from '../contexts/ToastContext';
import {
  AppLayout,
  PageLayout,
  SectionLayout,
  Chip,
  ActionMenu,
} from '../design-system';

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  category: 'Import/Export' | 'Customs' | 'Certificates' | 'Licenses' | 'Logistics';
  country: string[];
  required: boolean;
  cost: string;
  processingTime: string;
  validity: string;
  issuingAuthority: string;
  documents: string[];
  applicationSteps: string[];
  fees: {
    application: string;
    processing: string;
    renewal?: string;
  };
  links?: {
    applicationForm?: string;
    guidelines?: string;
    portal?: string;
  };
  priority: 'high' | 'medium' | 'low';
}

interface DocumentStatus {
  documentId: string;
  status: 'not_started' | 'in_progress' | 'applied' | 'approved' | 'rejected' | 'expired';
  appliedDate?: string;
  expiryDate?: string;
  notes?: string;
}

interface UserDocumentPreferences {
  favorites: string[];
  checklist: DocumentStatus[];
  savedSearches: Array<{
    id: string;
    name: string;
    filters: {
      country?: string;
      category?: string;
      searchTerm?: string;
    };
  }>;
}

const DocumentVault: React.FC = () => {
  const { currentUser, authState } = useAuth();
  const { currentIndustry } = useIndustry();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'checklist' | 'resources'>('overview');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<DocumentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState<string | null>(null);

  const countries = ['RW', 'KE', 'UG', 'TZ', 'ET'];
  const categories = ['all', 'Import/Export', 'Customs', 'Certificates', 'Licenses', 'Logistics'];

  // Load user preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!authState.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const profile = await unifiedApi.user.getProfile(authState.user.id);
        const prefs = profile?.preferences?.documentVault as UserDocumentPreferences || {
          favorites: [],
          checklist: [],
          savedSearches: []
        };
        
        setFavorites(prefs.favorites || []);
        setChecklist(prefs.checklist || []);
      } catch (err) {
        console.error('Failed to load document preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [authState.user?.id]);

  // Save preferences to database
  const savePreferences = async (updates: Partial<UserDocumentPreferences>) => {
    if (!authState.user?.id) return;

    try {
      const profile = await unifiedApi.user.getProfile(authState.user.id);
      const currentPrefs = profile?.preferences || {};
      
      await unifiedApi.user.updateProfile(authState.user.id, {
        preferences: {
          ...currentPrefs,
          documentVault: {
            favorites,
            checklist,
            savedSearches: [],
            ...updates
          }
        }
      });
    } catch (err) {
      console.error('Failed to save preferences:', err);
      addToast({
        type: 'error',
        title: 'Failed to Save',
        message: 'Could not save your preferences. Please try again.'
      });
    }
  };

  const toggleFavorite = async (docId: string) => {
    const newFavorites = favorites.includes(docId)
      ? favorites.filter(id => id !== docId)
      : [...favorites, docId];
    
    setFavorites(newFavorites);
    await savePreferences({ favorites: newFavorites });
    
    addToast({
      type: 'success',
      title: favorites.includes(docId) ? 'Removed from Favorites' : 'Added to Favorites',
      message: favorites.includes(docId) ? 'Document removed from your favorites' : 'Document saved to your favorites'
    });
  };

  const updateChecklistStatus = async (docId: string, status: DocumentStatus['status'], notes?: string) => {
    const existing = checklist.find(item => item.documentId === docId);
    const updated: DocumentStatus = {
      documentId: docId,
      status,
      appliedDate: status === 'applied' ? new Date().toISOString() : existing?.appliedDate,
      expiryDate: status === 'approved' ? existing?.expiryDate : undefined,
      notes
    };

    const newChecklist = existing
      ? checklist.map(item => item.documentId === docId ? updated : item)
      : [...checklist, updated];
    
    setChecklist(newChecklist);
    await savePreferences({ checklist: newChecklist });
    
    addToast({
      type: 'success',
      title: 'Status Updated',
      message: `Document status updated to ${status.replace('_', ' ')}`
    });
    
    setShowStatusModal(null);
  };

  const getDocumentStatus = (docId: string): DocumentStatus | null => {
    return checklist.find(item => item.documentId === docId) || null;
  };

  const documentRequirements: DocumentRequirement[] = [
    {
      id: 'commercial-invoice',
      name: 'Commercial Invoice',
      description: 'Document issued by the seller detailing goods, quantities, and prices in a transaction',
      category: 'Import/Export',
      country: countries,
      required: true,
      cost: 'No fee',
      processingTime: 'Immediate',
      validity: 'Until transaction completion',
      issuingAuthority: 'Exporter/Supplier',
      documents: ['Purchase order', 'Product specifications', 'Pricing agreement'],
      applicationSteps: [
        'Prepare invoice with all required details',
        'Include HS codes for all products',
        'Specify Incoterms (FOB, CIF, etc.)',
        'Sign and date the invoice',
        'Attach supporting documents'
      ],
      fees: {
        application: 'Free',
        processing: 'Free'
      },
      links: {
        guidelines: 'https://www.eac.int/trade'
      },
      priority: 'high'
    },
    {
      id: 'certificate-of-origin',
      name: 'Certificate of Origin',
      description: 'Document certifying the country where goods were manufactured or produced',
      category: 'Customs',
      country: countries,
      required: true,
      cost: '$15-50',
      processingTime: '1-3 business days',
      validity: '6 months',
      issuingAuthority: 'Chamber of Commerce / Trade Ministry',
      documents: ['Commercial invoice', 'Export declaration', 'Production evidence', 'Bill of lading'],
      applicationSteps: [
        'Complete application form at Chamber of Commerce',
        'Submit commercial invoice and supporting documents',
        'Pay applicable fees',
        'Attend inspection if required',
        'Collect certificate after approval'
      ],
      fees: {
        application: '$15-30',
        processing: '$10-20',
        renewal: 'Same as application'
      },
      links: {
        applicationForm: 'https://www.eac.int/trade/certificate-of-origin'
      },
      priority: 'high'
    },
    {
      id: 'import-license',
      name: 'Import License',
      description: 'Authorization required to import certain goods into East African countries',
      category: 'Import/Export',
      country: countries,
      required: true,
      cost: '$50-500',
      processingTime: '7-30 business days',
      validity: '1-3 years',
      issuingAuthority: 'Ministry of Trade / Revenue Authority',
      documents: [
        'Business registration certificate',
        'Tax compliance certificate',
        'Product specifications',
        'Importer declaration',
        'Previous import records (if applicable)'
      ],
      applicationSteps: [
        'Register business if not already registered',
        'Obtain tax compliance certificate',
        'Complete import license application form',
        'Submit required documents and fees',
        'Attend inspection/interview if required',
        'Await approval notification',
        'Collect license from issuing authority'
      ],
      fees: {
        application: '$50-200',
        processing: '$100-300',
        renewal: '$30-150'
      },
      links: {
        portal: 'https://www.eac.int/trade/import-license'
      },
      priority: 'high'
    },
    {
      id: 'export-license',
      name: 'Export License',
      description: 'Authorization required to export certain goods from East African countries',
      category: 'Import/Export',
      country: countries,
      required: true,
      cost: '$50-500',
      processingTime: '7-30 business days',
      validity: '1-3 years',
      issuingAuthority: 'Ministry of Trade / Export Promotion Agency',
      documents: [
        'Business registration certificate',
        'Tax compliance certificate',
        'Product specifications',
        'Export declaration',
        'Quality certificates (if applicable)'
      ],
      applicationSteps: [
        'Register business if not already registered',
        'Obtain necessary product certifications',
        'Complete export license application',
        'Submit documents and pay fees',
        'Product inspection (if required)',
        'Await approval',
        'Collect license'
      ],
      fees: {
        application: '$50-200',
        processing: '$100-300',
        renewal: '$30-150'
      },
      priority: 'high'
    },
    {
      id: 'customs-declaration',
      name: 'Customs Declaration',
      description: 'Official form declaring goods for customs clearance',
      category: 'Customs',
      country: countries,
      required: true,
      cost: 'Varies by value',
      processingTime: '1-3 business days',
      validity: 'Single use',
      issuingAuthority: 'Customs Authority',
      documents: [
        'Commercial invoice',
        'Packing list',
        'Certificate of origin',
        'Import/Export license',
        'Bill of lading',
        'Insurance certificate'
      ],
      applicationSteps: [
        'Complete customs declaration form',
        'Attach all required documents',
        'Pay customs duties and taxes',
        'Submit to customs office',
        'Await clearance',
        'Collect goods upon clearance'
      ],
      fees: {
        application: 'Varies',
        processing: 'Duties + taxes + processing fees'
      },
      links: {
        portal: 'https://www.eac.int/customs'
      },
      priority: 'high'
    },
    {
      id: 'packing-list',
      name: 'Packing List',
      description: 'Detailed list of items in a shipment including weights, dimensions, and packaging',
      category: 'Logistics',
      country: countries,
      required: true,
      cost: 'No fee',
      processingTime: 'Immediate',
      validity: 'Until shipment completion',
      issuingAuthority: 'Exporter/Supplier',
      documents: ['Commercial invoice', 'Shipping instructions'],
      applicationSteps: [
        'List all items in shipment',
        'Include weights and dimensions',
        'Specify packaging type',
        'Number packages sequentially',
        'Attach to shipping documents'
      ],
      fees: {
        application: 'Free',
        processing: 'Free'
      },
      priority: 'high'
    },
    {
      id: 'bill-of-lading',
      name: 'Bill of Lading',
      description: 'Document issued by carrier acknowledging receipt of goods for shipment',
      category: 'Logistics',
      country: countries,
      required: true,
      cost: 'Included in shipping cost',
      processingTime: 'Upon cargo acceptance',
      validity: 'Until delivery',
      issuingAuthority: 'Shipping Company / Freight Forwarder',
      documents: ['Commercial invoice', 'Packing list', 'Export permit'],
      applicationSteps: [
        'Book shipping space with carrier',
        'Submit shipping instructions',
        'Deliver cargo to port/terminal',
        'Receive B/L upon cargo acceptance',
        'Verify details on B/L'
      ],
      fees: {
        application: 'Included in freight',
        processing: 'Included in freight'
      },
      priority: 'high'
    },
    {
      id: 'tax-compliance',
      name: 'Tax Compliance Certificate',
      description: 'Certificate proving tax compliance required for trade operations',
      category: 'Licenses',
      country: countries,
      required: true,
      cost: '$20-100',
      processingTime: '3-10 business days',
      validity: '1 year',
      issuingAuthority: 'Revenue Authority',
      documents: [
        'Business registration certificate',
        'Tax identification number',
        'Tax returns',
        'Payment receipts'
      ],
      applicationSteps: [
        'Ensure all taxes are paid',
        'Submit tax returns',
        'Apply for compliance certificate',
        'Pay application fee',
        'Await verification',
        'Collect certificate'
      ],
      fees: {
        application: '$10-50',
        processing: '$10-50',
        renewal: 'Same as application'
      },
      priority: 'high'
    },
    {
      id: 'phytosanitary-certificate',
      name: 'Phytosanitary Certificate',
      description: 'Required for export of plants, plant products, and agricultural commodities',
      category: 'Certificates',
      country: countries,
      required: true,
      cost: '$30-100',
      processingTime: '3-7 business days',
      validity: '14 days from issue',
      issuingAuthority: 'Ministry of Agriculture / Plant Health Inspectorate',
      documents: [
        'Commercial invoice',
        'Export declaration',
        'Product sample (if required)',
        'Origin certificate',
        'Treatment certificate (if applicable)'
      ],
      applicationSteps: [
        'Complete phytosanitary application form',
        'Submit product samples for inspection',
        'Pay inspection and certificate fees',
        'Attend inspection appointment',
        'Collect certificate after approval'
      ],
      fees: {
        application: '$20-50',
        processing: '$10-50',
        renewal: 'New application required'
      },
      priority: 'medium'
    },
    {
      id: 'quality-certificate',
      name: 'Quality Certificate / Standards Mark',
      description: 'Certificate confirming products meet national/regional quality standards',
      category: 'Certificates',
      country: countries,
      required: true,
      cost: '$100-500',
      processingTime: '14-30 business days',
      validity: '1-3 years',
      issuingAuthority: 'Bureau of Standards',
      documents: [
        'Product specifications',
        'Test reports',
        'Manufacturing process details',
        'Sample products',
        'Application form'
      ],
      applicationSteps: [
        'Submit product samples for testing',
        'Complete application form',
        'Pay testing and certification fees',
        'Attend product inspection',
        'Receive test results',
        'Collect certificate upon approval'
      ],
      fees: {
        application: '$50-200',
        processing: '$50-300',
        renewal: '$30-150'
      },
      priority: 'medium'
    },
    {
      id: 'health-certificate',
      name: 'Health Certificate',
      description: 'Required for export of food products, animal products, and pharmaceuticals',
      category: 'Certificates',
      country: countries,
      required: true,
      cost: '$50-200',
      processingTime: '5-14 business days',
      validity: '14-30 days',
      issuingAuthority: 'Ministry of Health / Veterinary Services',
      documents: [
        'Product samples',
        'Production facility details',
        'Hygiene certificates',
        'Test reports',
        'Export declaration'
      ],
      applicationSteps: [
        'Prepare product samples',
        'Complete health certificate application',
        'Submit samples for testing',
        'Pay inspection fees',
        'Attend facility inspection',
        'Collect certificate after approval'
      ],
      fees: {
        application: '$30-100',
        processing: '$20-100',
        renewal: 'New application required'
      },
      priority: 'medium'
    },
    {
      id: 'insurance-certificate',
      name: 'Marine/Cargo Insurance Certificate',
      description: 'Insurance coverage for goods during transit',
      category: 'Logistics',
      country: countries,
      required: false,
      cost: '0.5-2% of cargo value',
      processingTime: '1-2 business days',
      validity: 'Duration of shipment',
      issuingAuthority: 'Insurance Company',
      documents: ['Commercial invoice', 'Shipping details', 'Cargo value declaration'],
      applicationSteps: [
        'Contact insurance provider',
        'Provide shipment details',
        'Get insurance quote',
        'Pay premium',
        'Receive insurance certificate'
      ],
      fees: {
        application: 'Premium varies',
        processing: 'Included in premium'
      },
      priority: 'low'
    }
  ];

  const filteredDocs = useMemo(() => {
    return documentRequirements.filter(doc => {
      const searchMatch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase());
      const countryMatch = selectedCountry === 'all' || doc.country.includes(selectedCountry);
      const categoryMatch = selectedCategory === 'all' || doc.category === selectedCategory;
      return searchMatch && countryMatch && categoryMatch;
    });
  }, [searchTerm, selectedCountry, selectedCategory]);

  const getCountryName = (code: string) => {
    const names: Record<string, string> = {
      'RW': 'Rwanda',
      'KE': 'Kenya',
      'UG': 'Uganda',
      'TZ': 'Tanzania',
      'ET': 'Ethiopia'
    };
    return names[code] || code;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Import/Export':
        return <Briefcase className="h-5 w-5" />;
      case 'Customs':
        return <Shield className="h-5 w-5" />;
      case 'Certificates':
        return <Award className="h-5 w-5" />;
      case 'Licenses':
        return <FileCheck className="h-5 w-5" />;
      case 'Logistics':
        return <Truck className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: DocumentStatus['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300';
      case 'applied':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'in_progress':
        return 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300';
      case 'rejected':
        return 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300';
      case 'expired':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const requiredDocs = documentRequirements.filter(d => d.required);
  const categoriesCount = categories.slice(1).map(cat => ({
    name: cat,
    count: documentRequirements.filter(d => d.category === cat).length
  }));

  const checklistProgress = useMemo(() => {
    const total = documentRequirements.filter(d => d.required).length;
    const completed = checklist.filter(item => 
      item.status === 'approved' || item.status === 'applied'
    ).length;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [checklist]);

  if (loading) {
    return (
      <AppLayout>
        <HeaderStrip title="Trade Documentation Guide" subtitle="Loading..." />
        <PageLayout maxWidth="full" padding="none">
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your document preferences...</p>
            </div>
          </div>
        </PageLayout>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <HeaderStrip 
        title="Trade Documentation Guide"
        subtitle="Complete guide to required documentation for trade in East Africa"
        chips={[
          { label: 'Documents', value: documentRequirements.length, variant: 'info' },
          { label: 'Required', value: requiredDocs.length, variant: 'error' },
          { label: 'Countries', value: countries.length, variant: 'success' },
        ]}
        right={
          <ActionMenu
            items={[
              { id: 'download', label: 'Download Guide PDF', icon: <Download className="h-4 w-4" />, onClick: () => console.log('Download') },
              { id: 'print', label: 'Print Guide', icon: <FileX className="h-4 w-4" />, onClick: () => window.print() },
            ]}
            size="sm"
          />
        }
      />
      
      <PageLayout maxWidth="full" padding="none">
        <div className="px-10 md:px-14 lg:px-20 py-8 space-y-8">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">Trade Documentation Made Simple</h1>
                  <p className="text-primary-100 text-lg max-w-2xl">
                    Navigate the complexities of East African trade documentation with our comprehensive guide. 
                    Find requirements, costs, processing times, and step-by-step instructions for all essential documents.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <FileText className="h-12 w-12 mb-2" />
                    <div className="text-2xl font-bold">{documentRequirements.length}</div>
                    <div className="text-sm text-primary-100">Documents Covered</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Required Docs</span>
                  </div>
                  <div className="text-2xl font-bold">{requiredDocs.length}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5" />
                    <span className="text-sm font-medium">Countries</span>
                  </div>
                  <div className="text-2xl font-bold">{countries.length}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm font-medium">Avg. Time</span>
                  </div>
                  <div className="text-2xl font-bold">5-15</div>
                  <div className="text-xs text-primary-100">days</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm font-medium">Cost Range</span>
                  </div>
                  <div className="text-2xl font-bold">$0-500</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: <Eye className="h-4 w-4" /> },
                { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
                { id: 'checklist', label: 'My Checklist', icon: <ListChecks className="h-4 w-4" />, badge: checklistProgress.completed },
                { id: 'resources', label: 'Resources', icon: <BookOpen className="h-4 w-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap relative ${
                    activeTab === tab.id
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Category Overview */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents by Category</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {categoriesCount.map(cat => (
                        <div
                          key={cat.name}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {getCategoryIcon(cat.name)}
                            <span className="font-semibold text-gray-900 dark:text-white">{cat.count}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{cat.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Tips</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { icon: <Clock className="h-5 w-5 text-warning-600" />, title: 'Start Early', desc: 'Begin 2-4 weeks before shipment' },
                        { icon: <FileText className="h-5 w-5 text-info-600" />, title: 'Keep Copies', desc: 'Maintain digital and physical copies' },
                        { icon: <CheckCircle2 className="h-5 w-5 text-success-600" />, title: 'Verify Requirements', desc: 'Check with authorities before shipping' },
                        { icon: <Globe className="h-5 w-5 text-primary-600" />, title: 'Use Digital Platforms', desc: 'Apply online to save time' },
                      ].map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex-shrink-0">{tip.icon}</div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{tip.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{tip.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Countries</option>
                      {countries.map(code => (
                        <option key={code} value={code}>{getCountryName(code)}</option>
                      ))}
                    </select>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3">
                    {filteredDocs.length === 0 ? (
                      <div className="text-center py-12">
                        <FileX className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">No documents found matching your criteria</p>
                      </div>
                    ) : (
                      filteredDocs.map(doc => {
                        const isExpanded = expandedDoc === doc.id;
                        const isFavorite = favorites.includes(doc.id);
                        const docStatus = getDocumentStatus(doc.id);
                        
                        return (
                          <div 
                            key={doc.id} 
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                          >
                            <div 
                              className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                              onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${getPriorityColor(doc.priority)}`}>
                                      {getCategoryIcon(doc.category)}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doc.name}</h3>
                                        {doc.required && (
                                          <Chip label="Required" size="sm" variant="error" />
                                        )}
                                        <Chip label={doc.priority} size="sm" variant={doc.priority === 'high' ? 'error' : doc.priority === 'medium' ? 'warning' : 'info'} />
                                        {docStatus && (
                                          <Chip 
                                            label={docStatus.status.replace('_', ' ')} 
                                            size="sm" 
                                            variant={docStatus.status === 'approved' ? 'success' : docStatus.status === 'applied' ? 'info' : 'warning'} 
                                          />
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{doc.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-3 mt-3">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                      <MapPin className="h-3.5 w-3.5" />
                                      <span>{doc.country.slice(0, 3).map(getCountryName).join(', ')}{doc.country.length > 3 ? '...' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                      <DollarSign className="h-3.5 w-3.5" />
                                      <span>{doc.cost}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                      <Clock className="h-3.5 w-3.5" />
                                      <span>{doc.processingTime}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                      <Award className="h-3.5 w-3.5" />
                                      <span>{doc.validity}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(doc.id);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${
                                      isFavorite
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                  >
                                    <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                                  </button>
                                  <button className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800 p-6 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                      <Building2 className="h-4 w-4 text-primary-600" />
                                      Issuing Authority
                                    </h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 pl-6">{doc.issuingAuthority}</p>
                                  </div>
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-success-600" />
                                      Fees Breakdown
                                    </h4>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 pl-6 space-y-1">
                                      <div className="flex justify-between">
                                        <span>Application:</span>
                                        <span className="font-medium">{doc.fees.application}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Processing:</span>
                                        <span className="font-medium">{doc.fees.processing}</span>
                                      </div>
                                      {doc.fees.renewal && (
                                        <div className="flex justify-between">
                                          <span>Renewal:</span>
                                          <span className="font-medium">{doc.fees.renewal}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <FileCheck className="h-4 w-4 text-info-600" />
                                    Required Documents
                                  </h4>
                                  <div className="flex flex-wrap gap-2 pl-6">
                                    {doc.documents.map((item, idx) => (
                                      <Chip key={idx} label={item} size="sm" variant="info" />
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-primary-600" />
                                    Step-by-Step Application Process
                                  </h4>
                                  <div className="pl-6 space-y-2">
                                    {doc.applicationSteps.map((step, idx) => (
                                      <div key={idx} className="flex items-start gap-3">
                                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                          idx === 0 ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' :
                                          idx === doc.applicationSteps.length - 1 ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300' :
                                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}>
                                          {idx + 1}
                                        </span>
                                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 pt-1">{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Status Tracking */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                      <ListChecks className="h-4 w-4 text-primary-600" />
                                      Track Your Application
                                    </h4>
                                    <button
                                      onClick={() => setShowStatusModal(doc.id)}
                                      className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                      {docStatus ? 'Update Status' : 'Mark Status'}
                                    </button>
                                  </div>
                                  {docStatus && (
                                    <div className="pl-6 space-y-2">
                                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor(docStatus.status)}`}>
                                        {docStatus.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                                        {docStatus.status === 'rejected' && <XCircle className="h-3 w-3" />}
                                        {docStatus.status === 'applied' && <Clock className="h-3 w-3" />}
                                        {docStatus.status.replace('_', ' ').toUpperCase()}
                                      </div>
                                      {docStatus.appliedDate && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                          Applied: {new Date(docStatus.appliedDate).toLocaleDateString()}
                                        </div>
                                      )}
                                      {docStatus.notes && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                          Notes: {docStatus.notes}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {doc.links && Object.keys(doc.links).length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                      <ExternalLink className="h-4 w-4 text-primary-600" />
                                      Official Resources
                                    </h4>
                                    <div className="flex flex-wrap gap-2 pl-6">
                                      {doc.links.applicationForm && (
                                        <a 
                                          href={doc.links.applicationForm} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                                        >
                                          Application Form <ExternalLink className="h-3 w-3" />
                                        </a>
                                      )}
                                      {doc.links.guidelines && (
                                        <a 
                                          href={doc.links.guidelines} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                                        >
                                          Guidelines <ExternalLink className="h-3 w-3" />
                                        </a>
                                      )}
                                      {doc.links.portal && (
                                        <a 
                                          href={doc.links.portal} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                                        >
                                          Online Portal <ExternalLink className="h-3 w-3" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'checklist' && (
                <div className="space-y-6">
                  {/* Progress Overview */}
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Document Checklist Progress</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Track your progress on required trade documents
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                          {checklistProgress.percentage}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {checklistProgress.completed} of {checklistProgress.total} completed
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${checklistProgress.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-3">
                    {requiredDocs.map(doc => {
                      const docStatus = getDocumentStatus(doc.id);
                      return (
                        <div 
                          key={doc.id}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`mt-1 ${docStatus?.status === 'approved' ? 'text-success-600' : docStatus?.status === 'applied' ? 'text-blue-600' : 'text-gray-400'}`}>
                                {docStatus?.status === 'approved' ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : docStatus?.status === 'applied' ? (
                                  <Clock className="h-5 w-5" />
                                ) : (
                                  <div className="h-5 w-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white">{doc.name}</h4>
                                  {docStatus && (
                                    <Chip 
                                      label={docStatus.status.replace('_', ' ')} 
                                      size="sm" 
                                      variant={docStatus.status === 'approved' ? 'success' : docStatus.status === 'applied' ? 'info' : 'warning'} 
                                    />
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <span>{doc.processingTime}</span>
                                  <span>{doc.cost}</span>
                                  <span>Valid: {doc.validity}</span>
                                </div>
                                {docStatus?.notes && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                                    {docStatus.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => setShowStatusModal(doc.id)}
                              className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              {docStatus ? 'Update' : 'Track'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Additional Resources</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Links to official portals, application forms, and detailed guidelines will be available here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Modal */}
          {showStatusModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Update Document Status
                  </h3>
                  <button
                    onClick={() => setShowStatusModal(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      id="status-select"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      defaultValue={getDocumentStatus(showStatusModal)?.status || 'not_started'}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="applied">Applied</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="status-notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Add any notes about this document..."
                      defaultValue={getDocumentStatus(showStatusModal)?.notes || ''}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const statusSelect = document.getElementById('status-select') as HTMLSelectElement;
                        const notesTextarea = document.getElementById('status-notes') as HTMLTextAreaElement;
                        updateChecklistStatus(
                          showStatusModal,
                          statusSelect.value as DocumentStatus['status'],
                          notesTextarea.value
                        );
                      }}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      Save Status
                    </button>
                    <button
                      onClick={() => setShowStatusModal(null)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    </AppLayout>
  );
};

export default DocumentVault;

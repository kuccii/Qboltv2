import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Lock,
  Share2,
  History,
  Folder,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FilePlus,
  FileCheck,
  FileX
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../contexts/AuthContext';

interface Document {
  id: number;
  name: string;
  type: 'contract' | 'invoice' | 'report' | 'legal' | 'financial';
  category: string;
  size: string;
  lastModified: string;
  version: number;
  status: 'active' | 'archived' | 'pending';
  accessLevel: 'public' | 'private' | 'restricted';
  sharedWith: string[];
  encryption: boolean;
  owner: string;
}

interface DocumentTemplate {
  id: number;
  name: string;
  type: 'customs' | 'invoice' | 'certificate' | 'contract' | 'logistics';
  description: string;
  lastUsed: string;
  usageCount: number;
  status: 'approved' | 'pending' | 'deprecated';
  industry: string[];
  requiredFields: string[];
  tradeSpecific: {
    hsCode?: string;
    origin?: string;
    destination?: string;
    incoterms?: string;
    customsProcedure?: string;
  };
}

const DocumentVault: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'documents' | 'templates'>('documents');

  // Mock data for documents
  const documents: Document[] = [
    {
      id: 1,
      name: 'Supplier Contract - ABC Construction',
      type: 'contract',
      category: 'Supplier Agreements',
      size: '2.5 MB',
      lastModified: '2024-03-15',
      version: 2,
      status: 'active',
      accessLevel: 'restricted',
      sharedWith: ['John Doe', 'Jane Smith'],
      encryption: true,
      owner: 'Admin'
    },
    {
      id: 2,
      name: 'Q1 2024 Market Report',
      type: 'report',
      category: 'Market Analysis',
      size: '1.8 MB',
      lastModified: '2024-03-10',
      version: 1,
      status: 'active',
      accessLevel: 'public',
      sharedWith: [],
      encryption: false,
      owner: 'Analyst Team'
    }
  ];

  // Mock data for templates
  const templates: DocumentTemplate[] = [
    {
      id: 1,
      name: 'Commercial Invoice',
      type: 'invoice',
      description: 'Standard commercial invoice for international trade transactions',
      lastUsed: '2024-03-18',
      usageCount: 45,
      status: 'approved',
      industry: ['All'],
      requiredFields: [
        'Seller Details',
        'Buyer Details',
        'Invoice Number',
        'Date',
        'HS Code',
        'Description of Goods',
        'Quantity',
        'Unit Price',
        'Total Value',
        'Currency',
        'Incoterms'
      ],
      tradeSpecific: {
        hsCode: 'Required',
        incoterms: 'Required'
      }
    },
    {
      id: 2,
      name: 'Certificate of Origin',
      type: 'certificate',
      description: 'Document certifying the country of origin of goods',
      lastUsed: '2024-03-15',
      usageCount: 32,
      status: 'approved',
      industry: ['All'],
      requiredFields: [
        'Exporter Details',
        'Consignee Details',
        'Country of Origin',
        'HS Code',
        'Description of Goods',
        'Quantity',
        'Weight',
        'Transport Details'
      ],
      tradeSpecific: {
        origin: 'Required',
        hsCode: 'Required'
      }
    },
    {
      id: 3,
      name: 'Customs Declaration',
      type: 'customs',
      description: 'Standard customs declaration form for import/export',
      lastUsed: '2024-03-10',
      usageCount: 18,
      status: 'approved',
      industry: ['All'],
      requiredFields: [
        'Declarant Details',
        'Customs Procedure',
        'HS Code',
        'Goods Description',
        'Quantity',
        'Value',
        'Country of Origin',
        'Country of Destination',
        'Transport Details'
      ],
      tradeSpecific: {
        customsProcedure: 'Required',
        hsCode: 'Required',
        origin: 'Required',
        destination: 'Required'
      }
    },
    {
      id: 4,
      name: 'Bill of Lading',
      type: 'logistics',
      description: 'Standard bill of lading for sea freight shipments',
      lastUsed: '2024-03-12',
      usageCount: 28,
      status: 'approved',
      industry: ['All'],
      requiredFields: [
        'Shipper Details',
        'Consignee Details',
        'Notify Party',
        'Vessel Name',
        'Port of Loading',
        'Port of Discharge',
        'Container Details',
        'Cargo Description',
        'Weight and Measurements'
      ],
      tradeSpecific: {
        incoterms: 'Required'
      }
    },
    {
      id: 5,
      name: 'Import/Export License',
      type: 'certificate',
      description: 'Template for import/export license applications',
      lastUsed: '2024-03-08',
      usageCount: 15,
      status: 'approved',
      industry: ['All'],
      requiredFields: [
        'Applicant Details',
        'Goods Description',
        'HS Code',
        'Quantity',
        'Value',
        'Country of Origin',
        'Country of Destination',
        'Purpose of Import/Export'
      ],
      tradeSpecific: {
        hsCode: 'Required',
        origin: 'Required',
        destination: 'Required'
      }
    }
  ];

  const documentTypes = ['all', 'contract', 'invoice', 'report', 'legal', 'financial'];
  const categories = ['all', 'Supplier Agreements', 'Market Analysis', 'Financial Records', 'Legal Documents'];
  const statuses = ['all', 'active', 'archived', 'pending'];

  const filteredDocuments = documents.filter(doc => {
    const searchMatch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = selectedType === 'all' || doc.type === selectedType;
    const categoryMatch = selectedCategory === 'all' || doc.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || doc.status === selectedStatus;
    return searchMatch && typeMatch && categoryMatch && statusMatch;
  });

  const filteredTemplates = templates.filter(template => {
    const searchMatch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = selectedType === 'all' || template.type === selectedType;
    const industryMatch = selectedCategory === 'all' || template.industry.includes(selectedCategory);
    return searchMatch && typeMatch && industryMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Document Vault</h1>
        <div className="flex gap-2">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'documents' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={20} />
            <span>Documents</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'templates' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            <FilePlus size={20} />
            <span>Templates</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title={activeTab === 'documents' ? "Total Documents" : "Total Templates"}
          icon={<FileText className="w-5 h-5" />}
        >
          <div className="text-2xl font-bold">
            {activeTab === 'documents' ? documents.length : templates.length}
          </div>
        </DashboardCard>
        <DashboardCard
          title={activeTab === 'documents' ? "Encrypted" : "Approved"}
          icon={<Lock className="w-5 h-5" />}
        >
          <div className="text-2xl font-bold">
            {activeTab === 'documents' 
              ? documents.filter(doc => doc.encryption).length 
              : templates.filter(t => t.status === 'approved').length}
          </div>
        </DashboardCard>
        <DashboardCard
          title={activeTab === 'documents' ? "Shared Documents" : "Usage Count"}
          icon={<Share2 className="w-5 h-5" />}
        >
          <div className="text-2xl font-bold">
            {activeTab === 'documents' 
              ? documents.filter(doc => doc.sharedWith.length > 0).length 
              : templates.reduce((acc, t) => acc + t.usageCount, 0)}
          </div>
        </DashboardCard>
        <DashboardCard
          title={activeTab === 'documents' ? "Active Versions" : "Last Used"}
          icon={<History className="w-5 h-5" />}
        >
          <div className="text-2xl font-bold">
            {activeTab === 'documents' 
              ? documents.reduce((acc, doc) => acc + doc.version, 0)
              : templates.length > 0 ? templates[0].lastUsed : 'N/A'}
          </div>
        </DashboardCard>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex-1">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {documentTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          {activeTab === 'documents' && (
            <div className="flex-1">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeTab === 'documents' ? (
          <div className="space-y-4">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Folder size={16} />
                        {doc.category}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <History size={16} />
                        Version {doc.version}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        {doc.encryption ? (
                          <Lock size={16} className="text-success-600" />
                        ) : (
                          <AlertTriangle size={16} className="text-warning-600" />
                        )}
                        {doc.accessLevel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-primary-600">
                      <Download size={20} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-primary-600">
                      <Share2 size={20} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-primary-600">
                      <History size={20} />
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Size</span>
                    <p className="text-sm font-medium">{doc.size}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Last Modified</span>
                    <p className="text-sm font-medium">{doc.lastModified}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="flex items-center gap-1">
                      {doc.status === 'active' ? (
                        <CheckCircle2 size={16} className="text-success-600" />
                      ) : doc.status === 'pending' ? (
                        <AlertTriangle size={16} className="text-warning-600" />
                      ) : (
                        <XCircle size={16} className="text-gray-400" />
                      )}
                      <span className="text-sm font-medium capitalize">{doc.status}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Shared With</span>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span className="text-sm font-medium">{doc.sharedWith.length} users</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTemplates.map(template => (
              <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <FileText size={16} />
                        {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <History size={16} />
                        Last used: {template.lastUsed}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        {template.status === 'approved' ? (
                          <FileCheck size={16} className="text-success-600" />
                        ) : template.status === 'pending' ? (
                          <AlertTriangle size={16} className="text-warning-600" />
                        ) : (
                          <FileX size={16} className="text-gray-400" />
                        )}
                        {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-primary-600">
                      <FilePlus size={20} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-primary-600">
                      <Download size={20} />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Required Fields</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {template.requiredFields.map(field => (
                      <span key={field} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Trade Specific Requirements</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(template.tradeSpecific).map(([key, value]) => (
                      <span key={key} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                        {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Industries</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {template.industry.map(ind => (
                      <span key={ind} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Used {template.usageCount} times</span>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard
          title={activeTab === 'documents' ? "Document Categories" : "Template Types"}
          icon={<Folder className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Supplier Agreements</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-primary-600 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Market Analysis</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-success-600 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Financial Records</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-warning-600 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Recent Activity"
          icon={<History className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold">
                A
              </div>
              <div>
                <p className="text-sm font-medium">New version uploaded for Supplier Contract</p>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold">
                B
              </div>
              <div>
                <p className="text-sm font-medium">Document shared with 3 users</p>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default DocumentVault; 
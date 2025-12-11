import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageSquare, 
  Mail, 
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import {
  AppLayout,
  PageHeader,
  PageLayout,
  SectionLayout,
  SearchInput
} from '../design-system';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: number;
  lastUpdated: string;
  helpful: number;
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });

  const categories = [
    { id: 'all', name: 'All Topics', count: 45 },
    { id: 'getting-started', name: 'Getting Started', count: 12 },
    { id: 'pricing', name: 'Pricing & Billing', count: 8 },
    { id: 'suppliers', name: 'Suppliers', count: 10 },
    { id: 'prices', name: 'Price Tracking', count: 7 },
    { id: 'technical', name: 'Technical', count: 5 },
    { id: 'account', name: 'Account', count: 3 }
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I set up price alerts?',
      answer: 'To set up price alerts, go to the Price Tracking page and click on the "Create Alert" button. You can set alerts for specific materials, regions, and price thresholds. You\'ll receive notifications via email, push, or SMS when prices change.',
      category: 'prices',
      helpful: 24,
      notHelpful: 2
    },
    {
      id: '2',
      question: 'How do I add a new supplier?',
      answer: 'You can add a new supplier by going to the Supplier Directory and clicking "Add Supplier". Fill in the required information including company name, contact details, and verification documents. Our team will review and verify the supplier within 24-48 hours.',
      category: 'suppliers',
      helpful: 18,
      notHelpful: 1
    },
    {
      id: '3',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), bank transfers, and mobile money payments. You can update your payment method in the Billing section of your account settings.',
      category: 'pricing',
      helpful: 31,
      notHelpful: 0
    },
    {
      id: '4',
      question: 'How do I export my data?',
      answer: 'You can export your data by going to Settings > Data Management and clicking "Export Data". This will generate a ZIP file containing all your data in JSON format. The export process may take a few minutes for large datasets.',
      category: 'technical',
      helpful: 15,
      notHelpful: 3
    },
    {
      id: '5',
      question: 'How do I change my password?',
      answer: 'To change your password, go to Profile > Security Settings and click "Change Password". You\'ll need to enter your current password and then your new password twice for confirmation.',
      category: 'account',
      helpful: 22,
      notHelpful: 1
    }
  ];

  const articles: Article[] = [
    {
      id: '1',
      title: 'Getting Started with Qivook',
      category: 'getting-started',
      readTime: 5,
      lastUpdated: '2024-01-15',
      helpful: 45
    },
    {
      id: '2',
      title: 'Understanding Supplier Scores',
      category: 'suppliers',
      readTime: 8,
      lastUpdated: '2024-01-12',
      helpful: 32
    },
    {
      id: '3',
      title: 'Setting Up Price Alerts',
      category: 'prices',
      readTime: 6,
      lastUpdated: '2024-01-10',
      helpful: 28
    },
    {
      id: '4',
      title: 'API Documentation',
      category: 'technical',
      readTime: 15,
      lastUpdated: '2024-01-08',
      helpful: 19
    }
  ];

  const tickets: Ticket[] = [
    {
      id: 'T-001',
      subject: 'Unable to access supplier directory',
      status: 'in_progress',
      priority: 'high',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-21'
    },
    {
      id: 'T-002',
      subject: 'Price alert not working',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-19'
    },
    {
      id: 'T-003',
      subject: 'Billing question',
      status: 'open',
      priority: 'low',
      createdAt: '2024-01-22',
      updatedAt: '2024-01-22'
    }
  ];

  const filteredFAQs = faqs.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (searchQuery === '' || faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit ticket:', contactForm);
    setShowContactForm(false);
    setContactForm({
      subject: '',
      category: '',
      priority: 'medium',
      description: ''
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Help Center"
        subtitle="Find answers, get support, and learn how to use Qivook"
        breadcrumbs={[{ label: 'Help Center' }]}
      />

      <PageLayout>
        <div className="space-y-6">
          {/* Search Section */}
          <SectionLayout title="How can we help you?" subtitle="Search our knowledge base or browse by category">
            <div className="max-w-2xl mx-auto">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search for help articles, FAQs, or topics..."
                className="w-full"
              />
            </div>
          </SectionLayout>

          {/* Quick Actions */}
          <SectionLayout title="Quick Actions" subtitle="Common tasks and support options">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setShowContactForm(true)}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-left hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare size={24} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get help from our support team</p>
              </button>

              <button className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-left hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Documentation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Browse our comprehensive guides</p>
              </button>

              <button className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-left hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                  <Phone size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chat with our support team</p>
              </button>
            </div>
          </SectionLayout>

          {/* Categories */}
          <SectionLayout title="Browse by Category" subtitle="Find help organized by topic">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <h3 className="font-medium mb-1">{category.name}</h3>
                  <p className="text-sm opacity-75">{category.count} articles</p>
                </button>
              ))}
            </div>
          </SectionLayout>

          {/* FAQs */}
          <SectionLayout title="Frequently Asked Questions" subtitle="Quick answers to common questions">
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white">{faq.question}</h3>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown size={20} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-400" />
                    )}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{faq.answer}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Was this helpful?</span>
                        <button className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                          <CheckCircle size={16} />
                          Yes ({faq.helpful})
                        </button>
                        <button className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                          <AlertCircle size={16} />
                          No ({faq.notHelpful})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionLayout>

          {/* Help Articles */}
          <SectionLayout title="Popular Articles" subtitle="Most helpful articles from our knowledge base">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{article.title}</h3>
                    <ExternalLink size={16} className="text-gray-400" />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {article.readTime} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} />
                      {article.helpful} helpful
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Last updated: {new Date(article.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </SectionLayout>

          {/* Support Tickets */}
          <SectionLayout title="Your Support Tickets" subtitle="Track your support requests">
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{ticket.subject}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionLayout>

          {/* Contact Form Modal */}
          {showContactForm && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Support</h3>
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={contactForm.category}
                      onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={contactForm.priority}
                      onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={contactForm.description}
                      onChange={(e) => setContactForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Please provide detailed information about your issue..."
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Submit Ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    </AppLayout>
  );
};

export default HelpCenter;

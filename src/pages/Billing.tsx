import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Star,
  Zap,
  Crown
} from 'lucide-react';
import {
  AppLayout,
  PageHeader,
  PageLayout,
  SectionLayout,
  ActionMenu
} from '../design-system';

interface Subscription {
  id: string;
  plan: 'free' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

const Billing: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription>({
    id: 'sub_123',
    plan: 'professional',
    status: 'active',
    currentPeriodStart: '2024-01-01',
    currentPeriodEnd: '2024-02-01',
    amount: 29.99,
    currency: 'USD',
    interval: 'month'
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm_1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'inv_001',
      date: '2024-01-01',
      amount: 29.99,
      currency: 'USD',
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'inv_002',
      date: '2023-12-01',
      amount: 29.99,
      currency: 'USD',
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'inv_003',
      date: '2023-11-01',
      amount: 29.99,
      currency: 'USD',
      status: 'paid',
      downloadUrl: '#'
    }
  ]);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      description: 'Perfect for getting started',
      features: [
        'Up to 5 price alerts',
        'Basic supplier directory',
        'Standard support',
        '1 user account'
      ],
      icon: <Star className="text-gray-400" size={24} />,
      color: 'gray'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 29.99,
      interval: 'month',
      description: 'Best for growing businesses',
      features: [
        'Unlimited price alerts',
        'Advanced supplier directory',
        'Priority support',
        'Up to 5 user accounts',
        'Export data',
        'API access'
      ],
      icon: <Zap className="text-blue-500" size={24} />,
      color: 'blue',
      current: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      interval: 'month',
      description: 'For large organizations',
      features: [
        'Everything in Professional',
        'Unlimited user accounts',
        'Custom integrations',
        'Dedicated support',
        'Advanced analytics',
        'White-label options'
      ],
      icon: <Crown className="text-purple-500" size={24} />,
      color: 'purple'
    }
  ];

  const handleUpgrade = (planId: string) => {
    console.log('Upgrade to plan:', planId);
    setMessage({ type: 'success', text: 'Redirecting to upgrade page...' });
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      setSubscription(prev => ({ ...prev, status: 'cancelled' }));
      setMessage({ type: 'success', text: 'Subscription cancelled. You will retain access until the end of your billing period.' });
    }
  };

  const handleReactivateSubscription = () => {
    setSubscription(prev => ({ ...prev, status: 'active' }));
    setMessage({ type: 'success', text: 'Subscription reactivated successfully!' });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log('Download invoice:', invoiceId);
    setMessage({ type: 'success', text: 'Invoice download started...' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'past_due': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Billing & Subscription"
        subtitle="Manage your subscription, payment methods, and billing history"
        breadcrumbs={[{ label: 'Billing' }]}
        actions={
          <div className="flex items-center gap-3">
            <ActionMenu
              items={[
                { id: 'download', label: 'Download All Invoices', icon: <Download className="h-4 w-4" />, description: 'Download all invoices as ZIP', onClick: () => console.log('Download all') },
                { id: 'add-payment', label: 'Add Payment Method', icon: <Plus className="h-4 w-4" />, description: 'Add a new payment method', onClick: () => setShowAddPayment(true) }
              ]}
              size="sm"
            />
          </div>
        }
      />

      <PageLayout>
        <div className="space-y-6">
          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Current Subscription */}
          <SectionLayout title="Current Subscription" subtitle="Your active subscription details">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <CreditCard size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {subscription.plan} Plan
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(subscription.amount, subscription.currency)} per {subscription.interval}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                    {subscription.status.replace('_', ' ')}
                  </span>
                  {subscription.status === 'cancelled' ? (
                    <button
                      onClick={handleReactivateSubscription}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelSubscription}
                      className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Current period:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Next billing date:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
              </div>
            </div>
          </SectionLayout>

          {/* Available Plans */}
          <SectionLayout title="Available Plans" subtitle="Choose the plan that best fits your needs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 p-6 ${
                    plan.current
                      ? 'border-blue-500 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {plan.current && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Current Plan
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-3">
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {plan.description}
                    </p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(plan.price, 'USD')}
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        /{plan.interval}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.current ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        plan.color === 'purple'
                          ? 'text-white bg-purple-600 hover:bg-purple-700'
                          : plan.color === 'blue'
                          ? 'text-white bg-blue-600 hover:bg-blue-700'
                          : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SectionLayout>

          {/* Payment Methods */}
          <SectionLayout 
            title="Payment Methods" 
            subtitle="Manage your payment methods"
            actions={
              <button
                onClick={() => setShowAddPayment(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Add Payment Method
              </button>
            }
          >
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <CreditCard size={20} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {method.brand} •••• {method.last4}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 rounded-full">
                          Default
                        </span>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionLayout>

          {/* Billing History */}
          <SectionLayout title="Billing History" subtitle="Your recent invoices and payments">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(invoice.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                              : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                          >
                            <Download size={14} />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionLayout>
        </div>
      </PageLayout>
    </AppLayout>
  );
};

export default Billing;

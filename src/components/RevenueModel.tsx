import React, { useState } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  BarChart3, 
  CheckCircle,
  Star,
  Crown,
  Zap
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ElementType;
  color: string;
}

const RevenueModel: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<string>('professional');

  const pricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      currency: 'USD',
      period: 'month',
      description: 'Perfect for small businesses getting started',
      features: [
        'Access to basic price data',
        'Up to 50 supplier contacts',
        'Basic analytics dashboard',
        'Email support',
        'Rwanda data only'
      ],
      icon: Users,
      color: 'bg-gray-100 text-gray-800'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 49,
      currency: 'USD',
      period: 'month',
      description: 'Most popular for growing businesses',
      features: [
        'Real-time price tracking',
        'Unlimited supplier contacts',
        'Advanced analytics & insights',
        'Multi-country data (Rwanda, Kenya, Uganda)',
        'Priority support',
        'PDF export functionality',
        'Price alerts & notifications',
        'Supplier rating system'
      ],
      popular: true,
      icon: TrendingUp,
      color: 'bg-primary-100 text-primary-800'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 149,
      currency: 'USD',
      period: 'month',
      description: 'For large organizations with complex needs',
      features: [
        'Everything in Professional',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced reporting & analytics',
        'API access',
        'Custom data sources',
        'White-label options',
        '24/7 phone support',
        'Training & onboarding'
      ],
      icon: Crown,
      color: 'bg-yellow-100 text-yellow-800'
    }
  ];

  const additionalRevenueStreams = [
    {
      title: 'Transaction Fees',
      description: '2-3% commission on facilitated transactions',
      icon: CreditCard,
      potential: 'High volume, recurring revenue'
    },
    {
      title: 'Premium Listings',
      description: 'Suppliers pay for enhanced visibility',
      icon: Star,
      potential: 'Scalable with supplier growth'
    },
    {
      title: 'Data Licensing',
      description: 'Sell aggregated market intelligence',
      icon: BarChart3,
      potential: 'High-margin, B2B sales'
    },
    {
      title: 'Financing Commissions',
      description: 'Earn from loan origination fees',
      icon: Zap,
      potential: 'High-value, relationship-based'
    }
  ];

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    // In a real app, this would redirect to payment
    console.log(`Selected tier: ${tierId}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Start free and scale as you grow. All plans include access to our core supply chain intelligence platform.
        </p>
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {pricingTiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-200 ${
              tier.popular
                ? 'border-primary-500 scale-105'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${tier.color}`}>
                  <tier.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {tier.description}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${tier.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    /{tier.period}
                  </span>
                </div>
                {tier.price === 0 && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Free forever
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectTier(tier.id)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  tier.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                }`}
              >
                {tier.price === 0 ? 'Get Started Free' : 'Choose Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Revenue Streams */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Additional Revenue Opportunities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {additionalRevenueStreams.map((stream, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <stream.icon className="text-primary-600 dark:text-primary-300" size={20} />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {stream.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {stream.description}
              </p>
              <p className="text-xs text-green-600 font-medium">
                {stream.potential}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="mt-12 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900 dark:to-blue-900 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Revenue Projections
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-300 mb-2">
              $50K
            </div>
            <p className="text-gray-600 dark:text-gray-300">Monthly Recurring Revenue (Year 1)</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Based on 1,000 paying customers
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-300 mb-2">
              $200K
            </div>
            <p className="text-gray-600 dark:text-gray-300">Monthly Recurring Revenue (Year 2)</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              With transaction fees & premium features
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-300 mb-2">
              $500K
            </div>
            <p className="text-gray-600 dark:text-gray-300">Monthly Recurring Revenue (Year 3)</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Multi-country expansion & enterprise clients
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueModel;


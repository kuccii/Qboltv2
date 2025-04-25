import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  TrendingUp, 
  Map, 
  Users, 
  Wallet,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      title: 'Real-time Price Tracking',
      description: 'Monitor construction materials and agricultural input prices across East Africa.',
      icon: <TrendingUp className="text-primary-600" size={24} />
    },
    {
      title: 'Demand Mapping',
      description: 'Visualize regional demand patterns and market opportunities.',
      icon: <Map className="text-primary-600" size={24} />
    },
    {
      title: 'Supplier Scoring',
      description: 'Evaluate and track supplier reliability and performance.',
      icon: <Users className="text-primary-600" size={24} />
    },
    {
      title: 'Trade Financing',
      description: 'Access working capital based on your verified trade activity.',
      icon: <Wallet className="text-primary-600" size={24} />
    }
  ];

  const benefits = [
    'Make data-driven procurement decisions',
    'Reduce supply chain risks',
    'Access reliable supplier networks',
    'Unlock working capital financing',
    'Track market trends in real-time',
    'Optimize inventory management'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="text-white" size={48} />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Qivook</h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Trade Intelligence Platform
          </h2>
          <p className="text-lg text-primary-100 max-w-2xl mb-8">
            Empowering construction and agriculture businesses across East Africa with real-time market intelligence and trade financing solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-primary-800 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Powerful Features for Your Business
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              Why Choose Qivook?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm"
                >
                  <CheckCircle className="text-primary-600 flex-shrink-0" size={20} />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses using Qivook to make smarter trade decisions and access better financing options.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-800 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Start Free Trial <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary-900 text-primary-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Building2 size={24} />
              <span className="font-semibold">Qivook</span>
            </div>
            <div className="text-sm">
              © 2024 Qivook. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  TrendingUp, 
  Map, 
  Users, 
  Wallet,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Shield,
  Truck,
  FileText,
  Star,
  Play,
  Globe,
  Zap,
  Target,
  Award,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Eye,
  Download,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';

const Home: React.FC = () => {
  const { authState } = useAuth();
  const { currentIndustry } = useIndustry();
  const navigate = useNavigate();
  const [currentPriceIndex, setCurrentPriceIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!authState.user);
  }, [authState.user]);

  // Live price ticker data
  const priceTicker = [
    { material: 'Cement', price: 'KES 850', change: '+2.3%', trend: 'up', region: 'Nairobi' },
    { material: 'Steel', price: 'KES 1,200', change: '-1.1%', trend: 'down', region: 'Mombasa' },
    { material: 'Fertilizer', price: 'KES 2,100', change: '+0.8%', trend: 'up', region: 'Kisumu' },
    { material: 'Timber', price: 'KES 450', change: '+3.2%', trend: 'up', region: 'Nakuru' },
    { material: 'Sand', price: 'KES 320', change: '+1.5%', trend: 'up', region: 'Eldoret' },
    { material: 'Seeds', price: 'KES 180', change: '-0.5%', trend: 'down', region: 'Kigali' }
  ];

  // Rotate price ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPriceIndex((prev) => (prev + 1) % priceTicker.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentPrice = priceTicker[currentPriceIndex];

  const features = [
    {
      title: 'Real-time Price Tracking',
      description: 'Monitor construction materials and agricultural input prices across East Africa with live updates.',
      icon: <TrendingUp className="text-blue-600" size={24} />,
      link: '/app/prices',
      stats: '10,000+ daily updates'
    },
    {
      title: 'Supplier Intelligence',
      description: 'Discover and evaluate suppliers with comprehensive scoring and verification systems.',
      icon: <Users className="text-green-600" size={24} />,
      link: '/app/supplier-directory',
      stats: '2,500+ verified suppliers'
    },
    {
      title: 'Demand Mapping',
      description: 'Visualize regional demand patterns and identify market opportunities with interactive maps.',
      icon: <Map className="text-purple-600" size={24} />,
      link: '/app/demand',
      stats: '4 countries covered'
    },
    {
      title: 'Trade Financing',
      description: 'Access working capital and trade finance solutions based on your verified activity.',
      icon: <Wallet className="text-orange-600" size={24} />,
      link: '/app/financing',
      stats: 'Up to $50K credit'
    },
    {
      title: 'Risk Management',
      description: 'Monitor and mitigate supply chain risks with real-time alerts and analytics.',
      icon: <Shield className="text-red-600" size={24} />,
      link: '/app/risk',
      stats: '95% risk reduction'
    },
    {
      title: 'Logistics Planning',
      description: 'Optimize routes and costs with intelligent logistics planning and tracking.',
      icon: <Truck className="text-indigo-600" size={24} />,
      link: '/app/logistics',
      stats: '15% cost savings'
    }
  ];

  const stats = [
    { label: 'Active Suppliers', value: '2,500+', icon: <Users className="text-blue-500" size={20} />, change: '+12%' },
    { label: 'Price Updates Daily', value: '10,000+', icon: <TrendingUp className="text-green-500" size={20} />, change: '+25%' },
    { label: 'Countries Covered', value: '4', icon: <Globe className="text-purple-500" size={20} />, change: '+1' },
    { label: 'Cost Savings', value: '15%', icon: <DollarSign className="text-orange-500" size={20} />, change: '+3%' }
  ];

  const testimonials = [
    {
      name: 'Sarah Mwangi',
      role: 'Procurement Manager',
      company: 'BuildCorp Kenya',
      content: 'Qivook has transformed how we source materials. We\'ve reduced costs by 18% and improved supplier relationships significantly.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'James Kiprop',
      role: 'Farm Manager',
      company: 'GreenFields Agriculture',
      content: 'The price tracking feature helps us plan our purchases better. We\'ve saved thousands on fertilizer and seed costs.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Grace Akinyi',
      role: 'Operations Director',
      company: 'East Africa Logistics',
      content: 'The logistics planning tools are game-changing. We\'ve optimized routes and reduced delivery times by 30%.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];

  const coverageMap = [
    { country: 'Kenya', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'], suppliers: 1200 },
    { country: 'Uganda', cities: ['Kampala', 'Entebbe', 'Jinja', 'Gulu'], suppliers: 800 },
    { country: 'Tanzania', cities: ['Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza'], suppliers: 600 },
    { country: 'Rwanda', cities: ['Kigali', 'Butare', 'Gisenyi'], suppliers: 400 }
  ];

  const logos = [
    'BuildCorp Kenya',
    'GreenFields Agriculture',
    'East Africa Logistics',
    'Kenya Construction Co.',
    'Uganda Materials Ltd',
    'Tanzania Builders'
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Qivook
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/#features" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Features
              </Link>
              <Link to="/#testimonials" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Testimonials
              </Link>
              <Link to="/#coverage" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Coverage
              </Link>
              {isLoggedIn ? (
                <Link
                  to="/app"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-950/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              East Africa's Premier
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}Trade Intelligence{' '}
              </span>
              Platform
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Connect suppliers, track prices, optimize logistics, and access financing - all in one powerful platform designed for East Africa's construction and agriculture sectors.
            </p>
            
            {/* Live Price Ticker */}
            <div className="mb-8">
              <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Live Prices</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-900 dark:text-white">{currentPrice.material}</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{currentPrice.price}</span>
                    <div className={`flex items-center space-x-1 ${
                      currentPrice.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentPrice.trend === 'up' ? (
                        <TrendingUpIcon className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{currentPrice.change}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{currentPrice.region}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <Link
                  to="/app"
                  className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => setShowDemo(true)}
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-blue-600 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </button>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-col items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Trusted by leading companies across East Africa</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                {logos.map((logo, index) => (
                  <div key={index} className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</div>
                <div className="text-xs text-green-600 font-medium">{stat.change} this month</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Trade Success
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and insights you need to make informed decisions and grow your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white ml-3">{feature.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{feature.stats}</span>
                  <Link
                    to={feature.link}
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Learn More
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage Map Section */}
      <div id="coverage" className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Coverage Across East Africa
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our network spans four countries with thousands of verified suppliers and real-time market data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coverageMap.map((country, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <MapPin className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{country.country}</h3>
                </div>
                <div className="space-y-2 mb-4">
                  {country.cities.map((city, cityIndex) => (
                    <div key={cityIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      {city}
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {country.suppliers} suppliers
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of satisfied customers who have transformed their business with Qivook.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of companies already using Qivook to optimize their supply chain, reduce costs, and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Link
                to="/app"
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-8 py-4 text-lg font-medium text-white border-2 border-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Contact Sales
                  <Phone className="ml-2 h-5 w-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold text-white">
                  Qivook
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-4 max-w-md">
                East Africa's premier trade intelligence platform. Connect suppliers, track prices, optimize logistics, and access financing - all in one powerful platform.
              </p>
              <div className="flex items-center gap-4">
                <a href="mailto:info@qivook.com" className="text-gray-400 hover:text-white transition-colors">
                  <Mail size={20} />
                </a>
                <a href="tel:+254700000000" className="text-gray-400 hover:text-white transition-colors">
                  <Phone size={20} />
                </a>
                <a href="https://www.linkedin.com/company/qivook" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link to="/#coverage" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Coverage
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/help" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Qivook. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <span className="text-sm text-gray-400">Made with ❤️ for East Africa</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Qivook Platform Demo</h3>
              <button
                onClick={() => setShowDemo(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Demo video would be embedded here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
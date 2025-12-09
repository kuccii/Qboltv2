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
  BookOpen,
  X
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
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="text-6xl sm:text-8xl animate-bounce">🚀</div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Your Trade Adventure
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 animate-pulse">
                Starts Here! 🎯
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-medium">
              The <strong>super fun</strong> way to find suppliers, track prices, get money for your business, and grow bigger! 
              Made just for East Africa! 🌍✨
            </p>
            
            {/* Live Price Ticker - Kid Friendly */}
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl px-6 py-4 border-4 border-yellow-300 dark:border-yellow-600 transform hover:scale-105 transition-transform">
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">💰 Live Prices!</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-extrabold text-gray-900 dark:text-white">{currentPrice.material}</span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{currentPrice.price}</span>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                      currentPrice.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {currentPrice.trend === 'up' ? (
                        <TrendingUpIcon className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="text-sm font-bold">{currentPrice.change}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">📍 {currentPrice.region}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <Link
                  to="/app"
                  className="inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all shadow-2xl border-4 border-yellow-300 transform hover:scale-110"
                >
                  🎯 Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all shadow-2xl border-4 border-yellow-300 transform hover:scale-110"
                  >
                    🚀 Start Your Adventure FREE!
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => setShowDemo(true)}
                    className="inline-flex items-center px-8 py-4 text-lg font-bold text-blue-600 bg-white border-4 border-blue-400 rounded-xl hover:bg-blue-50 transition-all shadow-xl transform hover:scale-110"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    🎬 Watch Demo
                  </button>
                </>
              )}
            </div>

            {/* Trust Indicators - Kid Friendly */}
            <div className="mt-12 flex flex-col items-center">
              <p className="text-base sm:text-lg font-bold text-white/90 mb-6 flex items-center gap-2">
                <span>⭐</span>
                <span>Trusted by awesome companies across East Africa! 🌍</span>
              </p>
              <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8">
                {logos.map((logo, index) => (
                  <div key={index} className="text-sm sm:text-base font-bold text-white/80 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border-2 border-white/30 hover:bg-white/30 transition-all transform hover:scale-105">
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Kid Friendly */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 py-16 border-t-4 border-b-4 border-yellow-300 dark:border-yellow-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-8 flex items-center justify-center gap-2">
            <span>📊</span>
            <span>Look How Awesome We Are! 🎉</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border-4 border-blue-200 dark:border-blue-700 transform hover:scale-110 transition-all">
                <div className="flex items-center justify-center mb-3 text-3xl">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{stat.label}</div>
                <div className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg inline-block">
                  {stat.change} this month! 📈
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section - Kid Friendly */}
      <div id="features" className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
              <span>🎁</span>
              <span>Super Cool Features That Make You Win! 🏆</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium">
              Everything you need to be a <strong>trade superstar</strong>! All in one fun place! 🎮✨
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group p-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl shadow-lg border-4 border-blue-200 dark:border-blue-700 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-start mb-4">
                  <div className="text-4xl mr-3 transform group-hover:scale-125 transition-transform">
                    {index === 0 && '💰'}
                    {index === 1 && '👥'}
                    {index === 2 && '🗺️'}
                    {index === 3 && '💳'}
                    {index === 4 && '🛡️'}
                    {index === 5 && '🚚'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                    {feature.stats}
                  </span>
                  <div className="inline-flex items-center text-blue-600 dark:text-blue-400 font-bold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    Try It! 
                    <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage Map Section - Kid Friendly */}
      <div id="coverage" className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 py-16 sm:py-20 border-t-4 border-b-4 border-green-300 dark:border-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
              <span>🌍</span>
              <span>We're Everywhere in East Africa! 🗺️</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium">
              Our <strong>super network</strong> covers <strong>4 amazing countries</strong> with thousands of awesome suppliers! 🎯
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {coverageMap.map((country, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border-4 border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 transform hover:scale-105 transition-all">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-2">📍</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{country.country}</h3>
                </div>
                <div className="space-y-2 mb-4">
                  {country.cities.map((city, cityIndex) => (
                    <div key={cityIndex} className="flex items-center text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      {city}
                    </div>
                  ))}
                </div>
                <div className="text-sm sm:text-base font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg text-center">
                  👥 {country.suppliers} Awesome Suppliers!
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section - Kid Friendly */}
      <div id="testimonials" className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
              <span>💬</span>
              <span>What Our Super Happy Users Say! 😊</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium">
              Join <strong>thousands</strong> of awesome people who made their business <strong>super successful</strong> with Qivook! 🎉
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-pink-900/20 rounded-2xl p-6 shadow-xl border-4 border-yellow-200 dark:border-yellow-700 transform hover:scale-105 transition-all">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white mr-4 border-4 border-white shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{testimonial.role}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{testimonial.company}</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-2xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - Kid Friendly */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl sm:text-8xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Ready to Become a Trade Superstar? 🚀
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto font-medium">
            Join <strong>thousands</strong> of awesome people already using Qivook to make their business <strong>super successful</strong>! 
            It's FREE to start! 🎁
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Link
                to="/app"
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-2xl border-4 border-yellow-300 transform hover:scale-110"
              >
                🎯 Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-2xl border-4 border-yellow-300 transform hover:scale-110"
                >
                  🚀 Start FREE Now!
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-4 text-lg font-bold text-white border-4 border-white rounded-xl hover:bg-white hover:text-blue-600 transition-all shadow-xl transform hover:scale-110"
                >
                  📞 Need Help?
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
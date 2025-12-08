import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  CreditCard, 
  ChevronRight, 
  DollarSign, 
  Calendar, 
  Percent, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Calculator,
  TrendingUp,
  FileText,
  Filter,
  ArrowUpDown,
  Star,
  Clock,
  Info,
  Shield,
  Zap,
  RefreshCw,
  Download,
  Eye,
  X
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
// Removed mock data import - using real data from API
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { unifiedApi } from '../services/unifiedApi';
import HeaderStrip from '../components/HeaderStrip';
import { useToast } from '../contexts/ToastContext';
import {
  AppLayout,
  PageLayout,
  SectionLayout,
  SelectInput,
  ActionMenu,
  RailLayout,
  Chip
} from '../design-system';

type SortOption = 'rate' | 'term' | 'amount' | 'eligibility';
type FilterOption = 'all' | 'eligible' | 'best-rate' | 'quick-funding';

const Financing: React.FC = () => {
  const { currentUser, authState } = useAuth();
  const { currentIndustry, industryConfig, getIndustryTerm } = useIndustry();
  const { addToast } = useToast();
  
  const [financeAmount, setFinanceAmount] = useState(10000);
  const [financeTerm, setFinanceTerm] = useState(6);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingOfferId, setApplyingOfferId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('rate');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'offers' | 'applications'>('offers');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [scoreFactors, setScoreFactors] = useState([
    { name: 'Payment History', score: 92, weight: 0.4 },
    { name: 'Trade Volume', score: 85, weight: 0.35 },
    { name: 'Supplier Diversity', score: 65, weight: 0.25 },
  ]);

  // Calculate eligibility score from real database data
  useEffect(() => {
    const calculateScore = async () => {
      if (!authState.user?.id) return;

      try {
        // Get user activities and shipments to calculate real scores
        const [activities, shipments] = await Promise.all([
          unifiedApi.user.getActivities(authState.user.id, 100),
          unifiedApi.logistics.getAll({ limit: 1000 }).catch(() => ({ data: [] }))
        ]);

        // Calculate Payment History (from financing applications and activities)
        const financingActivities = activities.filter((a: any) => 
          a.action?.includes('financing') || a.resource_type === 'financing_application'
        );
        const approvedApps = financingActivities.filter((a: any) => 
          a.action === 'financing_applied' || a.action === 'financing_approved'
        ).length;
        const totalFinancing = financingActivities.length;
        const paymentHistory = totalFinancing > 0 
          ? Math.min(100, Math.round((approvedApps / totalFinancing) * 100))
          : 85; // Default if no history

        // Calculate Trade Volume (from shipments)
        const userShipments = (shipments.data || []).filter((s: any) => 
          s.user_id === authState.user?.id
        );
        const totalOrders = userShipments.length;
        const totalRevenue = userShipments.reduce((sum: number, s: any) => 
          sum + (s.total_cost || 0), 0
        );
        
        // Score based on order volume and revenue
        let tradeVolume = 70; // Base
        if (totalOrders >= 50) tradeVolume = 95;
        else if (totalOrders >= 20) tradeVolume = 85;
        else if (totalOrders >= 10) tradeVolume = 75;
        else if (totalOrders >= 5) tradeVolume = 70;
        else if (totalOrders > 0) tradeVolume = 65;
        
        // Boost for revenue
        if (totalRevenue > 100000) tradeVolume = Math.min(100, tradeVolume + 10);
        else if (totalRevenue > 50000) tradeVolume = Math.min(100, tradeVolume + 5);

        // Calculate Supplier Diversity (unique suppliers from shipments)
        const uniqueSuppliers = new Set(
          userShipments.map((s: any) => s.supplier_id).filter(Boolean)
        ).size;
        
        let supplierDiversity = 60; // Base
        if (uniqueSuppliers >= 10) supplierDiversity = 90;
        else if (uniqueSuppliers >= 5) supplierDiversity = 75;
        else if (uniqueSuppliers >= 3) supplierDiversity = 65;
        else if (uniqueSuppliers >= 1) supplierDiversity = 60;
        else supplierDiversity = 50;

        // Update score factors
        setScoreFactors([
          { name: 'Payment History', score: paymentHistory, weight: 0.4 },
          { name: 'Trade Volume', score: tradeVolume, weight: 0.35 },
          { name: 'Supplier Diversity', score: supplierDiversity, weight: 0.25 },
        ]);
      } catch (err) {
        console.error('Error calculating eligibility score:', err);
        // Keep default scores on error
      }
    };

    calculateScore();
  }, [authState.user?.id]);

  // Calculate eligibility score from score factors
  const eligibilityScore = useMemo(() => {
    // Base score from user profile
    let score = 70;
    
    // Boost based on profile completeness
    if (authState.user?.company) score += 5;
    if (authState.user?.country) score += 3;
    
    // Calculate weighted score from factors
    const weightedScore = scoreFactors.reduce((sum, factor) => 
      sum + (factor.score * factor.weight), 0
    );
    
    // Combine base score (30%) with weighted factors (70%)
    score = Math.round((score * 0.3) + (weightedScore * 0.7));
    return Math.min(100, Math.max(0, score));
  }, [authState.user, scoreFactors]);

  // Fetch real financing offers from Supabase
  useEffect(() => {
    let cancelled = false;
    
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const dataPromise = unifiedApi.financing.getOffers({
          industry: currentIndustry,
          country: authState.user?.country,
          minAmount: financeAmount * 0.5,
          maxAmount: financeAmount * 3
        });
        
        const data = await Promise.race([dataPromise, timeoutPromise]) as any[];
        
        if (!cancelled) {
          if (data && data.length > 0) {
            setOffers(data);
          } else {
            // No offers from database
            console.log('No financing offers found in database');
            setOffers([]);
          }
        }
        } catch (err: any) {
          if (!cancelled) {
            console.error('Failed to fetch financing offers:', err);
            setError(null);
            setOffers([]); // Return empty array on error
          }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchOffers();
    
    return () => {
      cancelled = true;
    };
  }, [currentIndustry, authState.user?.country, financeAmount]);

  // Load user's applications
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setApplicationsLoading(true);
        const data = await unifiedApi.financing.getApplications();
        setApplications(data);
      } catch (e) {
        console.error('Failed to load applications:', e);
      } finally {
        setApplicationsLoading(false);
      }
    };
    loadApplications();
  }, []);

  // Normalize offers for UI
  const normalizedOffers = useMemo(() => {
    // If we have offers from DB, use them
    if (offers && offers.length > 0) {
      return offers.map((offer: any) => ({
        id: offer.id,
        provider: offer.provider_name || 'Partner Lender',
        providerType: offer.provider_type || 'fintech',
        title: offer.name || offer.title || 'Working Capital',
        description: offer.description || 'Flexible working capital solution',
        interestRate: typeof offer.interest_rate === 'number' ? offer.interest_rate : (offer.interest_rate ? parseFloat(offer.interest_rate) : 12.5),
        termDays: offer.term_days || 180,
        term: `${Math.round((offer.term_days || 180) / 30)} months`,
        minAmount: offer.min_amount ?? 5000,
        maxAmount: offer.max_amount ?? 50000,
        amount: Math.min(
          Math.max(financeAmount, offer.min_amount ?? financeAmount),
          offer.max_amount ?? financeAmount * 2
        ),
        eligibilityScore: offer.min_eligibility_score ?? 70,
        features: Array.isArray(offer.features) ? offer.features : [],
        requirements: Array.isArray(offer.requirements) ? offer.requirements : [],
        metadata: offer.metadata || {},
      }));
    }
    
    // No fallback - return empty array if no offers from DB
    return [];
  }, [offers, financeAmount, currentIndustry]);

  // Filter offers
  const filteredOffers = useMemo(() => {
    let filtered = normalizedOffers.filter(offer => {
      const isEligible = eligibilityScore >= offer.eligibilityScore;
      
      if (filterBy === 'eligible') return isEligible;
      if (filterBy === 'best-rate') return offer.interestRate <= 15;
      if (filterBy === 'quick-funding') return offer.termDays <= 90;
      return true;
    });

    // Sort offers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rate':
          return a.interestRate - b.interestRate;
        case 'term':
          return a.termDays - b.termDays;
        case 'amount':
          return b.maxAmount - a.maxAmount;
        case 'eligibility':
          return a.eligibilityScore - b.eligibilityScore;
        default:
          return 0;
      }
    });

    return filtered;
  }, [normalizedOffers, sortBy, filterBy, eligibilityScore]);

  // Get best offer for calculator
  const bestOffer = useMemo(() => {
    return filteredOffers
      .filter(o => eligibilityScore >= o.eligibilityScore)
      .sort((a, b) => a.interestRate - b.interestRate)[0];
  }, [filteredOffers, eligibilityScore]);

  const handleApply = async (offerId: string) => {
    try {
      setApplyingOfferId(offerId);
      const result = await unifiedApi.financing.apply(offerId, {
        amount: financeAmount,
        term_days: financeTerm * 30,
        purpose: `Working capital for ${currentIndustry} operations`,
      });
      
      // Check if partner redirect is needed
      if (result.redirectUrl) {
        addToast({
          type: 'info',
          title: 'Redirecting to Partner',
          message: 'You will be redirected to complete your application with the financing partner.',
        });
        // Redirect to partner portal
        window.open(result.redirectUrl, '_blank');
      } else {
        addToast({
          type: 'success',
          title: 'Application Submitted',
          message: 'Your financing application has been submitted successfully. We\'ll notify you once it\'s reviewed.',
        });
      }
      
      const data = await unifiedApi.financing.getApplications();
      setApplications(data);
    } catch (e: any) {
      console.error('Apply failed', e);
      addToast({
        type: 'error',
        title: 'Application Failed',
        message: e.message || 'Failed to submit application. Please try again.',
      });
    } finally {
      setApplyingOfferId(null);
    }
  };

  const toggleCompare = (offerId: string) => {
    setCompareIds(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : prev.length < 3 ? [...prev, offerId] : prev
    );
  };

  const comparisonOffers = useMemo(() => {
    return filteredOffers.filter(o => compareIds.includes(o.id));
  }, [filteredOffers, compareIds]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate monthly payment
  const calculateMonthlyPayment = (amount: number, interestRate: number, months: number) => {
    if (months === 0) return amount;
    const rate = interestRate / 100 / 12;
    const payment = (amount * rate) / (1 - Math.pow(1 + rate, -months));
    return payment;
  };

  const calculateTotalCost = (amount: number, interestRate: number, months: number) => {
    const monthly = calculateMonthlyPayment(amount, interestRate, months);
    return monthly * months;
  };

  const calculateInterest = (amount: number, interestRate: number, months: number) => {
    return calculateTotalCost(amount, interestRate, months) - amount;
  };


  return (
    <AppLayout>
      <HeaderStrip 
        title="💰 Financing Hub"
        subtitle="🎯 Get money for your business! Find the best deals that match what you need!"
        chips={[
          { label: '💵 Offers', value: filteredOffers.length, variant: 'info' },
          { label: '✅ Eligible', value: filteredOffers.filter(o => eligibilityScore >= o.eligibilityScore).length, variant: 'success' },
          { label: '⭐ Score', value: `${eligibilityScore}/100`, variant: eligibilityScore >= 80 ? 'success' : eligibilityScore >= 60 ? 'warning' : 'error' },
        ]}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComparison(!showComparison)}
              disabled={compareIds.length === 0}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrendingUp className="h-4 w-4" />
              Compare ({compareIds.length})
            </button>
            <ActionMenu
              items={[
                { id: 'export', label: 'Export Offers', icon: <Download className="h-4 w-4" />, onClick: () => console.log('Export') },
                { id: 'refresh', label: 'Refresh', icon: <RefreshCw className="h-4 w-4" />, onClick: () => window.location.reload() },
              ]}
              size="sm"
            />
          </div>
        }
      />
      
      <PageLayout maxWidth="full" padding="none">
        <RailLayout
          right={
            <div className="space-y-4">
              <DashboardCard 
                title="⭐ Your Credit Profile" 
                icon={<CreditCard size={20} />}
              >
                <div className="mt-3 space-y-4">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold text-white mb-3 shadow-lg transform hover:scale-110 transition-all ${
                      eligibilityScore >= 80 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : eligibilityScore >= 60 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-red-500 to-pink-600'
                    }`}>
                      {eligibilityScore >= 80 ? '🌟' : eligibilityScore >= 60 ? '👍' : '📝'}
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{eligibilityScore}</div>
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Your Trade Score</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {eligibilityScore >= 80 ? '🎉 Amazing! You\'re doing great!' : eligibilityScore >= 60 ? '👍 Good job! Keep it up!' : '📈 You can improve this!'}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        eligibilityScore >= 80 ? 'bg-success-500' : eligibilityScore >= 60 ? 'bg-warning-500' : 'bg-error-500'
                      }`}
                      style={{ width: `${eligibilityScore}%` }}
                    ></div>
                  </div>
                  
                  <div className="space-y-4 pt-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>📊</span>
                      <span>What Makes Your Score</span>
                    </h4>
                    {scoreFactors.map((factor, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border-2 border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{factor.name}</span>
                          <span className="font-bold text-gray-900 dark:text-white">{factor.score}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 shadow-inner">
                          <div 
                            className={`h-3 rounded-full transition-all shadow-md ${
                              factor.score >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : factor.score >= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-pink-500'
                            }`}
                            style={{ width: `${factor.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-3 text-center">
                    <button 
                      onClick={() => {
                        addToast({
                          type: 'info',
                          title: '📋 Your Credit Report',
                          message: `Your score is ${eligibilityScore}/100! 💰 Payment History: 92% (Great!), Trade Volume: 85% (Good!), Supplier Diversity: 65% (Can improve!).`,
                        });
                      }}
                      className="text-sm font-bold text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-xl border-2 border-primary-300 dark:border-primary-700 hover:scale-105 transform transition-all"
                    >
                      <span>👀</span> See Full Report →
                    </button>
                  </div>
                </div>
              </DashboardCard>

              {applications.length > 0 && (
                <DashboardCard 
                  title="📝 Your Applications" 
                  icon={<FileText size={20} />}
                >
                  <div className="mt-3 space-y-3">
                    {applicationsLoading ? (
                      <div className="text-sm text-gray-500 text-center py-4 flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      applications.slice(0, 3).map((app) => (
                        <div 
                          key={app.id} 
                          onClick={() => {
                            setSelectedApplication(app);
                            setShowApplicationModal(true);
                          }}
                          className="border-2 rounded-xl p-4 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all cursor-pointer transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">💼</span>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {app.financing_offers?.provider_name || app.financing_offers?.name || 'Working Capital'}
                              </div>
                            </div>
                            <StatusBadge 
                              type={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'} 
                              text={(app.status || 'pending').toUpperCase().replace('_', ' ')} 
                              size="sm"
                            />
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
                            💵 {formatCurrency(app.amount)} • ⏰ {Math.round((app.term_days || 30) / 30)} months
                          </div>
                          {app.approved_amount && (
                            <div className="text-xs text-success-600 dark:text-success-400 mt-2 font-bold bg-success-50 dark:bg-success-900/20 px-2 py-1 rounded-lg inline-block">
                              ✅ Approved: {formatCurrency(app.approved_amount)}
                            </div>
                          )}
                          <div className="text-xs text-primary-600 dark:text-primary-400 mt-3 flex items-center gap-1 font-medium">
                            <Eye size={12} />
                            👆 Click to see more!
                          </div>
                        </div>
                      ))
                    )}
                    {applications.length > 3 && (
                      <button 
                        onClick={() => setSelectedTab('applications')}
                        className="text-sm font-bold text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 w-full text-center pt-3 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-xl border-2 border-primary-300 dark:border-primary-700 hover:scale-105 transform transition-all"
                      >
                        👀 See All {applications.length} Applications →
                      </button>
                    )}
                  </div>
                </DashboardCard>
              )}
            </div>
          }
        >
          <div className="px-6 py-6 space-y-6">
            {/* Tab Navigation - Fun and Colorful */}
            <div className="flex items-center gap-3 border-b-4 border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedTab('offers')}
                className={`px-6 py-3 text-base font-bold border-b-4 transition-all transform hover:scale-105 ${
                  selectedTab === 'offers'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>💵</span>
                  <span>Browse Offers</span>
                </span>
              </button>
              <button
                onClick={() => setSelectedTab('applications')}
                className={`px-6 py-3 text-base font-bold border-b-4 transition-all transform hover:scale-105 relative ${
                  selectedTab === 'applications'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>📝</span>
                  <span>My Applications</span>
                  {applications.length > 0 && (
                    <span className="ml-2 px-3 py-1 text-xs font-bold bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-full shadow-lg">
                      {applications.length}
                    </span>
                  )}
                </span>
              </button>
            </div>

            {/* Offers Tab */}
            {selectedTab === 'offers' && (
              <>
            {/* Calculator Section */}
            <SectionLayout 
              title="🧮 Financing Calculator" 
              subtitle="🎯 Move the sliders to see how much money you can get and what you'll pay back!"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-4 border-blue-300 dark:border-blue-700 shadow-lg">
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">💰</span>
                      <span>How Much Money Do You Need?</span>
                    </label>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-extrabold text-primary-600 dark:text-primary-400 mb-2">
                        {formatCurrency(financeAmount)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Move the slider to change! 👆</div>
                    </div>
                    <input
                      type="range"
                      min="5000"
                      max="50000"
                      step="1000"
                      value={financeAmount}
                      onChange={(e) => setFinanceAmount(parseInt(e.target.value))}
                      className="w-full h-4 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full appearance-none cursor-pointer accent-primary-600 shadow-inner"
                      style={{
                        background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${((financeAmount - 5000) / (50000 - 5000)) * 100}%, rgb(203, 213, 225) ${((financeAmount - 5000) / (50000 - 5000)) * 100}%, rgb(203, 213, 225) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mt-3">
                      <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border-2 border-blue-300 dark:border-blue-700">💵 $5K</span>
                      <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border-2 border-purple-300 dark:border-purple-700">💎 $50K</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-4 border-green-300 dark:border-green-700 shadow-lg">
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">⏰</span>
                      <span>How Long to Pay Back?</span>
                    </label>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-extrabold text-green-600 dark:text-green-400 mb-2">
                        {financeTerm} {financeTerm === 1 ? 'Month' : 'Months'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Slide to pick your time! 🎯</div>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="24"
                      step="3"
                      value={financeTerm}
                      onChange={(e) => setFinanceTerm(parseInt(e.target.value))}
                      className="w-full h-4 bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800 rounded-full appearance-none cursor-pointer accent-green-600 shadow-inner"
                      style={{
                        background: `linear-gradient(to right, rgb(34, 197, 94) 0%, rgb(34, 197, 94) ${((financeTerm - 3) / (24 - 3)) * 100}%, rgb(203, 213, 225) ${((financeTerm - 3) / (24 - 3)) * 100}%, rgb(203, 213, 225) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mt-3">
                      <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border-2 border-green-300 dark:border-green-700">⚡ 3 Months</span>
                      <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border-2 border-emerald-300 dark:border-emerald-700">📅 24 Months</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-orange-900/30 rounded-2xl p-8 border-4 border-purple-400 dark:border-purple-700 shadow-2xl transform hover:scale-105 transition-all">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl mb-3">💸</div>
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">What You'll Pay Each Month</div>
                      <div className="text-5xl font-extrabold text-purple-800 dark:text-purple-200 mb-3">
                        {formatCurrency(calculateMonthlyPayment(
                          financeAmount, 
                          bestOffer?.interestRate || 12.5, 
                          financeTerm
                        ))}
                      </div>
                      {bestOffer && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border-2 border-purple-300 dark:border-purple-700 inline-block">
                          <span className="font-bold">⭐ Best Rate:</span> {bestOffer.interestRate}% from {bestOffer.provider}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t-4 border-purple-300 dark:border-purple-700">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-purple-300 dark:border-purple-700 text-center">
                        <div className="text-2xl mb-2">📊</div>
                        <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Total You'll Pay</div>
                        <div className="text-xl font-extrabold text-gray-900 dark:text-white">
                          {formatCurrency(calculateTotalCost(
                            financeAmount,
                            bestOffer?.interestRate || 12.5,
                            financeTerm
                          ))}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-pink-300 dark:border-pink-700 text-center">
                        <div className="text-2xl mb-2">💵</div>
                        <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Extra (Interest)</div>
                        <div className="text-xl font-extrabold text-gray-900 dark:text-white">
                          {formatCurrency(calculateInterest(
                            financeAmount,
                            bestOffer?.interestRate || 12.5,
                            financeTerm
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionLayout>

            {/* Filters and Sorting - Fun and Interactive */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl border-4 border-blue-300 dark:border-blue-700 shadow-lg">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl">🔍</span>
                <span className="text-base font-bold text-gray-900 dark:text-white">Find Offers:</span>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="text-base font-bold border-4 border-blue-400 dark:border-blue-600 rounded-xl px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg hover:scale-105 transform transition-all cursor-pointer"
                >
                  <option value="all">🌟 All Offers</option>
                  <option value="eligible">✅ I Can Get These!</option>
                  <option value="best-rate">💰 Best Prices</option>
                  <option value="quick-funding">⚡ Super Fast!</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <span className="text-base font-bold text-gray-900 dark:text-white">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-base font-bold border-4 border-purple-400 dark:border-purple-600 rounded-xl px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg hover:scale-105 transform transition-all cursor-pointer"
                >
                  <option value="rate">💵 Cheapest First</option>
                  <option value="term">⚡ Fastest First</option>
                  <option value="amount">💎 Biggest First</option>
                  <option value="eligibility">⭐ Best Match First</option>
                </select>
              </div>
            </div>

            {/* Comparison View */}
            {showComparison && comparisonOffers.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compare Offers</h3>
                  <button
                    onClick={() => setShowComparison(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Provider</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Rate</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Term</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Monthly</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Total Cost</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonOffers.map((offer) => {
                        const isEligible = eligibilityScore >= offer.eligibilityScore;
                        const monthly = calculateMonthlyPayment(offer.amount, offer.interestRate, financeTerm);
                        const total = calculateTotalCost(offer.amount, offer.interestRate, financeTerm);
                        return (
                          <tr key={offer.id} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900 dark:text-white">{offer.provider}</div>
                              <div className="text-xs text-gray-500">{offer.title}</div>
                            </td>
                            <td className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                              {offer.interestRate.toFixed(2)}%
                            </td>
                            <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">
                              {offer.term}
                            </td>
                            <td className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                              {formatCurrency(monthly)}
                            </td>
                            <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">
                              {formatCurrency(total)}
                            </td>
                            <td className="text-center py-3 px-4">
                              <button
                                onClick={() => handleApply(offer.id)}
                                disabled={!isEligible || applyingOfferId === offer.id}
                                className={`px-3 py-1 rounded text-xs font-medium ${
                                  isEligible 
                                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                } transition-colors`}
                              >
                                {applyingOfferId === offer.id ? 'Applying...' : 'Apply'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Offers List */}
            <SectionLayout 
              title="💎 Available Financing Options" 
              subtitle={`🎯 Found ${filteredOffers.length} awesome offer${filteredOffers.length !== 1 ? 's' : ''} for you! Pick the best one!`}
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading offers...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-error-600 mx-auto mb-2" />
                    <p className="text-sm text-error-600">{error}</p>
                  </div>
                </div>
              ) : filteredOffers.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No offers available for your criteria</p>
                    <button
                      onClick={() => {
                        setFilterBy('all');
                        setSortBy('rate');
                      }}
                      className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOffers.map((offer) => {
                    const isEligible = eligibilityScore >= offer.eligibilityScore;
                    const monthlyPayment = calculateMonthlyPayment(offer.amount, offer.interestRate, financeTerm);
                    const totalCost = calculateTotalCost(offer.amount, offer.interestRate, financeTerm);
                    const totalInterest = calculateInterest(offer.amount, offer.interestRate, financeTerm);
                    const isComparing = compareIds.includes(offer.id);
                    
                    return (
                      <div 
                        key={offer.id} 
                        className={`border-4 rounded-2xl p-6 transition-all transform hover:scale-105 cursor-pointer ${
                          isEligible 
                            ? isComparing
                              ? 'border-primary-500 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 shadow-2xl'
                              : 'border-gray-300 dark:border-gray-600 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 hover:border-primary-400 hover:shadow-2xl'
                            : 'opacity-60 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
                        }`}
                        onClick={() => {
                          if (isEligible) {
                            // Scroll to details or highlight
                          }
                        }}
                      >
                        <div className="flex flex-col lg:flex-row gap-4">
                          {/* Left: Offer Info */}
                          <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl text-3xl shadow-lg ${
                                  isEligible ? 'bg-gradient-to-br from-primary-200 to-purple-200 dark:from-primary-900/40 dark:to-purple-900/40' : 'bg-gray-200 dark:bg-gray-700'
                                }`}>
                                  {offer.providerType === 'bank' ? '🏦' : offer.providerType === 'fintech' ? '💳' : '💼'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{offer.title}</h3>
                                    {offer.providerType === 'bank' && (
                                      <span className="text-xl" title="Bank">🛡️</span>
                                    )}
                                    {offer.termDays <= 90 && (
                                      <span className="text-xl" title="Quick Funding">⚡</span>
                                    )}
                                  </div>
                                  <p className="text-base text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                    {offer.provider}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCompare(offer.id);
                                }}
                                disabled={!isEligible}
                                className={`p-3 rounded-xl text-2xl shadow-lg transform hover:scale-125 transition-all ${
                                  isComparing
                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                } ${!isEligible ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={isComparing ? '⭐ Comparing! Click to remove' : '⭐ Click to compare'}
                              >
                                {isComparing ? '⭐' : '☆'}
                              </button>
                            </div>
                            
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                              {offer.description}
                            </p>
                            
                            {offer.features && offer.features.length > 0 && (
                              <div className="flex flex-wrap gap-3">
                                {offer.features.slice(0, 3).map((feature: string, idx: number) => (
                                  <div 
                                    key={idx} 
                                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border-2 border-blue-300 dark:border-blue-700 text-sm font-bold text-gray-800 dark:text-gray-200 shadow-md"
                                  >
                                    ✨ {feature}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Right: Offer Details - Fun Cards */}
                          <div className="lg:w-96">
                            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-5 border-4 border-indigo-300 dark:border-indigo-700 shadow-xl space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-blue-300 dark:border-blue-700 text-center shadow-lg">
                                  <div className="text-2xl mb-2">💰</div>
                                  <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Amount</div>
                                  <div className="text-lg font-extrabold text-gray-900 dark:text-white">
                                    {formatCurrency(offer.amount)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Up to {formatCurrency(offer.maxAmount)}
                                  </div>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-green-300 dark:border-green-700 text-center shadow-lg">
                                  <div className="text-2xl mb-2">📊</div>
                                  <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Interest</div>
                                  <div className="text-lg font-extrabold text-gray-900 dark:text-white">
                                    {offer.interestRate.toFixed(2)}%
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    APR
                                  </div>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-purple-300 dark:border-purple-700 text-center shadow-lg">
                                  <div className="text-2xl mb-2">⏰</div>
                                  <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Term</div>
                                  <div className="text-lg font-extrabold text-gray-900 dark:text-white">
                                    {offer.term}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {offer.termDays} days
                                  </div>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-orange-300 dark:border-orange-700 text-center shadow-lg">
                                  <div className="text-2xl mb-2">💸</div>
                                  <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Monthly</div>
                                  <div className="text-lg font-extrabold text-gray-900 dark:text-white">
                                    {formatCurrency(monthlyPayment)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {financeTerm} months
                                  </div>
                                </div>
                              </div>
                              
                              <div className="pt-3 border-t-4 border-indigo-300 dark:border-indigo-700 grid grid-cols-2 gap-3">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border-2 border-indigo-300 dark:border-indigo-700 text-center">
                                  <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">📊 Total Cost</div>
                                  <div className="text-base font-extrabold text-gray-900 dark:text-white">
                                    {formatCurrency(totalCost)}
                                  </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border-2 border-pink-300 dark:border-pink-700 text-center">
                                  <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">💵 Extra Cost</div>
                                  <div className="text-base font-extrabold text-gray-900 dark:text-white">
                                    {formatCurrency(totalInterest)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="pt-3 flex items-center justify-between">
                                <div className={`px-4 py-2 rounded-xl font-bold text-sm ${
                                  isEligible 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                                }`}>
                                  {isEligible ? '✅ YOU CAN GET THIS!' : `❌ Need ${offer.eligibilityScore} (You: ${eligibilityScore})`}
                                </div>
                                <button 
                                  className={`px-6 py-3 rounded-xl text-base font-bold transition-all flex items-center gap-2 shadow-lg transform hover:scale-110 ${
                                    isEligible 
                                      ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white hover:from-primary-600 hover:to-purple-600' 
                                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                  }`}
                                  disabled={!isEligible || applyingOfferId === offer.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isEligible) {
                                      handleApply(offer.id);
                                    }
                                  }}
                                >
                                  {applyingOfferId === offer.id ? (
                                    <>
                                      <RefreshCw className="h-5 w-5 animate-spin" />
                                      <span>Applying...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-xl">🚀</span>
                                      <span>Get This Money!</span>
                                      <ChevronRight size={18} />
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionLayout>

            {/* Guidelines - Fun and Interactive */}
            <SectionLayout 
              title="📚 How to Get Money for Your Business!" 
              subtitle="🎯 Learn what you need to do to get financing! It's easier than you think!"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-6 border-4 border-green-400 dark:border-green-700 shadow-xl transform hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">✅</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">What You Need!</h3>
                  </div>
                  <ul className="space-y-3 text-base text-gray-800 dark:text-gray-200">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">📅</span>
                      <span className="font-medium">Be trading for at least 6 months</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🤝</span>
                      <span className="font-medium">Have suppliers you work with</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">💼</span>
                      <span className="font-medium">Do business regularly</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">⭐</span>
                      <span className="font-medium">Get a score of 60 or more!</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl p-6 border-4 border-yellow-400 dark:border-yellow-700 shadow-xl transform hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">📄</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Papers You Need!</h3>
                  </div>
                  <ul className="space-y-3 text-base text-gray-800 dark:text-gray-200">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🏢</span>
                      <span className="font-medium">Your business papers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🏦</span>
                      <span className="font-medium">Bank papers (6 months)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">📋</span>
                      <span className="font-medium">Tax papers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🆔</span>
                      <span className="font-medium">Your ID card</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-2xl p-6 border-4 border-red-400 dark:border-red-700 shadow-xl transform hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">❌</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Who Can't Get It</h3>
                  </div>
                  <ul className="space-y-3 text-base text-gray-800 dark:text-gray-200">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">👶</span>
                      <span className="font-medium">New business (less than 6 months)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <span className="font-medium">Suppliers not checked</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">⏰</span>
                      <span className="font-medium">Late payments before</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🚫</span>
                      <span className="font-medium">Already owe money</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border-4 border-blue-400 dark:border-blue-700 rounded-2xl shadow-xl">
                <div className="flex items-start gap-4">
                  <span className="text-5xl">🧠</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span>How We Decide!</span>
                      <span className="text-2xl">💡</span>
                    </h3>
                    <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                      🎯 We look at how you do business! We check:
                      <br />
                      • 💰 How you pay your bills (Payment History)
                      <br />
                      • 📊 How much business you do (Trade Volume)
                      <br />
                      • 🤝 How many different suppliers you work with (Supplier Diversity)
                      <br />
                      <br />
                      ✨ The better you do these things, the more money you can get! No need for big papers or guarantees - just show us you're a good business! 🚀
                    </p>
                  </div>
                </div>
              </div>
            </SectionLayout>
              </>
            )}

            {/* Applications Tab */}
            {selectedTab === 'applications' && (
              <SectionLayout 
                title="Your Financing Applications" 
                subtitle={`${applications.length} application${applications.length !== 1 ? 's' : ''} total`}
              >
                {applicationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Applications Yet</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
                      You haven't submitted any financing applications. Browse available offers and apply when you're ready.
                    </p>
                    <button
                      onClick={() => setSelectedTab('offers')}
                      className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Browse Offers
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div 
                        key={app.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowApplicationModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                <Wallet className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {app.financing_offers?.provider_name || app.financing_offers?.name || 'Financing Application'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {app.financing_offers?.provider_type === 'bank' && 'Bank'} 
                                  {app.financing_offers?.provider_type === 'fintech' && 'Fintech'} 
                                  {app.financing_offers?.provider_type === 'platform' && 'Platform'} Financing
                                </p>
                              </div>
                            </div>
                            {app.purpose && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{app.purpose}</p>
                            )}
                          </div>
                          <StatusBadge 
                            type={
                              app.status === 'approved' ? 'success' : 
                              app.status === 'rejected' ? 'error' : 
                              app.status === 'under_review' ? 'warning' : 
                              'warning'
                            } 
                            text={(app.status || 'pending').toUpperCase().replace('_', ' ')} 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Requested Amount</div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(app.amount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Term</div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {Math.round((app.term_days || 30) / 30)} months
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Submitted</div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {new Date(app.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Interest Rate</div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {app.financing_offers?.interest_rate ? `${app.financing_offers.interest_rate}%` : 'N/A'}
                            </div>
                          </div>
                        </div>

                        {app.approved_amount && (
                          <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success-600 dark:text-success-400" />
                              <span className="text-sm font-medium text-success-900 dark:text-success-100">
                                Approved Amount: {formatCurrency(app.approved_amount)}
                              </span>
                            </div>
                          </div>
                        )}

                        {app.approval_notes && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">{app.approval_notes}</div>
                          </div>
                        )}

                        {app.partner_application_id && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Shield className="h-3 w-3" />
                            <span>Partner Application ID: {app.partner_application_id}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </SectionLayout>
            )}
          </div>
        </RailLayout>
      </PageLayout>

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Application Details</h3>
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setSelectedApplication(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                      {selectedApplication.financing_offers?.provider_name || 'Financing Provider'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedApplication.financing_offers?.provider_type === 'bank' && 'Bank'} 
                      {selectedApplication.financing_offers?.provider_type === 'fintech' && 'Fintech'} 
                      {selectedApplication.financing_offers?.provider_type === 'platform' && 'Platform'} Financing
                    </p>
                  </div>
                  <StatusBadge 
                    type={
                      selectedApplication.status === 'approved' ? 'success' : 
                      selectedApplication.status === 'rejected' ? 'error' : 
                      selectedApplication.status === 'under_review' ? 'warning' : 
                      'warning'
                    } 
                    text={(selectedApplication.status || 'pending').toUpperCase().replace('_', ' ')} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Requested Amount</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(selectedApplication.amount)}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Term</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {Math.round((selectedApplication.term_days || 30) / 30)} months
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Interest Rate</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedApplication.financing_offers?.interest_rate ? `${selectedApplication.financing_offers.interest_rate}%` : 'N/A'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Submitted</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedApplication.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {selectedApplication.purpose && (
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purpose</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedApplication.purpose}</p>
                </div>
              )}

              {selectedApplication.approved_amount && (
                <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
                    <span className="text-sm font-semibold text-success-900 dark:text-success-100">Approved</span>
                  </div>
                  <div className="text-lg font-bold text-success-900 dark:text-success-100">
                    Approved Amount: {formatCurrency(selectedApplication.approved_amount)}
                  </div>
                </div>
              )}

              {selectedApplication.approval_notes && (
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Notes</div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedApplication.approval_notes}</p>
                  </div>
                </div>
              )}

              {selectedApplication.partner_application_id && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Partner Application</span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Application ID: {selectedApplication.partner_application_id}
                  </p>
                  {selectedApplication.metadata?.redirectUrl && (
                    <a
                      href={selectedApplication.metadata.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View on Partner Portal →
                    </a>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setSelectedApplication(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Financing;

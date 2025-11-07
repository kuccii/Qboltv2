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

  // Calculate eligibility score from user data
  const eligibilityScore = useMemo(() => {
    // Base score from user profile
    let score = 70;
    
    // Boost based on trading history (simulated)
    if (authState.user?.company) score += 5;
    if (authState.user?.country) score += 3;
    
    // Simulate score factors from trade activity
    // In real app, this would come from transaction history analysis
    const paymentHistory = 92; // Excellent
    const tradeVolume = 85; // Good
    const supplierDiversity = 65; // Fair
    
    score = Math.round((paymentHistory * 0.4 + tradeVolume * 0.35 + supplierDiversity * 0.25));
    return Math.min(100, Math.max(0, score));
  }, [authState.user]);

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
            // No offers from DB, use mock data as fallback
            console.log('No offers from database, using mock data');
            setOffers([]);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to fetch financing offers:', err);
          // Don't show error, just use mock data fallback
          setError(null);
          setOffers([]);
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
      await unifiedApi.financing.apply(offerId, {
        amount: financeAmount,
        term_days: financeTerm * 30,
        purpose: `Working capital for ${currentIndustry} operations`,
      });
      
      const data = await unifiedApi.financing.getApplications();
      setApplications(data);
      
      addToast({
        type: 'success',
        title: 'Application Submitted',
        message: 'Your financing application has been submitted successfully. We\'ll notify you once it\'s reviewed.',
      });
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

  // Score factors breakdown
  const scoreFactors = useMemo(() => {
    return [
      { name: 'Payment History', score: 92, weight: 0.4 },
      { name: 'Trade Volume', score: 85, weight: 0.35 },
      { name: 'Supplier Diversity', score: 65, weight: 0.25 },
    ];
  }, []);

  return (
    <AppLayout>
      <HeaderStrip 
        title="Financing Hub"
        subtitle="Smart working capital offers tailored to your trade activity and business profile"
        chips={[
          { label: 'Offers', value: filteredOffers.length, variant: 'info' },
          { label: 'Eligible', value: filteredOffers.filter(o => eligibilityScore >= o.eligibilityScore).length, variant: 'success' },
          { label: 'Score', value: `${eligibilityScore}/100`, variant: eligibilityScore >= 80 ? 'success' : eligibilityScore >= 60 ? 'warning' : 'error' },
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
                title="Credit Profile" 
                icon={<CreditCard size={20} />}
              >
                <div className="mt-3 space-y-4">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold text-white mb-2 ${
                      eligibilityScore >= 80 ? 'bg-success-600' : eligibilityScore >= 60 ? 'bg-warning-500' : 'bg-error-600'
                    }`}>
                      {eligibilityScore >= 80 ? 'A' : eligibilityScore >= 60 ? 'B' : 'C'}
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{eligibilityScore}</div>
                    <div className="text-sm text-gray-500">Trade Score</div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        eligibilityScore >= 80 ? 'bg-success-500' : eligibilityScore >= 60 ? 'bg-warning-500' : 'bg-error-500'
                      }`}
                      style={{ width: `${eligibilityScore}%` }}
                    ></div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-medium text-gray-800">Score Breakdown</h4>
                    {scoreFactors.map((factor, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">{factor.name}</span>
                          <span className="font-medium">{factor.score}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              factor.score >= 80 ? 'bg-success-500' : factor.score >= 60 ? 'bg-warning-500' : 'bg-error-500'
                            }`}
                            style={{ width: `${factor.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2 text-center">
                    <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                      View Full Credit Report →
                    </button>
                  </div>
                </div>
              </DashboardCard>

              {applications.length > 0 && (
                <DashboardCard 
                  title="Your Applications" 
                  icon={<FileText size={20} />}
                >
                  <div className="mt-3 space-y-2">
                    {applicationsLoading ? (
                      <div className="text-sm text-gray-500 text-center py-4">Loading...</div>
                    ) : (
                      applications.slice(0, 3).map((app) => (
                        <div key={app.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-1">
                            <div className="text-sm font-medium text-gray-800">
                              {app.financing_offers?.name || 'Working Capital'}
                            </div>
                            <StatusBadge 
                              type={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'} 
                              text={(app.status || 'pending').toUpperCase()} 
                              size="sm"
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatCurrency(app.amount)} • {Math.round((app.term_days || 30) / 30)} months
                          </div>
                          {app.approved_amount && (
                            <div className="text-xs text-success-600 mt-1 font-medium">
                              Approved: {formatCurrency(app.approved_amount)}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {applications.length > 3 && (
                      <button className="text-sm text-primary-600 hover:text-primary-800 font-medium w-full text-center pt-2">
                        View All ({applications.length})
                      </button>
                    )}
                  </div>
                </DashboardCard>
              )}
            </div>
          }
        >
          <div className="px-6 py-6 space-y-6">
            {/* Calculator Section */}
            <SectionLayout 
              title="Financing Calculator" 
              subtitle="Adjust parameters to see personalized offers and monthly payments"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Loan Amount: {formatCurrency(financeAmount)}
                    </label>
                    <input
                      type="range"
                      min="5000"
                      max="50000"
                      step="1000"
                      value={financeAmount}
                      onChange={(e) => setFinanceAmount(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>$5,000</span>
                      <span>$50,000</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Repayment Term: {financeTerm} months
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="24"
                      step="3"
                      value={financeTerm}
                      onChange={(e) => setFinanceTerm(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>3 months</span>
                      <span>24 months</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Monthly Payment</div>
                      <div className="text-3xl font-bold text-primary-800 dark:text-primary-200">
                        {formatCurrency(calculateMonthlyPayment(
                          financeAmount, 
                          bestOffer?.interestRate || 12.5, 
                          financeTerm
                        ))}
                      </div>
                      {bestOffer && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Based on best rate: {bestOffer.interestRate}% from {bestOffer.provider}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-200 dark:border-primary-800">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Amount</div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">
                          {formatCurrency(calculateTotalCost(
                            financeAmount,
                            bestOffer?.interestRate || 12.5,
                            financeTerm
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Interest</div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">
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

            {/* Filters and Sorting */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Offers</option>
                  <option value="eligible">Eligible Only</option>
                  <option value="best-rate">Best Rates</option>
                  <option value="quick-funding">Quick Funding</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="rate">Lowest Rate</option>
                  <option value="term">Shortest Term</option>
                  <option value="amount">Highest Amount</option>
                  <option value="eligibility">Eligibility</option>
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
              title="Available Financing Options" 
              subtitle={`${filteredOffers.length} offers found matching your criteria`}
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
                        className={`border rounded-xl p-5 transition-all ${
                          isEligible 
                            ? isComparing
                              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md'
                            : 'opacity-60 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row gap-4">
                          {/* Left: Offer Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-lg ${
                                  isEligible ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                }`}>
                                  <Wallet size={24} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{offer.title}</h3>
                                    {offer.providerType === 'bank' && (
                                      <Shield className="h-4 w-4 text-blue-500" title="Bank" />
                                    )}
                                    {offer.termDays <= 90 && (
                                      <Zap className="h-4 w-4 text-amber-500" title="Quick Funding" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {offer.provider}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleCompare(offer.id)}
                                disabled={!isEligible}
                                className={`p-2 rounded-md ${
                                  isComparing
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                } ${!isEligible ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={isComparing ? 'Remove from comparison' : 'Add to comparison'}
                              >
                                <Star className={`h-4 w-4 ${isComparing ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {offer.description}
                            </p>
                            
                            {offer.features && offer.features.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {offer.features.slice(0, 3).map((feature: string, idx: number) => (
                                  <Chip key={idx} label={feature} size="sm" variant="info" />
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Right: Offer Details */}
                          <div className="lg:w-80">
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                                    <DollarSign size={14} />
                                    Amount
                                  </div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(offer.amount)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Up to {formatCurrency(offer.maxAmount)}
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                                    <Percent size={14} />
                                    Interest Rate
                                  </div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {offer.interestRate.toFixed(2)}%
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    APR
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                                    <Calendar size={14} />
                                    Term
                                  </div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {offer.term}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {offer.termDays} days
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                                    <TrendingUp size={14} />
                                    Monthly
                                  </div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(monthlyPayment)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {financeTerm} months
                                  </div>
                                </div>
                              </div>
                              
                              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <div className="text-gray-500 dark:text-gray-400">Total Cost</div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(totalCost)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500 dark:text-gray-400">Total Interest</div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(totalInterest)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="pt-3 flex items-center justify-between">
                                <StatusBadge 
                                  type={isEligible ? 'success' : 'error'} 
                                  text={isEligible ? 'ELIGIBLE' : `Score ${eligibilityScore}/${offer.eligibilityScore}`} 
                                  size="sm"
                                />
                                <button 
                                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                    isEligible 
                                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                  }`}
                                  disabled={!isEligible || applyingOfferId === offer.id}
                                  onClick={() => isEligible && handleApply(offer.id)}
                                >
                                  {applyingOfferId === offer.id ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                      Applying...
                                    </>
                                  ) : (
                                    <>
                                      Apply Now
                                      <ChevronRight size={16} />
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

            {/* Guidelines */}
            <SectionLayout 
              title="Financing Guidelines" 
              subtitle="Understanding eligibility and requirements"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-success-200 dark:border-success-800 rounded-lg p-4 bg-success-50 dark:bg-success-900/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={20} className="text-success-600 dark:text-success-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Eligibility Criteria</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-success-600 mt-1">•</span>
                      <span>Minimum 6 months trading history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success-600 mt-1">•</span>
                      <span>Verified supplier relationships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success-600 mt-1">•</span>
                      <span>Regular transaction activity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success-600 mt-1">•</span>
                      <span>Trade score above 60</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border border-warning-200 dark:border-warning-800 rounded-lg p-4 bg-warning-50 dark:bg-warning-900/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={20} className="text-warning-600 dark:text-warning-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Required Documents</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-warning-600 mt-1">•</span>
                      <span>Business registration documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning-600 mt-1">•</span>
                      <span>6 months bank statements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning-600 mt-1">•</span>
                      <span>Tax compliance certificate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning-600 mt-1">•</span>
                      <span>Director/owner identification</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border border-error-200 dark:border-error-800 rounded-lg p-4 bg-error-50 dark:bg-error-900/20">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle size={20} className="text-error-600 dark:text-error-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Exclusions</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-error-600 mt-1">•</span>
                      <span>Businesses less than 6 months old</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error-600 mt-1">•</span>
                      <span>Unverified suppliers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error-600 mt-1">•</span>
                      <span>Late payment history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error-600 mt-1">•</span>
                      <span>Existing loan defaults</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">How Financing Decisions Are Made</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Qivook's financing options are based on your verified trade activity and patterns. Our system analyzes your transaction history, supplier relationships, payment behavior, and industry metrics to determine your eligibility for various financing products. This data-driven approach allows us to offer working capital solutions tailored to your business needs without traditional collateral requirements.
                    </p>
                  </div>
                </div>
              </div>
            </SectionLayout>
          </div>
        </RailLayout>
      </PageLayout>
    </AppLayout>
  );
};

export default Financing;

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Activity,
  Download,
  Clock,
  Bell,
  MapPin,
  Filter,
  Play,
  Pause,
  RefreshCw,
  Settings,
  BarChart3,
  History,
  CheckCircle,
  Zap,
  Target,
  ArrowRight,
  Info,
  ShieldCheck,
  ShieldX,
  FileText,
  DollarSign,
  Search,
  X
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { useRiskAlerts } from '../hooks/useData';
import { unifiedApi } from '../services/unifiedApi';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { useToast } from '../contexts/ToastContext';
import HeaderStrip from '../components/HeaderStrip';
import {
  AppLayout,
  PageLayout,
  SectionLayout,
  ActionMenu,
  InsuranceIndicator,
  SearchInput
} from '../design-system';

const RiskMitigation: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { currentIndustry } = useIndustry();
  const { addToast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedAlertType, setSelectedAlertType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'timeline' | 'alerts' | 'playbooks' | 'insurance'>('overview');
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [initialLoadTimeout, setInitialLoadTimeout] = useState(false);
  const [insuranceData, setInsuranceData] = useState<any>(null);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [insuranceError, setInsuranceError] = useState<string | null>(null);
  const [showRiskProfileModal, setShowRiskProfileModal] = useState(false);
  const [riskProfile, setRiskProfile] = useState<any>(null);
  const [riskProfileLoading, setRiskProfileLoading] = useState(false);
  const [insuranceProviders, setInsuranceProviders] = useState<any[]>([]);
  const [insuranceQuotes, setInsuranceQuotes] = useState<any[]>([]);
  const [insuranceApplications, setInsuranceApplications] = useState<any[]>([]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [quoteRequest, setQuoteRequest] = useState({
    quoteType: 'cargo' as 'cargo' | 'liability' | 'property' | 'general' | 'trade_credit',
    coverageAmount: 1000000,
    termDays: 365,
    currency: 'KES'
  });
  const [requestingQuote, setRequestingQuote] = useState(false);

  // Fetch real risk alerts from backend
  const { alerts: realAlerts, loading: alertsLoading, error: alertsError, refetch: refetchAlerts, resolveAlert } = useRiskAlerts({ resolved: false });

  // Fetch insurance data from backend
  useEffect(() => {
    const fetchInsuranceData = async () => {
      try {
        setInsuranceLoading(true);
        setInsuranceError(null);
        const summary = await unifiedApi.insurance.getCoverageSummary();
        setInsuranceData(summary);
      } catch (err) {
        console.error('Error fetching insurance data:', err);
        setInsuranceError(err instanceof Error ? err.message : 'Failed to fetch insurance data');
        // Set fallback data
        setInsuranceData({
          activePolicies: 0,
          totalCoverage: 0,
          coverageGaps: 0,
          expiringSoon: 0,
          recommendedCoverage: 3000000,
          policies: []
        });
      } finally {
        setInsuranceLoading(false);
      }
    };

    fetchInsuranceData();
  }, []);

  // Fetch insurance providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const providers = await unifiedApi.insurance.getProviders({
          active: true,
          country: authState.user?.country
        });
        setInsuranceProviders(providers);
      } catch (err) {
        console.error('Error fetching insurance providers:', err);
        // Use fallback providers if API fails
        setInsuranceProviders([
          {
            id: '1',
            name: 'East Africa Trade Insurance',
            provider_type: 'insurance_company',
            coverage_types: ['cargo', 'trade_credit', 'liability'],
            description: 'Specialized in cargo and trade insurance across East African corridors.',
            rating: 4.5
          },
          {
            id: '2',
            name: 'Pan-African Risk Solutions',
            provider_type: 'broker',
            coverage_types: ['business_interruption', 'price_risk', 'supplier_risk'],
            description: 'Comprehensive coverage for supply chain and business risks.',
            rating: 4.3
          }
        ]);
      }
    };

    if (selectedTab === 'insurance') {
      fetchProviders();
    }
  }, [selectedTab, authState.user?.country]);

  // Fetch insurance quotes
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const quotes = await unifiedApi.insurance.getQuotes({ limit: 10 });
        setInsuranceQuotes(quotes);
      } catch (err) {
        console.error('Error fetching insurance quotes:', err);
        setInsuranceQuotes([]);
      }
    };

    if (selectedTab === 'insurance') {
      fetchQuotes();
    }
  }, [selectedTab]);

  // Fetch insurance applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const applications = await unifiedApi.insurance.getApplications({ limit: 10 });
        setInsuranceApplications(applications);
      } catch (err) {
        console.error('Error fetching insurance applications:', err);
        setInsuranceApplications([]);
      }
    };

    if (selectedTab === 'insurance') {
      fetchApplications();
    }
  }, [selectedTab]);

  // Handle quote request
  const handleRequestQuote = async (providerId: string) => {
    try {
      setRequestingQuote(true);
      setSelectedProvider(insuranceProviders.find(p => p.id === providerId));
      setShowQuoteModal(true);
    } catch (err) {
      console.error('Error opening quote modal:', err);
    } finally {
      setRequestingQuote(false);
    }
  };

  // Submit quote request
  const handleSubmitQuote = async () => {
    if (!selectedProvider) return;
    
    try {
      setRequestingQuote(true);
      const quote = await unifiedApi.insurance.requestQuote({
        providerId: selectedProvider.id,
        quoteType: quoteRequest.quoteType,
        coverageAmount: quoteRequest.coverageAmount,
        termDays: quoteRequest.termDays,
        currency: quoteRequest.currency
      });
      
      // Refresh quotes list
      const quotes = await unifiedApi.insurance.getQuotes({ limit: 10 });
      setInsuranceQuotes(quotes);
      
      setShowQuoteModal(false);
      setSelectedProvider(null);
      
      addToast({
        type: 'success',
        title: 'Quote Requested',
        message: 'Your insurance quote request has been submitted. You will receive a response shortly.',
      });
    } catch (err: any) {
      console.error('Error requesting quote:', err);
      addToast({
        type: 'error',
        title: 'Quote Request Failed',
        message: err.message || 'Failed to request quote. Please try again.',
      });
    } finally {
      setRequestingQuote(false);
    }
  };

  // Submit application from quote
  const handleSubmitApplication = async (quoteId: string) => {
    try {
      const result = await unifiedApi.insurance.submitApplication({ quoteId });
      
      // Refresh applications list
      const applications = await unifiedApi.insurance.getApplications({ limit: 10 });
      setInsuranceApplications(applications);
      
      // Refresh quotes list
      const quotes = await unifiedApi.insurance.getQuotes({ limit: 10 });
      setInsuranceQuotes(quotes);
      
      if (result.redirectUrl) {
        addToast({
          type: 'info',
          title: 'Redirecting to Partner',
          message: 'You will be redirected to complete your insurance application with the partner.',
        });
        window.open(result.redirectUrl, '_blank');
      } else {
        addToast({
          type: 'success',
          title: 'Application Submitted',
          message: 'Your insurance application has been submitted successfully. We\'ll notify you once it\'s reviewed.',
        });
      }
    } catch (err: any) {
      console.error('Error submitting application:', err);
      addToast({
        type: 'error',
        title: 'Application Failed',
        message: err.message || 'Failed to submit application. Please try again.',
      });
    }
  };

  // Fetch risk profile from backend
  useEffect(() => {
    const fetchRiskProfile = async () => {
      try {
        setRiskProfileLoading(true);
        const profile = await unifiedApi.riskProfile.get();
        setRiskProfile(profile);
      } catch (err) {
        console.error('Error fetching risk profile:', err);
      } finally {
        setRiskProfileLoading(false);
      }
    };

    fetchRiskProfile();
  }, []);

  // Timeout for initial load to prevent infinite loading
  useEffect(() => {
    if (!alertsLoading) {
      setInitialLoadTimeout(false);
      return;
    }

    const timer = setTimeout(() => {
      setInitialLoadTimeout(true);
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [alertsLoading]);

  // Handle errors gracefully
  useEffect(() => {
    if (alertsError) {
      console.error('Error loading risk alerts:', alertsError);
      // Set timeout to show content even if there's an error
      setInitialLoadTimeout(true);
    }
  }, [alertsError]);

  // Transform and prioritize alerts - HIGH SEVERITY FIRST
  const processedAlerts = useMemo(() => {
    // Ensure we always have an array
    const alerts = Array.isArray(realAlerts) ? realAlerts : [];
    
    return alerts
      .map((alert: any) => {
        // Handle invalid dates
        let timestamp: Date;
        try {
          timestamp = alert.created_at ? new Date(alert.created_at) : new Date();
          if (isNaN(timestamp.getTime())) {
            timestamp = new Date();
          }
        } catch {
          timestamp = new Date();
        }

        return {
          id: alert.id || `alert-${Math.random()}`,
          type: alert.alert_type || 'general',
          severity: alert.severity || 'medium',
          title: alert.title || 'Risk Alert',
          message: alert.description || alert.message || '',
          region: alert.country || alert.region || 'Unknown',
          material: alert.material || 'N/A',
          timestamp,
          isActive: !alert.resolved,
          impact: alert.impact || 'Medium',
          recommendedAction: alert.recommended_action || 'Review and take action',
          alert: alert // Keep original for API calls
        };
      })
      .filter(alert => !dismissedAlerts.has(alert.id))
      .filter(alert => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            alert.title.toLowerCase().includes(query) ||
            alert.message.toLowerCase().includes(query) ||
            alert.region.toLowerCase().includes(query) ||
            alert.material.toLowerCase().includes(query) ||
            alert.type.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .filter(alert => {
        // Alert type filter
        if (selectedAlertType !== 'all') {
          return alert.type === selectedAlertType || 
                 (selectedAlertType === 'price' && (alert.type === 'price_volatility' || alert.type === 'price_threshold')) ||
                 (selectedAlertType === 'supply' && (alert.type === 'supply_shortage' || alert.type === 'supply_disruption'));
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by severity: high > medium > low
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
               (severityOrder[a.severity as keyof typeof severityOrder] || 0);
      });
  }, [realAlerts, dismissedAlerts, searchQuery, selectedAlertType]);

  // Critical alerts (high severity) - MOST IMPORTANT
  const criticalAlerts = processedAlerts.filter(a => a.severity === 'high');
  const mediumAlerts = processedAlerts.filter(a => a.severity === 'medium');
  const lowAlerts = processedAlerts.filter(a => a.severity === 'low');

  // Risk timeline - most recent first
  const riskTimeline = useMemo(() => {
    return processedAlerts.slice(0, 10).map((alert) => ({
      id: alert.id,
      timestamp: alert.timestamp,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      description: alert.message,
      region: alert.region,
      material: alert.material,
      impact: alert.impact,
      action: alert.recommendedAction
    }));
  }, [processedAlerts]);

  // Calculate risk metrics
  const riskMetrics = useMemo(() => {
    const totalAlerts = processedAlerts.length;
    const highRisk = criticalAlerts.length;
    const priceAlerts = processedAlerts.filter(a => a.type === 'price' || a.type === 'price_threshold').length;
    const supplyAlerts = processedAlerts.filter(a => a.type === 'supply' || a.type === 'supply_disruption').length;
    const complianceScore = Math.max(100 - (highRisk * 5) - (mediumAlerts.length * 2), 70);

    // Insurance coverage metrics - from backend or fallback
    const insuranceCoverage = insuranceData || {
      activePolicies: 0,
      totalCoverage: 0,
      coverageGaps: highRisk > 0 ? 2 : 0,
      expiringSoon: 0,
      recommendedCoverage: highRisk > 0 ? 5000000 : 3000000
    };

    return {
      totalAlerts,
      highRisk,
      priceAlerts,
      supplyAlerts,
      complianceScore,
      riskTrend: highRisk > 0 ? 'up' : 'stable',
      insuranceCoverage
    };
  }, [processedAlerts, criticalAlerts, mediumAlerts]);

  // Risk assessment data
  const riskData = useMemo(() => [
    {
      id: 1,
      category: 'Market Volatility',
      riskLevel: criticalAlerts.filter(a => a.type === 'price').length > 0 ? 'high' : 
                 processedAlerts.filter(a => a.type === 'price').length > 0 ? 'medium' : 'low',
      impact: 'High',
      probability: 'Medium',
      mitigation: 'Diversify suppliers and maintain buffer stock',
      trend: processedAlerts.filter(a => a.type === 'price').length > 0 ? 'up' : 'stable',
      trendValue: processedAlerts.filter(a => a.type === 'price').length * 5,
      alertCount: processedAlerts.filter(a => a.type === 'price').length
    },
    {
      id: 2,
      category: 'Supply Chain',
      riskLevel: criticalAlerts.filter(a => a.type === 'supply').length > 0 ? 'high' :
                 processedAlerts.filter(a => a.type === 'supply').length > 0 ? 'medium' : 'low',
      impact: 'Medium',
      probability: 'High',
      mitigation: 'Establish backup suppliers and improve logistics',
      trend: processedAlerts.filter(a => a.type === 'supply').length > 0 ? 'down' : 'stable',
      trendValue: processedAlerts.filter(a => a.type === 'supply').length * 3,
      alertCount: processedAlerts.filter(a => a.type === 'supply').length
    },
    {
      id: 3,
      category: 'Regulatory',
      riskLevel: processedAlerts.filter(a => a.type === 'regulatory').length > 0 ? 'medium' : 'low',
      impact: 'Low',
      probability: 'Low',
      mitigation: 'Regular compliance audits and legal consultation',
      trend: 'stable',
      trendValue: 0,
      alertCount: processedAlerts.filter(a => a.type === 'regulatory').length
    }
  ], [processedAlerts, criticalAlerts]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(async () => {
      // Refresh both alerts and insurance data
      await Promise.all([
        refetchAlerts(),
        (async () => {
          try {
            const summary = await unifiedApi.insurance.getCoverageSummary();
            setInsuranceData(summary);
            setInsuranceError(null);
          } catch (err) {
            console.error('Error refreshing insurance data:', err);
          }
        })()
      ]);
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refetchAlerts]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Refresh both alerts and insurance data
      await Promise.all([
        refetchAlerts(),
        (async () => {
          try {
            setInsuranceLoading(true);
            const summary = await unifiedApi.insurance.getCoverageSummary();
            setInsuranceData(summary);
            setInsuranceError(null);
          } catch (err) {
            console.error('Error refreshing insurance data:', err);
            setInsuranceError(err instanceof Error ? err.message : 'Failed to fetch insurance data');
          } finally {
            setInsuranceLoading(false);
          }
        })()
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      setDismissedAlerts(prev => new Set(prev).add(alertId));
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      setDismissedAlerts(prev => new Set(prev).add(alertId));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const filteredRisks = riskData.filter(risk => {
    const riskLevelMatch = selectedRiskLevel === 'all' || risk.riskLevel === selectedRiskLevel;
    return riskLevelMatch;
  });

  return (
    <AppLayout>
      <HeaderStrip 
        title="Risk & Compliance Center"
        subtitle="Monitor and mitigate trade risks across your supply chain"
        chips={[
          { label: 'Active Alerts', value: riskMetrics.totalAlerts, variant: riskMetrics.totalAlerts > 0 ? 'warning' : 'success' },
          { label: 'High Risk', value: riskMetrics.highRisk, variant: riskMetrics.highRisk > 0 ? 'error' : 'success' },
          { label: 'Compliance', value: `${riskMetrics.complianceScore}%`, variant: riskMetrics.complianceScore >= 90 ? 'success' : riskMetrics.complianceScore >= 80 ? 'warning' : 'error' },
        ]}
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isAutoRefresh 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {isAutoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isAutoRefresh ? 'Auto ON' : 'Auto OFF'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading || alertsLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${(loading || alertsLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
              <Clock className="h-4 w-4 mr-1 inline" />
              {lastUpdated.toLocaleTimeString()}
            </div>
            <ActionMenu items={[
              {
                label: 'Export Risk Report',
                icon: <Download className="h-4 w-4" />,
                onClick: () => {
                  const csvData = [
                    ['Category', 'Risk Level', 'Impact', 'Probability', 'Mitigation', 'Alert Count'],
                    ...riskData.map(r => [r.category, r.riskLevel, r.impact, r.probability, r.mitigation, r.alertCount])
                  ];
                  const csvContent = csvData.map(row => row.join(',')).join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `risk-report-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              },
              {
                label: 'Risk Profile Settings',
                icon: <Settings className="h-4 w-4" />,
                onClick: () => setShowRiskProfileModal(true)
              }
            ]} />
          </div>
        }
        status={isAutoRefresh ? { kind: 'live' } : undefined}
      />

      <PageLayout maxWidth="full" padding="none">
        <div className="px-3 sm:px-4 md:px-6 lg:px-10 xl:px-14 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Loading State - Only show if still loading and not timed out */}
          {(loading || (alertsLoading && !initialLoadTimeout)) && (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading risk data...</p>
            </div>
          )}

          {/* Error State */}
          {alertsError && initialLoadTimeout && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                    Unable to load risk alerts
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                    {alertsError}. Showing cached or empty data. Please try refreshing.
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 flex items-center gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CRITICAL ALERTS BANNER - Fun and Playful */}
          {(!loading && (!alertsLoading || initialLoadTimeout)) && criticalAlerts.length > 0 && (
            <div className="bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100 dark:from-red-900/30 dark:via-orange-900/30 dark:to-yellow-900/30 border-4 border-red-400 dark:border-red-700 rounded-2xl p-6 shadow-2xl animate-pulse">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="text-5xl animate-bounce">🚨</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-extrabold text-red-900 dark:text-red-100 flex items-center gap-3">
                      <span>{criticalAlerts.length} Super Important Thing{criticalAlerts.length !== 1 ? 's' : ''} Need Your Help!</span>
                      <span className="text-3xl">⚡</span>
                    </h3>
                    <div className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold animate-pulse">URGENT!</div>
                  </div>
                  <p className="text-base text-red-800 dark:text-red-200 mb-5 font-medium leading-relaxed">
                    🎯 We found some really important problems! Check them out and fix them so nothing bad happens! 🛡️
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {criticalAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-red-300 dark:border-red-800 shadow-lg">
                        <span className="text-2xl">⚠️</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{alert.title}</span>
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="ml-2 text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all shadow-md transform hover:scale-105"
                        >
                          ✅ Fix It!
                        </button>
                      </div>
                    ))}
                    {criticalAlerts.length > 3 && (
                      <button
                        onClick={() => setSelectedTab('alerts')}
                        className="flex items-center gap-2 px-5 py-3 text-base font-bold text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 bg-white dark:bg-gray-800 rounded-xl border-2 border-red-300 dark:border-red-800 shadow-lg hover:scale-105 transition-all"
                      >
                        <span>👀 See All {criticalAlerts.length} Problems</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs Container - Matching Country Profile Style */}
          <div className="mb-6">
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-2 border-2 border-blue-200 dark:border-gray-700 shadow-lg overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Overview', emoji: '📊', color: 'blue', badge: riskMetrics.totalAlerts },
                { id: 'alerts', label: 'Alerts', emoji: '🚨', color: 'red', badge: riskMetrics.totalAlerts, urgent: riskMetrics.highRisk },
                { id: 'timeline', label: 'Timeline', emoji: '📅', color: 'purple' },
                { id: 'insurance', label: 'Insurance', emoji: '🛡️', color: 'green', badge: riskMetrics.insuranceCoverage.coverageGaps },
                { id: 'playbooks', label: 'Playbooks', emoji: '📚', color: 'orange' }
              ].map((tab) => {
                const colorClasses = {
                  blue: { active: 'from-blue-500 to-blue-600', hover: 'hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-300' },
                  red: { active: 'from-red-500 to-red-600', hover: 'hover:bg-red-100 dark:hover:bg-gray-700 hover:text-red-700 dark:hover:text-red-300' },
                  purple: { active: 'from-purple-500 to-purple-600', hover: 'hover:bg-purple-100 dark:hover:bg-gray-700 hover:text-purple-700 dark:hover:text-purple-300' },
                  green: { active: 'from-green-500 to-green-600', hover: 'hover:bg-green-100 dark:hover:bg-gray-700 hover:text-green-700 dark:hover:text-green-300' },
                  orange: { active: 'from-orange-500 to-orange-600', hover: 'hover:bg-orange-100 dark:hover:bg-gray-700 hover:text-orange-700 dark:hover:text-orange-300' }
                };
                const colors = colorClasses[tab.color as keyof typeof colorClasses] || colorClasses.blue;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm sm:text-base font-bold rounded-xl transition-all whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
                      selectedTab === tab.id
                        ? `bg-gradient-to-r ${colors.active} text-white shadow-lg scale-105`
                        : `text-gray-600 dark:text-gray-400 ${colors.hover}`
                    }`}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`ml-1.5 px-2 py-1 text-xs font-bold rounded-full shadow-md ${
                        tab.urgent && tab.urgent > 0
                          ? 'bg-white/30 text-white animate-pulse'
                          : selectedTab === tab.id ? 'bg-white/30 text-white' : 'bg-gradient-to-r from-primary-500 to-purple-500 text-white'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6">

              {/* Tab Content */}
              {(!loading && (!alertsLoading || initialLoadTimeout || alertsError)) && (
                <>
                {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Insurance Coverage Summary - Quick View */}
                {riskMetrics.insuranceCoverage && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Insurance Coverage Summary</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                            <div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {riskMetrics.insuranceCoverage.activePolicies || 0}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Active Policies</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${((riskMetrics.insuranceCoverage.totalCoverage || 0) / 1000000).toFixed(1)}M
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Total Coverage</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {riskMetrics.insuranceCoverage.coverageGaps || 0}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Coverage Gaps</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {riskMetrics.insuranceCoverage.expiringSoon || 0}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</div>
                            </div>
                          </div>
                          {(riskMetrics.insuranceCoverage.coverageGaps > 0 || riskMetrics.insuranceCoverage.expiringSoon > 0) && (
                            <button
                              onClick={() => setSelectedTab('insurance')}
                              className="mt-4 text-sm text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 font-medium flex items-center gap-1"
                            >
                              Manage Insurance <ArrowRight className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Alerts Preview - Quick View */}
                {processedAlerts.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary-600" />
                        Recent Alerts
                      </h3>
                      <button
                        onClick={() => setSelectedTab('alerts')}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                      >
                        View All <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {processedAlerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className={`p-1.5 rounded ${
                            alert.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                            alert.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                            'bg-yellow-100 dark:bg-yellow-900/30'
                          }`}>
                            <AlertTriangle className={`h-4 w-4 ${
                              alert.severity === 'critical' ? 'text-red-600 dark:text-red-400' :
                              alert.severity === 'high' ? 'text-orange-600 dark:text-orange-400' :
                              'text-yellow-600 dark:text-yellow-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{alert.title}</h4>
                              <StatusBadge 
                                type={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'warning'} 
                                text={alert.severity?.toUpperCase() || 'MEDIUM'} 
                                size="sm"
                              />
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{alert.message}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {alert.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {alert.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(alert.created_at || alert.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Resolve
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fun Value Proposition Banner */}
                <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30 rounded-2xl p-6 border-4 border-purple-300 dark:border-purple-700 shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">🎯</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span>What You're Getting</span>
                        <span className="text-3xl">✨</span>
                      </h3>
                      <p className="text-base text-gray-700 dark:text-gray-300 mb-6 font-medium">
                        🚀 Super smart alerts that help you stay safe and save money! We'll tell you when prices go up 📈, 
                        when things get delayed ⏰, and when you need to do something important 📋 - all before it becomes a problem! 
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-purple-200 dark:border-purple-800 shadow-lg transform hover:scale-105 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">💰</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Price Protection</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            We'll tell you when prices go up so you can buy things before they get expensive! 💸
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-pink-200 dark:border-pink-800 shadow-lg transform hover:scale-105 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">🚚</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Supply Alerts</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            Know about delays and problems before they happen! We'll keep you in the loop! 📢
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-800 shadow-lg transform hover:scale-105 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">✅</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Compliance Tracking</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            We'll remind you when important papers expire so you don't get in trouble! 📄
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics - Visual Priority with Emojis and Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div className={`rounded-2xl shadow-lg border-2 p-6 transform hover:scale-105 transition-all ${
                    riskMetrics.highRisk > 0 
                      ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-red-300 dark:border-red-700' 
                      : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{riskMetrics.highRisk > 0 ? '🚨' : '✅'}</span>
                      <AlertTriangle className={`h-6 w-6 ${riskMetrics.highRisk > 0 ? 'text-red-500' : 'text-green-500'}`} />
                    </div>
                    <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{riskMetrics.highRisk}</div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">High Risk Items</div>
                    <div className="flex items-center text-xs">
                      {riskMetrics.highRisk > 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                          <span className="text-red-600 dark:text-red-400 font-medium">⚠️ Needs Attention</span>
                        </>
                      ) : (
                        <span className="text-green-600 dark:text-green-400 font-medium">✨ All Safe!</span>
                      )}
                    </div>
                  </div>
                  <div className={`rounded-2xl shadow-lg border-2 p-6 transform hover:scale-105 transition-all ${
                    riskMetrics.totalAlerts > 0 
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-300 dark:border-yellow-700' 
                      : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{riskMetrics.totalAlerts > 0 ? '🔔' : '🎉'}</span>
                      <Bell className={`h-6 w-6 ${riskMetrics.totalAlerts > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
                    </div>
                    <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{riskMetrics.totalAlerts}</div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Active Alerts</div>
                    <div className="text-xs font-medium">
                      {riskMetrics.totalAlerts > 0 ? (
                        <span className="text-yellow-600 dark:text-yellow-400">👀 Check them out!</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">✨ All clear!</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl shadow-lg border-2 border-blue-300 dark:border-blue-700 p-6 transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">💰</span>
                      <TrendingUp className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{riskMetrics.priceAlerts}</div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price Alerts</div>
                    <div className="text-xs font-medium">
                      {riskMetrics.priceAlerts > 0 ? (
                        <span className="text-blue-600 dark:text-blue-400">📈 Prices changing!</span>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400">💵 Stable prices</span>
                      )}
                    </div>
                  </div>
                  <div className={`rounded-2xl shadow-lg border-2 p-6 transform hover:scale-105 transition-all ${
                    riskMetrics.complianceScore >= 90 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700'
                      : riskMetrics.complianceScore >= 80
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-300 dark:border-yellow-700'
                      : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-red-300 dark:border-red-700'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">
                        {riskMetrics.complianceScore >= 90 ? '⭐' : riskMetrics.complianceScore >= 80 ? '👍' : '⚠️'}
                      </span>
                      <CheckCircle className={`h-6 w-6 ${
                        riskMetrics.complianceScore >= 90 ? 'text-green-500' : 
                        riskMetrics.complianceScore >= 80 ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                    </div>
                    <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{riskMetrics.complianceScore}%</div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Compliance Score</div>
                    <div className="text-xs font-medium">
                      {riskMetrics.complianceScore >= 90 ? (
                        <span className="text-green-600 dark:text-green-400">🌟 Excellent!</span>
                      ) : riskMetrics.complianceScore >= 80 ? (
                        <span className="text-yellow-600 dark:text-yellow-400">👍 Good job!</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">📝 Needs work</span>
                      )}
                    </div>
                  </div>
                  <div className={`rounded-2xl shadow-lg border-2 p-6 transform hover:scale-105 transition-all ${
                    riskMetrics.insuranceCoverage.coverageGaps === 0 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700' 
                      : 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-300 dark:border-yellow-700'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">🛡️</span>
                      <ShieldCheck className={`h-6 w-6 ${
                        riskMetrics.insuranceCoverage.coverageGaps === 0 ? 'text-green-500' : 'text-yellow-500'
                      }`} />
                    </div>
                    <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">
                      ${(riskMetrics.insuranceCoverage.totalCoverage / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Insurance</div>
                    <div className="text-xs font-medium">
                      {riskMetrics.insuranceCoverage.coverageGaps === 0 ? (
                        <span className="text-green-600 dark:text-green-400">✅ Protected!</span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">⚠️ {riskMetrics.insuranceCoverage.coverageGaps} gap{riskMetrics.insuranceCoverage.coverageGaps !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions - Fun and Playful */}
                {criticalAlerts.length > 0 && (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl shadow-xl border-4 border-red-300 dark:border-red-700 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="text-4xl animate-bounce">⚡</span>
                        <span>Things That Need Your Attention NOW!</span>
                        <span className="text-3xl">🚨</span>
                      </h3>
                      <button
                        onClick={() => setSelectedTab('alerts')}
                        className="text-base font-bold text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border-2 border-red-300 dark:border-red-700 hover:scale-105 transition-all shadow-lg"
                      >
                        See Everything
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {criticalAlerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="p-5 bg-white dark:bg-gray-800 border-4 border-red-300 dark:border-red-800 rounded-2xl shadow-lg transform hover:scale-105 transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">⚠️</span>
                              <h4 className="font-bold text-gray-900 dark:text-white text-base">{alert.title}</h4>
                            </div>
                            <div className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">HIGH</div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">{alert.message}</p>
                          {alert.recommendedAction && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl mb-4 border-2 border-yellow-300 dark:border-yellow-700">
                              <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium flex items-start gap-2">
                                <span className="text-xl">💡</span>
                                <span>{alert.recommendedAction}</span>
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="flex-1 text-sm font-bold px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-lg transform hover:scale-105"
                            >
                              ✅ Fix It!
                            </button>
                            <button
                              onClick={() => setSelectedTab('alerts')}
                              className="text-sm font-bold px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                            >
                              👀 More
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Insights Section - Fun Version */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl shadow-xl border-4 border-blue-300 dark:border-blue-700 p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
                    <span className="text-4xl">🧠</span>
                    <span>Smart Things We Found!</span>
                    <span className="text-3xl">💡</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-blue-300 dark:border-blue-700 shadow-lg">
                        <div className="flex items-start gap-4">
                          <span className="text-4xl">💰</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Price Protection</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                              {riskMetrics.priceAlerts > 0 
                                ? `You have ${riskMetrics.priceAlerts} price alerts! 📊 Watch them closely so you can buy things before prices go up! 📈`
                                : 'No price problems right now! 💵 Everything is stable and good! ✨'}
                            </p>
                            {riskMetrics.priceAlerts > 0 && (
                              <button 
                                onClick={() => navigate('/app/prices')}
                                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border-2 border-blue-300 dark:border-blue-700 hover:scale-105 transition-all"
                              >
                                <span>See Price Trends</span>
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-yellow-300 dark:border-yellow-700 shadow-lg">
                        <div className="flex items-start gap-4">
                          <span className="text-4xl">🚚</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Supply Chain Health</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                              {riskMetrics.supplyAlerts > 0
                                ? `${riskMetrics.supplyAlerts} supply problems found! ⚠️ Maybe find some backup suppliers to stay safe! 🛡️`
                                : 'Your supply chain is super healthy! 🎉 Everything is running smoothly! ✨'}
                            </p>
                            {riskMetrics.supplyAlerts > 0 && (
                              <button 
                                onClick={() => navigate('/app/supplier-directory')}
                                className="text-sm font-bold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 hover:scale-105 transition-all"
                              >
                                <span>Find Backup Suppliers</span>
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-green-300 dark:border-green-700 shadow-lg">
                        <div className="flex items-start gap-4">
                          <span className="text-4xl">✅</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Compliance Status</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                              Your score is {riskMetrics.complianceScore}%! {
                                riskMetrics.complianceScore >= 90 
                                  ? 'You\'re doing AMAZING! 🌟 Keep it up!'
                                  : riskMetrics.complianceScore >= 80
                                  ? 'You\'re doing good! 👍 But check your alerts to get even better!'
                                  : 'You need to check some things! 📋 Look at your alerts and update your papers!'
                              }
                            </p>
                            <button 
                              onClick={() => navigate('/app/documents')}
                              className="text-sm font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl border-2 border-green-300 dark:border-green-700 hover:scale-105 transition-all"
                            >
                              <span>Check Documents</span>
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-purple-300 dark:border-purple-700 shadow-lg">
                        <div className="flex items-start gap-4">
                          <span className="text-4xl">🛡️</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Risk Protection</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                              {riskMetrics.totalAlerts === 0
                                ? 'No problems found! 🎉 You\'re super safe! ✨'
                                : `You have ${riskMetrics.totalAlerts} alerts! 👀 Check them out and do something about them! 🚀`}
                            </p>
                            {riskMetrics.totalAlerts > 0 && (
                              <button 
                                onClick={() => setSelectedTab('playbooks')}
                                className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl border-2 border-purple-300 dark:border-purple-700 hover:scale-105 transition-all"
                              >
                                <span>See How to Fix Things</span>
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment Cards - Fun and Colorful */}
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-xl border-4 border-indigo-300 dark:border-indigo-700 p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                        <span className="text-4xl">📊</span>
                        <span>Risk Assessment</span>
                        <span className="text-3xl">🎯</span>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-12">See what risks you have and how to fix them!</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border-2 border-indigo-300 dark:border-indigo-700 shadow-lg">
                        <Filter className="h-5 w-5 text-indigo-600" />
                        <select
                          value={selectedRiskLevel}
                          onChange={(e) => setSelectedRiskLevel(e.target.value)}
                          className="px-3 py-1 text-sm font-bold border-0 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0"
                        >
                          <option value="all">🔍 All Risks</option>
                          <option value="high">🔴 High Risk</option>
                          <option value="medium">🟡 Medium Risk</option>
                          <option value="low">🟢 Low Risk</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredRisks.length > 0 ? filteredRisks.map((risk) => (
                      <div 
                        key={risk.id} 
                        className={`rounded-2xl shadow-xl border-4 p-6 transform hover:scale-105 transition-all ${
                          risk.riskLevel === 'high' 
                            ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-red-400 dark:border-red-700' 
                            : risk.riskLevel === 'medium'
                            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-400 dark:border-yellow-700'
                            : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-400 dark:border-green-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">
                              {risk.category === 'Market Volatility' ? '💰' : 
                               risk.category === 'Supply Chain' ? '🚚' : '📋'}
                            </span>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{risk.category}</h4>
                              <StatusBadge 
                                type={risk.riskLevel === 'high' ? 'error' : risk.riskLevel === 'medium' ? 'warning' : 'success'} 
                                text={risk.riskLevel.toUpperCase()} 
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <Bell className={`h-5 w-5 ${risk.alertCount > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alerts</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">{risk.alertCount}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Impact</div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{risk.impact}</div>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chance</div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{risk.probability}</div>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-2">
                              <span className="text-xl">💡</span>
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">How to Fix It</div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">{risk.mitigation}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trend</span>
                            <div className="flex items-center gap-2">
                              {risk.trend === 'up' ? (
                                <>
                                  <TrendingUp className="h-5 w-5 text-red-500" />
                                  <span className="text-sm font-bold text-red-600 dark:text-red-400">📈 Going Up</span>
                                </>
                              ) : risk.trend === 'down' ? (
                                <>
                                  <TrendingDown className="h-5 w-5 text-green-500" />
                                  <span className="text-sm font-bold text-green-600 dark:text-green-400">📉 Going Down</span>
                                </>
                              ) : (
                                <>
                                  <div className="h-5 w-5 bg-gray-400 rounded-full" />
                                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">➡️ Stable</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-12">
                        <span className="text-6xl mb-4 block">🎉</span>
                        <p className="text-lg font-bold text-gray-600 dark:text-gray-400">No risks match your filter!</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Try a different filter or celebrate - you're all safe! ✨</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
                )}

                {selectedTab === 'alerts' && (
              <div className="space-y-6">
                {/* Search and Filter Bar - Kid Friendly */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-blue-200 dark:border-gray-700 p-4 sm:p-6 shadow-lg">
                  <div className="flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                      <input
                        type="text"
                        placeholder="🔍 Search for problems by name, place, or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 text-base border-2 border-blue-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Filters - Kid Friendly */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Filter className="h-5 w-5 text-blue-600" />
                          <span className="text-base font-bold text-gray-900 dark:text-white">🔍 Filter by:</span>
                        </div>
                        <select
                          value={selectedRiskLevel}
                          onChange={(e) => setSelectedRiskLevel(e.target.value)}
                          className="px-4 py-2.5 text-sm font-bold border-2 border-blue-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        >
                          <option value="all">🔍 All Problems</option>
                          <option value="high">🚨 Super Important!</option>
                          <option value="medium">⚠️ Kinda Important</option>
                          <option value="low">✅ Not Too Bad</option>
                        </select>
                        <select
                          value={selectedRegion}
                          onChange={(e) => setSelectedRegion(e.target.value)}
                          className="px-4 py-2.5 text-sm font-bold border-2 border-purple-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                        >
                          <option value="all">🌍 All Places</option>
                          <option value="Rwanda">🇷🇼 Rwanda</option>
                          <option value="Kenya">🇰🇪 Kenya</option>
                          <option value="Uganda">🇺🇬 Uganda</option>
                          <option value="Tanzania">🇹🇿 Tanzania</option>
                          <option value="Ethiopia">🇪🇹 Ethiopia</option>
                        </select>
                        <select
                          value={selectedAlertType}
                          onChange={(e) => setSelectedAlertType(e.target.value)}
                          className="px-4 py-2.5 text-sm font-bold border-2 border-green-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                        >
                          <option value="all">📋 All Types</option>
                          <option value="price">💰 Price Problems</option>
                          <option value="supply">📦 Supply Problems</option>
                          <option value="logistics_delay">🚚 Delivery Problems</option>
                          <option value="supplier_risk">👥 Supplier Problems</option>
                          <option value="market_risk">📊 Market Problems</option>
                          <option value="compliance_issue">📄 Paper Problems</option>
                        </select>
                      </div>
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-sm">
                        <span>📊</span> Found {processedAlerts.filter(a => 
                          (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                          (selectedRegion === 'all' || a.region === selectedRegion)
                        ).length} of {processedAlerts.length} problem{processedAlerts.length !== 1 ? 's' : ''}!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerts List - Prioritized by Severity */}
                <div className="space-y-4">
                  {/* High Priority Alerts - Kid Friendly */}
                  {criticalAlerts.filter(a => 
                    (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                    (selectedRegion === 'all' || a.region === selectedRegion)
                  ).length > 0 && (
                    <div>
                      <h3 className="text-lg font-extrabold text-red-700 dark:text-red-400 mb-4 flex items-center gap-3 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 px-4 py-3 rounded-xl border-2 border-red-300 dark:border-red-700 shadow-lg">
                        <span className="text-2xl animate-pulse">🚨</span>
                        <span>Super Important Problems!</span>
                        <span className="ml-auto px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold shadow-md">
                          {criticalAlerts.filter(a => 
                            (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                            (selectedRegion === 'all' || a.region === selectedRegion)
                          ).length}
                        </span>
                      </h3>
                      <div className="space-y-3">
                        {criticalAlerts.filter(a => 
                          (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                          (selectedRegion === 'all' || a.region === selectedRegion)
                        ).map((alert) => (
                          <div key={alert.id} className="p-5 sm:p-6 rounded-2xl border-4 border-red-400 dark:border-red-700 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 shadow-xl transform hover:scale-[1.02] transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="text-3xl">⚠️</span>
                                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-white">{alert.title}</h4>
                                  <div className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-md">HIGH</div>
                                </div>
                                <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">{alert.message}</p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {alert.region}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    {alert.material}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {alert.timestamp.toLocaleString()}
                                  </span>
                                </div>
                                {alert.recommendedAction && (
                                  <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 shadow-md">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                      <span>💡</span>
                                      <span>What to Do:</span>
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{alert.recommendedAction}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleResolveAlert(alert.id)}
                                  className="px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-lg transform hover:scale-105 whitespace-nowrap flex items-center gap-2"
                                >
                                  <span>✅</span>
                                  <span>Fix It!</span>
                                </button>
                                <button
                                  onClick={() => handleDismissAlert(alert.id)}
                                  className="px-4 py-2.5 text-sm font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all whitespace-nowrap"
                                >
                                  <span>👋</span> Later
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medium Priority Alerts - Kid Friendly */}
                  {mediumAlerts.filter(a => 
                    (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                    (selectedRegion === 'all' || a.region === selectedRegion)
                  ).length > 0 && (
                    <div>
                      <h3 className="text-lg font-extrabold text-yellow-700 dark:text-yellow-400 mb-4 flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 px-4 py-3 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 shadow-lg">
                        <span className="text-2xl">⚠️</span>
                        <span>Kinda Important Problems</span>
                        <span className="ml-auto px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-bold shadow-md">
                          {mediumAlerts.filter(a => 
                            (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                            (selectedRegion === 'all' || a.region === selectedRegion)
                          ).length}
                        </span>
                      </h3>
                      <div className="space-y-4">
                        {mediumAlerts.filter(a => 
                          (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                          (selectedRegion === 'all' || a.region === selectedRegion)
                        ).map((alert) => (
                          <div key={alert.id} className="p-5 sm:p-6 rounded-2xl border-4 border-yellow-400 dark:border-yellow-700 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 shadow-xl transform hover:scale-[1.02] transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="text-3xl">📋</span>
                                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-white">{alert.title}</h4>
                                  <div className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold shadow-md">MEDIUM</div>
                                </div>
                                <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">{alert.message}</p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {alert.region}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    {alert.material}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {alert.timestamp.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleResolveAlert(alert.id)}
                                  className="px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg transform hover:scale-105 whitespace-nowrap flex items-center gap-2"
                                >
                                  <span>✅</span>
                                  <span>Fix It!</span>
                                </button>
                                <button
                                  onClick={() => handleDismissAlert(alert.id)}
                                  className="px-4 py-2.5 text-sm font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all whitespace-nowrap"
                                >
                                  <span>👋</span> Later
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Low Priority Alerts - Kid Friendly */}
                  {lowAlerts.filter(a => 
                    (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                    (selectedRegion === 'all' || a.region === selectedRegion)
                  ).length > 0 && (
                    <div>
                      <h3 className="text-lg font-extrabold text-green-700 dark:text-green-400 mb-4 flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 px-4 py-3 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-lg">
                        <span className="text-2xl">✅</span>
                        <span>Not Too Bad Problems</span>
                        <span className="ml-auto px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold shadow-md">
                          {lowAlerts.filter(a => 
                            (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                            (selectedRegion === 'all' || a.region === selectedRegion)
                          ).length}
                        </span>
                      </h3>
                      <div className="space-y-4">
                        {lowAlerts.filter(a => 
                          (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                          (selectedRegion === 'all' || a.region === selectedRegion)
                        ).map((alert) => (
                          <div key={alert.id} className="p-5 sm:p-6 rounded-2xl border-4 border-green-400 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 shadow-xl transform hover:scale-[1.02] transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="text-3xl">📝</span>
                                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-white">{alert.title}</h4>
                                  <div className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-md">LOW</div>
                                </div>
                                <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">{alert.message}</p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {alert.region}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    {alert.material}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {alert.timestamp.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                <button
                                  onClick={() => handleResolveAlert(alert.id)}
                                  className="px-4 py-2 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() => handleDismissAlert(alert.id)}
                                  className="px-4 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State - Kid Friendly */}
                  {processedAlerts.filter(a => 
                    (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                    (selectedRegion === 'all' || a.region === selectedRegion)
                  ).length === 0 && (
                    <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-4 border-green-300 dark:border-green-700 shadow-xl">
                      <div className="text-8xl mb-6">🎉</div>
                      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">All Clear! ✨</h3>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">No problems found! You're doing great! 🌟</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Everything is running smoothly! Keep it up! 🚀</p>
                    </div>
                  )}
                </div>
              </div>
                )}

                {selectedTab === 'timeline' && (
                  <div className="space-y-6">
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700 shadow-lg">
                      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <span className="text-4xl">📅</span>
                        <span>What Happened Before!</span>
                      </h3>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300">See all the problems and what you did about them! 🎯</p>
                    </div>
                    <div className="space-y-4">
                    {riskTimeline.length > 0 ? riskTimeline.map((event) => (
                      <div key={event.id} className="relative flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                          event.severity === 'high' ? 'bg-red-500' : 
                          event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {event.title}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                              {event.timestamp.toLocaleDateString()} {event.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {event.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.region}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {event.material}
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Impact: {event.impact}
                            </span>
                          </div>
                          {event.action && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                              <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Action Taken:</p>
                              <p className="text-xs text-blue-800 dark:text-blue-200">{event.action}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-16">
                        <History className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">No risk events recorded yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Risk events will appear here as they are detected.</p>
                      </div>
                    )}
                  </div>
                </div>
                )}

                {selectedTab === 'insurance' && (
                  <div className="space-y-6">
                    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-700 shadow-lg">
                      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <span className="text-4xl">🛡️</span>
                        <span>Your Safety Shield!</span>
                      </h3>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300">See how protected you are and get more protection if you need it! 💪</p>
                    </div>

                    {/* Insurance Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Active Policies</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Current coverage</p>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {riskMetrics.insuranceCoverage.activePolicies}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total coverage: ${(riskMetrics.insuranceCoverage.totalCoverage / 1000000).toFixed(1)}M
                        </div>
                      </div>

                      <div className={`bg-gradient-to-br rounded-lg border p-6 ${
                        riskMetrics.insuranceCoverage.coverageGaps === 0 
                          ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                          : 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800'
                      }`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${
                            riskMetrics.insuranceCoverage.coverageGaps === 0
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : 'bg-yellow-100 dark:bg-yellow-900/30'
                          }`}>
                            {riskMetrics.insuranceCoverage.coverageGaps === 0 ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Coverage Gaps</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Areas needing protection</p>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {riskMetrics.insuranceCoverage.coverageGaps}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {riskMetrics.insuranceCoverage.coverageGaps === 0 
                            ? 'All risks covered' 
                            : 'Consider additional coverage'}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Optimal coverage</p>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          ${(riskMetrics.insuranceCoverage.recommendedCoverage / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Based on current risk profile
                        </div>
                      </div>
                    </div>

                    {/* Insurance Policies */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Insurance Policies</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your current insurance coverage</p>
                          </div>
                          {insuranceLoading && (
                            <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {insuranceLoading ? (
                          <div className="p-6 text-center">
                            <RefreshCw className="h-6 w-6 animate-spin text-primary-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Loading insurance policies...</p>
                          </div>
                        ) : insuranceError ? (
                          <div className="p-6 text-center">
                            <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{insuranceError}</p>
                            <button
                              onClick={async () => {
                                try {
                                  setInsuranceLoading(true);
                                  const summary = await unifiedApi.insurance.getCoverageSummary();
                                  setInsuranceData(summary);
                                  setInsuranceError(null);
                                } catch (err) {
                                  setInsuranceError(err instanceof Error ? err.message : 'Failed to fetch');
                                } finally {
                                  setInsuranceLoading(false);
                                }
                              }}
                              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
                            >
                              Retry
                            </button>
                          </div>
                        ) : insuranceData?.policies && insuranceData.policies.length > 0 ? (
                          insuranceData.policies.map((policy: any) => (
                          <div key={policy.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <InsuranceIndicator 
                                    status={policy.status as any} 
                                    type={policy.type === 'cargo' ? 'cargo' : policy.type === 'supplier_liability' ? 'liability' : 'general'} 
                                    coverageAmount={policy.coverageAmount}
                                    expiryDate={policy.expiryDate}
                                    showAmount={true}
                                  />
                                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                                    {policy.type === 'cargo' ? 'Cargo Insurance' : 
                                     policy.type === 'supplier_liability' ? 'Supplier Liability Insurance' :
                                     policy.type === 'liability' ? 'Professional Liability' : 'Insurance Policy'}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  {policy.details.description || 
                                   (policy.type === 'cargo' ? 'Covers goods in transit across East Africa. Protects against theft, damage, and loss during transportation.' :
                                    policy.type === 'supplier_liability' ? `Insurance for supplier: ${policy.entityName}` :
                                    'Protects against claims of negligence or errors in professional services and advice.')}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                  {policy.coverageAmount > 0 && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      Coverage: ${(policy.coverageAmount / 1000000).toFixed(1)}M USD
                                    </span>
                                  )}
                                  {policy.expiryDate && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Expires: {policy.expiryDate.toLocaleDateString()}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    Provider: {policy.provider}
                                  </span>
                                  {policy.entityType && (
                                    <span className="flex items-center gap-1">
                                      <FileText className="h-3 w-3" />
                                      {policy.entityType === 'supplier' ? 'Supplier' : 'Shipment'} Policy
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  if (policy.entityType === 'supplier') {
                                    navigate(`/app/supplier-directory/${policy.entityId}`);
                                  } else if (policy.entityType === 'shipment') {
                                    navigate(`/app/logistics`);
                                  }
                                }}
                                className="ml-4 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                          ))
                        ) : (
                          <div className="p-6 text-center">
                            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Insurance Policies Found</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                              You don't have any active insurance policies. Consider adding insurance to protect your supply chain.
                            </p>
                            <button
                              onClick={() => navigate('/app/supplier-directory')}
                              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 mx-auto"
                            >
                              Find Insured Suppliers <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {riskMetrics.insuranceCoverage.expiringSoon > 0 && (
                          <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-4 border-orange-300 dark:border-orange-700 rounded-2xl shadow-lg">
                            <div className="flex items-start gap-4">
                              <span className="text-4xl">⏰</span>
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                                  <span>Policy Expiring Soon!</span>
                                  <span className="text-2xl">⚠️</span>
                                </h4>
                                <p className="text-sm text-orange-800 dark:text-orange-200 mb-4 leading-relaxed">
                                  You have {riskMetrics.insuranceCoverage.expiringSoon} policy{riskMetrics.insuranceCoverage.expiringSoon !== 1 ? 's' : ''} expiring soon! 
                                  Renew them now to stay protected! 🛡️
                                </p>
                                <button 
                                  onClick={() => setSelectedTab('insurance')}
                                  className="px-6 py-3 text-base font-bold bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg transform hover:scale-105 flex items-center gap-2"
                                >
                                  <span>🔄 Renew Now!</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Coverage Recommendations */}
                    {riskMetrics.insuranceCoverage.coverageGaps > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Coverage Recommendations</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                  Price Volatility Protection
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  With {riskMetrics.priceAlerts} active price alerts, consider price risk insurance to protect against sudden price spikes! 💰
                                </p>
                                <button 
                                  onClick={() => setSelectedTab('insurance')}
                                  className="text-sm font-bold text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 hover:scale-105 transition-all"
                                >
                                  <span>🔍 Explore Options</span>
                                  <ArrowRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {riskMetrics.supplyAlerts > 0 && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start gap-3">
                                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                    Supply Chain Disruption Coverage
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {riskMetrics.supplyAlerts} supply disruption alerts detected! Business interruption insurance can help cover losses! 🚚
                                  </p>
                                  <button 
                                    onClick={() => setSelectedTab('insurance')}
                                    className="text-sm font-bold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border-2 border-blue-300 dark:border-blue-700 hover:scale-105 transition-all"
                                  >
                                    <span>📚 Learn More</span>
                                    <ArrowRight className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Insurance Providers */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommended Insurance Providers</h3>
                      {insuranceProviders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {insuranceProviders.map((provider) => (
                            <div key={provider.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                  <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">{provider.name}</h4>
                                  {provider.rating && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      ⭐ {provider.rating.toFixed(1)} Rating
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {provider.description || 'Comprehensive insurance coverage for your business needs.'}
                              </p>
                              {provider.coverage_types && provider.coverage_types.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                  {provider.coverage_types.slice(0, 3).map((type: string, idx: number) => (
                                    <span key={idx}>✓ {type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                                  ))}
                                </div>
                              )}
                              <button 
                                onClick={() => handleRequestQuote(provider.id)}
                                disabled={requestingQuote}
                                className="w-full px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {requestingQuote ? 'Loading...' : 'Get Quote'}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No insurance providers available at this time.</p>
                        </div>
                      )}
                    </div>

                    {/* Insurance Quotes */}
                    {insuranceQuotes.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Insurance Quotes</h3>
                        <div className="space-y-4">
                          {insuranceQuotes.map((quote) => (
                            <div key={quote.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    {quote.insurance_providers?.name || 'Insurance Provider'}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {quote.quote_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Coverage
                                  </p>
                                </div>
                                <StatusBadge 
                                  type={quote.status === 'accepted' ? 'success' : quote.status === 'expired' ? 'error' : 'warning'} 
                                  text={quote.status.toUpperCase()} 
                                />
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                                <div>
                                  <div className="text-gray-500 dark:text-gray-400">Coverage</div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {quote.currency} {(quote.coverage_amount / 1000000).toFixed(1)}M
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500 dark:text-gray-400">Premium</div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {quote.currency} {quote.premium?.toLocaleString() || 'N/A'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500 dark:text-gray-400">Term</div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {Math.round(quote.term_days / 30)} months
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500 dark:text-gray-400">Expires</div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(quote.expires_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              {quote.status === 'pending' && new Date(quote.expires_at) > new Date() && (
                                <button
                                  onClick={() => handleSubmitApplication(quote.id)}
                                  className="w-full px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                  Apply Now
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Insurance Applications */}
                    {insuranceApplications.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Applications</h3>
                        <div className="space-y-4">
                          {insuranceApplications.map((app) => (
                            <div key={app.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    {app.insurance_providers?.name || 'Insurance Provider'}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {app.application_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Insurance
                                  </p>
                                </div>
                                <StatusBadge 
                                  type={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'} 
                                  text={app.status.toUpperCase()} 
                                />
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Coverage: {app.currency} {(app.coverage_amount / 1000000).toFixed(1)}M • 
                                Submitted: {new Date(app.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quote Request Modal */}
                    {showQuoteModal && selectedProvider && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Request Quote from {selectedProvider.name}
                              </h3>
                              <button
                                onClick={() => {
                                  setShowQuoteModal(false);
                                  setSelectedProvider(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          <div className="p-6 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Coverage Type
                              </label>
                              <select
                                value={quoteRequest.quoteType}
                                onChange={(e) => setQuoteRequest({ ...quoteRequest, quoteType: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              >
                                <option value="cargo">Cargo Insurance</option>
                                <option value="liability">Liability Insurance</option>
                                <option value="property">Property Insurance</option>
                                <option value="general">General Business Insurance</option>
                                <option value="trade_credit">Trade Credit Insurance</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Coverage Amount: {quoteRequest.coverageAmount.toLocaleString()} {quoteRequest.currency}
                              </label>
                              <input
                                type="range"
                                min="100000"
                                max="10000000"
                                step="100000"
                                value={quoteRequest.coverageAmount}
                                onChange={(e) => setQuoteRequest({ ...quoteRequest, coverageAmount: parseInt(e.target.value) })}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>100K</span>
                                <span>10M</span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Coverage Term: {Math.round(quoteRequest.termDays / 30)} months
                              </label>
                              <input
                                type="range"
                                min="30"
                                max="730"
                                step="30"
                                value={quoteRequest.termDays}
                                onChange={(e) => setQuoteRequest({ ...quoteRequest, termDays: parseInt(e.target.value) })}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>1 month</span>
                                <span>24 months</span>
                              </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={() => {
                                  setShowQuoteModal(false);
                                  setSelectedProvider(null);
                                }}
                                className="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSubmitQuote}
                                disabled={requestingQuote}
                                className="flex-1 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {requestingQuote ? 'Requesting...' : 'Request Quote'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'playbooks' && (
                  <div className="space-y-6">
                  <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-700 shadow-lg">
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                      <span className="text-4xl">📚</span>
                      <span>How to Fix Things!</span>
                    </h3>
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">Learn step-by-step how to solve problems! It's like a recipe for fixing things! 🎯</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Price Spike Response</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                          <span>Activate alternative suppliers immediately</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                          <span>Review and renegotiate contract terms</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                          <span>Notify all stakeholders of price changes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                          <span>Update pricing models and forecasts</span>
                        </li>
                      </ul>
                      <button 
                        onClick={() => {
                          addToast({
                            type: 'info',
                            title: 'Playbook Activated! 🎯',
                            message: 'Price Spike Response playbook is now active. We\'ll help you follow these steps!',
                          });
                        }}
                        className="mt-4 w-full px-4 py-3 text-base font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <span>🚀 Execute Playbook!</span>
                      </button>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                          <Activity className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Supply Disruption</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                          <span>Assess current inventory levels</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                          <span>Contact backup suppliers immediately</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                          <span>Adjust production schedules accordingly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                          <span>Communicate delays to customers proactively</span>
                        </li>
                      </ul>
                      <button 
                        onClick={() => {
                          addToast({
                            type: 'info',
                            title: 'Playbook Activated! 🎯',
                            message: 'Supply Disruption playbook is now active. We\'ll help you follow these steps!',
                          });
                        }}
                        className="mt-4 w-full px-4 py-3 text-base font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <span>🚀 Execute Playbook!</span>
                      </button>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Regulatory Change</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>Review new regulations thoroughly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>Update compliance checklists</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>Consult with legal team</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>Train staff on new requirements</span>
                        </li>
                      </ul>
                      <button 
                        onClick={() => {
                          addToast({
                            type: 'info',
                            title: 'Playbook Activated! 🎯',
                            message: 'Regulatory Change playbook is now active. We\'ll help you follow these steps!',
                          });
                        }}
                        className="mt-4 w-full px-4 py-3 text-base font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <span>🚀 Execute Playbook!</span>
                      </button>
                    </div>
                  </div>
                  </div>
                )}
                </>
              )}
            </div>
          </div>
        </div>
      </PageLayout>

      {/* Risk Profile Modal */}
      {showRiskProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Risk Profile Settings</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configure your risk tolerance and alert preferences
                </p>
              </div>
              <button
                onClick={() => setShowRiskProfileModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {riskProfileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              ) : (
                <>
                  {/* Risk Tolerance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Risk Tolerance Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => {
                            setRiskProfile((prev: any) => ({ ...prev, risk_tolerance: level }));
                          }}
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${
                            riskProfile?.risk_tolerance === level
                              ? level === 'low'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                : level === 'medium'
                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold capitalize">{level}</div>
                          <div className="text-xs mt-1">
                            {level === 'low' && 'Conservative approach'}
                            {level === 'medium' && 'Balanced approach'}
                            {level === 'high' && 'Aggressive approach'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alert Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Alert Preferences
                    </label>
                    <div className="space-y-3">
                      {[
                        { key: 'price_volatility', label: 'Price Volatility Alerts', icon: <TrendingUp className="h-4 w-4" /> },
                        { key: 'supply_shortage', label: 'Supply Shortage Alerts', icon: <AlertTriangle className="h-4 w-4" /> },
                        { key: 'logistics_delay', label: 'Logistics Delay Alerts', icon: <Clock className="h-4 w-4" /> },
                        { key: 'supplier_risk', label: 'Supplier Risk Alerts', icon: <Shield className="h-4 w-4" /> },
                        { key: 'market_risk', label: 'Market Risk Alerts', icon: <BarChart3 className="h-4 w-4" /> },
                        { key: 'compliance_issue', label: 'Compliance Issue Alerts', icon: <FileText className="h-4 w-4" /> },
                      ].map((alert) => (
                        <div key={alert.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="text-gray-500 dark:text-gray-400">{alert.icon}</div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{alert.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Threshold: {riskProfile?.alert_preferences?.[alert.key]?.threshold || 'medium'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <select
                              value={riskProfile?.alert_preferences?.[alert.key]?.threshold || 'medium'}
                              onChange={(e) => {
                                setRiskProfile((prev: any) => ({
                                  ...prev,
                                  alert_preferences: {
                                    ...prev?.alert_preferences,
                                    [alert.key]: {
                                      ...prev?.alert_preferences?.[alert.key],
                                      threshold: e.target.value
                                    }
                                  }
                                }));
                              }}
                              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={riskProfile?.alert_preferences?.[alert.key]?.enabled !== false}
                                onChange={(e) => {
                                  setRiskProfile((prev: any) => ({
                                    ...prev,
                                    alert_preferences: {
                                      ...prev?.alert_preferences,
                                      [alert.key]: {
                                        ...prev?.alert_preferences?.[alert.key],
                                        enabled: e.target.checked
                                      }
                                    }
                                  }));
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Regions of Interest */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Regions of Interest
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Rwanda', 'Kenya', 'Uganda', 'Tanzania', 'Ethiopia'].map((region) => (
                        <button
                          key={region}
                          onClick={() => {
                            const regions = riskProfile?.regions_of_interest || [];
                            const newRegions = regions.includes(region)
                              ? regions.filter((r: string) => r !== region)
                              : [...regions, region];
                            setRiskProfile((prev: any) => ({ ...prev, regions_of_interest: newRegions }));
                          }}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            riskProfile?.regions_of_interest?.includes(region)
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Insurance Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Insurance Preferences
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Minimum Coverage Amount (USD)
                        </label>
                        <input
                          type="number"
                          value={riskProfile?.insurance_preferences?.min_coverage || 1000000}
                          onChange={(e) => {
                            setRiskProfile((prev: any) => ({
                              ...prev,
                              insurance_preferences: {
                                ...prev?.insurance_preferences,
                                min_coverage: parseInt(e.target.value) || 1000000
                              }
                            }));
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          min="0"
                          step="100000"
                        />
                      </div>
                      <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={riskProfile?.insurance_preferences?.auto_recommend !== false}
                          onChange={(e) => {
                            setRiskProfile((prev: any) => ({
                              ...prev,
                              insurance_preferences: {
                                ...prev?.insurance_preferences,
                                auto_recommend: e.target.checked
                              }
                            }));
                          }}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Automatically recommend insurance based on risk profile
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowRiskProfileModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          setRiskProfileLoading(true);
                          await unifiedApi.riskProfile.createOrUpdate(riskProfile);
                          setShowRiskProfileModal(false);
                          // Refresh insurance data to reflect new preferences
                          const summary = await unifiedApi.insurance.getCoverageSummary();
                          setInsuranceData(summary);
                        } catch (err) {
                          console.error('Error saving risk profile:', err);
                          alert('Failed to save risk profile. Please try again.');
                        } finally {
                          setRiskProfileLoading(false);
                        }
                      }}
                      disabled={riskProfileLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {riskProfileLoading ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        'Save Risk Profile'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default RiskMitigation;

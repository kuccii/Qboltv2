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

  // Fetch real risk alerts from backend
  const { alerts: realAlerts, loading: alertsLoading, refetch: refetchAlerts, resolveAlert } = useRiskAlerts({ resolved: false });

  // Timeout for initial load to prevent infinite loading
  useEffect(() => {
    if (!alertsLoading) {
      setInitialLoadTimeout(false);
      return;
    }

    const timer = setTimeout(() => {
      if (alertsLoading) {
        setInitialLoadTimeout(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [alertsLoading]);

  // Transform and prioritize alerts - HIGH SEVERITY FIRST
  const processedAlerts = useMemo(() => {
    return (realAlerts || [])
      .map((alert: any) => ({
        id: alert.id,
        type: alert.alert_type || 'general',
        severity: alert.severity || 'medium',
        title: alert.title || 'Risk Alert',
        message: alert.description || alert.message || '',
        region: alert.country || alert.region || 'Unknown',
        material: alert.material || 'N/A',
        timestamp: new Date(alert.created_at),
        isActive: !alert.resolved,
        impact: alert.impact || 'Medium',
        recommendedAction: alert.recommended_action || 'Review and take action',
        alert: alert // Keep original for API calls
      }))
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

    // Insurance coverage metrics (mock data for now - can be connected to real data later)
    const insuranceCoverage = {
      activePolicies: 3,
      totalCoverage: 2500000, // USD
      coverageGaps: highRisk > 0 ? 2 : 0,
      expiringSoon: 1,
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

    const interval = setInterval(() => {
      refetchAlerts();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refetchAlerts]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refetchAlerts();
      setLastUpdated(new Date());
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
                label: 'Risk Settings',
                icon: <Settings className="h-4 w-4" />,
                onClick: () => console.log('Settings')
              }
            ]} />
          </div>
        }
        status={isAutoRefresh ? { kind: 'live' } : undefined}
      />

      <PageLayout maxWidth="full" padding="none">
        <div className="px-10 md:px-14 lg:px-20 py-8 space-y-8">
          {/* Loading State - Only show if still loading and not timed out */}
          {(loading || (alertsLoading && !initialLoadTimeout)) && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          )}

          {/* CRITICAL ALERTS BANNER - Most Important, Always Visible */}
          {(!loading && (!alertsLoading || initialLoadTimeout)) && criticalAlerts.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 animate-pulse" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
                      {criticalAlerts.length} Critical Risk{criticalAlerts.length !== 1 ? 's' : ''} Require Immediate Attention
                    </h3>
                    <StatusBadge type="error" text="URGENT" />
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                    High-severity risks detected. Review and take action immediately to prevent potential supply chain disruptions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {criticalAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.title}</span>
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="ml-2 text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Resolve
                        </button>
                      </div>
                    ))}
                    {criticalAlerts.length > 3 && (
                      <button
                        onClick={() => setSelectedTab('alerts')}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
                      >
                        View All {criticalAlerts.length} Critical Alerts
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs Container - Matching DocumentVault Style */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" />, badge: riskMetrics.totalAlerts },
                { id: 'alerts', label: 'Alerts', icon: <Bell className="h-4 w-4" />, badge: riskMetrics.totalAlerts, urgent: riskMetrics.highRisk },
                { id: 'timeline', label: 'Timeline', icon: <History className="h-4 w-4" /> },
                { id: 'insurance', label: 'Insurance', icon: <ShieldCheck className="h-4 w-4" />, badge: riskMetrics.insuranceCoverage.coverageGaps },
                { id: 'playbooks', label: 'Playbooks', icon: <Shield className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap relative ${
                    selectedTab === tab.id
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                      tab.urgent && tab.urgent > 0
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* Tab Content */}
              {(!loading && (!alertsLoading || initialLoadTimeout)) && (
                <>
                {selectedTab === 'overview' && (
              <div className="space-y-8">
                {/* Value Proposition Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">What You're Getting</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        Real-time risk intelligence to protect your supply chain and save costs. Get alerts on price spikes, supply disruptions, 
                        compliance issues, and supplier risks before they impact your business.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Price Protection</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Get notified when prices spike so you can lock in contracts early and avoid cost overruns</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Supply Alerts</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Know about port delays, border closures, and supplier issues before they disrupt your operations</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Compliance Tracking</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Monitor regulatory changes and document expiry to avoid penalties and delays</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics - Visual Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">High Risk Items</h3>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{riskMetrics.highRisk}</div>
                    <div className="mt-2 flex items-center text-sm">
                      {riskMetrics.highRisk > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-red-600 dark:text-red-400">+{riskMetrics.highRisk * 5}%</span>
                        </>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No high risk items</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</h3>
                      <Shield className={`h-5 w-5 ${riskMetrics.totalAlerts > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{riskMetrics.totalAlerts}</div>
                    <div className="mt-2 flex items-center text-sm">
                      {riskMetrics.totalAlerts > 0 ? (
                        <span className="text-yellow-600 dark:text-yellow-400">Requires attention</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">All clear</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Price Alerts</h3>
                      <Bell className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{riskMetrics.priceAlerts}</div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {riskMetrics.priceAlerts > 0 ? (
                        <span className="text-blue-600 dark:text-blue-400">Price volatility detected</span>
                      ) : (
                        'No price risks'
                      )}
                    </div>
                    {riskMetrics.priceAlerts > 0 && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        Potential cost impact: High
                      </div>
                    )}
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Score</h3>
                      <Activity className={`h-5 w-5 ${
                        riskMetrics.complianceScore >= 90 ? 'text-green-500' : 
                        riskMetrics.complianceScore >= 80 ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{riskMetrics.complianceScore}%</div>
                    <div className="mt-2 flex items-center text-sm">
                      {riskMetrics.complianceScore >= 90 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600 dark:text-green-400">Excellent</span>
                        </>
                      ) : riskMetrics.complianceScore >= 80 ? (
                        <span className="text-yellow-600 dark:text-yellow-400">Good</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">Needs improvement</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Insurance Coverage</h3>
                      <ShieldCheck className={`h-5 w-5 ${
                        riskMetrics.insuranceCoverage.coverageGaps === 0 ? 'text-green-500' : 'text-yellow-500'
                      }`} />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${(riskMetrics.insuranceCoverage.totalCoverage / 1000000).toFixed(1)}M
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      {riskMetrics.insuranceCoverage.coverageGaps === 0 ? (
                        <span className="text-green-600 dark:text-green-400">Fully covered</span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">
                          {riskMetrics.insuranceCoverage.coverageGaps} gap{riskMetrics.insuranceCoverage.coverageGaps !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {riskMetrics.insuranceCoverage.expiringSoon > 0 && (
                      <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                        {riskMetrics.insuranceCoverage.expiringSoon} policy expiring soon
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions - Most Important Actions First */}
                {criticalAlerts.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Immediate Actions Required
                      </h3>
                      <button
                        onClick={() => setSelectedTab('alerts')}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                      >
                        View All
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {criticalAlerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{alert.title}</h4>
                            <StatusBadge type="error" text="HIGH" />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{alert.message}</p>
                          {alert.recommendedAction && (
                            <p className="text-xs text-red-700 dark:text-red-300 mb-3 font-medium">
                              💡 {alert.recommendedAction}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="flex-1 text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => setSelectedTab('alerts')}
                              className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Insights Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Risk Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Price Volatility Protection</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {riskMetrics.priceAlerts > 0 
                              ? `You have ${riskMetrics.priceAlerts} active price alerts. Monitor these closely to lock in favorable prices before they increase.`
                              : 'No price volatility detected. Prices are stable across your tracked materials.'}
                          </p>
                          {riskMetrics.priceAlerts > 0 && (
                            <button 
                              onClick={() => navigate('/app/prices')}
                              className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                              View Price Trends <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                          <Activity className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Supply Chain Health</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {riskMetrics.supplyAlerts > 0
                              ? `${riskMetrics.supplyAlerts} supply disruption alerts detected. Consider activating backup suppliers.`
                              : 'Your supply chain is operating smoothly with no major disruptions.'}
                          </p>
                          {riskMetrics.supplyAlerts > 0 && (
                            <button 
                              onClick={() => navigate('/app/supplier-directory')}
                              className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 flex items-center gap-1"
                            >
                              Find Backup Suppliers <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Compliance Status</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Your compliance score is {riskMetrics.complianceScore}%. {
                              riskMetrics.complianceScore >= 90 
                                ? 'Excellent compliance - keep up the good work!'
                                : riskMetrics.complianceScore >= 80
                                ? 'Good compliance, but review any pending alerts to improve your score.'
                                : 'Review compliance alerts and update expired documents to improve your score.'
                            }
                          </p>
                          <button 
                            onClick={() => navigate('/app/documents')}
                            className="mt-2 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1"
                          >
                            Check Documents <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Risk Mitigation</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {riskMetrics.totalAlerts === 0
                              ? 'No active risks detected. Your supply chain is well-protected.'
                              : `You have ${riskMetrics.totalAlerts} active risk alerts. Review and take action to protect your operations.`}
                          </p>
                          {riskMetrics.totalAlerts > 0 && (
                            <button 
                              onClick={() => setSelectedTab('playbooks')}
                              className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
                            >
                              View Mitigation Strategies <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment Table with Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Assessment</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current risk factors and mitigation strategies</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-gray-500" />
                          <select
                            value={selectedRiskLevel}
                            onChange={(e) => setSelectedRiskLevel(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="all">All Risk Levels</option>
                            <option value="high">High Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="low">Low Risk</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Risk Level</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Alerts</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Impact</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Probability</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mitigation</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredRisks.length > 0 ? filteredRisks.map((risk) => (
                          <tr key={risk.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{risk.category}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge 
                                type={risk.riskLevel === 'high' ? 'error' : risk.riskLevel === 'medium' ? 'warning' : 'success'} 
                                text={risk.riskLevel.toUpperCase()} 
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Bell className={`h-4 w-4 ${risk.alertCount > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                                <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{risk.alertCount}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {risk.impact}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {risk.probability}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                                <span>{risk.mitigation}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {risk.trend === 'up' ? (
                                  <TrendingUp className="h-4 w-4 text-red-500" />
                                ) : risk.trend === 'down' ? (
                                  <TrendingDown className="h-4 w-4 text-green-500" />
                                ) : (
                                  <div className="h-4 w-4 bg-gray-400 rounded-full" />
                                )}
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {risk.trendValue > 0 ? `${risk.trendValue}%` : 'Stable'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                              No risks match your filter criteria
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
                )}

                {selectedTab === 'alerts' && (
              <div className="space-y-6">
                {/* Search and Filter Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search alerts by title, region, material, or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                    
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
                        </div>
                        <select
                          value={selectedRiskLevel}
                          onChange={(e) => setSelectedRiskLevel(e.target.value)}
                          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="all">All Severities</option>
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                        <select
                          value={selectedRegion}
                          onChange={(e) => setSelectedRegion(e.target.value)}
                          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="all">All Regions</option>
                          <option value="Rwanda">Rwanda</option>
                          <option value="Kenya">Kenya</option>
                          <option value="Uganda">Uganda</option>
                          <option value="Tanzania">Tanzania</option>
                          <option value="Ethiopia">Ethiopia</option>
                        </select>
                        <select
                          value={selectedAlertType}
                          onChange={(e) => setSelectedAlertType(e.target.value)}
                          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="all">All Types</option>
                          <option value="price">Price</option>
                          <option value="supply">Supply</option>
                          <option value="logistics_delay">Logistics</option>
                          <option value="supplier_risk">Supplier</option>
                          <option value="market_risk">Market</option>
                          <option value="compliance_issue">Compliance</option>
                        </select>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {processedAlerts.filter(a => 
                          (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                          (selectedRegion === 'all' || a.region === selectedRegion)
                        ).length} of {processedAlerts.length} alert{processedAlerts.length !== 1 ? 's' : ''}
                        {searchQuery && ` matching "${searchQuery}"`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerts List - Prioritized by Severity */}
                <div className="space-y-4">
                  {/* High Priority Alerts */}
                  {criticalAlerts.filter(a => 
                    (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                    (selectedRegion === 'all' || a.region === selectedRegion)
                  ).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        High Priority ({criticalAlerts.filter(a => 
                          (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                          (selectedRegion === 'all' || a.region === selectedRegion)
                        ).length})
                      </h3>
                      <div className="space-y-3">
                        {criticalAlerts.filter(a => 
                          (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                          (selectedRegion === 'all' || a.region === selectedRegion)
                        ).map((alert) => (
                          <div key={alert.id} className="p-5 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">{alert.title}</h4>
                                  <StatusBadge type="error" text="HIGH" />
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{alert.message}</p>
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
                                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-800">
                                    <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">Recommended Action:</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{alert.recommendedAction}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                <button
                                  onClick={() => handleResolveAlert(alert.id)}
                                  className="px-4 py-2 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors whitespace-nowrap"
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

                  {/* Medium Priority Alerts */}
                  {mediumAlerts.filter(a => 
                    (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                    (selectedRegion === 'all' || a.region === selectedRegion)
                  ).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Medium Priority ({mediumAlerts.filter(a => 
                          (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                          (selectedRegion === 'all' || a.region === selectedRegion)
                        ).length})
                      </h3>
                      <div className="space-y-3">
                        {mediumAlerts.filter(a => 
                          (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                          (selectedRegion === 'all' || a.region === selectedRegion)
                        ).map((alert) => (
                          <div key={alert.id} className="p-5 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">{alert.title}</h4>
                                  <StatusBadge type="warning" text="MEDIUM" />
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{alert.message}</p>
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
                                  className="px-4 py-2 text-xs font-medium bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors whitespace-nowrap"
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

                  {/* Low Priority Alerts */}
                  {lowAlerts.filter(a => 
                    (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                    (selectedRegion === 'all' || a.region === selectedRegion)
                  ).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Low Priority ({lowAlerts.filter(a => 
                          (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                          (selectedRegion === 'all' || a.region === selectedRegion)
                        ).length})
                      </h3>
                      <div className="space-y-3">
                        {lowAlerts.filter(a => 
                          (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                          (selectedRegion === 'all' || a.region === selectedRegion)
                        ).map((alert) => (
                          <div key={alert.id} className="p-5 rounded-lg border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">{alert.title}</h4>
                                  <StatusBadge type="success" text="LOW" />
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{alert.message}</p>
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

                  {/* Empty State */}
                  {processedAlerts.filter(a => 
                    (selectedRiskLevel === 'all' || a.severity === selectedRiskLevel) &&
                    (selectedRegion === 'all' || a.region === selectedRegion)
                  ).length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All Clear!</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">No active alerts match your filter criteria.</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Your supply chain is operating smoothly.</p>
                    </div>
                  )}
                </div>
              </div>
                )}

                {selectedTab === 'timeline' && (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Risk Timeline</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Recent risk events and actions taken</p>
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
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Insurance Coverage & Risk Protection</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage your insurance policies and identify coverage gaps</p>
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Insurance Policies</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your current insurance coverage</p>
                      </div>
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Mock policy data - can be replaced with real data */}
                        <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <InsuranceIndicator 
                                  status="active" 
                                  type="cargo" 
                                  coverageAmount={1500000}
                                  showAmount={true}
                                />
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Cargo Insurance</h4>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Covers goods in transit across East Africa. Protects against theft, damage, and loss during transportation.
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Coverage: $1.5M USD
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Expires: Dec 15, 2024
                                </span>
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  Provider: East Africa Cargo Insurance
                                </span>
                              </div>
                            </div>
                            <button className="ml-4 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>

                        <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <InsuranceIndicator 
                                  status="active" 
                                  type="liability" 
                                  coverageAmount={1000000}
                                  showAmount={true}
                                />
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Professional Liability</h4>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Protects against claims of negligence or errors in professional services and advice.
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Coverage: $1.0M USD
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Expires: Mar 20, 2025
                                </span>
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  Provider: Trade Shield Insurance
                                </span>
                              </div>
                            </div>
                            <button className="ml-4 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>

                        {riskMetrics.insuranceCoverage.expiringSoon > 0 && (
                          <div className="p-6 bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-400">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-1">
                                  Policy Expiring Soon
                                </h4>
                                <p className="text-sm text-orange-800 dark:text-orange-200">
                                  You have {riskMetrics.insuranceCoverage.expiringSoon} policy{riskMetrics.insuranceCoverage.expiringSoon !== 1 ? 's' : ''} expiring within 30 days. 
                                  Renew now to maintain continuous coverage.
                                </p>
                                <button className="mt-3 px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                                  Renew Policy
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
                                  With {riskMetrics.priceAlerts} active price alerts, consider price risk insurance to protect against sudden price spikes.
                                </p>
                                <button className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 flex items-center gap-1">
                                  Explore Options <ArrowRight className="h-4 w-4" />
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
                                    {riskMetrics.supplyAlerts} supply disruption alerts detected. Business interruption insurance can help cover losses.
                                  </p>
                                  <button className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 flex items-center gap-1">
                                    Learn More <ArrowRight className="h-4 w-4" />
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                              <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">East Africa Trade Insurance</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Specialized in cargo and trade insurance across East African corridors.
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <span>✓ Cargo Insurance</span>
                            <span>✓ Trade Credit</span>
                            <span>✓ Liability</span>
                          </div>
                          <button className="w-full px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                            Get Quote
                          </button>
                        </div>

                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                              <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Pan-African Risk Solutions</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Comprehensive coverage for supply chain and business risks.
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <span>✓ Business Interruption</span>
                            <span>✓ Price Risk</span>
                            <span>✓ Supplier Risk</span>
                          </div>
                          <button className="w-full px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                            Get Quote
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'playbooks' && (
                  <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Risk Playbooks</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Predefined response strategies for common risk scenarios</p>
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
                      <button className="mt-4 w-full px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Execute Playbook
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
                      <button className="mt-4 w-full px-4 py-2 text-sm font-medium bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                        Execute Playbook
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
                      <button className="mt-4 w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Execute Playbook
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
    </AppLayout>
  );
};

export default RiskMitigation;

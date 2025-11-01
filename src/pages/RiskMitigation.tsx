import React, { useState, useEffect } from 'react';
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
  Calendar,
  Filter,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  BarChart3,
  Timeline
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import {
  AppLayout,
  PageHeader,
  PageLayout,
  SectionLayout,
  SelectInput,
  ActionMenu,
  RailLayout
} from '../design-system';

const RiskMitigation: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentIndustry, industryConfig, getIndustryTerm } = useIndustry();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'timeline' | 'alerts' | 'playbooks'>('overview');
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Risk timeline data
  const riskTimeline = [
    {
      id: 1,
      timestamp: new Date('2024-01-15T10:30:00'),
      type: 'price_spike',
      severity: 'high',
      title: 'Cement Price Spike Detected',
      description: 'Cement prices increased by 15% in Nairobi region',
      region: 'Nairobi',
      material: 'cement',
      impact: 'High',
      action: 'Alert sent to 12 suppliers'
    },
    {
      id: 2,
      timestamp: new Date('2024-01-14T14:20:00'),
      type: 'supply_disruption',
      severity: 'medium',
      title: 'Supply Chain Disruption',
      description: 'Mombasa port delays affecting steel imports',
      region: 'Mombasa',
      material: 'steel',
      impact: 'Medium',
      action: 'Alternative routes activated'
    },
    {
      id: 3,
      timestamp: new Date('2024-01-13T09:15:00'),
      type: 'regulatory_change',
      severity: 'low',
      title: 'New Import Regulations',
      description: 'Updated customs procedures for construction materials',
      region: 'All',
      material: 'all',
      impact: 'Low',
      action: 'Compliance checklist updated'
    }
  ];

  // Risk alerts data
  const riskAlerts = [
    {
      id: 1,
      type: 'price_threshold',
      severity: 'high',
      title: 'Price Alert: Steel Exceeds Threshold',
      message: 'Steel prices have exceeded your set threshold of $900/ton',
      region: 'Nairobi',
      material: 'steel',
      currentPrice: 950,
      threshold: 900,
      timestamp: new Date(),
      isActive: true
    },
    {
      id: 2,
      type: 'supply_risk',
      severity: 'medium',
      title: 'Supply Risk: Timber Shortage',
      message: 'Timber supply levels below normal in Kampala region',
      region: 'Kampala',
      material: 'timber',
      supplyLevel: 65,
      normalLevel: 80,
      timestamp: new Date(),
      isActive: true
    }
  ];

  // Mock data for risk assessment
  const riskData = [
    {
      id: 1,
      category: 'Market Volatility',
      riskLevel: 'high',
      impact: 'High',
      probability: 'Medium',
      mitigation: 'Diversify suppliers and maintain buffer stock',
      trend: 'up',
      trendValue: 15
    },
    {
      id: 2,
      category: 'Supply Chain',
      riskLevel: 'medium',
      impact: 'Medium',
      probability: 'High',
      mitigation: 'Establish backup suppliers and improve logistics',
      trend: 'down',
      trendValue: 8
    },
    {
      id: 3,
      category: 'Regulatory',
      riskLevel: 'low',
      impact: 'Low',
      probability: 'Low',
      mitigation: 'Regular compliance audits and legal consultation',
      trend: 'stable',
      trendValue: 0
    }
  ];

  const regions = ['all', 'Nairobi', 'Mombasa', 'Kisumu', 'Eldoret'];
  const riskLevels = ['all', 'high', 'medium', 'low'];

  const filteredRisks = riskData.filter(risk => {
    const regionMatch = selectedRegion === 'all' || risk.category.includes(selectedRegion);
    const riskLevelMatch = selectedRiskLevel === 'all' || risk.riskLevel === selectedRiskLevel;
    return regionMatch && riskLevelMatch;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Risk & Compliance Center"
        subtitle="Monitor and mitigate trade risks across your supply chain"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Risk Mitigation' }]}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                  isAutoRefresh 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isAutoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isAutoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
              </button>
              <div className="text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 mr-1 inline" />
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
            <ActionMenu items={[
              {
                label: 'Export Risk Report',
                icon: <Download className="h-4 w-4" />,
                onClick: () => console.log('Export')
              },
              {
                label: 'Risk Settings',
                icon: <Settings className="h-4 w-4" />,
                onClick: () => console.log('Settings')
              }
            ]} />
          </div>
        }
      />

      <PageLayout maxWidth="full" padding="none">
        <RailLayout
          right={
            <>
              <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-2">Risk Insights</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Monitor price volatility and supply disruptions in real-time.</p>
              </div>
              <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left text-xs text-blue-600 hover:text-blue-700">Set Price Alerts</button>
                  <button className="w-full text-left text-xs text-blue-600 hover:text-blue-700">Review Suppliers</button>
                  <button className="w-full text-left text-xs text-blue-600 hover:text-blue-700">Check Compliance</button>
                </div>
              </div>
            </>
          }
        >
          <div className="px-6 py-6 space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
                  { id: 'timeline', label: 'Timeline', icon: <Timeline className="h-4 w-4" /> },
                  { id: 'alerts', label: 'Alerts', icon: <Bell className="h-4 w-4" /> },
                  { id: 'playbooks', label: 'Playbooks', icon: <Shield className="h-4 w-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Risk Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <DashboardCard
                    title="High Risk Items"
                    value="3"
                    icon={AlertTriangle}
                    trend="up"
                    trendValue={15}
                    color="error"
                  />
                  <DashboardCard
                    title="Active Mitigations"
                    value="8"
                    icon={Shield}
                    trend="down"
                    trendValue={5}
                    color="success"
                  />
                  <DashboardCard
                    title="Price Alerts"
                    value="12"
                    icon={Bell}
                    trend="stable"
                    trendValue={0}
                    color="info"
                  />
                  <DashboardCard
                    title="Compliance Score"
                    value="92%"
                    icon={Activity}
                    trend="up"
                    trendValue={3}
                    color="success"
                  />
                </div>

                {/* Risk Assessment Table */}
                <SectionLayout title="Risk Assessment" subtitle="Current risk factors and mitigation strategies">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Risk Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Impact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Probability</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mitigation</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trend</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredRiskData.map((risk) => (
                            <tr key={risk.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {risk.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge 
                                  type={risk.riskLevel === 'high' ? 'error' : risk.riskLevel === 'medium' ? 'warning' : 'success'} 
                                  text={risk.riskLevel.toUpperCase()} 
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {risk.impact}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {risk.probability}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {risk.mitigation}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {risk.trend === 'up' ? (
                                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                                  ) : risk.trend === 'down' ? (
                                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                                  ) : (
                                    <div className="h-4 w-4 bg-gray-400 rounded-full mr-1" />
                                  )}
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {risk.trendValue}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </SectionLayout>
              </div>
            )}

            {selectedTab === 'timeline' && (
              <SectionLayout title="Risk Timeline" subtitle="Recent risk events and actions taken">
                <div className="space-y-4">
                  {riskTimeline.map((event) => (
                    <div key={event.id} className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                        event.severity === 'high' ? 'bg-red-500' : 
                        event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {event.title}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {event.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
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
                        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                          Action: {event.action}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionLayout>
            )}

            {selectedTab === 'alerts' && (
              <SectionLayout title="Active Alerts" subtitle="Real-time risk notifications">
                <div className="space-y-4">
                  {riskAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                      alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                      'border-green-500 bg-green-50 dark:bg-green-900/20'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {alert.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
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
                              {alert.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-blue-600 hover:text-blue-700">
                            View Details
                          </button>
                          <button className="text-xs text-gray-500 hover:text-gray-700">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionLayout>
            )}

            {selectedTab === 'playbooks' && (
              <SectionLayout title="Risk Playbooks" subtitle="Predefined response strategies">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Price Spike Response</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Activate alternative suppliers</li>
                      <li>• Review contract terms</li>
                      <li>• Notify stakeholders</li>
                      <li>• Update pricing models</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Supply Disruption</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Assess inventory levels</li>
                      <li>• Contact backup suppliers</li>
                      <li>• Adjust production schedules</li>
                      <li>• Communicate with customers</li>
                    </ul>
                  </div>
                </div>
              </SectionLayout>
            )}
          </div>
        </RailLayout>
      </PageLayout>
    </AppLayout>
  );
        <DashboardCard
          title="High Risk Items"
          value="3"
          icon={AlertTriangle}
          trend="up"
          trendValue={15}
          color="error"
        />
        <DashboardCard
          title="Active Mitigations"
          value="8"
          icon={Shield}
          trend="down"
          trendValue={5}
          color="success"
        />
        <DashboardCard
          title="Risk Score"
          value="65%"
          icon={Activity}
          trend="down"
          trendValue={8}
          color="warning"
        />
        <DashboardCard
          title="Compliance Rate"
          value="92%"
          icon={Shield}
          trend="up"
          trendValue={3}
          color="success"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {regions.map(region => (
                <option key={region} value={region}>
                  {region.charAt(0).toUpperCase() + region.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Risk Level</label>
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {riskLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredRisks.map(risk => (
            <div key={risk.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{risk.category}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={risk.riskLevel} />
                    <span className="text-sm text-gray-500">
                      Impact: {risk.impact} | Probability: {risk.probability}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {risk.trend === 'up' ? (
                    <TrendingUp className="text-error-600" size={20} />
                  ) : risk.trend === 'down' ? (
                    <TrendingDown className="text-success-600" size={20} />
                  ) : null}
                  <span className={`text-sm ${risk.trend === 'up' ? 'text-error-600' : 'text-success-600'}`}>
                    {risk.trendValue}%
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Mitigation Strategy:</span> {risk.mitigation}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard
          title="Risk Assessment"
          icon={Activity}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Market Volatility</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-error-600 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Supply Chain</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-warning-600 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Regulatory Compliance</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-success-600 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Mitigation Progress"
          icon={Shield}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Strategy Implementation</span>
              <span className="text-sm font-medium text-success-600">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Training Completion</span>
              <span className="text-sm font-medium text-success-600">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">System Updates</span>
              <span className="text-sm font-medium text-warning-600">65%</span>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default RiskMitigation; 
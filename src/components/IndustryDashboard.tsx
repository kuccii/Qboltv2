import React, { useState, useEffect } from 'react';
import { useIndustry } from '../contexts/IndustryContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  Wheat, 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle,
  BarChart3,
  MapPin,
  Clock,
  DollarSign,
  Activity,
  Shield,
  Truck,
  Tractor,
  Leaf,
  Droplets,
  Hammer,
  Wrench
} from 'lucide-react';

interface IndustryDashboardProps {
  className?: string;
}

const IndustryDashboard: React.FC<IndustryDashboardProps> = ({ className = '' }) => {
  const { currentIndustry, industryConfig, getIndustryTerm } = useIndustry();
  const { authState } = useAuth();
  const currentUser = authState.user;

  const isConstruction = currentIndustry === 'construction';

  // Industry-specific metrics
  const metrics = {
    construction: [
      {
        title: 'Active Projects',
        value: '12',
        change: '+2 this month',
        trend: 'up',
        icon: Building2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Price Points Tracked',
        value: '1,248',
        change: '+15% vs last month',
        trend: 'up',
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Supplier Network',
        value: '156',
        change: '+8 new suppliers',
        trend: 'up',
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        title: 'Price Volatility',
        value: '3.2%',
        change: '-0.5% vs last week',
        trend: 'down',
        icon: TrendingUp,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    ],
    agriculture: [
      {
        title: 'Active Farms',
        value: '8',
        change: '+1 this season',
        trend: 'up',
        icon: Wheat,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Price Points Tracked',
        value: '892',
        change: '+22% vs last season',
        trend: 'up',
        icon: TrendingUp,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Supplier Network',
        value: '89',
        change: '+12 new suppliers',
        trend: 'up',
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        title: 'Seasonal Variation',
        value: '8.7%',
        change: '+1.2% vs last month',
        trend: 'up',
        icon: TrendingUp,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    ]
  };

  const industryMetrics = metrics[currentIndustry];

  // Industry-specific recent activity
  const recentActivity = {
    construction: [
      {
        type: 'project_update',
        message: 'Project "Nairobi Office Complex" - Foundation phase completed',
        time: '2 hours ago',
        icon: Building2,
        color: 'text-blue-600'
      },
      {
        type: 'price_update',
        message: 'Cement prices increased by 5.2% in Nairobi region',
        time: '4 hours ago',
        icon: TrendingUp,
        color: 'text-orange-600'
      },
      {
        type: 'supplier_added',
        message: 'New supplier "Steel Masters" added to directory',
        time: '6 hours ago',
        icon: Users,
        color: 'text-green-600'
      },
      {
        type: 'alert',
        message: 'Supply disruption alert for steel delivery in Mombasa',
        time: '8 hours ago',
        icon: AlertTriangle,
        color: 'text-red-600'
      }
    ],
    agriculture: [
      {
        type: 'harvest_update',
        message: 'Maize harvest completed - 15% above target yield',
        time: '1 hour ago',
        icon: Wheat,
        color: 'text-green-600'
      },
      {
        type: 'price_update',
        message: 'Fertilizer prices decreased by 3.1% across Uganda',
        time: '3 hours ago',
        icon: TrendingUp,
        color: 'text-orange-600'
      },
      {
        type: 'supplier_added',
        message: 'New supplier "Green Seeds Ltd" verified',
        time: '5 hours ago',
        icon: Users,
        color: 'text-blue-600'
      },
      {
        type: 'weather_alert',
        message: 'Heavy rainfall expected - adjust irrigation schedule',
        time: '7 hours ago',
        icon: Droplets,
        color: 'text-blue-600'
      }
    ]
  };

  const activityData = recentActivity[currentIndustry];

  // Industry-specific quick actions
  const quickActions = {
    construction: [
      {
        title: 'Start New Project',
        description: 'Create a new construction project',
        icon: Building2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        href: '/app/projects/new'
      },
      {
        title: 'Track Prices',
        description: 'Monitor material prices',
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        href: '/app/prices'
      },
      {
        title: 'Find Suppliers',
        description: 'Search for material suppliers',
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        href: '/app/supplier-directory'
      },
      {
        title: 'Track Prices',
        description: 'Monitor material prices',
        icon: TrendingUp,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        href: '/app/prices'
      }
    ],
    agriculture: [
      {
        title: 'Plan Season',
        description: 'Create seasonal farming plan',
        icon: Wheat,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        href: '/app/planning/season'
      },
      {
        title: 'Track Prices',
        description: 'Monitor input prices',
        icon: TrendingUp,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        href: '/app/prices'
      },
      {
        title: 'Find Suppliers',
        description: 'Search for input suppliers',
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        href: '/app/supplier-directory'
      },
      {
        title: 'Track Prices',
        description: 'Monitor input prices',
        icon: TrendingUp,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        href: '/app/prices'
      }
    ]
  };

  const actions = quickActions[currentIndustry];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Industry Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isConstruction ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
            }`}>
              {isConstruction ? <Building2 size={24} /> : <Wheat size={24} />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {industryConfig.displayName} Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome back, {currentUser?.name || 'User'}! Here's what's happening in your {industryConfig.displayName.toLowerCase()} operations.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Last updated</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {industryMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                  <p className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-left group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${action.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activityData.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color.replace('text-', 'bg-').replace('-600', '-50')}`}>
                  <Icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Industry-specific insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isConstruction ? 'Construction' : 'Agriculture'} Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {isConstruction ? 'Project Timeline' : 'Seasonal Calendar'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isConstruction 
                ? 'Track your construction projects and milestones with real-time updates.'
                : 'Plan your farming activities based on seasonal patterns and weather data.'
              }
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {isConstruction ? 'Material Costs' : 'Input Costs'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isConstruction 
                ? 'Monitor building material prices and optimize your procurement strategy.'
                : 'Track agricultural input prices and plan your purchases for maximum efficiency.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryDashboard;

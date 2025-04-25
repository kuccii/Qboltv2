import React from 'react';
import { AlertTriangle, TrendingDown, AlertCircle, Shield, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RiskAlert {
  id: string;
  type: 'price' | 'supply' | 'logistics' | 'regulatory';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  timestamp: Date;
}

const RiskMitigation: React.FC = () => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';

  const riskAlerts: RiskAlert[] = [
    {
      id: '1',
      type: 'price',
      severity: 'high',
      title: industry === 'construction' ? 'Cement Price Volatility' : 'Fertilizer Supply Shortage',
      description: industry === 'construction' 
        ? 'Significant price increases expected due to rising production costs and supply constraints.'
        : 'Regional fertilizer shortage expected due to import delays and increased demand.',
      impact: 'Potential 15-20% cost increase over next month',
      recommendation: 'Lock in current prices with suppliers through advance contracts',
      timestamp: new Date('2024-03-10T08:00:00')
    },
    {
      id: '2',
      type: 'logistics',
      severity: 'medium',
      title: 'Transport Disruption',
      description: 'Road maintenance on major routes causing delays',
      impact: 'Delivery times extended by 2-3 days',
      recommendation: 'Plan for extended lead times and consider alternative routes',
      timestamp: new Date('2024-03-09T14:30:00')
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-error-100 text-error-800 border-error-200';
      case 'medium':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'low':
        return 'bg-success-100 text-success-800 border-success-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <TrendingDown size={20} />;
      case 'supply':
        return <AlertTriangle size={20} />;
      case 'logistics':
        return <Activity size={20} />;
      case 'regulatory':
        return <Shield size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Risk Alerts</h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-error-100 text-error-800 rounded text-sm">
              {riskAlerts.filter(alert => alert.severity === 'high').length} High Risk
            </span>
            <span className="px-2 py-1 bg-warning-100 text-warning-800 rounded text-sm">
              {riskAlerts.filter(alert => alert.severity === 'medium').length} Medium Risk
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {riskAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${
                  alert.severity === 'high' ? 'bg-error-200' :
                  alert.severity === 'medium' ? 'bg-warning-200' :
                  'bg-success-200'
                }`}>
                  {getIcon(alert.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-lg">{alert.title}</h3>
                    <span className="text-sm capitalize px-2 py-1 rounded-full bg-white bg-opacity-50">
                      {alert.severity} Risk
                    </span>
                  </div>
                  
                  <p className="text-sm mb-3">{alert.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="block mb-1">Potential Impact:</strong>
                      <p>{alert.impact}</p>
                    </div>
                    <div>
                      <strong className="block mb-1">Recommended Action:</strong>
                      <p>{alert.recommendation}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span>
                      Reported: {alert.timestamp.toLocaleDateString()} at {alert.timestamp.toLocaleTimeString()}
                    </span>
                    <button className="text-primary-600 hover:text-primary-800 font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Mitigation Strategies</h3>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Supplier Diversification</h4>
              <p className="text-sm text-gray-600">
                Maintain relationships with multiple suppliers to reduce dependency risks and ensure continuous supply.
              </p>
              <button className="mt-3 text-sm text-primary-600 hover:text-primary-800 font-medium">
                View Recommended Suppliers
              </button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Price Hedging</h4>
              <p className="text-sm text-gray-600">
                Lock in prices through forward contracts and bulk purchasing agreements during stable market conditions.
              </p>
              <button className="mt-3 text-sm text-primary-600 hover:text-primary-800 font-medium">
                Explore Hedging Options
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Insurance Coverage</h3>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">Cargo Insurance</h4>
                <span className="text-sm text-success-600">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Covers loss or damage during transportation of goods.
              </p>
              <div className="text-sm text-gray-500">
                Coverage: Up to $50,000 per shipment
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">Trade Credit Insurance</h4>
                <span className="text-sm text-warning-600">Recommended</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Protects against non-payment by buyers.
              </p>
              <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                Get Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMitigation;
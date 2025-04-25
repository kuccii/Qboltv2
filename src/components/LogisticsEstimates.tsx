import React, { useState } from 'react';
import { 
  Truck, 
  Calendar, 
  DollarSign, 
  MapPin,
  AlertTriangle,
  Clock,
  Package
} from 'lucide-react';

interface RouteEstimate {
  distance: number;
  duration: string;
  cost: number;
  risks: string[];
}

const LogisticsEstimates: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');

  // Mock data - in production this would be calculated based on real data
  const estimate: RouteEstimate = {
    distance: 423,
    duration: '2-3 days',
    cost: 45000,
    risks: [
      'Heavy rainfall expected along route',
      'Road maintenance on highway B8'
    ]
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Logistics Calculator</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origin Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Enter origin city"
                  className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter destination city"
                  className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight"
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume (m³)
                </label>
                <input
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="Enter volume"
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-gray-800 mb-4">Estimated Delivery Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck size={20} />
                  <span>Distance</span>
                </div>
                <span className="font-medium text-gray-800">{estimate.distance} km</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={20} />
                  <span>Duration</span>
                </div>
                <span className="font-medium text-gray-800">{estimate.duration}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign size={20} />
                  <span>Estimated Cost</span>
                </div>
                <span className="font-medium text-gray-800">KES {estimate.cost.toLocaleString()}</span>
              </div>

              {estimate.risks.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-warning-600 mb-2">
                    <AlertTriangle size={20} />
                    <span className="font-medium">Route Alerts</span>
                  </div>
                  <ul className="space-y-2">
                    {estimate.risks.map((risk, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-warning-500 mt-1">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button className="w-full mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Request Delivery Quote
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-primary-100 text-primary-600">
              <Truck size={24} />
            </div>
            <h3 className="font-medium text-gray-800">Available Carriers</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <span>SafeBoda Logi</span>
              <span className="text-success-600">Available</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Lori Systems</span>
              <span className="text-success-600">Available</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Sendy</span>
              <span className="text-warning-600">Limited</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-primary-100 text-primary-600">
              <Calendar size={24} />
            </div>
            <h3 className="font-medium text-gray-800">Peak Days</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <span>Monday</span>
              <span className="text-error-600">High</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Wednesday</span>
              <span className="text-warning-600">Medium</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Friday</span>
              <span className="text-success-600">Low</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-primary-100 text-primary-600">
              <Package size={24} />
            </div>
            <h3 className="font-medium text-gray-800">Cargo Types</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <span>Standard Freight</span>
              <span className="text-success-600">Available</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Temperature Controlled</span>
              <span className="text-warning-600">Limited</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Hazardous Materials</span>
              <span className="text-error-600">Restricted</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LogisticsEstimates;
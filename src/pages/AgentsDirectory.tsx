import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Briefcase,
  Shield,
  MessageSquare,
  Download,
  TrendingUp
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../contexts/AuthContext';

interface Agent {
  id: number;
  name: string;
  type: 'customs' | 'logistics' | 'broker' | 'regulatory';
  location: string;
  expertise: string[];
  rating: number;
  reviews: number;
  services: string[];
  associatedSuppliers: string[];
  performance: {
    reliability: number;
    efficiency: number;
    serviceQuality: number;
  };
}

const AgentsDirectory: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Mock data for agents
  const agents: Agent[] = [
    {
      id: 1,
      name: 'Kenya Customs Solutions',
      type: 'customs',
      location: 'Nairobi',
      expertise: ['Import/Export', 'Customs Clearance', 'Documentation'],
      rating: 4.8,
      reviews: 124,
      services: ['Customs Clearance', 'Document Processing', 'Compliance'],
      associatedSuppliers: ['ABC Construction', 'XYZ Materials'],
      performance: {
        reliability: 4.9,
        efficiency: 4.7,
        serviceQuality: 4.8
      }
    },
    {
      id: 2,
      name: 'East Africa Logistics',
      type: 'logistics',
      location: 'Mombasa',
      expertise: ['Transportation', 'Warehousing', 'Distribution'],
      rating: 4.6,
      reviews: 98,
      services: ['Freight Forwarding', 'Warehousing', 'Distribution'],
      associatedSuppliers: ['Global Suppliers', 'Local Materials'],
      performance: {
        reliability: 4.7,
        efficiency: 4.5,
        serviceQuality: 4.6
      }
    }
  ];

  const agentTypes = ['all', 'customs', 'logistics', 'broker', 'regulatory'];
  const locations = ['all', 'Nairobi', 'Mombasa', 'Kisumu', 'Eldoret'];

  const filteredAgents = agents.filter(agent => {
    const searchMatch = agent.name.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = selectedType === 'all' || agent.type === selectedType;
    const locationMatch = selectedLocation === 'all' || agent.location === selectedLocation;
    return searchMatch && typeMatch && locationMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Agents Directory</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Download size={20} />
          <span>Export Directory</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Agents"
          icon={<Users className="w-5 h-5" />}
        >
          <div className="text-2xl font-bold">{agents.length}</div>
        </DashboardCard>
        <DashboardCard
          title="Average Rating"
          icon={<Star className="w-5 h-5" />}
        >
          <div className="text-2xl font-bold">4.7</div>
        </DashboardCard>
        <DashboardCard
          title="Active Reviews"
          icon={<MessageSquare className="w-5 h-5" />}
        >
          <div className="text-2xl font-bold">222</div>
        </DashboardCard>
        <DashboardCard
          title="Locations"
          icon={<MapPin className="w-5 h-5" />}
        >
          <div className="text-2xl font-bold">4</div>
        </DashboardCard>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex-1">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {agentTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {locations.map(location => (
                <option key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAgents.map(agent => (
            <div key={agent.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{agent.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={16} />
                      {agent.location}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Briefcase size={16} />
                      {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Star size={16} className="text-yellow-500" />
                      {agent.rating} ({agent.reviews} reviews)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-primary-600">
                    <MessageSquare size={20} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-primary-600">
                    <Shield size={20} />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Expertise</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {agent.expertise.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Associated Suppliers</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {agent.associatedSuppliers.map(supplier => (
                    <span key={supplier} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                      {supplier}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Reliability</span>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-success-600 rounded-full" 
                      style={{ width: `${(agent.performance.reliability / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Efficiency</span>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-primary-600 rounded-full" 
                      style={{ width: `${(agent.performance.efficiency / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Service Quality</span>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-warning-600 rounded-full" 
                      style={{ width: `${(agent.performance.serviceQuality / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard
          title="Agent Performance"
          icon={<TrendingUp className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customs Agents</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-primary-600 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Logistics Agents</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-success-600 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Trade Brokers</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-warning-600 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Recent Reviews"
          icon={<MessageSquare className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold">
                A
              </div>
              <div>
                <p className="text-sm font-medium">Excellent service and quick response time</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-500" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold">
                B
              </div>
              <div>
                <p className="text-sm font-medium">Very professional and knowledgeable</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-500" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">1 week ago</span>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default AgentsDirectory; 
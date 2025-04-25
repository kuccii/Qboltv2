import React, { useState, ChangeEvent } from 'react';
import { 
  Truck, 
  Map, 
  Clock, 
  AlertTriangle, 
  Download,
  Filter,
  Search,
  BarChart3,
  Calendar
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { logisticsData, LogisticsItem } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

type Status = 'normal' | 'delayed' | 'high-risk';
type Industry = 'construction' | 'agriculture';

const Logistics: React.FC = () => {
  const { currentUser } = useAuth();
  const industry = (currentUser?.industry as Industry) || 'construction';
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<Status | 'all'>('all');
  
  // Filter logistics data based on industry and search/filter settings
  const filteredLogistics = logisticsData
    .filter((item: LogisticsItem) => item.industry === industry)
    .filter((item: LogisticsItem) => 
      searchTerm === '' || 
      item.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item: LogisticsItem) => 
      selectedRegion === 'all' || 
      item.region === selectedRegion
    )
    .filter((item: LogisticsItem) => 
      selectedStatus === 'all' || 
      item.status === selectedStatus
    );
  
  // Get unique regions and statuses
  const uniqueRegions = Array.from(
    new Set(
      logisticsData
        .filter((item: LogisticsItem) => item.industry === industry)
        .map((item: LogisticsItem) => item.region)
    )
  );
  
  const statuses: readonly (Status | 'all')[] = ['all', 'normal', 'delayed', 'high-risk'] as const;
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleRegionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
  };
  
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value as Status | 'all');
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Logistics Awareness</h1>
          <p className="text-gray-500 mt-1">
            Monitor and plan your logistics operations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors px-3 py-1.5 rounded-md text-sm font-medium">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card p-5 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search routes or locations..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm text-gray-500">Filter by:</span>
            </div>
            
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <select
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  className="appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Regions</option>
                  {uniqueRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              
              <div className="relative flex-1">
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredLogistics.length > 0 ? (
            filteredLogistics.map(item => (
              <div 
                key={item.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-800">{item.route}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Map size={14} className="mr-1" />
                      {item.region}
                    </div>
                  </div>
                  <StatusBadge 
                    type={
                      item.status === 'normal' ? 'success' : 
                      item.status === 'delayed' ? 'warning' : 'error'
                    } 
                    text={item.status.toUpperCase()} 
                  />
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{item.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {item.estimatedTime}
                    </div>
                    <div className="flex items-center">
                      <Truck size={14} className="mr-1" />
                      {item.transportType}
                    </div>
                  </div>
                  
                  {item.alerts && item.alerts.length > 0 && (
                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={16} className="text-warning-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-800">Current Alerts</h4>
                          <ul className="mt-1 space-y-1 text-sm text-gray-600">
                            {item.alerts.map((alert, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-warning-500 mt-1">•</span>
                                <span>{alert}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No logistics data matches your search criteria
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard 
          title="Route Analysis" 
          icon={<BarChart3 size={20} />}
        >
          <div className="space-y-4 mt-2">
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
              <h3 className="font-medium text-primary-800 mb-2">Key Metrics</h3>
              <div className="space-y-3">
                {uniqueRegions.map(region => (
                  <div key={region} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{region}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">
                        {logisticsData.filter((l: LogisticsItem) => l.region === region && l.industry === industry).length} routes
                      </span>
                      <span className="text-xs text-gray-500">
                        ({logisticsData.filter((l: LogisticsItem) => l.region === region && l.industry === industry && l.status === 'normal').length} normal)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard 
          title="Infrastructure Updates" 
          icon={<AlertTriangle size={20} />}
        >
          <div className="space-y-4 mt-2">
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-warning-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-800">Recent Changes</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Infrastructure updates and changes affecting logistics routes will be displayed here.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-800 mb-2">Upcoming Events</h3>
              <div className="space-y-3">
                {logisticsData
                  .filter((item: LogisticsItem) => item.industry === industry && item.upcomingEvents)
                  .flatMap((item: LogisticsItem) => item.upcomingEvents || [])
                  .slice(0, 3)
                  .map((event, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Calendar size={14} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-800">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Logistics; 
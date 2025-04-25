import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { Users, Settings, Shield, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="User Management"
          icon={<Users className="w-5 h-5" />}
          className="bg-blue-50"
        >
          <div className="text-3xl font-bold text-blue-600">24</div>
          <p className="text-sm text-gray-500">Active Users</p>
        </DashboardCard>

        <DashboardCard
          title="System Settings"
          icon={<Settings className="w-5 h-5" />}
          className="bg-green-50"
        >
          <div className="text-3xl font-bold text-green-600">12</div>
          <p className="text-sm text-gray-500">Configurations</p>
        </DashboardCard>

        <DashboardCard
          title="Security"
          icon={<Shield className="w-5 h-5" />}
          className="bg-red-50"
        >
          <div className="text-3xl font-bold text-red-600">3</div>
          <p className="text-sm text-gray-500">Security Alerts</p>
        </DashboardCard>

        <DashboardCard
          title="System Health"
          icon={<Activity className="w-5 h-5" />}
          className="bg-purple-50"
        >
          <div className="text-3xl font-bold text-purple-600">98%</div>
          <p className="text-sm text-gray-500">Uptime</p>
        </DashboardCard>
      </div>
    </div>
  );
};

export default AdminDashboard; 
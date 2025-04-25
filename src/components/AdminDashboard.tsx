import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Database,
  MessageSquare,
  Flag
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Mock data - in production this would come from your backend
  const stats = {
    totalUsers: 1245,
    activeUsers: 892,
    pendingVerifications: 23,
    reportedContent: 8,
    systemHealth: 98.5,
    dataIngestion: {
      success: 95,
      failed: 5,
      pending: 12
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
            </div>
            <div className="p-3 bg-primary-100 rounded-full text-primary-600">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-success-600">
            +12% from last month
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.activeUsers}</h3>
            </div>
            <div className="p-3 bg-success-100 rounded-full text-success-600">
              <Activity size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-success-600">
            71% engagement rate
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Verifications</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.pendingVerifications}</h3>
            </div>
            <div className="p-3 bg-warning-100 rounded-full text-warning-600">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-warning-600">
            Requires attention
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reported Content</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.reportedContent}</h3>
            </div>
            <div className="p-3 bg-error-100 rounded-full text-error-600">
              <Flag size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-error-600">
            Needs review
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">System Health</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Overall Status</span>
                <span className="text-sm font-medium text-success-600">Healthy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-success-500 h-2 rounded-full" 
                  style={{ width: `${stats.systemHealth}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">{stats.dataIngestion.success}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-error-600">{stats.dataIngestion.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-600">{stats.dataIngestion.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-success-100 text-success-600">
                <CheckCircle size={16} />
              </div>
              <div>
                <p className="text-sm text-gray-800">New user verification completed</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-warning-100 text-warning-600">
                <AlertTriangle size={16} />
              </div>
              <div>
                <p className="text-sm text-gray-800">Price submission flagged for review</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-error-100 text-error-600">
                <XCircle size={16} />
              </div>
              <div>
                <p className="text-sm text-gray-800">Failed data ingestion detected</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Pipeline Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} />
                <span>Price Data</span>
              </div>
              <span className="text-success-600">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} />
                <span>Supplier Data</span>
              </div>
              <span className="text-success-600">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} />
                <span>Market Analysis</span>
              </div>
              <span className="text-warning-600">Degraded</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Content Moderation</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} />
                <span>Forum Posts</span>
              </div>
              <span className="text-sm">12 pending</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag size={16} />
                <span>Reported Users</span>
              </div>
              <span className="text-sm">3 pending</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>Price Reports</span>
              </div>
              <span className="text-sm">8 pending</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">System Metrics</h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">CPU Usage</span>
                <span className="text-sm">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm">48%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '48%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Storage Usage</span>
                <span className="text-sm">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
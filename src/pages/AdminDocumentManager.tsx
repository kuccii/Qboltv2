import React, { useState, useEffect } from 'react';
import { Search, FileText, AlertCircle, Trash2, Download } from 'lucide-react';
import { unifiedApi } from '../services/unifiedApi';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await unifiedApi.documents.getAll({ limit: 1000 });
      setDocuments(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;
    try {
      await unifiedApi.documents.delete(id);
      loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document. Please try again.');
    }
  };

  const filteredDocuments = documents.filter(d =>
    searchTerm === '' ||
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return (
    <div className="p-6">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Document Management</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage all documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocuments.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No documents found</td></tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{doc.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{doc.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{doc.category || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {doc.user_profiles?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {doc.file_url && (
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-900 dark:text-primary-400">
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                        <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-900 dark:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDocumentManager;


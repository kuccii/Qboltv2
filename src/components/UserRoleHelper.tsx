import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Copy, AlertCircle, CheckCircle, X } from 'lucide-react';

/**
 * Helper component to display current user info and provide SQL to update role
 * This is useful for debugging admin access issues
 */
const UserRoleHelper: React.FC = () => {
  const { authState } = useAuth();
  const [copied, setCopied] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  // Check if user has dismissed it before (stored in localStorage)
  React.useEffect(() => {
    const dismissedBefore = localStorage.getItem('userRoleHelperDismissed');
    if (dismissedBefore === 'true') {
      setDismissed(true);
    }
  }, []);

  if (!authState.user || dismissed) {
    return null;
  }

  const user = authState.user;
  const isAdmin = user.role === 'admin';

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('userRoleHelperDismissed', 'true');
  };

  const sqlQuery = `-- Update ${user.email} to admin role
UPDATE public.user_profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = '${user.email}';

-- Verify
SELECT id, email, name, role FROM public.user_profiles WHERE email = '${user.email}';`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-start gap-3">
        {isAdmin ? (
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {isAdmin ? 'Admin Access' : 'User Role Helper'}
            </h3>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> <code className="text-xs">{user.id}</code></p>
            <p><strong>Current Role:</strong> <span className={`font-semibold ${isAdmin ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{user.role}</span></p>
          </div>
          {!isAdmin && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                To become admin, run this SQL in Supabase:
              </p>
              <div className="bg-gray-100 dark:bg-gray-900 rounded p-2 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
                <pre className="whitespace-pre-wrap">{sqlQuery}</pre>
              </div>
              <button
                onClick={copyToClipboard}
                className="mt-2 flex items-center gap-2 px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                <Copy className="h-3 w-3" />
                {copied ? 'Copied!' : 'Copy SQL'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRoleHelper;


import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import SimplifiedNavigation from './components/SimplifiedNavigation';
import ProtectedRoute from './components/ProtectedRoute';
import SecurityMiddleware from './components/SecurityMiddleware';
import AccessibilityWrapper from './components/AccessibilityWrapper';
import MobileOptimization from './components/MobileOptimization';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const SimplifiedDashboard = React.lazy(() => import('./components/SimplifiedDashboard'));
const PriceTracking = React.lazy(() => import('./pages/PriceTracking'));
const SupplierDirectory = React.lazy(() => import('./pages/SupplierDirectory'));
const RwandaLogistics = React.lazy(() => import('./pages/RwandaLogistics'));
const Financing = React.lazy(() => import('./pages/Financing'));
const RevenueModel = React.lazy(() => import('./components/RevenueModel'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Loading fallback component
const LoadingFallback = () => (
  <LoadingSpinner fullScreen text="Loading..." />
);

// Main Layout Component
const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SimplifiedNavigation />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route index element={<SimplifiedDashboard />} />
              <Route path="prices" element={<PriceTracking />} />
              <Route path="suppliers" element={<SupplierDirectory />} />
              <Route path="rwanda" element={<RwandaLogistics />} />
              <Route path="financing" element={<Financing />} />
              <Route path="pricing" element={<RevenueModel />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <NotificationProvider>
            <AuthProvider>
              <DataProvider>
                <SecurityMiddleware>
                  <Router>
                    <AccessibilityWrapper>
                      <MobileOptimization>
                        <Suspense fallback={<LoadingFallback />}>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/app/*" element={
                              <ProtectedRoute>
                                <MainLayout />
                              </ProtectedRoute>
                            } />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </MobileOptimization>
                    </AccessibilityWrapper>
                  </Router>
                </SecurityMiddleware>
              </DataProvider>
            </AuthProvider>
          </NotificationProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;


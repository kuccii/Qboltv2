import React, { Suspense } from 'react';
import './styles/industry-themes.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { IndustryProvider } from './contexts/IndustryContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SecurityMiddleware from './components/SecurityMiddleware';
import AccessibilityWrapper from './components/AccessibilityWrapper';
import MobileOptimization from './components/MobileOptimization';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const AnalyticsDashboard = React.lazy(() => import('./components/AnalyticsDashboard'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PriceTracking = React.lazy(() => import('./pages/PriceTracking'));
const PriceAlerts = React.lazy(() => import('./pages/PriceAlerts'));
const DemandMapping = React.lazy(() => import('./pages/DemandMapping'));
const SupplierScores = React.lazy(() => import('./pages/SupplierScores'));
const SupplierDirectory = React.lazy(() => import('./pages/SupplierDirectory'));
const SupplierDetail = React.lazy(() => import('./pages/SupplierDetail'));
const AgentsDirectory = React.lazy(() => import('./pages/AgentsDirectory'));
const Financing = React.lazy(() => import('./pages/Financing'));
const PriceReporting = React.lazy(() => import('./components/PriceReporting'));
const RiskMitigation = React.lazy(() => import('./pages/RiskMitigation'));
const Logistics = React.lazy(() => import('./pages/Logistics'));
const DocumentVault = React.lazy(() => import('./pages/DocumentVault'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const IndustrySelector = React.lazy(() => import('./components/IndustrySelector'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// User menu pages
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Billing = React.lazy(() => import('./pages/Billing'));
const HelpCenter = React.lazy(() => import('./pages/HelpCenter'));

// Country Profile (unified)
const CountryProfile = React.lazy(() => import('./pages/CountryProfile'));
const CountrySelector = React.lazy(() => import('./pages/CountrySelector'));

// Loading fallback component
const LoadingFallback = () => (
  <LoadingSpinner fullScreen text="Loading..." />
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <NotificationProvider>
            <AuthProvider>
              <IndustryProvider>
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
                        <Route path="/select-industry" element={
                          <ProtectedRoute>
                            <IndustrySelector />
                          </ProtectedRoute>
                        } />
                        <Route path="/app" element={
                          <ProtectedRoute>
                            <Layout />
                          </ProtectedRoute>
                        }>
                          <Route index element={<Dashboard />} />
                          {/* Unified Country Profiles - consolidates suppliers, pricing, infrastructure, logistics, demand */}
                          <Route path="countries" element={<CountrySelector />} />
                          <Route path="countries/:countryCode" element={<CountryProfile />} />
                          <Route path="countries/:countryCode/:tab" element={<CountryProfile />} />
                          {/* Legacy routes - redirect to country profiles */}
                          <Route path="rwanda" element={<Navigate to="/app/countries/rw" replace />} />
                          <Route path="rwanda/:tab" element={<Navigate to="/app/countries/rw/:tab" replace />} />
                          <Route path="prices" element={<Navigate to="/app/countries/rw/pricing" replace />} />
                          <Route path="suppliers" element={<Navigate to="/app/countries/rw/contacts" replace />} />
                          <Route path="supplier-directory" element={<Navigate to="/app/countries/rw/contacts" replace />} />
                          <Route path="supplier-directory/:id" element={<SupplierDetail />} />
                          <Route path="demand" element={<DemandMapping />} />
                          <Route path="logistics" element={<Navigate to="/app/countries/rw/infrastructure" replace />} />
                          {/* Keep separate pages */}
                          <Route path="price-alerts" element={<PriceAlerts />} />
                          <Route path="price-reporting" element={<PriceReporting />} />
                          <Route path="agents" element={<AgentsDirectory />} />
                          <Route path="financing" element={<Financing />} />
                          <Route path="risk" element={<RiskMitigation />} />
                          <Route path="documents" element={<DocumentVault />} />
                          <Route path="analytics" element={<AnalyticsDashboard />} />
                          <Route path="profile" element={<Profile />} />
                          <Route path="settings" element={<Settings />} />
                          <Route path="notifications" element={<Notifications />} />
                          <Route path="billing" element={<Billing />} />
                          <Route path="help" element={<HelpCenter />} />
                          <Route path="admin" element={
                            <ProtectedRoute adminOnly requiredPermission="settings:read">
                              <AdminDashboard />
                            </ProtectedRoute>
                          } />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </MobileOptimization>
                </AccessibilityWrapper>
              </Router>
                  </SecurityMiddleware>
                </DataProvider>
              </IndustryProvider>
            </AuthProvider>
          </NotificationProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
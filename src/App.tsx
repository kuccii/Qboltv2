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
const DemandMapping = React.lazy(() => import('./pages/DemandMapping'));
const SupplierScores = React.lazy(() => import('./pages/SupplierScores'));
const SupplierDirectory = React.lazy(() => import('./pages/SupplierDirectory'));
const AgentsDirectory = React.lazy(() => import('./pages/AgentsDirectory'));
const Financing = React.lazy(() => import('./pages/Financing'));
const PriceReporting = React.lazy(() => import('./components/PriceReporting'));
const RiskMitigation = React.lazy(() => import('./components/RiskMitigation'));
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

// Rwanda components
const RwandaLogistics = React.lazy(() => import('./pages/RwandaLogistics'));
const RwandaOverview = React.lazy(() => import('./components/rwanda/RwandaOverview'));
const RwandaContactDirectory = React.lazy(() => import('./components/rwanda/RwandaContactDirectory'));
const RwandaPricingIntelligence = React.lazy(() => import('./components/rwanda/RwandaPricingIntelligence'));
const RwandaInfrastructureOverview = React.lazy(() => import('./components/rwanda/RwandaInfrastructureOverview'));
const RwandaSmartFeatures = React.lazy(() => import('./components/rwanda/RwandaSmartFeatures'));

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
                          <Route path="prices" element={<PriceTracking />} />
                          <Route path="price-reporting" element={<PriceReporting />} />
                          <Route path="demand" element={<DemandMapping />} />
                          <Route path="suppliers" element={<SupplierScores />} />
                          <Route path="supplier-directory" element={<SupplierDirectory />} />
                          <Route path="agents" element={<AgentsDirectory />} />
                          <Route path="logistics" element={<Logistics />} />
                          <Route path="financing" element={<Financing />} />
                          <Route path="risk" element={<RiskMitigation />} />
                          <Route path="documents" element={<DocumentVault />} />
                          <Route path="analytics" element={<AnalyticsDashboard />} />
                          <Route path="profile" element={<Profile />} />
                          <Route path="settings" element={<Settings />} />
                          <Route path="notifications" element={<Notifications />} />
                          <Route path="billing" element={<Billing />} />
                          <Route path="help" element={<HelpCenter />} />
                          <Route path="rwanda" element={
                            <ProtectedRoute>
                              <RwandaLogistics />
                            </ProtectedRoute>
                          }>
                            <Route index element={<RwandaOverview />} />
                            <Route path="profile" element={<RwandaOverview />} />
                            <Route path="infrastructure" element={<RwandaInfrastructureOverview />} />
                            <Route path="services" element={<RwandaPricingIntelligence />} />
                            <Route path="contacts" element={<RwandaContactDirectory />} />
                            <Route path="intelligence" element={<RwandaSmartFeatures />} />
                          </Route>
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
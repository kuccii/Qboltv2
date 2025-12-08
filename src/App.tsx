import React, { Suspense } from 'react';
import './styles/industry-themes.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { IndustryProvider } from './contexts/IndustryContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SecurityMiddleware from './components/SecurityMiddleware';
import AccessibilityWrapper from './components/AccessibilityWrapper';
import MobileOptimization from './components/MobileOptimization';
import UserRoleHelper from './components/UserRoleHelper';

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
const PriceReporting = React.lazy(() => import('./pages/PriceReporting'));
const RiskMitigation = React.lazy(() => import('./pages/RiskMitigation'));
const Logistics = React.lazy(() => import('./pages/Logistics'));
const DocumentVault = React.lazy(() => import('./pages/DocumentVault'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminPriceManager = React.lazy(() => import('./pages/AdminPriceManager'));
const AdminSupplierManager = React.lazy(() => import('./pages/AdminSupplierManager'));
const AdminAgentManager = React.lazy(() => import('./pages/AdminAgentManager'));
const AdminFinancingManager = React.lazy(() => import('./pages/AdminFinancingManager'));
const AdminLogisticsManager = React.lazy(() => import('./pages/AdminLogisticsManager'));
const AdminDemandManager = React.lazy(() => import('./pages/AdminDemandManager'));
const AdminRiskManager = React.lazy(() => import('./pages/AdminRiskManager'));
const AdminDocumentManager = React.lazy(() => import('./pages/AdminDocumentManager'));
const AdminUserManager = React.lazy(() => import('./pages/AdminUserManager'));
const AdminBulkImport = React.lazy(() => import('./pages/AdminBulkImport'));
const AdminBulkExport = React.lazy(() => import('./pages/AdminBulkExport'));
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
                        <UserRoleHelper />
                        <Suspense fallback={<LoadingFallback />}>
                          <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/app/login" element={<Navigate to="/login" replace />} />
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
                        </Route>
                        
                        {/* Separate Admin Routes - Completely Independent */}
                        <Route path="/admin" element={
                          <ProtectedRoute adminOnly>
                            <AdminLayout />
                          </ProtectedRoute>
                        }>
                          <Route index element={<AdminDashboard />} />
                          <Route path="prices" element={<AdminPriceManager />} />
                          <Route path="suppliers" element={<AdminSupplierManager />} />
                          <Route path="agents" element={<AdminAgentManager />} />
                          <Route path="financing" element={<AdminFinancingManager />} />
                          <Route path="logistics" element={<AdminLogisticsManager />} />
                          <Route path="demand" element={<AdminDemandManager />} />
                          <Route path="risk" element={<AdminRiskManager />} />
                          <Route path="documents" element={<AdminDocumentManager />} />
                          <Route path="users" element={<AdminUserManager />} />
                          <Route path="import" element={<AdminBulkImport />} />
                          <Route path="export" element={<AdminBulkExport />} />
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
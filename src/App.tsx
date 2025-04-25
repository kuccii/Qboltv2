import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
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

// Loading fallback component
const LoadingFallback = () => (
  <LoadingSpinner fullScreen text="Loading..." />
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
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
                <Route path="admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
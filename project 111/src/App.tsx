import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ClassificationProvider } from './contexts/ClassificationContext';
import { MarketplaceProvider } from './contexts/MarketplaceContext';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/Landing/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Upload from './components/Upload/Upload';
import UserDashboard from './components/Dashboard/UserDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import History from './components/History/History';
import Marketplace from './components/Marketplace/Marketplace';
import ImpactTracker from './components/Impact/ImpactTracker';
import CarbonCalculator from './components/Calculator/CarbonCalculator';

function App() {
  return (
    <AuthProvider>
      <ClassificationProvider>
        <MarketplaceProvider>
          <Router>
            <div className="App">
              <Toaster position="top-right" />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/upload" element={
                  <ProtectedRoute>
                    <Layout>
                      <Upload />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <UserDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/history" element={
                  <ProtectedRoute>
                    <Layout>
                      <History />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/impact" element={
                  <ProtectedRoute>
                    <Layout>
                      <ImpactTracker />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/carbon-calculator" element={
                  <ProtectedRoute>
                    <Layout>
                      <CarbonCalculator />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/marketplace" element={
                  <ProtectedRoute>
                    <Layout>
                      <Marketplace />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </MarketplaceProvider>
      </ClassificationProvider>
    </AuthProvider>
  );
}

export default App;
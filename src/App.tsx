import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load pages for code splitting and better performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Loading component for suspense fallback
const LoadingScreen = () => (
  <div className="min-h-screen bg-bolt-dark flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="h-8 w-8 border-4 border-bolt-blue border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-bolt-light">Loading...</p>
    </div>
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
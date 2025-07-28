'use client';

import { useAuth } from './providers/AuthProvider';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading AI Component Generator...</h5>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
}
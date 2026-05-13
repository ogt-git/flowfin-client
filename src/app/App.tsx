import { useState } from 'react';
import {Routes, Route, Navigate } from 'react-router';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import CommunityListPage from './pages/community/CommunityListPage';
import CommunityDetailPage from './pages/community/CommunityDetailPage';
import CommunityFormPage from './pages/community/CommunityFormPage';
import CardLink from './pages/CardLink';
import AssetLink from './pages/AssetLink';
import ExpensesPage from './pages/ExpensesPage';

type AuthPage = 'login' | 'signup';

export default function App() {
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [userName, setUserName] = useState(() => localStorage.getItem('name') || '');

  const handleLoginSuccess = (token: string, name: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('name', name);
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    setIsLoggedIn(false);
    setUserName('');
  };

  if (!isLoggedIn) {
    if (authPage === 'signup') {
      return <SignupPage onNavigateToLogin={() => setAuthPage('login')} />;
    }
    return (
        <LoginPage
            onNavigateToSignup={() => setAuthPage('signup')}
            onLoginSuccess={handleLoginSuccess}
        />
    );
  }

  return (
      <Routes>
        <Route element={<DashboardLayout userName={userName} onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage userName={userName} />} />
          <Route path="/community" element={<CommunityListPage />} />
          <Route path="/community/new" element={<CommunityFormPage />} />
          <Route path="/community/:id" element={<CommunityDetailPage />} />
          <Route path="/community/:id/edit" element={<CommunityFormPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/card/link" element={<CardLink />} />
          <Route path="/asset/link" element={<AssetLink />} />

        </Route>
      </Routes>
  );
}

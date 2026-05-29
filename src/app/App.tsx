import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import TendencyTestPage from './components/auth/TendencyTestPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import CommunityListPage from './pages/community/CommunityListPage';
import CommunityDetailPage from './pages/community/CommunityDetailPage';
import CommunityFormPage from './pages/community/CommunityFormPage';
import CardLink from './pages/CardLink';
import AssetLink from './pages/AssetLink';
import StockDashboardPage from './pages/StockDashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import PortfolioPage from './pages/PortfolioPage';
import MyPage from './pages/MyPage';
import { Toaster } from './components/ui/sonner';
import { login, type RiskType } from '../api/auth';

type AuthPage = 'login' | 'signup';

export default function App() {
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [userName, setUserName] = useState(() => localStorage.getItem('name') || '');
  const [needsTendencyTest, setNeedsTendencyTest] = useState(false);

  const applyLoginData = (data: { accessToken: string; name: string; userId: number; email: string; riskType: string | null }) => {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('name', data.name);
    localStorage.setItem('userId', String(data.userId));
    localStorage.setItem('email', data.email);
    localStorage.setItem('riskType', data.riskType ?? '');
    setUserName(data.name);
    setIsLoggedIn(true);
  };

  const handleLoginSuccess = (data: { accessToken: string; name: string; userId: number; email: string; riskType: string | null }) => {
    applyLoginData(data);
  };

  const handleSignupSuccess = async (email: string, password: string) => {
    const data = await login({ email, password });
    applyLoginData(data);
    setNeedsTendencyTest(true);
  };

  const handleTendencyComplete = (riskType: RiskType) => {
    localStorage.setItem('riskType', riskType);
    setNeedsTendencyTest(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('riskType');
    setIsLoggedIn(false);
    setUserName('');
    setNeedsTendencyTest(false);
  };

  if (!isLoggedIn) {
    if (authPage === 'signup') {
      return (
        <SignupPage
          onNavigateToLogin={() => setAuthPage('login')}
          onSignupSuccess={handleSignupSuccess}
        />
      );
    }
    return (
      <LoginPage
        onNavigateToSignup={() => setAuthPage('signup')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (needsTendencyTest) {
    return <TendencyTestPage onComplete={handleTendencyComplete} />;
  }

  return (
    <>
      <Toaster richColors position="top-center" />
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
          <Route path="/stocks" element={<StockDashboardPage />} />
          <Route path="/portfolio/link" element={<PortfolioPage />} />
          <Route path="/mypage" element={<MyPage onLogout={handleLogout} />} />
        </Route>
      </Routes>
    </>
  );
}

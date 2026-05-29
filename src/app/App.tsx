import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router';
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
import { ServiceTermsPage } from './pages/terms/ServiceTermsPage';
import { PrivacyPolicyPage } from './pages/terms/PrivacyPolicyPage';
import { ThirdPartyConsentPage } from './pages/terms/ThirdPartyConsentPage';
import { Toaster } from './components/ui/sonner';
import { login, type RiskType } from '../api/auth';

type AuthPage = 'login' | 'signup';

export default function App() {
  const navigate = useNavigate();
  const [authPage, setAuthPage] = useState<AuthPage>(
    () => (sessionStorage.getItem('authPage') as AuthPage) ?? 'login',
  );

  const setAuthPagePersisted = (page: AuthPage) => {
    sessionStorage.setItem('authPage', page);
    setAuthPage(page);
  };
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [userName, setUserName] = useState(() => localStorage.getItem('name') || '');
  const [needsTendencyTest, setNeedsTendencyTest] = useState(
    () => !!localStorage.getItem('token') && !localStorage.getItem('riskType'),
  );

  const applyLoginData = (data: { accessToken: string; name: string; userId: number; email: string; riskType: string | null }) => {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('name', data.name);
    localStorage.setItem('userId', String(data.userId));
    localStorage.setItem('email', data.email);
    localStorage.setItem('riskType', data.riskType ?? '');
    sessionStorage.removeItem('authPage');
    setUserName(data.name);
    setIsLoggedIn(true);
  };

  const handleLoginSuccess = (data: { accessToken: string; name: string; userId: number; email: string; riskType: string | null }) => {
    applyLoginData(data);
    navigate('/dashboard', { replace: true });
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
    setAuthPagePersisted('login');
  };

  if (!isLoggedIn) {
    if (authPage === 'signup') {
      return (
        <SignupPage
          onNavigateToLogin={() => setAuthPagePersisted('login')}
          onSignupSuccess={handleSignupSuccess}
        />
      );
    }
    return (
      <LoginPage
        onNavigateToSignup={() => setAuthPagePersisted('signup')}
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
          <Route path="/terms/service" element={<div className="p-6 max-w-2xl mx-auto"><ServiceTermsPage /></div>} />
          <Route path="/terms/privacy" element={<div className="p-6 max-w-2xl mx-auto"><PrivacyPolicyPage /></div>} />
          <Route path="/terms/third-party" element={<div className="p-6 max-w-2xl mx-auto"><ThirdPartyConsentPage /></div>} />
        </Route>
      </Routes>
    </>
  );
}

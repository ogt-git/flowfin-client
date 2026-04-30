import { Routes, Route } from 'react-router';
import { Toaster } from './components/ui/sonner';
import Dashboard from './pages/Dashboard';
import CardLink from './pages/CardLink';
import AssetLink from './pages/AssetLink';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/card/link" element={<CardLink />} />
        <Route path="/asset/link" element={<AssetLink />} />
      </Routes>
      <Toaster />
    </>
  );
}

// client/styles/src/App.jsx
import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Landing from './pages/landing';
import InvestorDashboard from './pages/Investordashboard';
import UMKMDashboard from './pages/Umkmdashboard';
import CampaignPage from './pages/Campaignpage';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import Installments from './pages/Installments';
import Profile from './pages/Profile';
import MapView from './pages/MapView';

export default function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved).role : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedCampaignId'); // bersihkan juga
    setUser(null);
    setRole(null);
    navigate('/');
  };

  if (!role) {
    return <Auth setRole={setRole} setUser={setUser} />;
  }

  return (
    <div>
      <Navbar role={role} user={user} onLogout={handleLogout} />

      <Routes>
        {/* Publik */}
        <Route path="/"        element={<Landing role={role} />} />
        <Route path="/campaign" element={<CampaignPage role={role} />} />
        <Route path="/map"      element={<MapView role={role} />} />

        {/* Detail kampanye — CampaignDetail baca id sendiri dari localStorage */}
        <Route path="/campaign-detail" element={<CampaignDetail role={role} />} />

        {/* Owner only */}
        <Route path="/umkm"            element={role === 'owner'    ? <UMKMDashboard user={user} />                                                              : <Navigate to="/" />} />
        <Route path="/create-campaign" element={role === 'owner'    ? <CreateCampaign user={user} onSuccess={() => navigate('/umkm')} onCancel={() => navigate('/umkm')} /> : <Navigate to="/" />} />
        <Route path="/installments"    element={role === 'owner'    ? <Installments onBack={() => navigate('/umkm')} />                                          : <Navigate to="/" />} />

        {/* Investor only */}
        <Route path="/investor"        element={role === 'investor' ? <InvestorDashboard user={user} />                                                          : <Navigate to="/" />} />

        {/* Profil */}
        <Route path="/profile" element={<Profile user={user} setUser={setUser} role={role} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
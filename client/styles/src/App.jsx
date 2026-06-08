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
import AdminDashboard from './pages/Admindashboard';

export default function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved)?.role : null;
  });

  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
    navigate('/');
  };

  // Jika belum login / tidak ada role, kunci layar di halaman Auth
  if (!role) {
    return <Auth setRole={setRole} setUser={setUser} />;
  }

  // Admin dikunci hanya ke halaman dashboard-nya, tidak bisa akses route lain
  if (role === 'admin') {
    return (
      <div>
        <Navbar role={role} user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/admin" element={<AdminDashboard user={user} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div>
      <Navbar role={role} user={user} onLogout={handleLogout} />

      <Routes>
        {/* Halaman Publik & Umum */}
        <Route path="/" element={<Landing role={role} setSelectedCampaign={setSelectedCampaign} />} />
        <Route path="/campaign" element={<CampaignPage role={role} setSelectedCampaign={setSelectedCampaign} />} />
        <Route path="/map" element={<MapView role={role} setSelectedCampaign={setSelectedCampaign} />} />

        {/* Halaman Detail */}
        <Route path="/campaign-detail/:id" element={<CampaignDetail role={role} />} />

        {/* Proteksi Rute Khusus Owner UMKM */}
        <Route path="/umkm" element={role === 'owner' ? <UMKMDashboard user={user} /> : <Navigate to="/" />} />
        <Route path="/umkm/:tab" element={role === 'owner' ? <UMKMDashboard user={user} /> : <Navigate to="/" />} />
        <Route path="/create-campaign" element={role === 'owner' ? <CreateCampaign user={user} onSuccess={() => navigate('/umkm')} onCancel={() => navigate('/umkm')} /> : <Navigate to="/" />} />
        <Route path="/installments" element={role === 'owner' ? <Installments onBack={() => navigate('/umkm')} /> : <Navigate to="/" />} />

        {/* Proteksi Rute Khusus Investor */}
        <Route path="/investor" element={role === 'investor' ? <InvestorDashboard user={user} setSelectedCampaign={setSelectedCampaign} /> : <Navigate to="/" />} />

        {/* Proteksi Rute Khusus Admin */}
        <Route path="/admin" element={role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/" />} />

        {/* Rute Profil */}
        <Route path="/profile" element={<Profile user={user} setUser={setUser} role={role} />} />

        {/* Catch-all jika URL tidak ditemukan, balikkan ke luar */}
        <Route path="*" element={<Navigate to={role === 'admin' ? '/admin' : role === 'owner' ? '/umkm' : '/investor'} />} />
      </Routes>
    </div>
  );
}
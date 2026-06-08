// client/styles/src/App.jsx
import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'; // 👈 Import tools routing
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
import MapView from './pages/MapView'; // 👈 1. Import MapView baru kamu di sini

export default function App() {
  const navigate = useNavigate(); // Hook untuk mengontrol perpindahan URL via kode

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved).role : null;
  });

  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
    navigate('/'); // 👈 Otomatis tendang ke landing page saat logout
  };

  // Jika belum login, kunci layar di halaman Auth
  if (!role) {
    return <Auth setRole={setRole} setUser={setUser} />;
  }

  return (
    <div>
      {/* 💡 Prop page dan setPage dihapus karena Navbar sekarang mandiri membaca URL */}
      <Navbar role={role} user={user} onLogout={handleLogout} />

      {/* 🚀 PEMETAAN RUTE URL BARU UNTUK PROYEK KOMPETISI */}
      <Routes>
        {/* Halaman Publik & Umum */}
        <Route path="/" element={<Landing role={role} setSelectedCampaign={setSelectedCampaign} />} />
        <Route path="/campaign" element={<CampaignPage role={role} setSelectedCampaign={setSelectedCampaign} />} />

        {/* 🗺️ RUTE MAP BARU */}
        <Route path="/map" element={<MapView role={role} setSelectedCampaign={setSelectedCampaign} />} />

        {/* Halaman Detail (Proteksi: Jika data campaign kosong/F5, balikkan ke /campaign) */}
        <Route path="/campaign-detail/:id" element={<CampaignDetail role="investor" />} />
        {/* 🔒 Proteksi Rute Khusus Owner UMKM */}
        <Route path="/umkm" element={role === 'owner' ? <UMKMDashboard user={user} /> : <Navigate to="/" />} />
        <Route path="/create-campaign" element={role === 'owner' ? <CreateCampaign user={user} onSuccess={() => navigate('/umkm')} onCancel={() => navigate('/umkm')} /> : <Navigate to="/" />} />
        <Route path="/installments" element={role === 'owner' ? <Installments onBack={() => navigate('/umkm')} /> : <Navigate to="/" />} />

        {/* 🔒 Proteksi Rute Khusus Investor */}
        <Route path="/investor" element={role === 'investor' ? <InvestorDashboard user={user} setSelectedCampaign={setSelectedCampaign} /> : <Navigate to="/" />} />

        {/* Rute Profil */}
        <Route path="/profile" element={<Profile user={user} setUser={setUser} role={role} />} />

        {/* Jika ketik URL aneh-aneh, auto redirect ke landing */}
        {/* <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </div>
  );
}

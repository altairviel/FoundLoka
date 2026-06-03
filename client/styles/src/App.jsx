import { useState } from 'react';
import Navbar from '../src/components/Navbar';
// import Landing from '../src/pages/landing';
// import InvestorDashboard from '../src/pages/Investordashboard';
// import UMKMDashboard from '../src/pages/Umkmdashboard';
// import CampaignPage from '../src/pages/Campaignpage';
// import Analytics from '../src/pages/Analytics';
import Auth from '../src/pages/Auth';
// import Profile from '../src/pages/Profile';

export default function App() {
  //tambahkan state user
  //saat app pertama dibuka, coba ambil data user dari localStorage
  //supaya kalau user refresh, tidak perlu login ulang
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  //role diambil dari user di localStorage
  //bukan null setiap kali refresh
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) return JSON.parse(saved).role;
    return null;
  });

  const [page, setPage] = useState('landing');

  // Kalau belum login, tampilkan Auth
  if (!role) {
    return (
      // ✅ Perbaikan 3 — oper setUser ke Auth
      <Auth setRole={setRole} setPage={setPage} setUser={setUser} />
    );
  }

  return (
    <div>
      <Navbar role={role} setRole={setRole} page={page} setPage={setPage} />

      {/* {page === 'landing' && <Landing role={role} setPage={setPage} />}
      {page === 'investor' && <InvestorDashboard />}
      {page === 'umkm' && <UMKMDashboard />}
      {page === 'campaign' && <CampaignPage />}
      {page === 'analytics' && <Analytics />}
      {page === 'profile' && <Profile role={role} />} */}
    </div>
  );
}

// client/src/App.jsx
import { useState } from 'react';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import InvestorDashboard from './pages/InvestorDashboard';
import UMKMDashboard from './pages/UMKMDashboard';
import CampaignPage from './pages/CampaignPage';
import Profile from './pages/Profile';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) return JSON.parse(saved).role;
    return null;
  });

  const [page, setPage] = useState('landing');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
    setPage('landing');
  };

  if (!role) {
    return <Auth setRole={setRole} setPage={setPage} setUser={setUser} />;
  }

  return (
    <div>
      <Navbar role={role} page={page} setPage={setPage} user={user} onLogout={handleLogout} />

      {page === 'landing'  && <Landing role={role} setPage={setPage} />}
      {page === 'investor' && role === 'investor' && <InvestorDashboard user={user} setPage={setPage} />}
      {page === 'umkm'     && role === 'owner'    && <UMKMDashboard user={user} />}
      {page === 'campaign' && <CampaignPage role={role} />}
      {page === 'profile'  && <Profile user={user} setUser={setUser} role={role} />}
    </div>
  );
}
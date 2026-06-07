// client/styles/src/App.jsx
import { useState } from 'react';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Landing from './pages/landing';
import InvestorDashboard from './pages/Investordashboard';
import UMKMDashboard from './pages/Umkmdashboard';
import CampaignPage from './pages/Campaignpage';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
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

  const [page, setPage]                       = useState('landing');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

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

      {page === 'landing' && (
        <Landing role={role} setPage={setPage} setSelectedCampaign={setSelectedCampaign} />
      )}

      {page === 'campaign' && (
        <CampaignPage
          role={role}
          setPage={setPage}
          setSelectedCampaign={setSelectedCampaign}
        />
      )}

      {page === 'campaignDetail' && selectedCampaign && (
        <CampaignDetail
          campaign={selectedCampaign}
          role={role}
          onBack={() => setPage('campaign')}
        />
      )}

      {/* Owner only: buat kampanye baru */}
      {page === 'createCampaign' && role === 'owner' && (
        <CreateCampaign
          user={user}
          onSuccess={() => setPage('umkm')}
          onCancel={() => setPage('umkm')}
        />
      )}

      {page === 'investor' && role === 'investor' && (
        <InvestorDashboard user={user} setPage={setPage} setSelectedCampaign={setSelectedCampaign} />
      )}

      {page === 'umkm' && role === 'owner' && (
        <UMKMDashboard user={user} setPage={setPage} />
      )}

      {page === 'profile' && (
        <Profile user={user} setUser={setUser} role={role} />
      )}
    </div>
  );
}
import { useState } from "react";
import Navbar from "../components/Navbar";
import Landing from "../pages/landing";
import InvestorDashboard from "../pages/Investordashboard";
import UMKMDashboard from "../pages/Umkmdashboard";
import CampaignPage from "../pages/Campaignpage";
import Analytics from "../pages/Analytics";
import Auth from "../pages/Auth";       // Menggunakan komponen Auth yang baru
import Profile from "../pages/Profile"; // Mengimpor halaman Profil

export default function App() {
  const [role, setRole] = useState(null); 
  const [page, setPage] = useState("landing");

  // Cegat pengguna yang belum login, tampilkan halaman pendaftaran/login
  if (!role) {
    return <Auth setRole={setRole} setPage={setPage} />;
  }

  return (
    <div>
      <Navbar role={role} setRole={setRole} page={page} setPage={setPage} />
      
      {/* Route Switcher via State */}
      {/* PASTIKAN ADA role={role} DI SINI 👇 */}
      {page === "landing"   && <Landing role={role} setPage={setPage} />}
      
      {page === "investor"  && <InvestorDashboard />}
      {page === "umkm"      && <UMKMDashboard />}
      {page === "campaign"  && <CampaignPage />}
      {page === "analytics" && <Analytics />}
      {page === "profile"   && <Profile role={role} />}
    </div>
  );
}
import { useState } from "react";
import Navbar from "../components/Navbar";
import Landing from "../pages/Landing";
import InvestorDashboard from "../pages/Investordashboard";
import UMKMDashboard from "../pages/Umkmdashboard";
import CampaignPage from "../pages/Campaignpage";
import Analytics from "../pages/Analytics";
import Login from "../pages/Login"; // Import halaman Login yang baru dibuat

export default function App() {
  // State baru untuk menyimpan peran pengguna ("investor" atau "umkm")
  const [role, setRole] = useState(null); 
  const [page, setPage] = useState("landing");

  // Jika belum ada role yang dipilih, tampilkan Halaman Login saja
  if (!role) {
    return <Login setRole={setRole} setPage={setPage} />;
  }

  return (
    <div>
      {/* Kirimkan data role ke Navbar agar Navbar tahu menu apa yang harus ditampilkan */}
      <Navbar role={role} setRole={setRole} page={page} setPage={setPage} />
      
      {/* Route Switcher via State */}
      {page === "landing"   && <Landing setPage={setPage} />}
      {page === "investor"  && <InvestorDashboard />}
      {page === "umkm"      && <UMKMDashboard />}
      {page === "campaign"  && <CampaignPage />}
      {page === "analytics" && <Analytics />}
    </div>
  );
}
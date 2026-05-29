import { useState } from "react";
import Navbar from "../components/Navbar"; 
import Landing from "../pages/landing";
import InvestorDashboard from "../pages/Investordashboard";
import UMKMDashboard from "../pages/Umkmdashboard";
// Ubah dari "../pages/Campainpage" menjadi "../pages/Campaignpage"
import CampaignPage from "../pages/Campaignpage";
import Analytics from "../pages/Analytics";

export default function App() {
  const [page, setPage] = useState("landing");

  return (
    <div>
      <Navbar page={page} setPage={setPage} />
      
      {/* Route Switcher via State */}
      {page === "landing"   && <Landing setPage={setPage} />}
      {page === "investor"  && <InvestorDashboard />}
      {page === "umkm"      && <UMKMDashboard />}
      {page === "campaign"  && <CampaignPage />}
      {page === "analytics" && <Analytics />}
    </div>
  );
}
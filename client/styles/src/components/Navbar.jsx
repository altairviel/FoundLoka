// client/src/components/Navbar.jsx
import { T } from '../../tokens';

const NAV_LINKS = [
  { id: 'landing',  label: 'Beranda' },
  { id: 'campaign', label: 'Campaign' },
];

export default function Navbar({ role, page, setPage, user, onLogout }) {
  const dashboardPage = role === 'investor' ? 'investor' : 'umkm';
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <nav className="ff-nav">
      {/* Logo */}
      <button className="ff-nav-logo" onClick={() => setPage('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <img src="/Folk Fund.png" alt="FolkFund" style={{ height: 28, objectFit: 'contain' }} />
      </button>

      {/* Nav links tengah */}
      <div className="ff-nav-links">
        {NAV_LINKS.map((l) => (
          <button
            key={l.id}
            className={`ff-nav-link${page === l.id ? ' active' : ''}`}
            onClick={() => setPage(l.id)}
          >
            {l.label}
          </button>
        ))}
        <button
          className={`ff-nav-link${page === dashboardPage ? ' active' : ''}`}
          onClick={() => setPage(dashboardPage)}
        >
          Dashboard
        </button>
      </div>

      {/* Kanan: avatar + nama + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Avatar + nama → ke profile */}
        <button
          onClick={() => setPage('profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 8px', borderRadius: 6,
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: T.greenLight, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: T.green,
          }}>
            {initials}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.gray900, lineHeight: 1.2 }}>
              {user?.name || 'Pengguna'}
            </div>
            <div style={{ fontSize: 11, color: T.gray500, lineHeight: 1 }}>
              {role === 'investor' ? 'Investor' : role === 'owner' ? 'Pemilik UMKM' : 'Admin'}
            </div>
          </div>
        </button>

        {/* Tombol logout */}
        <button
          className="ff-btn ff-btn-sm"
          onClick={onLogout}
          style={{ fontSize: 12, color: '#B91C1C', borderColor: '#FECACA' }}
        >
          Keluar
        </button>
      </div>
    </nav>
  );
}
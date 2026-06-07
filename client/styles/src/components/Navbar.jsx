// client/styles/src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { T } from '../../tokens';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notification';

export default function Navbar({ role, page, setPage, user, onLogout }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false); // State untuk hamburger menu

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loadingNotif, setLoadingNotif]   = useState(false);
  
  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null); // Ref untuk menutup menu mobile jika klik di luar

  const dashboardPage = role === 'investor' ? 'investor' : role === 'admin' ? 'admin' : 'umkm';

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close notification dropdown
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
      // Close mobile menu
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !e.target.closest('.ff-hamburger-btn')) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.warn('Gagal fetch notifikasi:', err.message);
    }
  };

  const handleToggleNotif = async () => {
    setShowNotif(!showNotif);
    setShowUserMenu(false);
    setShowMobileMenu(false); // Tutup menu mobile jika buka notif
    if (!showNotif) {
      setLoadingNotif(true);
      await fetchNotifications();
      setLoadingNotif(false);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Gagal mark read:', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Gagal mark all read:', err.message);
    }
  };

  const navLinks = [
    { id: 'campaign',    label: 'Kampanye' },
    { id: 'map',         label: 'Peta' },
    { id: dashboardPage, label: 'Dashboard' },
  ];

  return (
    <>
      <nav className="ff-nav" style={{ 
        position: 'sticky', top: 0, zIndex: 100, 
        background: T.white, borderBottom: T.border,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: '60px' 
      }}>
        
        {/* Kiri: Hamburger + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Tombol Hamburger (Hanya muncul di Mobile lewat CSS) */}
          <button 
            className="ff-hamburger-btn"
            onClick={() => { setShowMobileMenu(!showMobileMenu); setShowNotif(false); setShowUserMenu(false); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 24, color: T.gray700, padding: 4
            }}
          >
            {showMobileMenu ? '✕' : '☰'}
          </button>

          {/* Logo → klik ke landing */}
          <button
            className="ff-nav-logo"
            onClick={() => { setPage('landing'); setShowMobileMenu(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <img src="/Folk Fund.png" alt="FolkFund" style={{ height: 28, objectFit: 'contain' }} />
          </button>
        </div>

        {/* Nav links tengah (Disembunyikan di Mobile via CSS .ff-nav-links) */}
        <div className="ff-nav-links">
          {navLinks.map((l) => (
            <button
              key={l.id}
              className={`ff-nav-link${page === l.id ? ' active' : ''}`}
              onClick={() => setPage(l.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 12px', color: page === l.id ? T.green : T.gray700,
                fontWeight: page === l.id ? 600 : 500, fontSize: 14
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Kanan: notif + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Bell notifikasi */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={handleToggleNotif}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px', borderRadius: 6, fontSize: 20, position: 'relative',
                color: T.gray700, display: 'flex', alignItems: 'center'
              }}
              title="Notifikasi"
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: '#DC2626', color: T.white,
                  borderRadius: '50%', fontSize: 10, fontWeight: 700,
                  width: 16, height: 16, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div style={{ position: 'absolute', right: -40, top: '120%', zIndex: 200 }}>
                <div style={{
                  width: 290, maxHeight: 400, overflowY: 'auto',
                  background: T.white, border: `1px solid ${T.gray200}`,
                  borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}>
                  <div style={{
                    padding: '12px 16px', borderBottom: `1px solid ${T.gray200}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>Notifikasi</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{ fontSize: 12, color: T.green, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  {loadingNotif ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: T.gray500, fontSize: 13 }}>
                      Memuat...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: T.gray500, fontSize: 13 }}>
                      Belum ada notifikasi.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && handleMarkOneRead(n.id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: `1px solid ${T.gray100}`,
                          background: n.is_read ? T.white : T.greenLight,
                          cursor: n.is_read ? 'default' : 'pointer',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 600, color: T.gray900, marginBottom: 2 }}>
                          {n.message || n.title}
                        </div>
                        <div style={{ fontSize: 11, color: T.gray500 }}>
                          {n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                          {!n.is_read && (
                            <span style={{ marginLeft: 8, color: T.green, fontWeight: 600 }}>● Baru</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar + dropdown user */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); setShowMobileMenu(false); }}
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
              
              <div className="ff-user-info" style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.gray900, lineHeight: 1.2 }}>
                  {user?.name?.split(' ')[0] || 'Pengguna'}
                </div>
                <div style={{ fontSize: 11, color: T.gray500, lineHeight: 1 }}>
                  {role === 'investor' ? 'Investor' : role === 'owner' ? 'Pemilik UMKM' : 'Admin'}
                </div>
              </div>
              <span style={{ fontSize: 10, color: T.gray500 }}>▾</span>
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '110%',
                background: T.white, border: T.border, borderRadius: 8,
                boxShadow: T.shadowMd, minWidth: 160, zIndex: 200,
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => { setPage('profile'); setShowUserMenu(false); }}
                  style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: 14, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: T.gray700 }}
                >
                  👤 Profil Saya
                </button>
                <div style={{ borderTop: T.border }} />
                <button
                  onClick={() => { onLogout(); setShowUserMenu(false); }}
                  style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: 14, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}
                >
                  ⇠ Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Menu Drawer Mobile */}
      {showMobileMenu && (
        <div 
          ref={mobileMenuRef}
          className="ff-mobile-menu"
          style={{
            position: 'fixed', top: '61px', left: 0, width: '100%',
            background: T.white, borderBottom: T.border, zIndex: 99,
            padding: '8px 0', boxShadow: T.shadowMd
          }}
        >
          {navLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => { setPage(l.id); setShowMobileMenu(false); }}
              style={{
                display: 'block', width: '100%', padding: '12px 24px',
                textAlign: 'left', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 16,
                color: page === l.id ? T.green : T.gray700,
                fontWeight: page === l.id ? 600 : 500,
                background: page === l.id ? T.greenLight : 'transparent'
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
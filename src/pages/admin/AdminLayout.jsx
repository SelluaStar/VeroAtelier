import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import './AdminLayout.css';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    // Check if user is admin
    if (profile && !profile.is_admin) {
      navigate('/');
    }
  }, [profile, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/coupons', icon: Tag, label: 'Coupons' }
  ];

  if (!profile?.is_admin) {
    return (
      <div className="admin-loading">
        <p>Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-text">VERO ATELIER</span>
            <span className="logo-badge">Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <p className="nav-section-title">MAIN</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="nav-section">
            <p className="nav-section-title">ACCOUNT</p>
            <button onClick={handleSignOut} className="nav-item logout">
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="admin-user">
            <div className="user-info">
              <p className="user-name">{profile?.full_name || 'Admin'}</p>
              <p className="user-role">Administrator</p>
            </div>
            <div className="user-avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} />
              ) : (
                <div className="avatar-placeholder">
                  {profile?.full_name?.charAt(0) || 'A'}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminLayout;

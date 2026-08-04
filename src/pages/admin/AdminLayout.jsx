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
  X,
  ChevronDown,
  Search,
  Bell,
  Settings,
  Zap
} from 'lucide-react';
import './AdminLayout.css';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    if (profile && !profile.is_admin) {
      navigate('/');
    }
  }, [profile, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: Package, label: 'Products' },
    {
      path: '/admin/orders',
      icon: ShoppingCart,
      label: 'Orders',
      expandable: true,
      expanded: ordersExpanded,
      setExpanded: setOrdersExpanded,
      subitems: [
        { path: '/admin/orders', label: 'All Orders' },
        { path: '/admin/orders/returns', label: 'Returns' },
        { path: '/admin/orders/tracking', label: 'Order Tracking' }
      ]
    },
    { path: '/admin/users', icon: Users, label: 'Customers' },
    { path: '/admin/coupons', icon: Tag, label: 'Sales' }
  ];

  const settingsItems = [
    {
      icon: Settings,
      label: 'Settings',
      expandable: true,
      expanded: settingsExpanded,
      setExpanded: setSettingsExpanded
    }
  ];

  if (!profile?.is_admin) {
    return (
      <div className="admin-loading">
        <p>Checking permissions...</p>
      </div>
    );
  }

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">VA</div>
            <div>
              <div className="logo-text">Vero Atelier</div>
            </div>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar-sidebar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} />
              ) : (
                <div className="avatar-placeholder-sidebar">
                  {profile?.full_name?.charAt(0) || 'A'}
                </div>
              )}
            </div>
            <div className="user-info-sidebar">
              <div className="user-name-sidebar">{profile?.full_name || 'Admin'}</div>
            </div>
            <ChevronDown size={16} style={{ color: '#9ca3af' }} />
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <p className="nav-section-title">MAIN</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              if (item.expandable) {
                return (
                  <div key={item.label}>
                    <div className={`nav-item-wrapper ${active ? 'active' : ''} ${item.expanded ? 'expanded' : ''}`}>
                      <Link
                        to={item.path}
                        className="nav-item-main"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon size={20} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                      </Link>
                      {item.subitems && (
                        <button
                          className="nav-expand-btn"
                          onClick={() => item.setExpanded(!item.expanded)}
                        >
                          <ChevronDown size={16} className="nav-expand-icon" />
                        </button>
                      )}
                    </div>
                    {item.expanded && item.subitems && (
                      <div className="nav-subitems">
                        {item.subitems.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className="nav-subitem"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${active ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="nav-section">
            <p className="nav-section-title">SETTINGS</p>
            {settingsItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`nav-item ${item.expanded ? 'expanded' : ''}`}
                  onClick={() => item.setExpanded && item.setExpanded(!item.expanded)}
                >
                  <Icon size={20} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.expandable && (
                    <ChevronDown size={16} className="nav-expand-icon" />
                  )}
                </button>
              );
            })}
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

          <div className="header-right">
            <div className="header-search">
              <Search size={18} style={{ color: '#9ca3af' }} />
              <input type="text" placeholder="Search anything" />
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>⌘K</span>
            </div>

            <div className="header-icons">
              <button className="header-icon-btn">
                <Bell size={20} />
                <span className="notification-badge">8</span>
              </button>

              <div className="admin-user">
                <div className="user-avatar">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {profile?.full_name?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>
                <ChevronDown size={16} style={{ color: '#6b7280' }} />
              </div>
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

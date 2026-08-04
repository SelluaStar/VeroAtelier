import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, ChevronDown, LayoutDashboard, LogOut, Settings, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { categories as mainCategories } from '../data/products';
import './Header.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  const { getCartCount } = useCart();
  const { user, profile, signOut } = useAuth();
  const searchRef = useRef(null);
  const accountRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountPanelOpen(false);
      }
    };
    if (accountPanelOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountPanelOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    setAccountPanelOpen(false);
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Account';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''} ${searchOpen ? 'search-active' : ''}`}>
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">VERO ATELIER</Link>
        </div>

        <nav className="header-nav">
          {mainCategories.map((category) => (
            <div
              key={category.id}
              className="nav-dropdown"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <Link to={`/shop/${category.id}`} className="nav-link">
                {category.name}
                {category.subcategories && <ChevronDown size={14} style={{ marginLeft: '4px' }} />}
              </Link>
              {category.subcategories && hoveredCategory === category.id && (
                <div className="dropdown-menu">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub}
                      to={`/shop/${category.id}?subcategory=${sub}`}
                      className="dropdown-link"
                    >
                      {sub.charAt(0).toUpperCase() + sub.slice(1)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="header-icons">
          <Link to="/shop" className="shop-all-btn desktop-only">Shop All</Link>

          <div ref={searchRef} className={`search-container ${searchOpen ? 'active' : ''}`}>
            <button className="icon-btn search-btn" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}>
              <Search size={20} />
            </button>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                className="search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={searchOpen}
              />
            </form>
          </div>

          {/* Account icon → popup panel */}
          <div ref={accountRef} className="account-panel-wrapper">
            <button
              className="icon-btn"
              aria-label="Account"
              onClick={() => setAccountPanelOpen((p) => !p)}
            >
              <User size={20} />
            </button>

            {accountPanelOpen && (
              <div className="account-panel">
                {user ? (
                  <>
                    <div className="account-panel-user">
                      <div className="account-panel-avatar">{initials}</div>
                      <div className="account-panel-info">
                        <span className="account-panel-name">{displayName}</span>
                        <span className="account-panel-email">{user.email}</span>
                      </div>
                    </div>

                    <div className="account-panel-divider" />

                    <Link to="/account" className="account-panel-item" onClick={() => setAccountPanelOpen(false)}>
                      <Settings size={15} />
                      Account Settings
                    </Link>
                    <Link to="/account/orders" className="account-panel-item" onClick={() => setAccountPanelOpen(false)}>
                      <Package size={15} />
                      My Orders
                    </Link>

                    {profile?.is_admin && (
                      <>
                        <div className="account-panel-divider" />
                        <Link to="/admin" className="account-panel-item admin-item" onClick={() => setAccountPanelOpen(false)}>
                          <LayoutDashboard size={15} />
                          Admin Dashboard
                        </Link>
                      </>
                    )}

                    <div className="account-panel-divider" />

                    <button className="account-panel-item signout-item" onClick={handleSignOut}>
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <p className="account-panel-guest">Sign in to your account</p>
                    <Link to="/signin" className="account-panel-btn-primary" onClick={() => setAccountPanelOpen(false)}>
                      Sign In
                    </Link>
                    <Link to="/signup" className="account-panel-btn-secondary" onClick={() => setAccountPanelOpen(false)}>
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
            <ShoppingBag size={20} />
            {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
          </Link>

          <button
            className="icon-btn mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link to="/shop" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Shop All
            </Link>
            {mainCategories.map((category) => (
              <div key={category.id} className="mobile-nav-group">
                <Link to={`/shop/${category.id}`} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  {category.name}
                </Link>
                {category.subcategories && (
                  <div className="mobile-sub-links">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub}
                        to={`/shop/${category.id}?subcategory=${sub}`}
                        className="mobile-nav-link sub"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {sub.charAt(0).toUpperCase() + sub.slice(1)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;

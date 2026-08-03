import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { categories as mainCategories } from '../data/products';
import './Header.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const { getCartCount } = useCart();
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''} ${searchOpen ? 'search-active' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <Link to="/">VERO ATELIER</Link>
        </div>

        {/* Desktop Navigation */}
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

        {/* Right Icons */}
        <div className="header-icons">
          {/* Shop All Button (Desktop Only) */}
          <Link to="/shop" className="shop-all-btn desktop-only">
            Shop All
          </Link>

          {/* Search Bar */}
          <div ref={searchRef} className={`search-container ${searchOpen ? 'active' : ''}`}>
            <button
              className="icon-btn search-btn"
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search size={20} />
            </button>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                className="search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                autoFocus={searchOpen}
              />
            </form>
          </div>

          <Link to="/account" className="icon-btn" aria-label="Account">
            <User size={20} />
          </Link>
          <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
            <ShoppingBag size={20} />
            {getCartCount() > 0 && (
              <span className="cart-badge">{getCartCount()}</span>
            )}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link
              to="/shop"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop All
            </Link>
            {mainCategories.map((category) => (
              <div key={category.id} className="mobile-nav-group">
                <Link
                  to={`/shop/${category.id}`}
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
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

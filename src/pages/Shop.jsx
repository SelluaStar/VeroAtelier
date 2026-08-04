import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronDown } from 'lucide-react';
import LoadingCard from '../components/LoadingCard';
import './Shop.css';

function Shop() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const subcategoryParam = searchParams.get('subcategory');
  const searchQuery = searchParams.get('search');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeGender, setActiveGender] = useState(category || 'all');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(subcategoryParam || null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const [filters, setFilters] = useState({
    brands: [],
    priceRange: [0, 5000],
    sortBy: 'newest',
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const isMainShopPage = !category;

  const allBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  // Build category slug → subcategories found in actual products
  const subcategoryMap = {};
  products.forEach(p => {
    if (p.category && p.subcategory) {
      const slug = p.category.toLowerCase();
      if (!subcategoryMap[slug]) subcategoryMap[slug] = new Set();
      subcategoryMap[slug].add(p.subcategory.trim());
    }
  });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [{ data: categoriesData }, { data: productsData }] = await Promise.all([
          supabase.from('categories').select('*').order('name', { ascending: true }),
          supabase.from('products').select('*').order('created_at', { ascending: false }),
        ]);
        setCategories(categoriesData || []);
        setProducts((productsData || []).map(p => ({
          ...p,
          images: p.images?.length ? p.images : p.image_url ? [p.image_url] : [],
          brand: p.brand || 'VeroAtelier',
        })));
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Close all dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFilterDropdown(null);
        setExpandedCategory(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    if (activeGender !== 'all' && !searchQuery) {
      filtered = filtered.filter(p =>
        p.category?.toLowerCase() === activeGender.toLowerCase()
      );
    }

    if (activeCategory && !searchQuery) {
      filtered = filtered.filter(p =>
        p.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (activeSubcategory && !searchQuery) {
      filtered = filtered.filter(p =>
        p.subcategory?.toLowerCase().trim() === activeSubcategory.toLowerCase().trim()
      );
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter(p => filters.brands.includes(p.brand));
    }

    filtered = filtered.filter(p =>
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    if (filters.sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (filters.sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);

    setFilteredProducts(filtered);
  }, [products, activeGender, activeCategory, activeSubcategory, filters, searchQuery]);

  const toggleBrand = (brand) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const clearAllFilters = () => {
    setFilters({ brands: [], priceRange: [0, 5000], sortBy: 'newest' });
    setActiveCategory(null);
    setActiveSubcategory(null);
    setActiveGender('all');
    setExpandedCategory(null);
  };

  // Label for the Category button
  const categoryLabel = activeSubcategory
    ? activeSubcategory
    : activeCategory
    ? categories.find(c => c.slug === activeCategory)?.name || activeCategory
    : 'Category';

  const hasActiveFilters = filters.brands.length > 0 || activeCategory ||
    activeSubcategory || filters.priceRange[0] > 0 || filters.priceRange[1] < 5000;

  return (
    <div className="shop-page">
      {/* Header */}
      <div className="shop-header-new">
        <div className="shop-header-content">
          <h1 className="shop-title-new">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : activeGender !== 'all'
              ? activeGender.charAt(0).toUpperCase() + activeGender.slice(1)
              : 'All Products'}
          </h1>

          {!searchQuery && isMainShopPage && (
            <div className="gender-toggle">
              {['all', 'men', 'women', 'unisex'].map(g => (
                <button
                  key={g}
                  className={`gender-btn ${activeGender === g ? 'active' : ''}`}
                  onClick={() => {
                    setActiveGender(g);
                    setActiveCategory(null);
                    setActiveSubcategory(null);
                  }}
                >
                  {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar" ref={dropdownRef}>
        <div className="filters-bar-content">
          <div className="filters-left">

            {/* Category dropdown — inline accordion */}
            <div className="filter-dropdown-wrapper">
              <button
                className={`filter-dropdown-btn ${activeCategory || activeSubcategory ? 'active-filter' : ''}`}
                onClick={() => {
                  setShowFilterDropdown(prev => prev === 'category' ? null : 'category');
                  setExpandedCategory(null);
                }}
              >
                {categoryLabel}
                <ChevronDown size={14} className={`chevron-icon ${showFilterDropdown === 'category' ? 'open' : ''}`} />
              </button>

              {showFilterDropdown === 'category' && (
                <div className="filter-dropdown-menu cat-accordion-menu">
                  {/* All */}
                  <button
                    className={`cat-row ${!activeCategory && !activeSubcategory ? 'cat-selected' : ''}`}
                    onClick={() => {
                      setActiveCategory(null);
                      setActiveSubcategory(null);
                      setExpandedCategory(null);
                      setShowFilterDropdown(null);
                    }}
                  >
                    All Categories
                    {!activeCategory && !activeSubcategory && <span className="cat-check">✓</span>}
                  </button>

                  {categories.map(cat => {
                    const subs = subcategoryMap[cat.slug.toLowerCase()]
                      ? [...subcategoryMap[cat.slug.toLowerCase()]]
                      : [];
                    const isOpen = expandedCategory === cat.id;
                    const isActive = activeCategory === cat.slug;

                    return (
                      <div key={cat.id} className="cat-group">
                        {/* Category row */}
                        <div className={`cat-row ${isActive && !activeSubcategory ? 'cat-selected' : ''}`}>
                          <button
                            className="cat-row-label"
                            onClick={() => {
                              setActiveCategory(cat.slug);
                              setActiveSubcategory(null);
                              if (subs.length === 0) setShowFilterDropdown(null);
                            }}
                          >
                            {isActive && !activeSubcategory && <span className="cat-check">✓</span>}
                            {cat.name}
                          </button>
                          {subs.length > 0 && (
                            <button
                              className="cat-expand-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCategory(prev => prev === cat.id ? null : cat.id);
                              }}
                            >
                              <ChevronDown size={13} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
                            </button>
                          )}
                        </div>

                        {/* Inline subcategory list */}
                        {isOpen && subs.length > 0 && (
                          <div className="cat-subs">
                            {subs.map(sub => (
                              <button
                                key={sub}
                                className={`cat-sub-row ${activeSubcategory === sub ? 'cat-selected' : ''}`}
                                onClick={() => {
                                  setActiveCategory(cat.slug);
                                  setActiveSubcategory(sub);
                                  setShowFilterDropdown(null);
                                  setExpandedCategory(null);
                                }}
                              >
                                {activeSubcategory === sub && <span className="cat-check">✓</span>}
                                {sub}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Brand */}
            {allBrands.length > 0 && (
              <div className="filter-dropdown-wrapper">
                <button
                  className={`filter-dropdown-btn ${filters.brands.length > 0 ? 'active-filter' : ''}`}
                  onClick={() => setShowFilterDropdown(prev => prev === 'brand' ? null : 'brand')}
                >
                  {filters.brands.length > 0 ? `Brand (${filters.brands.length})` : 'Brand'}
                  <ChevronDown size={14} className={`chevron-icon ${showFilterDropdown === 'brand' ? 'open' : ''}`} />
                </button>
                {showFilterDropdown === 'brand' && (
                  <div className="filter-dropdown-menu">
                    {allBrands.map(brand => (
                      <button
                        key={brand}
                        className={`cat-row ${filters.brands.includes(brand) ? 'cat-selected' : ''}`}
                        onClick={() => toggleBrand(brand)}
                      >
                        {filters.brands.includes(brand) && <span className="cat-check">✓</span>}
                        {brand}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Price */}
            <div className="filter-dropdown-wrapper">
              <button
                className="filter-dropdown-btn"
                onClick={() => setShowFilterDropdown(prev => prev === 'price' ? null : 'price')}
              >
                {filters.priceRange[0] > 0 || filters.priceRange[1] < 5000
                  ? `$${filters.priceRange[0]} – $${filters.priceRange[1]}`
                  : 'Price'}
                <ChevronDown size={14} className={`chevron-icon ${showFilterDropdown === 'price' ? 'open' : ''}`} />
              </button>
              {showFilterDropdown === 'price' && (
                <div className="filter-dropdown-menu price-menu">
                  <div className="price-slider-container">
                    <div className="price-values">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                    <div className="dual-range-slider">
                      <input type="range" min="0" max="5000" step="50"
                        value={filters.priceRange[0]}
                        onChange={e => {
                          const v = Number(e.target.value);
                          if (v < filters.priceRange[1])
                            setFilters(prev => ({ ...prev, priceRange: [v, prev.priceRange[1]] }));
                        }}
                        className="range-slider range-min"
                      />
                      <input type="range" min="0" max="5000" step="50"
                        value={filters.priceRange[1]}
                        onChange={e => {
                          const v = Number(e.target.value);
                          if (v > filters.priceRange[0])
                            setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], v] }));
                        }}
                        className="range-slider range-max"
                      />
                      <div className="slider-track"></div>
                      <div className="slider-range" style={{
                        left: `${(filters.priceRange[0] / 5000) * 100}%`,
                        right: `${100 - (filters.priceRange[1] / 5000) * 100}%`
                      }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <button className="clear-filters-btn" onClick={clearAllFilters}>Clear All</button>
            )}
          </div>

          <div className="filters-right">
            <select
              className="sort-select-new"
              value={filters.sortBy}
              onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="shop-products-new">
        <p className="results-count-new">
          {isLoading ? '' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'}`}
          {activeSubcategory && !isLoading && (
            <span style={{ marginLeft: '0.75rem', color: '#666' }}>
              in <strong>{activeSubcategory}</strong>
              <button
                onClick={() => setActiveSubcategory(null)}
                style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
              >×</button>
            </span>
          )}
        </p>

        <div className="products-grid-new">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, i) => <LoadingCard key={i} type="product" />)
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <Link key={product.id} to={`/product/${product.id}`} className="product-card-new">
                <div className="product-image-new">
                  <img
                    src={product.images[0] || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="product-img"
                  />
                  {product.featured && <span className="discount-badge">Featured</span>}
                </div>
                <div className="product-details-new">
                  {product.brand && <div className="product-brand-new">{product.brand}</div>}
                  <h3 className="product-name-new">{product.name}</h3>
                  <div className="product-pricing">
                    <span className="product-price-new">${product.price}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-results-new">
              <p>No items found matching your filters.</p>
              <button className="btn-primary" onClick={clearAllFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Shop;

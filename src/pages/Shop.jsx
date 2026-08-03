import { useState, useEffect } from 'react';
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
  const [filters, setFilters] = useState({
    brands: [],
    subcategories: subcategoryParam ? [subcategoryParam] : [],
    priceRange: [0, 5000],
    sortBy: 'newest',
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(null);

  // Check if we're on a category page
  const isMainShopPage = !category;

  // Get unique brands
  const allBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  // Fetch categories and products from Supabase
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (catError) throw catError;
        setCategories(categoriesData || []);

        // Fetch products
        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (prodError) throw prodError;

        // Transform data
        const transformedProducts = (productsData || []).map(product => ({
          ...product,
          images: product.images?.length ? product.images : product.image_url ? [product.image_url] : [],
          brand: product.brand || 'VeroAtelier'
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Update filters when URL param changes
  useEffect(() => {
    if (subcategoryParam && !filters.subcategories.includes(subcategoryParam)) {
      setFilters(prev => ({
        ...prev,
        subcategories: [subcategoryParam]
      }));
    }
  }, [subcategoryParam]);

  useEffect(() => {
    if (products.length === 0) return;

    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        (product.brand && product.brand.toLowerCase().includes(query)) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query))
      );
    }

    // Filter by category (gender/department)
    if (activeGender !== 'all' && !searchQuery) {
      filtered = filtered.filter((product) =>
        product.category && product.category.toLowerCase() === activeGender.toLowerCase()
      );
    }

    // Filter by selected subcategories
    if (filters.subcategories.length > 0) {
      filtered = filtered.filter((product) =>
        product.subcategory && filters.subcategories.includes(product.subcategory.toLowerCase())
      );
    }

    // Filter by brands
    if (filters.brands.length > 0) {
      filtered = filtered.filter((product) =>
        product.brand && filters.brands.includes(product.brand)
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    );

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, activeGender, filters, searchQuery]);

  const toggleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      brands: [],
      subcategories: [],
      priceRange: [0, 5000],
      sortBy: 'newest',
    });
  };

  return (
    <div className="shop-page">
      {/* Header with Gender Switcher */}
      <div className="shop-header-new">
        <div className="shop-header-content">
          <h1 className="shop-title-new">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : category
              ? category.charAt(0).toUpperCase() + category.slice(1)
              : 'All Products'}
          </h1>

          {/* Category Toggle - Only show on main shop page */}
          {!searchQuery && isMainShopPage && (
            <div className="gender-toggle">
              <button
                className={`gender-btn ${activeGender === 'all' ? 'active' : ''}`}
                onClick={() => setActiveGender('all')}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`gender-btn ${activeGender === cat.slug ? 'active' : ''}`}
                  onClick={() => setActiveGender(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="filters-bar-content">
          <div className="filters-left">
            {/* Category Dropdown */}
            <div className="filter-dropdown-wrapper">
              <button
                className="filter-dropdown-btn"
                onClick={() => setShowFilterDropdown(showFilterDropdown === 'category' ? null : 'category')}
              >
                Category
                <ChevronDown size={16} />
              </button>
              {showFilterDropdown === 'category' && (
                <div className="filter-dropdown-menu">
                  {categories.map(cat => (
                    <label key={cat.id} className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.subcategories.includes(cat.slug)}
                        onChange={() => toggleFilter('subcategories', cat.slug)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Brand Dropdown */}
            <div className="filter-dropdown-wrapper">
              <button
                className="filter-dropdown-btn"
                onClick={() => setShowFilterDropdown(showFilterDropdown === 'brand' ? null : 'brand')}
              >
                Brand
                <ChevronDown size={16} />
              </button>
              {showFilterDropdown === 'brand' && (
                <div className="filter-dropdown-menu">
                  {allBrands.map(brand => (
                    <label key={brand} className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => toggleFilter('brands', brand)}
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range Dropdown */}
            <div className="filter-dropdown-wrapper">
              <button
                className="filter-dropdown-btn"
                onClick={() => setShowFilterDropdown(showFilterDropdown === 'price' ? null : 'price')}
              >
                Price
                <ChevronDown size={16} />
              </button>
              {showFilterDropdown === 'price' && (
                <div className="filter-dropdown-menu price-menu">
                  <div className="price-slider-container">
                    <div className="price-values">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                    <div className="dual-range-slider">
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="50"
                        value={filters.priceRange[0]}
                        onChange={(e) => {
                          const newMin = Number(e.target.value);
                          if (newMin < filters.priceRange[1]) {
                            setFilters(prev => ({
                              ...prev,
                              priceRange: [newMin, prev.priceRange[1]]
                            }));
                          }
                        }}
                        className="range-slider range-min"
                      />
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="50"
                        value={filters.priceRange[1]}
                        onChange={(e) => {
                          const newMax = Number(e.target.value);
                          if (newMax > filters.priceRange[0]) {
                            setFilters(prev => ({
                              ...prev,
                              priceRange: [prev.priceRange[0], newMax]
                            }));
                          }
                        }}
                        className="range-slider range-max"
                      />
                      <div className="slider-track"></div>
                      <div
                        className="slider-range"
                        style={{
                          left: `${(filters.priceRange[0] / 5000) * 100}%`,
                          right: `${100 - (filters.priceRange[1] / 5000) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(filters.brands.length > 0 || filters.subcategories.length > 0) && (
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                Clear All
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="filters-right">
            <select
              className="sort-select-new"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, sortBy: e.target.value }))
              }
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
          {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
        </p>

        <div className="products-grid-new">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, index) => (
              <LoadingCard key={index} type="product" />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="product-card-new"
              >
                <div className="product-image-new">
                  <img
                    src={product.images[0] || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="product-img"
                  />
                  {product.featured && (
                    <span className="discount-badge">Featured</span>
                  )}
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
              <button className="btn-primary" onClick={clearAllFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Shop;

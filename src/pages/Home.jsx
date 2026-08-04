import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { categories, subcategories } from '../data/products';
import './Home.css';

function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trendingBrands, setTrendingBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch featured products
      const { data: featuredData } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(20);

      // Fetch new arrivals - last 8 items added
      const { data: arrivalsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      // Fetch all brands and get top viewed ones
      const { data: brandsData } = await supabase
        .from('products')
        .select('brand, view_count')
        .not('brand', 'is', null);

      // Aggregate brands by view count
      const brandViewCounts = {};
      brandsData?.forEach(product => {
        if (product.brand) {
          brandViewCounts[product.brand] = (brandViewCounts[product.brand] || 0) + (product.view_count || 0);
        }
      });

      // Sort brands by total views and get top 6
      const sortedBrands = Object.entries(brandViewCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([brand]) => brand);

      setFeatured(featuredData || []);
      setNewArrivals(arrivalsData || []);
      setTrendingBrands(sortedBrands);
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section - Split with Image & Text */}
      <section className="hero-modern">
        <div className="hero-image-side">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2670&auto=format&fit=crop"
            alt="Fashion collection"
          />
        </div>
        <div className="hero-content-side">
          <span className="hero-tag">SPRING 2024 COLLECTION</span>
          <h1 className="hero-heading">
            Pre-Loved<br />
            Luxury That<br />
            Lasts
          </h1>
          <p className="hero-subtext">
            Authenticated designer pieces at 50-80% below retail.
            Sustainable fashion meets timeless style.
          </p>
          <div className="hero-buttons">
            <Link to="/shop/women" className="btn-primary">Shop Women</Link>
            <Link to="/shop/men" className="btn-secondary">Shop Men</Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="trust-bar">
        <div className="trust-item">
          <h4>100%</h4>
          <p>Authenticated</p>
        </div>
        <div className="trust-item">
          <h4>50-80%</h4>
          <p>Below Retail</p>
        </div>
        <div className="trust-item">
          <h4>14 Day</h4>
          <p>Easy Returns</p>
        </div>
        <div className="trust-item">
          <h4>2,500+</h4>
          <p>Items</p>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="categories-modern">
        <h2 className="section-heading">Shop by Category</h2>
        <div className="category-grid-modern">
          {categories.map((category) => (
            <Link key={category.id} to={`/shop/${category.id}`} className="category-card-modern">
              <div className="category-img">
                <img src={category.image} alt={category.name} />
              </div>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Subcategories Showcase */}
      <section className="subcategories-section">
        <h2 className="section-heading">Shop by Style</h2>
        <div className="subcategories-grid">
          <Link to="/shop/women/shoes" className="subcategory-card">
            <div className="subcategory-img">
              <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop" alt="Shoes" />
            </div>
            <div className="subcategory-overlay">
              <h3>Shoes</h3>
              <p>Designer Footwear</p>
            </div>
          </Link>
          <Link to="/shop/women/bags" className="subcategory-card">
            <div className="subcategory-img">
              <img src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop" alt="Bags" />
            </div>
            <div className="subcategory-overlay">
              <h3>Bags</h3>
              <p>Luxury Handbags</p>
            </div>
          </Link>
          <Link to="/shop/women/accessories" className="subcategory-card">
            <div className="subcategory-img">
              <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop" alt="Accessories" />
            </div>
            <div className="subcategory-overlay">
              <h3>Accessories</h3>
              <p>Complete Your Look</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="featured-header">
          <h2 className="section-heading">Featured This Week</h2>
          <Link to="/shop" className="view-all-link">View All</Link>
        </div>
        <div className="featured-scroll">
          {featured.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="featured-card">
              <div className="featured-img">
                <img src={product.images?.[0]} alt={product.name} />
                <span className="condition-label">{product.condition}</span>
              </div>
              <div className="featured-info">
                <h3>{product.brand}</h3>
                <p>{product.name}</p>
                <div className="price-info">
                  <span className="current">${product.price}</span>
                  {product.original_price && (
                    <>
                      <span className="original">${product.original_price}</span>
                      <span className="discount">-{Math.round((1 - product.price / product.original_price) * 100)}%</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="arrivals-modern">
        <div className="arrivals-header-modern">
          <h2 className="section-heading">New Arrivals</h2>
          <Link to="/shop" className="view-all-link">View All</Link>
        </div>
        <div className="arrivals-grid">
          {newArrivals.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="arrival-card">
              <div className="arrival-img">
                <img src={product.images?.[0]} alt={product.name} />
              </div>
              <div className="arrival-info">
                <h4>{product.brand}</h4>
                <p>{product.name}</p>
                <span className="price">${product.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Brands */}
      <section className="brands-section">
        <h2 className="section-heading">Trending Brands</h2>
        <div className="brands-grid">
          {trendingBrands.map((brand) => (
            <Link key={brand} to={`/shop`} className="brand-card">
              <h3>{brand}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Style Guide Banner */}
      <section className="style-guide-banner">
        <div className="style-guide-content">
          <div className="style-guide-text">
            <span className="style-tag">CURATED FOR YOU</span>
            <h2>Find Your Style</h2>
            <p>Discover pieces that match your unique aesthetic. From minimalist elegance to bold statements, we have something for every wardrobe.</p>
            <Link to="/shop" className="btn-primary">Explore Collections</Link>
          </div>
          <div className="style-guide-images">
            <div className="style-img">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop" alt="Style 1" />
            </div>
            <div className="style-img">
              <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop" alt="Style 2" />
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Banner */}
      <section className="sustainability-banner">
        <div className="banner-content">
          <h2>Why Shop?</h2>
          <div className="benefits-grid">
            <div className="benefit">
              <h3></h3>
              <h4>Sustainable</h4>
              <p>Reduce fashion waste by giving luxury items a second life</p>
            </div>
            <div className="benefit">
              <h3></h3>
              <h4>Save Money</h4>
              <p>Pay 50-80% less than retail for the same designer quality</p>
            </div>
            <div className="benefit">
              <h3></h3>
              <h4>Authenticated</h4>
              <p>Every item is verified by our team of experts</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

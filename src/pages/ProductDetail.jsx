import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Check, Heart, Pencil } from 'lucide-react';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Normalise images field
      const images = data.images?.length
        ? data.images
        : data.image_url
        ? [data.image_url]
        : [];

      const normalised = { ...data, images, sizes: data.size ? data.size.split(',').map(s => s.trim()) : [] };
      setProduct(normalised);

      // Fetch related products from same category
      const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('category', data.category)
        .neq('id', id)
        .limit(4);

      setRelatedProducts((related || []).map(p => ({
        ...p,
        images: p.images?.length ? p.images : p.image_url ? [p.image_url] : []
      })));
    } catch (err) {
      console.error('Error fetching product:', err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="not-found-page">
        <div className="not-found-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found-page">
        <div className="not-found-content">
          <h1>Product not found</h1>
          <p>The item you're looking for doesn't exist or has been removed.</p>
          <Link to="/shop" className="btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      addToast('Please select a size', 'error');
      return;
    }
    addToCart(product, selectedSize);
    addToast(`${product.name} added to cart!`, 'success');
  };

  const originalPrice = product.original_price || product.originalPrice;
  const savings = originalPrice ? originalPrice - product.price : 0;
  const savingsPercent = originalPrice ? Math.round((savings / originalPrice) * 100) : 0;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="breadcrumb">
          <Link to="/shop" className="breadcrumb-link">
            <ChevronLeft size={18} />
            Shop
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.category}</span>
        </div>

        {/* Admin edit bar */}
        {profile?.is_admin && product && (
          <div className="admin-edit-bar">
            <span className="admin-edit-label">Admin</span>
            <button
              className="admin-edit-btn"
              onClick={() => navigate('/admin/products', { state: { editProductId: product.id } })}
            >
              <Pencil size={14} />
              Edit Product
            </button>
          </div>
        )}

        <div className="product-detail-layout">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="gallery-main">
              {product.images[selectedImage] ? (
                <img src={product.images[selectedImage]} alt={product.name} className="gallery-main-img" />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                  No image
                </div>
              )}
              {originalPrice && savingsPercent > 0 && (
                <div className="gallery-badge">-{savingsPercent}% OFF</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="gallery-thumbnails">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`gallery-thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`View ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="product-info-panel">
            <div className="product-info-header">
              <div>
                {product.brand && <div className="product-brand-badge">{product.brand}</div>}
                <h1 className="product-info-title">{product.name}</h1>
              </div>
              <button
                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label="Add to favorites"
              >
                <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="product-info-pricing">
              <div className="pricing-main">
                <span className="pricing-current">${Number(product.price).toFixed(2)}</span>
                {originalPrice && (
                  <span className="pricing-original">${Number(originalPrice).toFixed(2)}</span>
                )}
              </div>
              {originalPrice && savings > 0 && (
                <div className="pricing-savings">
                  You save ${savings.toFixed(2)} ({savingsPercent}% off retail)
                </div>
              )}
            </div>

            <div className="product-features">
              <div className="feature-item">
                <Check size={18} />
                <span>100% Authenticated</span>
              </div>
              {product.condition && (
                <div className="feature-item">
                  <Check size={18} />
                  <span>{product.condition} Condition</span>
                </div>
              )}
              <div className="feature-item">
                <Check size={18} />
                <span>14-Day Returns</span>
              </div>
            </div>

            {product.sizes?.length > 0 && (
              <div className="size-selection">
                <div className="size-selection-header">
                  <h3>Select Size</h3>
                  <button className="size-guide-btn">Size Guide</button>
                </div>
                <div className="size-options-grid">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.sizes?.length > 0 && !selectedSize}
            >
              {product.sizes?.length > 0 && !selectedSize ? 'Select a Size' : 'Add to Cart'}
            </button>

            {product.description && (
              <div className="product-description-panel">
                <h3>Product Details</h3>
                <p>{product.description}</p>
              </div>
            )}

            <div className="product-additional-info">
              <details className="info-accordion">
                <summary>Shipping & Returns</summary>
                <div className="accordion-content">
                  <p>Free standard shipping on orders over $100. Returns accepted within 14 days of delivery.</p>
                </div>
              </details>
              <details className="info-accordion">
                <summary>Authentication Process</summary>
                <div className="accordion-content">
                  <p>Every item is thoroughly inspected and authenticated by our team of luxury goods experts.</p>
                </div>
              </details>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2 className="related-heading">You May Also Like</h2>
            <div className="related-products-grid">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} to={`/product/${rp.id}`} className="related-product-card">
                  <div className="related-product-img">
                    {rp.images[0] && <img src={rp.images[0]} alt={rp.name} />}
                  </div>
                  <div className="related-product-info">
                    {rp.brand && <div className="related-product-brand">{rp.brand}</div>}
                    <h4 className="related-product-name">{rp.name}</h4>
                    <div className="related-product-price">${Number(rp.price).toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;

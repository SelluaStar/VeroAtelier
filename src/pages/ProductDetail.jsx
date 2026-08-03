import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ChevronLeft, Check, Heart } from 'lucide-react';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { addToast } = useToast();

  if (!product) {
    return (
      <div className="not-found-page">
        <div className="not-found-content">
          <h1>Product not found</h1>
          <p>The item you're looking for doesn't exist or has been removed.</p>
          <Link to="/shop" className="btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      addToast('Please select a size', 'error');
      return;
    }
    addToCart(product, selectedSize);
    addToast(`${product.name} added to cart!`, 'success');
  };

  const savings = product.originalPrice - product.price;
  const savingsPercent = Math.round((savings / product.originalPrice) * 100);

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/shop" className="breadcrumb-link">
            <ChevronLeft size={18} />
            Shop
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.category}</span>
        </div>

        <div className="product-detail-layout">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="gallery-main">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="gallery-main-img"
              />
              {product.originalPrice && (
                <div className="gallery-badge">
                  -{savingsPercent}% OFF
                </div>
              )}
            </div>
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
          </div>

          {/* Product Information */}
          <div className="product-info-panel">
            {/* Header */}
            <div className="product-info-header">
              <div>
                <div className="product-brand-badge">{product.brand}</div>
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

            {/* Pricing */}
            <div className="product-info-pricing">
              <div className="pricing-main">
                <span className="pricing-current">${product.price}</span>
                {product.originalPrice && (
                  <span className="pricing-original">${product.originalPrice}</span>
                )}
              </div>
              {product.originalPrice && (
                <div className="pricing-savings">
                  You save ${savings} ({savingsPercent}% off retail)
                </div>
              )}
            </div>

            {/* Key Features */}
            <div className="product-features">
              <div className="feature-item">
                <Check size={18} />
                <span>100% Authenticated</span>
              </div>
              <div className="feature-item">
                <Check size={18} />
                <span>{product.condition} Condition</span>
              </div>
              <div className="feature-item">
                <Check size={18} />
                <span>14-Day Returns</span>
              </div>
            </div>

            {/* Size Selection */}
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

            {/* Add to Cart */}
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={!selectedSize}
            >
              {selectedSize ? 'Add to Cart' : 'Select a Size'}
            </button>

            {/* Description */}
            <div className="product-description-panel">
              <h3>Product Details</h3>
              <p>{product.description}</p>
            </div>

            {/* Additional Info */}
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2 className="related-heading">You May Also Like</h2>
            <div className="related-products-grid">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="related-product-card"
                >
                  <div className="related-product-img">
                    <img src={relatedProduct.images[0]} alt={relatedProduct.name} />
                  </div>
                  <div className="related-product-info">
                    <div className="related-product-brand">{relatedProduct.brand}</div>
                    <h4 className="related-product-name">{relatedProduct.name}</h4>
                    <div className="related-product-price">${relatedProduct.price}</div>
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

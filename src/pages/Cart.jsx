import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, Lock, Package, RefreshCcw } from 'lucide-react';
import './Cart.css';

function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="empty-cart-page">
        <div className="empty-cart-content">
          <div className="empty-cart-icon">
            <ShoppingBag size={80} strokeWidth={1} />
          </div>
          <h1 className="empty-cart-title">Your Cart is Empty</h1>
          <p className="empty-cart-text">Start adding items to your cart and they'll appear here.</p>
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 200 ? 0 : 15;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-page-header">
          <div>
            <h1 className="cart-page-title">Shopping Cart</h1>
            <p className="cart-page-subtitle">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button className="clear-all-btn" onClick={clearCart}>
            Clear All
          </button>
        </div>

        <div className="cart-page-layout">
          {/* Cart Items List */}
          <div className="cart-items-section">
            {/* Free Shipping Progress */}
            {subtotal < 200 && (
              <div className="shipping-progress-card">
                <div className="shipping-progress-header">
                  <Package size={20} />
                  <span>Add ${(200 - subtotal).toFixed(2)} more for FREE shipping</span>
                </div>
                <div className="shipping-progress-bar">
                  <div
                    className="shipping-progress-fill"
                    style={{ width: `${Math.min((subtotal / 200) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="cart-item-card">
                  <Link to={`/product/${item.id}`} className="cart-item-image-wrapper">
                    <img src={item.images[0]} alt={item.name} className="cart-item-img" />
                  </Link>

                  <div className="cart-item-content">
                    <div className="cart-item-header">
                      <div className="cart-item-info">
                        <div className="cart-item-brand-badge">{item.brand}</div>
                        <Link to={`/product/${item.id}`} className="cart-item-name-link">
                          <h3 className="cart-item-title">{item.name}</h3>
                        </Link>
                        <div className="cart-item-meta-info">
                          <span>Size: {item.size}</span>
                          <span className="meta-separator">•</span>
                          <span>{item.condition}</span>
                        </div>
                      </div>

                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id, item.size)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="cart-item-footer">
                      <div className="cart-item-quantity">
                        <button
                          className="quantity-btn-new"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          className="quantity-btn-new"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="cart-item-pricing">
                        {item.originalPrice && (
                          <span className="cart-item-original-price">${item.originalPrice}</span>
                        )}
                        <span className="cart-item-current-price">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="cart-summary-section">
            <div className="cart-summary-card">
              <h2 className="cart-summary-title">Order Summary</h2>

              <div className="cart-summary-rows">
                <div className="summary-row-new">
                  <span className="summary-label">Subtotal</span>
                  <span className="summary-value">${subtotal.toFixed(2)}</span>
                </div>

                <div className="summary-row-new">
                  <span className="summary-label">Shipping</span>
                  <span className="summary-value">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>

                <div className="summary-row-new">
                  <span className="summary-label">Tax (8%)</span>
                  <span className="summary-value">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="summary-total-row">
                <span className="summary-total-label">Total</span>
                <span className="summary-total-value">${total.toFixed(2)}</span>
              </div>

              <button className="checkout-btn-new" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>

              <Link to="/shop" className="continue-shopping-link">
                Continue Shopping
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="cart-trust-badges">
              <div className="cart-trust-item">
                <Lock size={18} />
                <span>Secure Checkout</span>
              </div>
              <div className="cart-trust-item">
                <Package size={18} />
                <span>Authenticated Items</span>
              </div>
              <div className="cart-trust-item">
                <RefreshCcw size={18} />
                <span>14-Day Returns</span>
              </div>
            </div>

            {/* Accepted Payment Methods */}
            <div className="payment-methods">
              <p className="payment-methods-title">We Accept</p>
              <div className="payment-icons">
                <div className="payment-icon">💳</div>
                <div className="payment-icon">💰</div>
                <div className="payment-icon">🔒</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;

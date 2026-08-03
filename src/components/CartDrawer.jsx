import { Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

function CartDrawer() {
  const { cart, removeFromCart, getCartTotal, showCartDrawer, setShowCartDrawer } = useCart();

  const subtotal = getCartTotal();

  if (!showCartDrawer) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-drawer-backdrop ${showCartDrawer ? 'active' : ''}`}
        onClick={() => setShowCartDrawer(false)}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${showCartDrawer ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">
            <ShoppingBag size={20} />
            Cart ({cart.length})
          </h2>
          <button
            className="cart-drawer-close"
            onClick={() => setShowCartDrawer(false)}
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        <div className="cart-drawer-content">
          {cart.length === 0 ? (
            <div className="cart-drawer-empty">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="cart-drawer-items">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="cart-drawer-item">
                    <Link
                      to={`/product/${item.id}`}
                      className="cart-drawer-item-image"
                      onClick={() => setShowCartDrawer(false)}
                    >
                      <img src={item.images[0]} alt={item.name} />
                    </Link>

                    <div className="cart-drawer-item-details">
                      <Link
                        to={`/product/${item.id}`}
                        className="cart-drawer-item-name"
                        onClick={() => setShowCartDrawer(false)}
                      >
                        {item.name}
                      </Link>
                      <div className="cart-drawer-item-meta">
                        <span>{item.brand}</span>
                        <span>•</span>
                        <span>Size {item.size}</span>
                      </div>
                      <div className="cart-drawer-item-footer">
                        <span className="cart-drawer-item-quantity">Qty: {item.quantity}</span>
                        <span className="cart-drawer-item-price">${item.price * item.quantity}</span>
                      </div>
                    </div>

                    <button
                      className="cart-drawer-item-remove"
                      onClick={() => removeFromCart(item.id, item.size)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-drawer-footer">
                <div className="cart-drawer-subtotal">
                  <span>Subtotal</span>
                  <span className="cart-drawer-subtotal-amount">${subtotal.toFixed(2)}</span>
                </div>

                <Link
                  to="/cart"
                  className="cart-drawer-btn-primary"
                  onClick={() => setShowCartDrawer(false)}
                >
                  View Cart
                </Link>

                <button className="cart-drawer-btn-secondary">
                  Checkout
                </button>

                <button
                  className="cart-drawer-continue"
                  onClick={() => setShowCartDrawer(false)}
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default CartDrawer;

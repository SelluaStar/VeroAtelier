import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import './CheckoutSuccess.css';

function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const [sessionStatus, setSessionStatus] = useState('loading');
  const [customerEmail, setCustomerEmail] = useState('');
  const { clearCart } = useCart();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setSessionStatus('no_session');
      return;
    }

    retrieveSession();
  }, [sessionId]);

  const retrieveSession = async () => {
    try {
      // Check session status via our backend
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        }
      );

      if (!response.ok) {
        setSessionStatus('error');
        return;
      }

      const { session } = await response.json();

      if (session?.payment_status === 'paid') {
        setSessionStatus('success');
        setCustomerEmail(session.customer_details?.email || '');
        clearCart(); // Clear the cart after successful payment
      } else if (session?.payment_status === 'unpaid') {
        setSessionStatus('pending');
      } else {
        setSessionStatus('error');
      }
    } catch (err) {
      console.error('Error retrieving session:', err);
      setSessionStatus('error');
    }
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="checkout-success-page">
        <div className="success-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Confirming your order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (sessionStatus === 'no_session' || sessionStatus === 'error') {
    return (
      <div className="checkout-success-page">
        <div className="success-container">
          <div className="error-state">
            <h2>Something went wrong</h2>
            <p>We couldn't confirm your order. Please contact support if you were charged.</p>
            <Link to="/" className="btn-primary">Return to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  if (sessionStatus === 'pending') {
    return (
      <div className="checkout-success-page">
        <div className="success-container">
          <div className="pending-state">
            <h2>Payment Pending</h2>
            <p>Your payment is being processed. You'll receive an email confirmation shortly.</p>
            <Link to="/account/orders" className="btn-primary">View Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-success-page">
      <div className="success-container">
        <div className="success-icon">
          <CheckCircle size={64} />
        </div>

        <h1>Order Confirmed!</h1>
        <p className="success-message">
          Thank you for your purchase. Your order has been confirmed and is being prepared for shipment.
        </p>

        {customerEmail && (
          <div className="email-confirmation">
            <p>A confirmation email has been sent to:</p>
            <strong>{customerEmail}</strong>
          </div>
        )}

        <div className="next-steps">
          <div className="step-card">
            <Package size={32} />
            <h3>What's Next?</h3>
            <ul>
              <li>You'll receive a shipping confirmation email within 1-2 business days</li>
              <li>Track your order status in your account</li>
              <li>Estimated delivery: 5-7 business days</li>
            </ul>
          </div>
        </div>

        <div className="success-actions">
          <Link to="/account/orders" className="btn-primary">
            View Order Details
            <ArrowRight size={18} />
          </Link>
          <Link to="/shop" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSuccess;

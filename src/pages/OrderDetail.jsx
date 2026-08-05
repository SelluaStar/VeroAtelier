import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Package, Truck, CheckCircle, Clock, XCircle, ExternalLink, ChevronLeft, MapPin, Mail, Phone } from 'lucide-react';
import './OrderDetail.css';

function OrderDetail() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && orderId) {
      fetchOrderDetail();
    }
  }, [user, orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
      case 'processing':
        return <Clock size={24} />;
      case 'shipped':
        return <Truck size={24} />;
      case 'delivered':
        return <CheckCircle size={24} />;
      case 'cancelled':
        return <XCircle size={24} />;
      default:
        return <Package size={24} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'paid':
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    if (typeof address === 'string') return address;

    const { line1, line2, city, state, postal_code, country } = address;
    return `${line1}${line2 ? ', ' + line2 : ''}, ${city}, ${state} ${postal_code}, ${country}`;
  };

  const getTrackingUrl = (trackingNumber, carrier = 'ups') => {
    if (carrier === 'ups') {
      return `https://www.ups.com/track?track=yes&trackNums=${trackingNumber}`;
    }
    return '#';
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-container">
          <div className="loading-state">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-container">
          <div className="error-state">
            <h2>Order not found</h2>
            <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link to="/account/orders" className="btn-primary">Back to Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <Link to="/account/orders" className="back-link">
          <ChevronLeft size={20} />
          Back to Orders
        </Link>

        <div className="order-detail-header">
          <div className="order-title">
            <h1>Order #{order.order_number}</h1>
            <p>Placed on {formatDate(order.created_at)}</p>
          </div>
          <div className={`order-status-large ${getStatusClass(order.status)}`}>
            {getStatusIcon(order.status)}
            <span>{formatStatus(order.status)}</span>
          </div>
        </div>

        <div className="order-detail-grid">
          {/* Order Status Timeline */}
          <div className="detail-card">
            <h3>Order Status</h3>
            <div className="status-timeline">
              <div className={`timeline-item ${order.status === 'paid' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''}`}>
                <div className="timeline-icon">
                  <CheckCircle size={20} />
                </div>
                <div className="timeline-content">
                  <h4>Order Placed</h4>
                  <p>{formatDate(order.created_at)}</p>
                </div>
              </div>

              <div className={`timeline-item ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''}`}>
                <div className="timeline-icon">
                  <Clock size={20} />
                </div>
                <div className="timeline-content">
                  <h4>Processing</h4>
                  <p>{order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'In progress' : 'Pending'}</p>
                </div>
              </div>

              <div className={`timeline-item ${order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''}`}>
                <div className="timeline-icon">
                  <Truck size={20} />
                </div>
                <div className="timeline-content">
                  <h4>Shipped</h4>
                  <p>{order.shipped_at ? formatDate(order.shipped_at) : 'Not yet shipped'}</p>
                </div>
              </div>

              <div className={`timeline-item ${order.status === 'delivered' ? 'completed' : ''}`}>
                <div className="timeline-icon">
                  <Package size={20} />
                </div>
                <div className="timeline-content">
                  <h4>Delivered</h4>
                  <p>{order.delivered_at ? formatDate(order.delivered_at) : order.estimated_delivery ? `Est. ${formatDate(order.estimated_delivery)}` : 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="detail-card">
            <h3>Shipping Information</h3>
            <div className="info-section">
              <div className="info-item">
                <MapPin size={18} />
                <div>
                  <p className="info-label">Shipping Address</p>
                  <p className="info-value">{formatAddress(order.shipping_address)}</p>
                </div>
              </div>
              <div className="info-item">
                <Mail size={18} />
                <div>
                  <p className="info-label">Email</p>
                  <p className="info-value">{order.customer_email}</p>
                </div>
              </div>
              {order.customer_phone && (
                <div className="info-item">
                  <Phone size={18} />
                  <div>
                    <p className="info-label">Phone</p>
                    <p className="info-value">{order.customer_phone}</p>
                  </div>
                </div>
              )}
              {order.tracking_number && (
                <div className="info-item">
                  <Truck size={18} />
                  <div>
                    <p className="info-label">Tracking Number</p>
                    <a
                      href={getTrackingUrl(order.tracking_number, order.carrier)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tracking-link"
                    >
                      {order.tracking_number}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="detail-card">
          <h3>Order Items</h3>
          <div className="order-items">
            {order.items && order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                </div>
                <div className="item-price">
                  ${Number(item.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${Number(order.subtotal || order.total_amount || 0).toFixed(2)}</span>
            </div>
            {order.tax && (
              <div className="summary-row">
                <span>Tax</span>
                <span>${Number(order.tax).toFixed(2)}</span>
              </div>
            )}
            {order.shipping && (
              <div className="summary-row">
                <span>Shipping</span>
                <span>${Number(order.shipping).toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>${Number(order.total_amount || order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {order.order_notes && (
          <div className="detail-card">
            <h3>Order Notes</h3>
            <p className="order-notes">{order.order_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetail;

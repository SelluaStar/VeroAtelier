import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Package, Truck, CheckCircle, Clock, XCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Orders.css';

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
      case 'processing':
        return <Clock size={20} />;
      case 'shipped':
        return <Truck size={20} />;
      case 'delivered':
        return <CheckCircle size={20} />;
      case 'cancelled':
        return <XCircle size={20} />;
      default:
        return <Package size={20} />;
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="loading-state">Loading your orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>

        <div className="orders-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Orders
          </button>
          <button
            className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
            onClick={() => setFilter('processing')}
          >
            Processing
          </button>
          <button
            className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
            onClick={() => setFilter('shipped')}
          >
            Shipped
          </button>
          <button
            className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
            onClick={() => setFilter('delivered')}
          >
            Delivered
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <Package size={64} strokeWidth={1} />
            <h2>No orders found</h2>
            <p>You haven't placed any orders yet</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <Link to={`/account/orders/${order.id}`} key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-number">
                    <Package size={18} />
                    <span>Order #{order.order_number}</span>
                  </div>
                  <div className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{formatStatus(order.status)}</span>
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-date">
                    <span className="label">Order Date:</span>
                    <span className="value">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="order-total">
                    <span className="label">Total:</span>
                    <span className="value">${Number(order.total_amount || order.total || 0).toFixed(2)}</span>
                  </div>
                  {order.tracking_number && (
                    <div className="order-tracking">
                      <span className="label">Tracking:</span>
                      <span className="value tracking-link">
                        {order.tracking_number}
                        <ExternalLink size={14} />
                      </span>
                    </div>
                  )}
                </div>

                <div className="order-items-preview">
                  {order.items && order.items.length > 0 && (
                    <div className="items-count">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  <span className="view-details">
                    View Details
                    <ChevronRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;

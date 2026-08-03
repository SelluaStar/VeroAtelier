import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Eye } from 'lucide-react';
import LoadingCard from '../../components/LoadingCard';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order: ' + error.message);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <h1>Orders</h1>
        <div className="orders-stats">
          <div className="stat-badge">
            <span className="stat-count">{orders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="stat-badge">
            <span className="stat-count">{orders.filter(o => o.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="orders-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">
                  <div style={{ display: 'flex', gap: '1rem', padding: '2rem' }}>
                    <LoadingCard />
                    <LoadingCard />
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-number">#{order.order_number}</td>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-name">{order.profiles?.full_name || 'Guest'}</span>
                      <span className="customer-email">{order.profiles?.email || '-'}</span>
                    </div>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="order-total">${Number(order.total).toFixed(2)}</td>
                  <td>
                    <select
                      className={`status-select status-${order.status}`}
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn-icon" title="View Details">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;

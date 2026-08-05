import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Eye, Truck, X, Package, Edit, Save } from 'lucide-react';
import LoadingCard from '../../components/LoadingCard';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    tracking_number: '',
    carrier: 'ups',
    shipping_method: '',
    estimated_delivery: '',
  });

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
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
      const updateData = { status: newStatus, updated_at: new Date().toISOString() };

      if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order: ' + error.message);
    }
  };

  const handleShipOrder = (order) => {
    setSelectedOrder(order);
    setShippingForm({
      tracking_number: order.tracking_number || '',
      carrier: order.carrier || 'ups',
      shipping_method: order.shipping_method || '',
      estimated_delivery: order.estimated_delivery ? new Date(order.estimated_delivery).toISOString().split('T')[0] : '',
    });
    setShowShippingModal(true);
  };

  const submitShipping = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: shippingForm.tracking_number,
          carrier: shippingForm.carrier,
          shipping_method: shippingForm.shipping_method,
          estimated_delivery: shippingForm.estimated_delivery || null,
          shipped_at: new Date().toISOString(),
          status: 'shipped',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      setShowShippingModal(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (error) {
      console.error('Error updating shipping:', error);
      alert('Error updating shipping: ' + error.message);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const formatAddress = (address) => {
    if (!address) return 'No address';
    if (typeof address === 'string') return address;

    const { line1, line2, city, state, postal_code, country } = address;
    return `${line1}${line2 ? ', ' + line2 : ''}, ${city}, ${state} ${postal_code}, ${country}`;
  };

  const filteredOrders = orders.filter(order =>
    order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: orders.length,
    paid: orders.filter(o => o.status === 'paid').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <div>
          <h1>Orders Management</h1>
          <p>Manage and track all customer orders</p>
        </div>
        <div className="orders-stats">
          <div className="stat-badge">
            <span className="stat-count">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-badge processing">
            <span className="stat-count">{stats.processing}</span>
            <span className="stat-label">Processing</span>
          </div>
          <div className="stat-badge shipped">
            <span className="stat-count">{stats.shipped}</span>
            <span className="stat-label">Shipped</span>
          </div>
          <div className="stat-badge delivered">
            <span className="stat-count">{stats.delivered}</span>
            <span className="stat-label">Delivered</span>
          </div>
        </div>
      </div>

      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by order #, customer, or tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="orders-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Tracking</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">
                  <div style={{ display: 'flex', gap: '1rem', padding: '2rem' }}>
                    <LoadingCard />
                    <LoadingCard />
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-number">#{order.order_number}</td>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-name">{order.customer_name || order.profiles?.full_name || 'Guest'}</span>
                      <span className="customer-email">{order.customer_email || order.profiles?.email || '-'}</span>
                    </div>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{order.items?.length || 0}</td>
                  <td className="order-total">${Number(order.total_amount || order.total || 0).toFixed(2)}</td>
                  <td>
                    <select
                      className={`status-select status-${order.status}`}
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {order.tracking_number ? (
                      <span className="tracking-badge">{order.tracking_number}</span>
                    ) : (
                      <span className="no-tracking">-</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        title="View Details"
                        onClick={() => viewOrderDetails(order)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="btn-icon"
                        title="Add Shipping Info"
                        onClick={() => handleShipOrder(order)}
                      >
                        <Truck size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order #{selectedOrder.order_number}</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="order-detail-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.customer_name || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedOrder.customer_email || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer_phone || 'N/A'}</p>
              </div>

              <div className="order-detail-section">
                <h4>Shipping Address</h4>
                <p>{formatAddress(selectedOrder.shipping_address)}</p>
              </div>

              <div className="order-detail-section">
                <h4>Order Items</h4>
                {selectedOrder.items && selectedOrder.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${Number(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-detail-section">
                <h4>Order Summary</h4>
                <div className="order-item-row">
                  <span>Subtotal:</span>
                  <span>${Number(selectedOrder.subtotal || selectedOrder.total_amount || 0).toFixed(2)}</span>
                </div>
                {selectedOrder.tax && (
                  <div className="order-item-row">
                    <span>Tax:</span>
                    <span>${Number(selectedOrder.tax).toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.shipping && (
                  <div className="order-item-row">
                    <span>Shipping:</span>
                    <span>${Number(selectedOrder.shipping).toFixed(2)}</span>
                  </div>
                )}
                <div className="order-item-row total">
                  <span><strong>Total:</strong></span>
                  <span><strong>${Number(selectedOrder.total_amount || selectedOrder.total || 0).toFixed(2)}</strong></span>
                </div>
              </div>

              {selectedOrder.tracking_number && (
                <div className="order-detail-section">
                  <h4>Shipping Information</h4>
                  <p><strong>Carrier:</strong> {selectedOrder.carrier?.toUpperCase() || 'N/A'}</p>
                  <p><strong>Tracking:</strong> {selectedOrder.tracking_number}</p>
                  <p><strong>Shipped:</strong> {selectedOrder.shipped_at ? new Date(selectedOrder.shipped_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {showShippingModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowShippingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Shipping Information</h3>
              <button className="modal-close" onClick={() => setShowShippingModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">Order #{selectedOrder.order_number}</p>

              <div className="form-group">
                <label>Tracking Number *</label>
                <input
                  type="text"
                  placeholder="e.g., 1Z999AA10123456784"
                  value={shippingForm.tracking_number}
                  onChange={(e) => setShippingForm({ ...shippingForm, tracking_number: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Carrier</label>
                <select
                  value={shippingForm.carrier}
                  onChange={(e) => setShippingForm({ ...shippingForm, carrier: e.target.value })}
                >
                  <option value="ups">UPS</option>
                  <option value="usps">USPS</option>
                  <option value="fedex">FedEx</option>
                  <option value="dhl">DHL</option>
                </select>
              </div>

              <div className="form-group">
                <label>Shipping Method</label>
                <input
                  type="text"
                  placeholder="e.g., Ground, 2-Day Air"
                  value={shippingForm.shipping_method}
                  onChange={(e) => setShippingForm({ ...shippingForm, shipping_method: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Estimated Delivery</label>
                <input
                  type="date"
                  value={shippingForm.estimated_delivery}
                  onChange={(e) => setShippingForm({ ...shippingForm, estimated_delivery: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowShippingModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={submitShipping}
                disabled={!shippingForm.tracking_number}
              >
                <Save size={18} />
                Save & Mark as Shipped
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users
} from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get orders count and revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total, status');

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;

      // Get users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get recent orders
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get top products
      const { data: topProductsData } = await supabase
        .from('products')
        .select('*')
        .order('stock', { ascending: false })
        .limit(5);

      setStats({
        totalProducts: productsCount || 0,
        totalSales: completedOrders,
        totalRevenue: totalRevenue,
        totalOrders: orders?.length || 0,
        totalUsers: usersCount || 0
      });

      setRecentOrders(recentOrdersData || []);
      setTopProducts(topProductsData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Products</p>
            <h2 className="stat-value">{stats.totalProducts.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Sales</p>
            <h2 className="stat-value">{stats.totalSales.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Revenue</p>
            <h2 className="stat-value">${stats.totalRevenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Users</p>
            <h2 className="stat-value">{stats.totalUsers.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Products */}
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Recent Orders</h3>
          </div>
          <div className="recent-orders">
            {recentOrders.length === 0 ? (
              <p className="empty-state">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <p className="order-number">Order #{order.order_number}</p>
                    <p className="order-customer">{order.profiles?.full_name || 'Guest'}</p>
                  </div>
                  <div className="order-meta">
                    <span className={`order-status status-${order.status}`}>
                      {order.status}
                    </span>
                    <span className="order-amount">${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h3>Top Products</h3>
          </div>
          <div className="top-products">
            {topProducts.length === 0 ? (
              <p className="empty-state">No products yet</p>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.stock}</td>
                      <td>${Number(product.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

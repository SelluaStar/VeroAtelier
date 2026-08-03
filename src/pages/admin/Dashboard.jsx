import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Package, DollarSign, TrendingUp, TrendingDown,
  ShoppingCart, AlertCircle, Tag, Settings, BarChart3
} from 'lucide-react';
import LoadingCard from '../../components/LoadingCard';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalIncome: 0,
    totalExpenses: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
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

      // Get orders and calculate revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total, status, created_at, order_number, profiles(full_name)');

      const totalIncome = orders?.reduce((sum, order) =>
        order.status === 'delivered' ? sum + Number(order.total) : sum, 0) || 0;

      const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;

      // Get top products by stock
      const { data: topProductsData } = await supabase
        .from('products')
        .select('id, name, images, image_url, stock, price')
        .order('stock', { ascending: false })
        .limit(5);

      // Create mock activity (in real app, would come from activity_logs table)
      const mockActivity = [
        {
          id: 1,
          type: 'order',
          title: `Order #${orders?.[0]?.order_number || '2048'}`,
          subtitle: orders?.[0]?.profiles?.full_name || 'John Doe',
          date: orders?.[0]?.created_at ? new Date(orders[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '12 Jan 25',
          badge: 'New Order',
          badgeClass: 'new-order'
        },
        {
          id: 2,
          type: 'alert',
          title: 'Low Stock Alert',
          subtitle: topProductsData?.[0]?.name || 'MacBook Air M2',
          date: '10 Jan 26',
          badge: 'Low Stock',
          badgeClass: 'low-stock'
        },
        {
          id: 3,
          type: 'promo',
          title: 'Promo code "SUMMER20"',
          subtitle: 'Applied 52 times',
          date: '8 Jan 25',
          badge: 'Campaign',
          badgeClass: 'campaign'
        },
        {
          id: 4,
          type: 'system',
          title: 'System Update',
          subtitle: 'Version 1.2.1',
          date: '2 Jan 25',
          badge: 'System',
          badgeClass: 'system'
        }
      ];

      setStats({
        totalProducts: productsCount || 0,
        totalSales: completedOrders,
        totalIncome: totalIncome,
        totalExpenses: totalIncome * 0.08 // Mock 8% expenses
      });

      setRecentActivity(mockActivity);
      setTopProducts(topProductsData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Electronics', amount: 85000, percentage: 68, color: '#6366f1' },
    { name: 'Fashion', amount: 25000, percentage: 20, color: '#f59e0b' },
    { name: 'Health & Wellness', amount: 10000, percentage: 8, color: '#ec4899' },
    { name: 'Home & Living', amount: 5000, percentage: 4, color: '#22c55e' }
  ];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>
        <div className="stats-grid">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </div>
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
          <div className="stat-header">
            <div className="stat-icon blue">
              <Package size={24} />
            </div>
            <div className="stat-trend up">
              <TrendingUp size={16} />
              12%
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Products</p>
            <h2 className="stat-value">{stats.totalProducts.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">
              <DollarSign size={24} />
            </div>
            <div className="stat-trend up">
              <TrendingUp size={16} />
              8%
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Sales</p>
            <h2 className="stat-value">{stats.totalSales.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <TrendingDown size={24} style={{ transform: 'rotate(180deg)' }} />
            </div>
            <div className="stat-trend up">
              <TrendingUp size={16} />
              15%
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Income</p>
            <h2 className="stat-value">${stats.totalIncome.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">
              <TrendingUp size={24} />
            </div>
            <div className="stat-trend down">
              <TrendingDown size={16} />
              3%
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Expenses</p>
            <h2 className="stat-value">${Math.round(stats.totalExpenses).toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* Revenue Chart & Categories */}
      <div className="dashboard-main">
        <div className="chart-section">
          <div className="section-header">
            <div className="section-title">
              <BarChart3 size={20} />
              Sales Revenue
            </div>
            <div className="chart-tabs">
              <button className="chart-tab active">Monthly</button>
              <button className="chart-tab">Quarterly</button>
              <button className="chart-tab">Yearly</button>
            </div>
          </div>
          <div className="chart-placeholder">
            Chart visualization coming soon
          </div>
        </div>

        <div className="categories-section">
          <div className="section-header">
            <div className="section-title">
              <Tag size={20} />
              Top Categories
            </div>
            <a href="#" className="see-all-link">See All</a>
          </div>

          <div className="categories-chart">
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: `conic-gradient(
                ${categories[0].color} 0% ${categories[0].percentage}%,
                ${categories[1].color} ${categories[0].percentage}% ${categories[0].percentage + categories[1].percentage}%,
                ${categories[2].color} ${categories[0].percentage + categories[1].percentage}% ${categories[0].percentage + categories[1].percentage + categories[2].percentage}%,
                ${categories[3].color} ${categories[0].percentage + categories[1].percentage + categories[2].percentage}% 100%
              )`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Sales</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>$125,000</div>
              </div>
            </div>
          </div>

          <div className="category-list">
            {categories.map((cat, idx) => (
              <div key={idx} className="category-item">
                <div className="category-info">
                  <div className="category-dot" style={{ background: cat.color }} />
                  <span className="category-name">{cat.name}</span>
                </div>
                <div className="category-stats">
                  <span className="category-amount">${cat.amount.toLocaleString()}</span>
                  <span className="category-percentage">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity & Products */}
      <div className="dashboard-bottom">
        <div className="dashboard-section">
          <div className="section-header-with-link">
            <div className="section-title">Recent Activity</div>
            <a href="#" className="see-all-link">See All</a>
          </div>

          <div className="activity-feed">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'order' && <ShoppingCart size={20} />}
                  {activity.type === 'alert' && <AlertCircle size={20} />}
                  {activity.type === 'promo' && <Tag size={20} />}
                  {activity.type === 'system' && <Settings size={20} />}
                </div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-subtitle">
                    {activity.subtitle} · {activity.date}
                  </div>
                </div>
                <div className={`activity-badge ${activity.badgeClass}`}>
                  {activity.badge}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header-with-link">
            <div className="section-title">Top Products</div>
            <a href="#" className="see-all-link">See All</a>
          </div>

          {topProducts.length === 0 ? (
            <div className="empty-state">No products yet</div>
          ) : (
            <table className="products-table-compact">
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
                    <td>
                      <div className="product-cell-compact">
                        {(product.images?.[0] || product.image_url) ? (
                          <img
                            src={product.images?.[0] || product.image_url}
                            alt={product.name}
                            className="product-img-compact"
                          />
                        ) : (
                          <div className="product-img-compact" style={{ background: '#e5e7eb' }} />
                        )}
                        <span className="product-name-compact">{product.name}</span>
                      </div>
                    </td>
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
  );
}

export default Dashboard;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, ShoppingBag, Heart, Settings, LogOut, Package, MapPin, CreditCard, Bell, Mail, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Account.css';

function Account() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    cards: 0,
    addresses: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [ordersRes, wishlistRes, cardsRes, addressesRes] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('wishlist').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('payment_methods').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      setStats({
        orders: ordersRes.count || 0,
        wishlist: wishlistRes.count || 0,
        cards: cardsRes.count || 0,
        addresses: addressesRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-container">
          <div className="loading-message">Loading your account...</div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-card">
            <div className="profile-avatar">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} />
              ) : (
                <User size={40} strokeWidth={1.5} />
              )}
            </div>
            <div className="profile-info">
              <h2>Welcome back</h2>
              <p className="profile-name">{profile.full_name || 'User'}</p>
              <div className="profile-contact">
                <div className="contact-item">
                  <Mail size={14} />
                  <span>{user.email}</span>
                </div>
                {profile.phone && (
                  <div className="contact-item">
                    <Phone size={14} />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Package size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{loadingStats ? '...' : stats.orders}</span>
              <span className="stat-label">Orders</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Heart size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{loadingStats ? '...' : stats.wishlist}</span>
              <span className="stat-label">Wishlist</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <CreditCard size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{loadingStats ? '...' : stats.cards}</span>
              <span className="stat-label">Cards</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <MapPin size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{loadingStats ? '...' : stats.addresses}</span>
              <span className="stat-label">Addresses</span>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="actions-section">
          <h3 className="section-title">Account Management</h3>
          <div className="actions-grid">
            <div className="action-card">
              <div className="action-icon">
                <ShoppingBag size={24} strokeWidth={1.5} />
              </div>
              <div className="action-content">
                <h4>My Orders</h4>
                <p>Track, return, or buy again</p>
              </div>
              <div className="action-arrow">→</div>
            </div>

            <div className="action-card">
              <div className="action-icon">
                <Heart size={24} strokeWidth={1.5} />
              </div>
              <div className="action-content">
                <h4>Wishlist</h4>
                <p>View and manage your saved items</p>
              </div>
              <div className="action-arrow">→</div>
            </div>

            <div className="action-card">
              <div className="action-icon">
                <MapPin size={24} strokeWidth={1.5} />
              </div>
              <div className="action-content">
                <h4>Addresses</h4>
                <p>Manage shipping addresses</p>
              </div>
              <div className="action-arrow">→</div>
            </div>

            <div className="action-card">
              <div className="action-icon">
                <CreditCard size={24} strokeWidth={1.5} />
              </div>
              <div className="action-content">
                <h4>Payment Methods</h4>
                <p>Manage your payment options</p>
              </div>
              <div className="action-arrow">→</div>
            </div>

            <div className="action-card">
              <div className="action-icon">
                <Bell size={24} strokeWidth={1.5} />
              </div>
              <div className="action-content">
                <h4>Notifications</h4>
                <p>Manage your preferences</p>
              </div>
              <div className="action-arrow">→</div>
            </div>

            <div className="action-card">
              <div className="action-icon">
                <Settings size={24} strokeWidth={1.5} />
              </div>
              <div className="action-content">
                <h4>Account Settings</h4>
                <p>Update your account details</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="signout-section">
          <button className="signout-btn" onClick={handleSignOut}>
            <LogOut size={20} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Account;

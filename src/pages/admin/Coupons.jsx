import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Tag, Calendar } from 'lucide-react';
import LoadingCard from '../../components/LoadingCard';
import './Coupons.css';

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase: '',
    max_discount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const couponData = {
        ...formData,
        code: formData.code.toUpperCase(),
        discount_value: parseFloat(formData.discount_value),
        min_purchase: formData.min_purchase ? parseFloat(formData.min_purchase) : 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: formData.valid_from || new Date().toISOString(),
        valid_until: formData.valid_until || null
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([couponData]);

        if (error) throw error;
      }

      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      loadCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Error saving coupon: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value || '',
      min_purchase: coupon.min_purchase || '',
      max_discount: coupon.max_discount || '',
      usage_limit: coupon.usage_limit || '',
      valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().slice(0, 16) : '',
      valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 16) : '',
      is_active: coupon.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Error deleting coupon: ' + error.message);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;
      loadCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase: '',
      max_discount: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
      is_active: true
    });
  };

  return (
    <div className="admin-coupons">
      <div className="coupons-header">
        <h1>Coupons</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingCoupon(null);
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={20} />
          Add Coupon
        </button>
      </div>

      <div className="coupons-grid">
        {loading ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : coupons.length === 0 ? (
          <div className="empty-state">
            <Tag size={48} />
            <p>No coupons yet</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon.id} className="coupon-card">
              <div className="coupon-header">
                <div className="coupon-code">
                  <Tag size={20} />
                  <span>{coupon.code}</span>
                </div>
                <button
                  className={`toggle-btn ${coupon.is_active ? 'active' : ''}`}
                  onClick={() => toggleActive(coupon)}
                >
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="coupon-details">
                <div className="detail-item">
                  <span className="detail-label">Discount</span>
                  <span className="detail-value">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}%`
                      : `$${coupon.discount_value}`}
                  </span>
                </div>

                {coupon.min_purchase > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Min. Purchase</span>
                    <span className="detail-value">${coupon.min_purchase}</span>
                  </div>
                )}

                {coupon.usage_limit && (
                  <div className="detail-item">
                    <span className="detail-label">Usage</span>
                    <span className="detail-value">
                      {coupon.times_used || 0} / {coupon.usage_limit}
                    </span>
                  </div>
                )}

                {coupon.valid_until && (
                  <div className="detail-item">
                    <span className="detail-label">
                      <Calendar size={14} />
                      Expires
                    </span>
                    <span className="detail-value">
                      {new Date(coupon.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="coupon-actions">
                <button className="btn-icon" onClick={() => handleEdit(coupon)}>
                  <Edit size={18} />
                </button>
                <button className="btn-icon danger" onClick={() => handleDelete(coupon.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Coupon Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="coupon-form">
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="SUMMER2024"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select
                    required
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder={formData.discount_type === 'percentage' ? '10' : '50'}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Purchase</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Max Discount (for %)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Usage Limit</label>
                <input
                  type="number"
                  placeholder="Unlimited"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valid From</label>
                  <input
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Valid Until</label>
                  <input
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Coupons;

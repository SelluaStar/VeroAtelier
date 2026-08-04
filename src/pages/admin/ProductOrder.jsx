import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { GripVertical, Save, RotateCcw } from 'lucide-react';
import LoadingCard from '../../components/LoadingCard';
import './ProductOrder.css';

function ProductOrder() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, brand, images, price, popularity_order')
        .order('popularity_order', { ascending: false, nullsLast: true });

      if (error) throw error;
      setProducts(data || []);
      setHasChanges(false);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newProducts = [...products];
    const draggedProduct = newProducts[draggedItem];
    newProducts.splice(draggedItem, 1);
    newProducts.splice(index, 0, draggedProduct);

    setProducts(newProducts);
    setDraggedItem(index);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update popularity_order for all products based on their position
      const updates = products.map((product, index) => ({
        id: product.id,
        popularity_order: products.length - index, // Higher number = more popular
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('products')
          .update({ popularity_order: update.popularity_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      alert('Product order saved successfully!');
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving order:', err);
      alert('Failed to save product order');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to the saved order?')) {
      fetchProducts();
    }
  };

  if (loading) {
    return (
      <div className="product-order-page">
        <div className="page-header">
          <h1>Product Popularity Order</h1>
        </div>
        <div className="product-order-loading">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingCard key={i} type="product" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="product-order-page">
      <div className="page-header">
        <div>
          <h1>Product Popularity Order</h1>
          <p className="page-description">
            Drag and drop products to set their order in the "Popular" sorting option.
            Products at the top appear first when customers sort by Popular.
          </p>
        </div>
        <div className="page-actions">
          {hasChanges && (
            <button className="btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} />
              Reset
            </button>
          )}
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="changes-notice">
          You have unsaved changes. Drag products to reorder, then click Save Order.
        </div>
      )}

      <div className="product-order-list">
        {products.map((product, index) => (
          <div
            key={product.id}
            className={`product-order-item ${draggedItem === index ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="drag-handle">
              <GripVertical size={20} />
            </div>
            <div className="product-order-rank">#{index + 1}</div>
            <div className="product-order-image">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>
            <div className="product-order-info">
              {product.brand && <div className="product-order-brand">{product.brand}</div>}
              <div className="product-order-name">{product.name}</div>
              <div className="product-order-price">${product.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductOrder;

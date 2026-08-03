import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Star, Search, Upload, X, GripVertical, Image as ImageIcon } from 'lucide-react';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    subcategory: '',
    brand: '',
    size: '',
    condition: '',
    images: [],
    stock: '',
    featured: false,
    is_on_sale: false,
    discount_percentage: ''
  });
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images: ' + error.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDragStart = (index) => {
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedImageIndex === null) return;

    const newImages = [...formData.images];
    const [draggedImage] = newImages.splice(draggedImageIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    setDraggedImageIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        size: formData.size,
        condition: formData.condition,
        images: formData.images,
        image_url: formData.images[0] || null,
        stock: parseInt(formData.stock),
        featured: formData.featured,
        is_on_sale: formData.is_on_sale,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      original_price: product.original_price || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      size: product.size || '',
      condition: product.condition || '',
      images: product.images || [],
      stock: product.stock || '',
      featured: product.featured || false,
      is_on_sale: product.is_on_sale || false,
      discount_percentage: product.discount_percentage || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product: ' + error.message);
    }
  };

  const toggleFeatured = async (product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured: !product.featured })
        .eq('id', product.id);

      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      category: '',
      subcategory: '',
      brand: '',
      size: '',
      condition: '',
      images: [],
      stock: '',
      featured: false,
      is_on_sale: false,
      discount_percentage: ''
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-products">
      <div className="products-header">
        <h1>Products</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="products-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="products-grid">
        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={48} />
            <p>No products found</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={20} />
              Add Your First Product
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {(product.images?.[0] || product.image_url) ? (
                  <img src={product.images?.[0] || product.image_url} alt={product.name} />
                ) : (
                  <div className="product-image-placeholder">
                    <ImageIcon size={32} />
                  </div>
                )}
                {product.featured && (
                  <div className="featured-badge">
                    <Star size={14} />
                    Featured
                  </div>
                )}
                {product.is_on_sale && (
                  <div className="sale-badge">Sale</div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                {product.brand && <p className="product-brand">{product.brand}</p>}
                <div className="product-price">
                  <span className="current-price">${Number(product.price).toFixed(2)}</span>
                  {product.is_on_sale && product.original_price && (
                    <span className="original-price-card">${Number(product.original_price).toFixed(2)}</span>
                  )}
                </div>
                <div className="product-meta">
                  <span className={`stock-indicator ${product.stock < 10 ? 'low' : ''}`}>
                    {product.stock} in stock
                  </span>
                  <span className="product-category">{product.category}</span>
                </div>
              </div>
              <div className="product-actions">
                <button className="action-btn" onClick={() => toggleFeatured(product)} title="Toggle Featured">
                  <Star size={18} className={product.featured ? 'filled' : ''} />
                </button>
                <button className="action-btn" onClick={() => handleEdit(product)}>
                  <Edit size={18} />
                </button>
                <button className="action-btn danger" onClick={() => handleDelete(product.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enhanced Product Modal */}
      {showModal && (
        <div className="modal-overlay-large" onClick={() => setShowModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-large">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close-large" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form-large">
              {/* Image Upload Section */}
              <div className="form-section">
                <h3 className="section-title">Product Images</h3>
                <div className="images-upload-area">
                  <div className="images-grid">
                    {formData.images.map((url, index) => (
                      <div
                        key={index}
                        className="image-preview"
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                      >
                        <img src={url} alt={`Product ${index + 1}`} />
                        <div className="image-overlay">
                          <button
                            type="button"
                            className="image-remove"
                            onClick={() => removeImage(index)}
                          >
                            <X size={16} />
                          </button>
                          <div className="image-drag-handle">
                            <GripVertical size={16} />
                          </div>
                        </div>
                        {index === 0 && <div className="primary-badge">Primary</div>}
                      </div>
                    ))}
                    <label className="image-upload-box">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImages}
                        style={{ display: 'none' }}
                      />
                      <Upload size={24} />
                      <span>{uploadingImages ? 'Uploading...' : 'Add Images'}</span>
                    </label>
                  </div>
                  <p className="upload-hint">Drag images to reorder. First image will be the primary image.</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product..."
                  />
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="form-section">
                <h3 className="section-title">Pricing & Inventory</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Original Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Discount %</label>
                    <input
                      type="number"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="form-section">
                <h3 className="section-title">Product Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select category</option>
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                      <option value="accessories">Accessories</option>
                      <option value="shoes">Shoes</option>
                      <option value="bags">Bags</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Subcategory</label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="e.g., Dresses, Shirts"
                    />
                  </div>
                  <div className="form-group">
                    <label>Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="e.g., S, M, L, XL"
                    />
                  </div>
                  <div className="form-group">
                    <label>Condition</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    >
                      <option value="">Select condition</option>
                      <option value="new">New</option>
                      <option value="like-new">Like New</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="form-section">
                <h3 className="section-title">Options</h3>
                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span>Featured Product</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_on_sale}
                      onChange={(e) => setFormData({ ...formData, is_on_sale: e.target.checked })}
                    />
                    <span>On Sale</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions-large">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading || uploadingImages}>
                  {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;

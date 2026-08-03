import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Star, Search, Upload, X, GripVertical, Image as ImageIcon, Info } from 'lucide-react';
import './Products.css';

// Tooltip component
function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && <span className="tooltip-bubble">{text}</span>}
    </span>
  );
}

// Custom Checkbox component
function CustomCheckbox({ checked, onChange, label, description }) {
  return (
    <label className="custom-checkbox-label">
      <span className="custom-checkbox-wrapper" onClick={onChange}>
        <span className={`custom-checkbox ${checked ? 'checked' : ''}`}>
          {checked && (
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
              <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>
      </span>
      <span className="checkbox-text">
        <span className="checkbox-title">{label}</span>
        {description && <span className="checkbox-description">{description}</span>}
      </span>
    </label>
  );
}

const DEMO_PRODUCTS = [
  {
    name: 'Monogram Canvas Tote',
    brand: 'Louis Vuitton',
    description: 'Classic LV monogram canvas tote in excellent condition. Gold-tone hardware, leather trim, and tan interior lining. A timeless investment piece.',
    price: 1250,
    original_price: 2100,
    category: 'bags',
    subcategory: 'totes',
    size: 'One Size',
    condition: 'excellent',
    stock: 1,
    featured: true,
    is_on_sale: true,
    discount_percentage: 40,
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop'],
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop'
  },
  {
    name: 'GG Marmont Belt Bag',
    brand: 'Gucci',
    description: 'Matelassé chevron leather belt bag with a distinctive GG buckle. Worn twice, in pristine condition. Adjustable belt included.',
    price: 780,
    original_price: 1350,
    category: 'bags',
    subcategory: 'belt bags',
    size: 'One Size',
    condition: 'like-new',
    stock: 1,
    featured: true,
    is_on_sale: true,
    discount_percentage: 42,
    images: ['https://images.unsplash.com/photo-1591480158595-c1a41a2e851f?w=800&auto=format&fit=crop'],
    image_url: 'https://images.unsplash.com/photo-1591480158595-c1a41a2e851f?w=800&auto=format&fit=crop'
  },
  {
    name: 'Silk Crepe Blouse',
    brand: 'Saint Laurent',
    description: 'Ivory silk crepe blouse with a relaxed fit and subtle sheen. Features a V-neckline, long sleeves, and tonal buttons. Dry cleaned and ready to wear.',
    price: 420,
    original_price: 890,
    category: 'women',
    subcategory: 'tops',
    size: 'S, M',
    condition: 'like-new',
    stock: 2,
    featured: false,
    is_on_sale: true,
    discount_percentage: 53,
    images: ['https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&auto=format&fit=crop'],
    image_url: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&auto=format&fit=crop'
  },
  {
    name: 'Wool Overcoat',
    brand: 'Loro Piana',
    description: 'Camel pure wool double-faced overcoat. Single-breasted silhouette with a belted back. Barely worn — ideal for autumn and winter layering.',
    price: 2200,
    original_price: 4500,
    category: 'women',
    subcategory: 'coats',
    size: 'S, M, L',
    condition: 'excellent',
    stock: 1,
    featured: true,
    is_on_sale: false,
    discount_percentage: null,
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop'],
    image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop'
  },
  {
    name: 'Classic Biker Jacket',
    brand: 'Balenciaga',
    description: 'Black lamb leather biker jacket with asymmetric zip and notched collar. Silver-tone hardware. A wardrobe staple in like-new condition.',
    price: 1650,
    original_price: 3200,
    category: 'men',
    subcategory: 'jackets',
    size: 'M, L',
    condition: 'like-new',
    stock: 1,
    featured: true,
    is_on_sale: true,
    discount_percentage: 48,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop'],
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop'
  },
  {
    name: 'Leather Derby Shoes',
    brand: 'Church\'s',
    description: 'Polished black calf leather Derby shoes with a Goodyear welt sole. Classic broguing detail. Barely worn — size EU 43.',
    price: 340,
    original_price: 680,
    category: 'shoes',
    subcategory: 'derby',
    size: '42, 43, 44',
    condition: 'excellent',
    stock: 1,
    featured: false,
    is_on_sale: true,
    discount_percentage: 50,
    images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop'],
    image_url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop'
  }
];

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', original_price: '',
    category: '', subcategory: '', brand: '', size: '', condition: '',
    images: [], stock: '', featured: false, is_on_sale: false, discount_percentage: ''
  });
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedDemoProducts = async () => {
    if (!window.confirm('This will add 6 demo products to your store. Continue?')) return;
    setSeedingDemo(true);
    try {
      const { error } = await supabase.from('products').insert(DEMO_PRODUCTS);
      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error seeding demo products:', error);
      alert('Error: ' + error.message);
    } finally {
      setSeedingDemo(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    const uploadedUrls = [];
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images: ' + error.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleDragStart = (index) => setDraggedImageIndex(index);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (dropIndex) => {
    if (draggedImageIndex === null) return;
    const newImages = [...formData.images];
    const [draggedImage] = newImages.splice(draggedImageIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    setFormData(prev => ({ ...prev, images: newImages }));
    setDraggedImageIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        name: formData.name, description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category: formData.category, subcategory: formData.subcategory,
        brand: formData.brand, size: formData.size, condition: formData.condition,
        images: formData.images, image_url: formData.images[0] || null,
        stock: parseInt(formData.stock) || 0,
        featured: formData.featured, is_on_sale: formData.is_on_sale,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null
      };
      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
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
      name: product.name || '', description: product.description || '',
      price: product.price || '', original_price: product.original_price || '',
      category: product.category || '', subcategory: product.subcategory || '',
      brand: product.brand || '', size: product.size || '', condition: product.condition || '',
      images: product.images || [],
      stock: product.stock || '', featured: product.featured || false,
      is_on_sale: product.is_on_sale || false, discount_percentage: product.discount_percentage || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      loadProducts();
    } catch (error) {
      alert('Error deleting product: ' + error.message);
    }
  };

  const toggleFeatured = async (product) => {
    try {
      const { error } = await supabase.from('products').update({ featured: !product.featured }).eq('id', product.id);
      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: '', original_price: '',
      category: '', subcategory: '', brand: '', size: '', condition: '',
      images: [], stock: '', featured: false, is_on_sale: false, discount_percentage: ''
    });
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-products">
      <div className="products-header">
        <h1>Products</h1>
        <div className="products-header-actions">
          {products.length === 0 && (
            <Tooltip text="Seed 6 sample luxury products to get started">
              <button className="btn-secondary" onClick={seedDemoProducts} disabled={seedingDemo}>
                {seedingDemo ? 'Adding...' : 'Add Demo Products'}
              </button>
            </Tooltip>
          )}
          <Tooltip text="Create a new product listing">
            <button className="btn-primary" onClick={() => { setEditingProduct(null); resetForm(); setShowModal(true); }}>
              <Plus size={18} />
              Add Product
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="products-toolbar">
        <div className="search-box">
          <Search size={18} color="#999" />
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="products-grid">
        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={48} />
            <p>No products yet</p>
            <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
              <Plus size={18} /> Add Your First Product
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {(product.images?.[0] || product.image_url) ? (
                  <img src={product.images?.[0] || product.image_url} alt={product.name} />
                ) : (
                  <div className="product-image-placeholder"><ImageIcon size={32} /></div>
                )}
                {product.featured && (
                  <div className="featured-badge"><Star size={12} /> Featured</div>
                )}
                {product.is_on_sale && <div className="sale-badge">Sale</div>}
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
                  <span className={`stock-indicator ${product.stock < 5 ? 'low' : ''}`}>
                    {product.stock} in stock
                  </span>
                  <span className="product-category">{product.category}</span>
                </div>
              </div>
              <div className="product-actions">
                <Tooltip text={product.featured ? 'Remove from featured' : 'Mark as featured — shows on homepage'}>
                  <button className={`action-btn ${product.featured ? 'featured-active' : ''}`} onClick={() => toggleFeatured(product)}>
                    <Star size={16} />
                  </button>
                </Tooltip>
                <Tooltip text="Edit this product">
                  <button className="action-btn" onClick={() => handleEdit(product)}>
                    <Edit size={16} />
                  </button>
                </Tooltip>
                <Tooltip text="Permanently delete this product">
                  <button className="action-btn danger" onClick={() => handleDelete(product.id)}>
                    <Trash2 size={16} />
                  </button>
                </Tooltip>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay-large" onClick={() => setShowModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-large">
              <h2>{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <button className="modal-close-large" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form-large">

              {/* Images */}
              <div className="form-section">
                <div className="section-title-row">
                  <h3 className="section-title">Product Images</h3>
                  <Tooltip text="Upload multiple images. Drag to reorder. The first image is the primary thumbnail shown in the shop.">
                    <span className="section-info"><Info size={16} /></span>
                  </Tooltip>
                </div>
                <div className="images-upload-area">
                  <div className="images-grid">
                    {formData.images.map((url, index) => (
                      <div key={index} className="image-preview" draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                      >
                        <img src={url} alt={`Product ${index + 1}`} />
                        <div className="image-overlay">
                          <button type="button" className="image-remove" onClick={() => removeImage(index)}>
                            <X size={14} />
                          </button>
                          <div className="image-drag-handle"><GripVertical size={14} /></div>
                        </div>
                        {index === 0 && <div className="primary-badge">Primary</div>}
                      </div>
                    ))}
                    <label className="image-upload-box">
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImages} style={{ display: 'none' }} />
                      <Upload size={22} />
                      <span>{uploadingImages ? 'Uploading...' : 'Upload'}</span>
                    </label>
                  </div>
                  <p className="upload-hint">Drag images to reorder · First image is used as the main thumbnail</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Product Name *
                      <Tooltip text="The full name shown on the product page and in search results">
                        <span className="field-info"><Info size={13} /></span>
                      </Tooltip>
                    </label>
                    <input type="text" required placeholder="e.g. Monogram Canvas Tote" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>
                      Brand
                      <Tooltip text="The designer or brand name. Shown as a badge on the product page.">
                        <span className="field-info"><Info size={13} /></span>
                      </Tooltip>
                    </label>
                    <input type="text" placeholder="e.g. Louis Vuitton" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="4" placeholder="Describe the item — material, condition details, notable features..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>

              {/* Pricing */}
              <div className="form-section">
                <h3 className="section-title">Pricing & Inventory</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Sale Price *
                      <Tooltip text="The price customers pay. Set lower than Original Price to show savings.">
                        <span className="field-info"><Info size={13} /></span>
                      </Tooltip>
                    </label>
                    <input type="number" step="0.01" required placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>
                      Original / Retail Price
                      <Tooltip text="The original retail price. Used to calculate and display the discount amount.">
                        <span className="field-info"><Info size={13} /></span>
                      </Tooltip>
                    </label>
                    <input type="number" step="0.01" placeholder="0.00" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>
                      Stock Quantity *
                      <Tooltip text="Number of units available. Items with fewer than 5 are flagged as low stock.">
                        <span className="field-info"><Info size={13} /></span>
                      </Tooltip>
                    </label>
                    <input type="number" required placeholder="1" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Discount %</label>
                    <input type="number" placeholder="0" value={formData.discount_percentage} onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="form-section">
                <h3 className="section-title">Product Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Category *</label>
                    <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      <option value="">Select category</option>
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                      <option value="accessories">Accessories</option>
                      <option value="shoes">Shoes</option>
                      <option value="bags">Bags</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      Subcategory
                      <Tooltip text="More specific classification, e.g. 'Totes', 'Jackets', 'Sneakers'">
                        <span className="field-info"><Info size={13} /></span>
                      </Tooltip>
                    </label>
                    <input type="text" placeholder="e.g. Totes, Jackets" value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>
                      Available Sizes
                      <Tooltip text="Comma-separated sizes, e.g. 'S, M, L' or '38, 40, 42'. Leave blank if one-size.">
                        <span className="field-info"><Info size={13} /></span>
                      </Tooltip>
                    </label>
                    <input type="text" placeholder="e.g. S, M, L or 38, 40, 42" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Condition</label>
                    <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })}>
                      <option value="">Select condition</option>
                      <option value="new">New — never worn, tags attached</option>
                      <option value="like-new">Like New — worn once or twice</option>
                      <option value="excellent">Excellent — minor signs of wear</option>
                      <option value="good">Good — noticeable wear, well maintained</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="form-section">
                <h3 className="section-title">Visibility Options</h3>
                <div className="form-checkboxes">
                  <CustomCheckbox
                    checked={formData.featured}
                    onChange={() => setFormData({ ...formData, featured: !formData.featured })}
                    label="Featured Product"
                    description="Pins this product to the top of the shop and shows it in the Featured section on the homepage."
                  />
                  <CustomCheckbox
                    checked={formData.is_on_sale}
                    onChange={() => setFormData({ ...formData, is_on_sale: !formData.is_on_sale })}
                    label="On Sale"
                    description="Displays a Sale badge on the product card and shows the original price with a strikethrough."
                  />
                </div>
              </div>

              <div className="modal-actions-large">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
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

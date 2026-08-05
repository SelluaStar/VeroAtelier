import { X, ZoomIn, Share, MoreHorizontal } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ImagePreviewModal.css';

function ImagePreviewModal({ imageUrl, productName, brandName, onClose }) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return createPortal(
    <div className="image-preview-overlay" onClick={onClose}>
      <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-actions">
          <button className="preview-action-btn" title="Zoom">
            <ZoomIn size={20} />
          </button>
          <button className="preview-action-btn" title="Share">
            <Share size={20} />
          </button>
          <button className="preview-action-btn" title="More">
            <MoreHorizontal size={20} />
          </button>
          <button className="preview-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Image Container */}
        <div className="preview-image-container">
          <img src={imageUrl} alt="Size Guide" className="preview-image" />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ImagePreviewModal;

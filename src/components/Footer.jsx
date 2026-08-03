import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          {/* Newsletter */}
          <div className="footer-newsletter">
            <h3 className="footer-title">The List</h3>
            <p className="footer-text">
              Sign up for early access to curated drops, archival pieces, and exclusive editorial content.
            </p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                required
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-submit">→</button>
            </form>
          </div>

          {/* Links */}
          <div className="footer-links-grid">
            <div className="footer-links-column">
              <h4 className="footer-links-title">Shop</h4>
              <ul className="footer-links">
                <li><Link to="/shop">New Arrivals</Link></li>
                <li><Link to="/shop/men">Men</Link></li>
                <li><Link to="/shop/women">Women</Link></li>
                <li><Link to="/shop/unisex">Unisex</Link></li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h4 className="footer-links-title">Support</h4>
              <ul className="footer-links">
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Shipping & Returns</a></li>
                <li><a href="#">Authentication</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h4 className="footer-links-title">Social</h4>
              <ul className="footer-links">
                <li><a href="#">Instagram</a></li>
                <li><a href="#">TikTok</a></li>
                <li><a href="#">Pinterest</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2024 Vero Atelier. All Rights Reserved.
          </p>
          <div className="footer-brand">VERO ATELIER</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Account from './pages/Account';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import Onboarding from './pages/Onboarding';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import ProductOrder from './pages/admin/ProductOrder';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import Coupons from './pages/admin/Coupons';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/signin', '/signup', '/verify-email', '/onboarding'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!isAuthPage && !isAdminPage && <Header />}
      {!isAuthPage && !isAdminPage && <CartDrawer />}
      <main className={`main-content ${!isAuthPage && !isAdminPage ? 'with-header' : ''}`}>
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/shop/:category?" element={<Shop />} />
            <Route path="/shop/:category/:subcategory" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/account" element={<Account />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="product-order" element={<ProductOrder />} />
              <Route path="orders" element={<Orders />} />
              <Route path="users" element={<Users />} />
              <Route path="coupons" element={<Coupons />} />
            </Route>
          </Routes>
        </PageTransition>
      </main>
      {!isAuthPage && !isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

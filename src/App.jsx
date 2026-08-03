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
import Onboarding from './pages/Onboarding';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/signin', '/signup', '/onboarding'].includes(location.pathname);

  return (
    <div className="app">
      {!isAuthPage && <Header />}
      {!isAuthPage && <CartDrawer />}
      <main className={`main-content ${!isAuthPage ? 'with-header' : ''}`}>
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
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </PageTransition>
      </main>
      {!isAuthPage && <Footer />}
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

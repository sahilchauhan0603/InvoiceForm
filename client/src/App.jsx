import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useEffect } from 'react';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-teal-300 to-blue-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-black">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in and not on auth pages, redirect to login
  if (!user && !['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-300 to-blue-200 flex flex-col justify-between">
      {/* Navigation for authenticated users */}
      {user && (
        <div className="flex flex-col items-center px-4 py-8">
          <header className="text-center mb-8 w-full">
            <h1 className="text-4xl font-extrabold text-black drop-shadow-lg mb-2">
              Invoice Management System
            </h1>
            <p className="text-lg text-black/90 mb-6">
              {user.role === 'admin' ? 'Admin Dashboard' : 'Your Invoice Portal'}
            </p>
            <Navigation />
          </header>
        </div>
      )}

      {/* Unified Routes */}
      <main className="w-full max-w-4xl mx-auto">
        <Routes>
          {/* Authenticated routes */}
          {user && (
            <>
              <Route path="/" element={<InvoiceForm />} />
              <Route path="/invoices" element={<InvoiceList />} />
            </>
          )}
          
          {/* Auth pages */}
          {!user && (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </>
          )}
          
          {/* Common pages */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Redirects */}
          {user && (
            <>
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/signup" element={<Navigate to="/" replace />} />
            </>
          )}
          
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </main>

      {user && (
        <footer className="text-center text-black/80 text-sm pb-4">
          <p>© {new Date().getFullYear()} Invoice App. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
}

// Navigation component to handle active states
function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <nav className="flex justify-center space-x-6 mb-2">
        <Link 
          to="/" 
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            location.pathname === '/' 
              ? 'bg-white text-teal-600 shadow-md' 
              : 'text-black hover:bg-white/50'
          }`}
        >
          New Invoice
        </Link>
        <Link 
          to="/invoices" 
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            location.pathname === '/invoices' 
              ? 'bg-white text-teal-600 shadow-md' 
              : 'text-black hover:bg-white/50'
          }`}
        >
          View Invoices
        </Link>
      </nav>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium bg-white/80 px-3 py-1 rounded-full">
          {user?.role === 'admin' ? 'Admin' : 'User'} Mode
        </span>
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1 hover:bg-white/50 rounded-full transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
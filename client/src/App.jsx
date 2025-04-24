import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-r from-teal-300 to-blue-200 flex flex-col justify-between">
        <div className="flex flex-col items-center px-4 py-8">
          <header className="text-center mb-8 w-full">
            <h1 className="text-4xl font-extrabold text-black drop-shadow-lg mb-2">
              Invoice Management System
            </h1>
            <p className="text-lg text-black/90 mb-6">
              Upload and manage your invoices efficiently
            </p>
            
            <Navigation />
          </header>

          <main className="w-full max-w-4xl">
            <Routes>
              <Route path="/" element={<InvoiceForm />} />
              <Route path="/invoices" element={<InvoiceList />} />
            </Routes>
          </main>
        </div>

        <footer className="text-center text-black/80 text-sm pb-4">
          <p>© {new Date().getFullYear()} Invoice App. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

// Navigation component to handle active states
function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="flex justify-center space-x-6 mb-6">
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
  );
}

export default App;
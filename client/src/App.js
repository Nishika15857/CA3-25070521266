import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingPage from './components/LoadingPage';

// Simple ErrorBoundary to prevent blank white screens
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary, #16a34a)', marginBottom: '0.5rem' }}>🔁 CampusLoop</h2>
          <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '1.5rem' }}>An error occurred while loading this section.</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy-loaded pages
const Home          = lazy(() => import('./pages/Home'));
const Browse        = lazy(() => import('./pages/Browse'));
const ItemDetails   = lazy(() => import('./pages/ItemDetails'));
const ReportLost    = lazy(() => import('./pages/ReportLost'));
const ReportFound   = lazy(() => import('./pages/ReportFound'));
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const AdminDashboard= lazy(() => import('./pages/AdminDashboard'));
const Profile       = lazy(() => import('./pages/Profile'));
const About         = lazy(() => import('./pages/About'));
const Contact       = lazy(() => import('./pages/Contact'));
const Safety        = lazy(() => import('./pages/Safety'));
const NotFound      = lazy(() => import('./pages/NotFound'));

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// Public route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Navbar />
      <main>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/safety" element={<Safety />} />

            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            <Route path="/report-lost" element={<ProtectedRoute><ReportLost /></ProtectedRoute>} />
            <Route path="/report-found" element={<ProtectedRoute><ReportFound /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </ErrorBoundary>
  );
}

export default App;

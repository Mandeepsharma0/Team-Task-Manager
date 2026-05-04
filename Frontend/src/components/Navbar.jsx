import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiGrid } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav style={{
        background: '#fff', borderBottom: '1px solid #eee',
        padding: '14px 0', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/projects" style={{ fontWeight: 700, fontSize: 20, color: '#6c5ce7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiGrid /> ProjectHub
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, color: '#555' }}>👋 {user?.name}</span>
            <button className="btn btn-ghost" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </nav>
      <main style={{ padding: '28px 0', minHeight: 'calc(100vh - 60px)' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </>
  );
}
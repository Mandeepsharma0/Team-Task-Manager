import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { FiArrowLeft } from 'react-icons/fi';

const StatCard = ({ title, value, color }) => (
  <div className="card" style={{ textAlign: 'center' }}>
    <p style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>{title}</p>
    <p style={{ fontSize: 40, fontWeight: 700, color }}>{value}</p>
  </div>
);

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, projRes] = await Promise.all([
          api.get(`/tasks/dashboard/${id}`),
          api.get(`/projects/${id}`)
        ]);
        setStats(statsRes.data);
        setProjectName(projRes.data.name);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, [id]);

  if (loading) return <p>Loading dashboard...</p>;
  if (!stats) return null;

  const statusColors = { 'To Do': '#636e72', 'In Progress': '#e17055', 'Done': '#27ae60' };

  return (
    <>
      <button onClick={() => navigate(`/projects/${id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 16 }}>
        <FiArrowLeft /> Back to Project
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28 }}>📊 Dashboard — {projectName}</h1>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard title="Total Tasks" value={stats.total} color="#6c5ce7" />
        <StatCard title="To Do" value={stats.byStatus['To Do']} color="#636e72" />
        <StatCard title="In Progress" value={stats.byStatus['In Progress']} color="#e17055" />
        <StatCard title="Done" value={stats.byStatus['Done']} color="#27ae60" />
        <StatCard title="Overdue" value={stats.overdue} color="#e74c3c" />
      </div>

      {/* Progress bar */}
      <div className="card" style={{ marginBottom: 28 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>Task Progress</h3>
        {stats.total === 0 ? <p style={{ color: '#888' }}>No tasks yet</p> : (
          <div style={{ background: '#eee', borderRadius: 8, height: 16, overflow: 'hidden' }}>
            {['To Do', 'In Progress', 'Done'].map(s => {
              const pct = stats.total ? (stats.byStatus[s] / stats.total * 100) : 0;
              return pct > 0 ? (
                <div key={s} style={{ display: 'inline-block', width: `${pct}%`, height: '100%', background: statusColors[s], transition: 'width 0.5s' }} title={`${s}: ${pct.toFixed(0)}%`} />
              ) : null;
            })}
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          {Object.entries(statusColors).map(([s, c]) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />{s}
            </span>
          ))}
        </div>
      </div>

      {/* Tasks per user */}
      {Object.keys(stats.byUser).length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Tasks per Member</h3>
          {Object.entries(stats.byUser).map(([name, count]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6c5ce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                {name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
                  <span style={{ fontSize: 13, color: '#888' }}>{count} task{count !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ background: '#eee', borderRadius: 4, height: 6 }}>
                  <div style={{ width: `${stats.total ? count/stats.total*100 : 0}%`, background: '#6c5ce7', borderRadius: 4, height: '100%', transition: 'width 0.5s' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
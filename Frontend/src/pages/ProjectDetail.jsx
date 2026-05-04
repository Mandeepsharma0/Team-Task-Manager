import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import AddMemberModal from '../components/AddMemberModal';
import { FiPlus, FiUserPlus, FiBarChart2, FiArrowLeft, FiUserMinus } from 'react-icons/fi';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
    } catch { toast.error('Failed to load project'); navigate('/projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const myRole = project?.members.find(m => m.user._id === user._id)?.role;
  const isAdmin = myRole === 'Admin';

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? data : t));
    } catch { toast.error('Failed to update status'); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const { data } = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(data);
      toast.success('Member removed');
    } catch { toast.error('Failed to remove member'); }
  };

  const statusColumns = ['To Do', 'In Progress', 'Done'];

  if (loading) return <p>Loading...</p>;
  if (!project) return null;

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button onClick={() => navigate('/projects')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 12 }}>
          <FiArrowLeft /> Back to Projects
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700 }}>{project.name}</h1>
            {project.description && <p style={{ color: '#888', marginTop: 4 }}>{project.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={() => navigate(`/projects/${id}/dashboard`)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiBarChart2 /> Dashboard
            </button>
            {isAdmin && <>
              <button className="btn btn-ghost" onClick={() => setShowMemberModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiUserPlus /> Add Member
              </button>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiPlus /> New Task
              </button>
            </>}
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="card" style={{ marginBottom: 28 }}>
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>Team Members</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {project.members.map(m => (
            <div key={m.user._id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8f9fa', padding: '8px 14px', borderRadius: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6c5ce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                {m.user.name[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{m.user.name}</p>
                <span className={`badge badge-${m.role === 'Admin' ? 'admin' : 'member'}`}>{m.role}</span>
              </div>
              {isAdmin && m.user._id !== user._id && (
                <button onClick={() => handleRemoveMember(m.user._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: '0 4px' }}>
                  <FiUserMinus />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {statusColumns.map(col => {
          const colTasks = tasks.filter(t => t.status === col);
          return (
            <div key={col}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: col === 'To Do' ? '#636e72' : col === 'In Progress' ? '#e17055' : '#27ae60' }}>
                  {col}
                </h3>
                <span style={{ background: '#eee', borderRadius: 20, padding: '2px 10px', fontSize: 13 }}>{colTasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {colTasks.length === 0 ? (
                  <div style={{ border: '2px dashed #ddd', borderRadius: 10, padding: '20px', textAlign: 'center', color: '#bbb', fontSize: 13 }}>
                    No tasks
                  </div>
                ) : colTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isAdmin={isAdmin}
                    userId={user._id}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                    members={project.members}
                    projectId={id}
                    onUpdate={(updated) => setTasks(tasks.map(t => t._id === updated._id ? updated : t))}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showTaskModal && (
        <CreateTaskModal
          projectId={id}
          members={project.members}
          onClose={() => setShowTaskModal(false)}
          onCreated={(task) => { setTasks([task, ...tasks]); setShowTaskModal(false); toast.success('Task created!'); }}
        />
      )}

      {showMemberModal && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowMemberModal(false)}
          onAdded={(updatedProject) => { setProject(updatedProject); setShowMemberModal(false); toast.success('Member added!'); }}
        />
      )}
    </>
  );
}
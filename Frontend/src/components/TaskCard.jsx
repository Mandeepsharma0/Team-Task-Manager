import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiTrash2, FiEdit2, FiCalendar, FiUser } from 'react-icons/fi';

const statusOptions = ['To Do', 'In Progress', 'Done'];
const priorityClass = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high' };

export default function TaskCard({ task, isAdmin, userId, onStatusChange, onDelete, members, projectId, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: task.title, description: task.description || '',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    priority: task.priority, assignedTo: task.assignedTo?._id || '',
    status: task.status
  });

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
  const canEdit = isAdmin || task.assignedTo?._id === userId;

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/tasks/${task._id}`, form);
      onUpdate(data);
      setEditing(false);
      toast.success('Task updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  if (editing && isAdmin) {
    return (
      <div className="card" style={{ border: '2px solid #6c5ce7' }}>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                {['Low','Medium','High'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {statusOptions.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Assign To</label>
            <select value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: 13 }}>Save</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card" style={{ border: isOverdue ? '1.5px solid #e74c3c' : '1.5px solid transparent' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 15, flex: 1, marginRight: 8 }}>{task.title}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {isAdmin && <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c5ce7' }}><FiEdit2 size={14} /></button>}
          {isAdmin && <button onClick={() => onDelete(task._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}><FiTrash2 size={14} /></button>}
        </div>
      </div>

      {task.description && <p style={{ fontSize: 13, color: '#888', marginBottom: 10, lineHeight: 1.5 }}>{task.description}</p>}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <span className={`badge ${priorityClass[task.priority]}`}>{task.priority}</span>
        {isOverdue && <span className="badge" style={{ background: '#fde8e8', color: '#c0392b' }}>Overdue</span>}
      </div>

      {task.assignedTo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555', marginBottom: 6 }}>
          <FiUser size={12} /> {task.assignedTo.name}
        </div>
      )}

      {task.dueDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isOverdue ? '#e74c3c' : '#888', marginBottom: 10 }}>
          <FiCalendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}

      {/* Status change (available to assigned member or admin) */}
      {canEdit && (
        <select value={task.status} onChange={e => onStatusChange(task._id, e.target.value)}
          style={{ fontSize: 12, padding: '4px 8px', width: 'auto', borderColor: '#ddd' }}>
          {statusOptions.map(s => <option key={s}>{s}</option>)}
        </select>
      )}
    </div>
  );
}
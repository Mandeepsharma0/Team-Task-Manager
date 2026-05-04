const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper: verify user is project member
const getProjectAndVerify = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };
  const member = project.members.find(m => m.user.toString() === userId.toString());
  if (!member) return { error: 'Not a member of this project', status: 403 };
  return { project, role: member.role };
};

// Create task (Admin only)
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo, projectId } = req.body;
    if (!title || !projectId) return res.status(400).json({ message: 'Title and projectId are required' });

    const { project, role, error, status } = await getProjectAndVerify(projectId, req.user._id);
    if (error) return res.status(status).json({ message: error });
    if (role !== 'Admin') return res.status(403).json({ message: 'Only admins can create tasks' });

    const task = await Task.create({
      title, description, dueDate, priority,
      assignedTo: assignedTo || null,
      project: projectId,
      createdBy: req.user._id
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get tasks for a project
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { error, status, role } = await getProjectAndVerify(projectId, req.user._id);
    if (error) return res.status(status).json({ message: error });

    let query = { project: projectId };
    // Members only see their assigned tasks
    if (role === 'Member') query.assignedTo = req.user._id;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { role, error, status } = await getProjectAndVerify(task.project._id, req.user._id);
    if (error) return res.status(status).json({ message: error });

    // Members can only update status of their own tasks
    if (role === 'Member') {
      if (task.assignedTo?.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'You can only update your own tasks' });
      const { status: newStatus } = req.body;
      task.status = newStatus || task.status;
    } else {
      // Admin can update everything
      const { title, description, dueDate, priority, assignedTo, status: newStatus } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (priority) task.priority = priority;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (newStatus) task.status = newStatus;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete task (Admin only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { role, error, status } = await getProjectAndVerify(task.project, req.user._id);
    if (error) return res.status(status).json({ message: error });
    if (role !== 'Admin') return res.status(403).json({ message: 'Admin access required' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { error, status, role } = await getProjectAndVerify(projectId, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const allTasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email');

    const now = new Date();
    const stats = {
      total: allTasks.length,
      byStatus: {
        'To Do': allTasks.filter(t => t.status === 'To Do').length,
        'In Progress': allTasks.filter(t => t.status === 'In Progress').length,
        'Done': allTasks.filter(t => t.status === 'Done').length,
      },
      overdue: allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done').length,
      byUser: {}
    };

    allTasks.forEach(task => {
      if (task.assignedTo) {
        const userName = task.assignedTo.name;
        if (!stats.byUser[userName]) stats.byUser[userName] = 0;
        stats.byUser[userName]++;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTask, getTasksByProject, updateTask, deleteTask, getDashboardStats };
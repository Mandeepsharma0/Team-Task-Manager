const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTask, getTasksByProject, updateTask, deleteTask, getDashboardStats
} = require('../controllers/taskController');

router.use(protect);

router.post('/', createTask);
router.get('/project/:projectId', getTasksByProject);
router.get('/dashboard/:projectId', getDashboardStats);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
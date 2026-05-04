const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createProject, getProjects, getProject,
  addMember, removeMember, deleteProject
} = require('../controllers/projectController');

router.use(protect); // All project routes require login

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
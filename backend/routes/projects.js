const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  redeemProjectToken,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect); // All project routes require authentication

router.route('/')
  .get(getProjects)
  .post(authorize('admin'), createProject);

router.route('/share/:token')
  .get(redeemProjectToken);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(authorize('admin'), deleteProject);

module.exports = router;

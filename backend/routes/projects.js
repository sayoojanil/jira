const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  redeemProjectToken,
  updateProject,
  deleteProject,
  downloadInvoice,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.use(protect); // All project routes require authentication

router.route('/')
  .get(getProjects)
  .post(authorize('admin'), upload.single('bannerImage'), createProject);

router.route('/share/:token')
  .get(redeemProjectToken);

router.route('/:id/invoice')
  .get(downloadInvoice);

router.route('/:id')
  .get(getProjectById)
  .put(upload.single('bannerImage'), updateProject)
  .delete(authorize('admin'), deleteProject);

module.exports = router;

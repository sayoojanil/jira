const express = require('express');
const { reportBug, getProjectBugs, updateBug } = require('../controllers/bugController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.use(protect); // All bug routes require login

router.route('/project/:projectId')
  .post(upload.array('screenshots', 5), reportBug)
  .get(getProjectBugs);

router.route('/:id')
  .put(updateBug);

module.exports = router;

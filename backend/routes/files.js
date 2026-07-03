const express = require('express');
const { uploadFile, getProjectFiles, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.use(protect); // All file routes require login

router.route('/project/:projectId')
  .post(upload.single('file'), uploadFile)
  .get(getProjectFiles);

router.route('/:id')
  .delete(deleteFile);

module.exports = router;

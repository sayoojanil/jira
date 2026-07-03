const express = require('express');
const { getProjectActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/project/:projectId', protect, getProjectActivity);

module.exports = router;

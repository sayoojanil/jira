const express = require('express');
const { getAdminStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.get('/', protect, authorize('admin'), getAdminStats);

module.exports = router;

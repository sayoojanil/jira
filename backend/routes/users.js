const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { getTeamMemberProfile } = require('../controllers/userController');

const router = express.Router();

router.use(protect);

// @desc    Get all users with client role
// @route   GET /api/users/clients
// @access  Private/Admin
router.get('/clients', authorize('admin'), async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).select('name email gender');
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all users with team_member role
// @route   GET /api/users/team
// @access  Private/Admin
router.get('/team', authorize('admin'), async (req, res) => {
  try {
    const team = await User.find({ role: 'team_member' }).select('name email position profilePic gender');
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get a specific team member profile
// @route   GET /api/users/team/:id
// @access  Private/Admin, Client, or self
router.get('/team/:id', authorize('admin', 'client', 'team_member'), getTeamMemberProfile);

module.exports = router;

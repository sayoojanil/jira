const User = require('../models/User');

// @desc    Get a specific team member profile
// @route   GET /api/users/team/:id
// @access  Private/Admin, Client, or self
const getTeamMemberProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const teamMember = await User.findById(id).select('-password');

    if (!teamMember || teamMember.role !== 'team_member') {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    res.status(200).json({ success: true, data: teamMember });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTeamMemberProfile,
};

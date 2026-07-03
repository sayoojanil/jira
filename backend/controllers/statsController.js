const Project = require('../models/Project');
const Bug = require('../models/Bug');
const User = require('../models/User');

// @desc    Get system stats for Admin dashboard
// @route   GET /api/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'In Progress' });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });
    const pendingBugs = await Bug.countDocuments({ status: { $in: ['Open', 'Under Review'] } });
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalTeam = await User.countDocuments({ role: 'team_member' });

    // Project progress breakdown (e.g. to render simple analytics chart)
    const pendingProjects = await Project.countDocuments({ status: 'Pending' });
    const checkingProjects = await Project.countDocuments({ status: 'Checking' });
    const holdProjects = await Project.countDocuments({ status: 'On Hold' });

    // Recent project access tokens created (Latest Project Links)
    const latestProjects = await Project.find()
      .select('name secureToken client assignedClients createdAt')
      .populate('client', 'name email')
      .populate('assignedClients', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalProjects,
          activeProjects,
          completedProjects,
          pendingBugs,
          totalClients,
          totalTeam,
        },
        chartData: [
          { status: 'Pending', count: pendingProjects },
          { status: 'In Progress', count: activeProjects },
          { status: 'Checking', count: checkingProjects },
          { status: 'Completed', count: completedProjects },
          { status: 'On Hold', count: holdProjects },
        ],
        latestProjects,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminStats };

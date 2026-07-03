const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');

// @desc    Get activity logs of project
// @route   GET /api/activity/project/:projectId
// @access  Private
const getProjectActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Auth checks
    const isAssignedClient = (project.client && project.client.toString() === req.user.id) ||
                             (project.assignedClients && project.assignedClients.some(c => c.toString() === req.user.id));
    if (req.user.role === 'client' && !isAssignedClient) {
      return res.status(403).json({ success: false, message: 'Not authorized to view logs' });
    }
    if (req.user.role === 'team_member' && !project.assignedTeam.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const logs = await ActivityLog.find({ project: projectId })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProjectActivity };

const Bug = require('../models/Bug');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { uploadToCloudOrLocal } = require('../utils/cloudinary');
const { sendEmail } = require('../utils/mailer');

// Helper to log activities
const createActivity = async (projectId, userId, action, details) => {
  try {
    await ActivityLog.create({
      project: projectId,
      user: userId,
      action,
      details,
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

// @desc    Report a new bug
// @route   POST /api/bugs/project/:projectId
// @access  Private
const reportBug = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Role authentication
    const isAssignedClient = (project.client && project.client.toString() === req.user.id) ||
                             (project.assignedClients && project.assignedClients.some(c => c.toString() === req.user.id));
    if (req.user.role === 'client' && !isAssignedClient) {
      return res.status(403).json({ success: false, message: 'Not authorized to report bugs on this project' });
    }
    if (req.user.role === 'team_member' && !project.assignedTeam.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this project' });
    }

    // Process uploaded files if any
    const screenshotUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudOrLocal(file);
        screenshotUrls.push(uploadResult.url);
      }
    }

    const bug = await Bug.create({
      project: projectId,
      reporter: req.user.id,
      title,
      description,
      priority: priority || 'Medium',
      screenshots: screenshotUrls,
    });

    await createActivity(projectId, req.user.id, 'Bug Reported', `Bug reported: '${title}' (${bug.priority} Priority).`);

    // Notify admins about new bug
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: `New Bug Reported: ${title}`,
          text: `A new bug has been reported on project '${project.name}' by ${req.user.name}.\nPriority: ${priority}`,
          html: `<p>A new bug has been reported on project <b>${project.name}</b> by <b>${req.user.name}</b>.</p><p><b>Title:</b> ${title}</p><p><b>Priority:</b> ${priority}</p>`,
        });
      }
    } catch (emailErr) {
      console.error('Failed to send admin bug notifications:', emailErr.message);
    }

    // Emit socket event if io exists
    if (global.io) {
      global.io.to(projectId.toString()).emit('newBug', bug);
    }

    res.status(201).json({ success: true, data: bug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bugs for a project
// @route   GET /api/bugs/project/:projectId
// @access  Private
const getProjectBugs = async (req, res) => {
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
      return res.status(403).json({ success: false, message: 'Not authorized to view bugs' });
    }
    if (req.user.role === 'team_member' && !project.assignedTeam.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bugs = await Bug.find({ project: projectId })
      .populate('reporter', 'name email role')
      .populate('comments.author', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bugs.length, data: bugs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update bug status or details
// @route   PUT /api/bugs/:id
// @access  Private
const updateBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id).populate('reporter', 'name email');
    if (!bug) {
      return res.status(404).json({ success: false, message: 'Bug not found' });
    }

    const project = await Project.findById(bug.project);

    // Only Admin or Team Members assigned to the project can update bug status/comments
    if (req.user.role === 'client' && bug.reporter._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Clients can only update bugs they reported' });
    }

    const { status, priority, comment } = req.body;
    const attachmentUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudOrLocal(file);
        attachmentUrls.push(uploadResult.url);
      }
    }

    let statusChanged = false;
    let oldStatus = bug.status;

    if (status && status !== bug.status) {
      bug.status = status;
      statusChanged = true;
    }
    if (priority) {
      bug.priority = priority;
    }

    const hasCommentText = typeof comment === 'string' && comment.trim().length > 0;
    const hasAttachments = attachmentUrls.length > 0;

    if (hasCommentText || hasAttachments) {
      bug.comments.push({
        author: req.user.id,
        content: comment || '',
        attachments: attachmentUrls,
      });
    }

    await bug.save();

    // Log Activity & Notify client
    if (statusChanged) {
      await createActivity(
        bug.project,
        req.user.id,
        'Bug Status Updated',
        `Bug '${bug.title}' status changed from '${oldStatus}' to '${status}'.`
      );

      // Notify reporter
      try {
        await sendEmail({
          to: bug.reporter.email,
          subject: `Bug Status Updated: ${bug.title}`,
          text: `Hi ${bug.reporter.name}, the status of your reported bug '${bug.title}' has been updated to '${status}'.`,
          html: `<p>Hi <b>${bug.reporter.name}</b>,</p><p>The status of your reported bug <b>${bug.title}</b> on project <b>${project.name}</b> has been updated to <b>${status}</b>.</p>`,
        });
      } catch (err) {
        console.error('Failed to notify bug reporter:', err.message);
      }
    } else if (hasCommentText || hasAttachments) {
      await createActivity(
        bug.project,
        req.user.id,
        'Bug Comment Added',
        `New comment added on bug '${bug.title}'.`
      );

      // Notify reporter if comment by admin/team
      if (req.user.id !== bug.reporter._id.toString()) {
        try {
          const messageText = hasCommentText
            ? `Hi ${bug.reporter.name}, a new comment was added to your bug report '${bug.title}' by ${req.user.name}:\n\n"${comment}"`
            : `Hi ${bug.reporter.name}, a new attachment was added to your bug report '${bug.title}' by ${req.user.name}.`;
          const htmlText = hasCommentText
            ? `<p>Hi <b>${bug.reporter.name}</b>,</p><p>A new comment was added to your bug report <b>${bug.title}</b> by <b>${req.user.name}</b>:</p><blockquote style="border-left: 3px solid #ccc; padding-left: 10px;">${comment}</blockquote>`
            : `<p>Hi <b>${bug.reporter.name}</b>,</p><p>A new attachment was added to your bug report <b>${bug.title}</b> by <b>${req.user.name}</b>.</p>`;

          await sendEmail({
            to: bug.reporter.email,
            subject: hasCommentText ? `New Comment on Bug: ${bug.title}` : `New Attachment on Bug: ${bug.title}`,
            text: messageText,
            html: htmlText,
          });
        } catch (err) {
          console.error('Failed to notify reporter of comment:', err.message);
        }
      }
    }

    const updatedBug = await Bug.findById(bug._id)
      .populate('reporter', 'name email role')
      .populate('comments.author', 'name email role');

    if (global.io) {
      global.io.to(bug.project.toString()).emit('bugUpdated', updatedBug);
    }

    res.status(200).json({ success: true, data: updatedBug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  reportBug,
  getProjectBugs,
  updateBug,
};

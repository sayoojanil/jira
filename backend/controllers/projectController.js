const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const crypto = require('crypto');

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

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const { name, description, requirements, deadline, clientEmail, clientEmails, assignedTeam } = req.body;

    let resolvedClientIds = [];

    if (clientEmail) {
      const clientUser = await User.findOne({ email: clientEmail, role: 'client' });
      if (clientUser) {
        resolvedClientIds.push(clientUser._id);
      } else {
        return res.status(400).json({ success: false, message: `Client email '${clientEmail}' not found. Make sure client is registered.` });
      }
    }

    if (clientEmails && Array.isArray(clientEmails)) {
      for (const email of clientEmails) {
        if (!email) continue;
        const clientUser = await User.findOne({ email, role: 'client' });
        if (clientUser) {
          if (!resolvedClientIds.some(id => id.toString() === clientUser._id.toString())) {
            resolvedClientIds.push(clientUser._id);
          }
        } else {
          return res.status(400).json({ success: false, message: `Client email '${email}' not found. Make sure client is registered.` });
        }
      }
    }

    const secureToken = crypto.randomBytes(24).toString('hex');

    const project = await Project.create({
      name,
      description,
      requirements: requirements || [],
      deadline,
      client: resolvedClientIds.length > 0 ? resolvedClientIds[0] : null,
      assignedClients: resolvedClientIds,
      assignedTeam: assignedTeam || [],
      secureToken,
      milestones: [],
    });

    await createActivity(project._id, req.user.id, 'Project Created', `Project '${name}' was initialized.`);

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all projects (filtered by role)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'client') {
      // Clients can only access projects they are explicitly linked to
      query = { $or: [{ client: req.user.id }, { assignedClients: req.user.id }] };
    } else if (req.user.role === 'team_member') {
      // Team members can only see projects they are assigned to
      query = { assignedTeam: req.user.id };
    }

    const projects = await Project.find(query)
      .populate('client', 'name email')
      .populate('assignedClients', 'name email')
      .populate('assignedTeam', 'name email profilePic');

    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project by ID (with authorization checks)
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email')
      .populate('assignedClients', 'name email')
      .populate('assignedTeam', 'name email profilePic');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Role-based auth checks
    if (req.user.role === 'client') {
      const isAssigned = (project.client && project.client._id.toString() === req.user.id) ||
                         (project.assignedClients && project.assignedClients.some(c => c._id.toString() === req.user.id));
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
      }
    }

    if (req.user.role === 'team_member' && !project.assignedTeam.some(member => member._id.toString() === req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not assigned to this project' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Redeem secure project token (Unique secure project link access)
// @route   GET /api/projects/share/:token
// @access  Private
const redeemProjectToken = async (req, res) => {
  try {
    const { token } = req.params;
    const project = await Project.findOne({ secureToken: token })
      .populate('client', 'name email')
      .populate('assignedClients', 'name email')
      .populate('assignedTeam', 'name email profilePic');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Invalid project access link' });
    }

    // If client, automatically link them if project client/assignedClients is unassigned
    if (req.user.role === 'client') {
      if (!project.assignedClients) {
        project.assignedClients = [];
      }
      const isAlreadyAssigned = project.assignedClients.some(
        (c) => c._id.toString() === req.user.id
      ) || (project.client && project.client._id.toString() === req.user.id);

      if (!isAlreadyAssigned) {
        project.assignedClients.push(req.user.id);
        if (!project.client) {
          project.client = req.user.id;
        }
        await project.save();
        await createActivity(project._id, req.user.id, 'Client Linked', `Client ${req.user.name} linked via secure link.`);
      }
    } else if (req.user.role === 'team_member') {
      const isAssigned = project.assignedTeam.some(
        (member) => member._id.toString() === req.user.id
      );
      if (!isAssigned) {
        project.assignedTeam.push(req.user.id);
        await project.save();
        await createActivity(project._id, req.user.id, 'Team Member Assigned', `Team Member ${req.user.name} joined via link.`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Access granted successfully',
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project (Admin or assigned team members)
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Role-based auth
    if (req.user.role === 'client') {
      return res.status(403).json({ success: false, message: 'Clients cannot modify project configurations' });
    }

    if (req.user.role === 'team_member' && !project.assignedTeam.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this project' });
    }

    const { name, description, requirements, deadline, status, progress, milestones, clientEmail, clientEmails, assignedTeam } = req.body;

    // Track status change for email alert and activity feed
    let statusChanged = false;
    let oldStatus = project.status;
    if (status && status !== project.status) {
      project.status = status;
      statusChanged = true;
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (requirements) project.requirements = requirements;
    if (deadline) project.deadline = deadline;
    if (progress !== undefined) project.progress = progress;
    if (milestones) project.milestones = milestones;

    // Admin-only updates
    if (req.user.role === 'admin') {
      if (clientEmails !== undefined && Array.isArray(clientEmails)) {
        let resolvedClientIds = [];
        for (const email of clientEmails) {
          if (!email) continue;
          const clientUser = await User.findOne({ email, role: 'client' });
          if (clientUser) {
            resolvedClientIds.push(clientUser._id);
          } else {
            return res.status(400).json({ success: false, message: `Client email '${email}' not found.` });
          }
        }
        project.assignedClients = resolvedClientIds;
        project.client = resolvedClientIds.length > 0 ? resolvedClientIds[0] : null;
      } else if (clientEmail !== undefined) {
        if (clientEmail === '') {
          project.client = null;
          project.assignedClients = [];
        } else {
          const clientUser = await User.findOne({ email: clientEmail, role: 'client' });
          if (clientUser) {
            project.client = clientUser._id;
            project.assignedClients = [clientUser._id];
          } else {
            return res.status(400).json({ success: false, message: 'Client email not found.' });
          }
        }
      }
      if (assignedTeam) {
        project.assignedTeam = assignedTeam;
      }
    }

    await project.save();

    // Log Activity
    if (statusChanged) {
      await createActivity(
        project._id,
        req.user.id,
        'Status Updated',
        `Project status changed from '${oldStatus}' to '${status}'.`
      );

      // Trigger Webhook/Socket message & email notifications (done in controller/sockets)
      const clientIds = [];
      if (project.client) clientIds.push(project.client.toString());
      if (project.assignedClients && project.assignedClients.length > 0) {
        project.assignedClients.forEach(c => {
          const idStr = c.toString();
          if (!clientIds.includes(idStr)) {
            clientIds.push(idStr);
          }
        });
      }

      for (const clientId of clientIds) {
        const clientUser = await User.findById(clientId);
        if (clientUser) {
          try {
            const { sendEmail } = require('../utils/mailer');
            await sendEmail({
              to: clientUser.email,
              subject: `Project Update: ${project.name}`,
              text: `Hello ${clientUser.name}, the status of your project '${project.name}' has been updated to '${status}'.`,
              html: `<p>Hello <b>${clientUser.name}</b>,</p><p>The status of your project <b>${project.name}</b> has been updated to <b>${status}</b>.</p><p>Log in to view the dashboard details.</p>`,
            });
          } catch (e) {
            console.error('Email notification failed:', e.message);
          }
        }
      }
    } else {
      await createActivity(
        project._id,
        req.user.id,
        'Project Updated',
        `Project attributes were updated.`
      );
    }

    // Populate and return updated project
    const updatedProject = await Project.findById(project._id)
      .populate('client', 'name email')
      .populate('assignedClients', 'name email')
      .populate('assignedTeam', 'name email');

    // Notify connected clients via global socket if required (handled globally or via events emitter)
    if (global.io) {
      global.io.to(project._id.toString()).emit('projectUpdated', updatedProject);
    }

    res.status(200).json({ success: true, data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await Project.deleteOne({ _id: req.params.id });

    // Clean up associated activity logs, bugs, and files could be done, or left for audit history.
    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  redeemProjectToken,
  updateProject,
  deleteProject,
};

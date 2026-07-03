const File = require('../models/File');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { uploadToCloudOrLocal } = require('../utils/cloudinary');
const { sendEmail } = require('../utils/mailer');
const fs = require('fs');
const path = require('path');

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

// @desc    Upload file to project
// @route   POST /api/files/project/:projectId
// @access  Private
const uploadFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    // Role-based auth
    if (req.user.role === 'client') {
      return res.status(403).json({ success: false, message: 'Clients cannot upload project files' });
    }
    if (req.user.role === 'team_member' && !project.assignedTeam.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this project' });
    }

    // Upload to local or Cloudinary
    const uploadResult = await uploadToCloudOrLocal(req.file);

    const fileDoc = await File.create({
      project: projectId,
      uploader: req.user.id,
      name: uploadResult.name,
      url: uploadResult.url,
      size: uploadResult.size,
      type: uploadResult.type,
    });

    await createActivity(
      projectId,
      req.user.id,
      'File Uploaded',
      `File '${uploadResult.name}' uploaded by ${req.user.name}.`
    );

    // Notify clients about new file upload
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
          await sendEmail({
            to: clientUser.email,
            subject: `New File Uploaded: ${uploadResult.name}`,
            text: `Hi ${clientUser.name}, a new resource file '${uploadResult.name}' has been uploaded to your project '${project.name}' by ${req.user.name}. You can log in to access the file.`,
            html: `<p>Hi <b>${clientUser.name}</b>,</p><p>A new file <b>${uploadResult.name}</b> has been uploaded to your project <b>${project.name}</b> by <b>${req.user.name}</b>.</p><p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Log in to download the resource.</a></p>`,
          });
        } catch (emailErr) {
          console.error('Failed to notify client of upload:', emailErr.message);
        }
      }
    }

    const populatedFile = await File.findById(fileDoc._id).populate('uploader', 'name email role');

    if (global.io) {
      global.io.to(projectId.toString()).emit('fileUploaded', populatedFile);
    }

    res.status(201).json({ success: true, data: populatedFile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get files of project
// @route   GET /api/files/project/:projectId
// @access  Private
const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Role authentication
    const isAssignedClient = (project.client && project.client.toString() === req.user.id) ||
                             (project.assignedClients && project.assignedClients.some(c => c.toString() === req.user.id));
    if (req.user.role === 'client' && !isAssignedClient) {
      return res.status(403).json({ success: false, message: 'Not authorized to view files' });
    }
    if (req.user.role === 'team_member' && !project.assignedTeam.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const files = await File.find({ project: projectId })
      .populate('uploader', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: files.length, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete file from project
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const project = await Project.findById(file.project);

    // Only Admin or Uploader (Team member) can delete files
    if (req.user.role === 'client') {
      return res.status(403).json({ success: false, message: 'Clients cannot delete project files' });
    }
    if (req.user.role === 'team_member' && file.uploader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Team members can only delete files they uploaded' });
    }

    // Delete local file if it is stored locally
    if (file.url.startsWith('/uploads/')) {
      const localPath = path.join(__dirname, '..', file.url);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }

    await File.deleteOne({ _id: req.params.id });

    await createActivity(
      file.project,
      req.user.id,
      'File Deleted',
      `File '${file.name}' was removed.`
    );

    if (global.io) {
      global.io.to(file.project.toString()).emit('fileDeleted', file._id);
    }

    res.status(200).json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadFile,
  getProjectFiles,
  deleteFile,
};

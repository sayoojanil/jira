const mongoose = require('mongoose');
const crypto = require('crypto');

const MilestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  dueDate: Date,
});

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a project name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    bannerImage: {
      type: String,
      default: '',
    },
    requirements: [
      {
        type: String,
      },
    ],
    milestones: [MilestoneSchema],
    deadline: {
      type: Date,
      required: [true, 'Please add a project deadline'],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['Pending', 'Checking', 'Completed', 'In Progress', 'On Hold'],
      default: 'Pending',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedClients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    assignedTeam: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    secureToken: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Pre-save to generate secure token
ProjectSchema.pre('save', function (next) {
  if (!this.secureToken) {
    this.secureToken = crypto.randomBytes(24).toString('hex');
  }
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);

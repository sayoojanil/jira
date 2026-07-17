import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API, { getFileUrl } from '../utils/api';
import { getSocket } from '../utils/socket';
import GlassCard from '../components/GlassCard';
import {
  FolderArchive,
  FileText,
  Calendar,
  CheckSquare,
  Activity,
  Bug,
  Square,
  UploadCloud,
  Bug as BugIcon,
  Activity as ActivityIcon,
  Trash2,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  MessageSquare,
  Video,
  PlayCircle,
  Image as ImageIcon,
  Share2,
  Menu,
  X,
  User,
  File,
  Users,
  Paperclip,
  Link,
  MoreVertical,
  FileDown,
  ExternalLink,
  Send,
  Flag,
  RefreshCw,
  UserPlus,
  GitBranch,
  Link2,
  Edit3,
} from 'lucide-react';
import {
  Tabs,
  Progress,
  Tag,
  Checkbox,
  Button,
  Modal,
  Input,
  Select,
  Alert,
  message,
  Drawer,
  Badge,
  Avatar,
  Space,
  List,
  Divider,
  Timeline,
  Tooltip,
} from 'antd';
import moment from 'moment';
import { useAppSelector } from '../store';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// Jira-style Bug Details Modal Component
const JiraBugDetailsModal: React.FC<{
  activeBug: any;
  setActiveBug: (bug: any) => void;
  user: any;
  handleBugComment: () => void;
  bugComment: string;
  setBugComment: (comment: string) => void;
  bugStatusUpdate: string;
  setBugStatusUpdate: (status: string) => void;
  bugCommentFiles: FileList | null;
  setBugCommentFiles: (files: FileList | null) => void;
  submittingComment: boolean;
  handleStatusChange: (bugId: string, status: string) => Promise<void>;
}> = ({
  activeBug,
  setActiveBug,
  user,
  handleBugComment,
  bugComment,
  setBugComment,
  bugStatusUpdate,
  setBugStatusUpdate,
  bugCommentFiles,
  setBugCommentFiles,
  submittingComment,
  handleStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState('1');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    if (activeBug) {
      setEditedTitle(activeBug.title || '');
    }
  }, [activeBug]);

  if (!activeBug) return null;

  const getPriorityConfig = (priority: string) => {
    const configs = {
      Critical: { color: '#FF3B30', bg: 'bg-red-50', icon: <AlertCircle size={14} className="text-red-500" /> },
      High: { color: '#FF9500', bg: 'bg-orange-50', icon: <Flag size={14} className="text-orange-500" /> },
      Medium: { color: '#FFCC00', bg: 'bg-yellow-50', icon: <Flag size={14} className="text-yellow-500" /> },
      Low: { color: '#34C759', bg: 'bg-green-50', icon: <Flag size={14} className="text-green-500" /> },
    };
    return configs[priority as keyof typeof configs] || configs['Medium'];
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      Open: { color: '#FF9500', bg: 'bg-orange-50', dotColor: 'bg-orange-500' },
      'Under Review': { color: '#5856D6', bg: 'bg-purple-50', dotColor: 'bg-purple-500' },
      Fixed: { color: '#34C759', bg: 'bg-green-50', dotColor: 'bg-green-500' },
      Closed: { color: '#8E8E93', bg: 'bg-gray-50', dotColor: 'bg-gray-500' },
    };
    return configs[status as keyof typeof configs] || configs['Open'];
  };

  const statusOptions = ['Open', 'Under Review', 'Fixed', 'Closed'];
  const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];

  const handleSaveTitle = async () => {
    try {
      await API.put(`/bugs/${activeBug._id}`, { title: editedTitle });
      setActiveBug({ ...activeBug, title: editedTitle });
      setIsEditingTitle(false);
      message.success('Title updated successfully');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update title');
    }
  };

  return (
    <Modal
      open={activeBug !== null}
      onCancel={() => setActiveBug(null)}
      footer={null}
      width="95%"
      style={{ maxWidth: 1000 }}
      className="jira-bug-modal"
      bodyStyle={{ padding: 0 }}
      closeIcon={<X className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
    >
      <div className="flex flex-col lg:flex-row min-h-[600px] max-h-[90vh] bg-gray-50">
        {/* Main Content - Left side */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 mr-4">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-xl font-bold"
                    onPressEnter={handleSaveTitle}
                    autoFocus
                  />
                  <Button size="small" type="primary" onClick={handleSaveTitle}>
                    Save
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditedTitle(activeBug.title);
                      setIsEditingTitle(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Bug className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{activeBug.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {activeBug.reporter?.name || 'Unknown'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {moment(activeBug.createdAt).format('MMM D, YYYY')}
                      </span>
                      <span className="hidden sm:flex items-center gap-1">
                        <RefreshCw size={12} />
                        Updated {moment(activeBug.updatedAt).fromNow()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="text"
                icon={<Edit3 size={16} />}
                className="text-gray-500"
                onClick={() => setIsEditingTitle(true)}
              >
                Edit
              </Button>
              <Button type="text" icon={<MoreVertical size={16} />} className="text-gray-500" />
            </div>
          </div>

          {/* Status & Priority Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Status</span>
              <Select
                value={bugStatusUpdate || activeBug.status}
                onChange={(value) => {
                  setBugStatusUpdate(value);
                  handleStatusChange(activeBug._id, value);
                }}
                className="w-32"
                size="small"
              >
                {statusOptions.map((status) => (
                  <Option key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusConfig(status).dotColor}`} />
                      {status}
                    </div>
                  </Option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Priority</span>
              <Select
                value={activeBug.priority}
                className="w-28"
                size="small"
                onChange={async (value) => {
                  try {
                    await API.put(`/bugs/${activeBug._id}`, { priority: value });
                    setActiveBug({ ...activeBug, priority: value });
                    message.success('Priority updated');
                  } catch (err: any) {
                    message.error(err.response?.data?.message || 'Failed to update priority');
                  }
                }}
              >
                {priorityOptions.map((priority) => (
                  <Option key={priority} value={priority}>
                    <div className="flex items-center gap-2">
                      {getPriorityConfig(priority).icon}
                      {priority}
                    </div>
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Description</h4>
                <Button
                  type="text"
                  size="small"
                  icon={<Edit3 size={14} />}
                  className="text-gray-400"
                >
                  Edit
                </Button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {activeBug.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs activeKey={activeTab} onChange={setActiveTab} className="jira-tabs">
            <TabPane
              tab={
                <span className="flex items-center gap-2">
                  <MessageSquare size={16} /> Comments
                </span>
              }
              key="1"
            >
              {/* Comments Section */}
              <div className="space-y-4 mt-4">
                {/* Add Comment */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={
                        user?.profilePic
                          ? getFileUrl(user.profilePic)
                          : user?.gender === 'Female'
                          ? 'https://img.magnific.com/free-vector/flat-style-woman-avatar_90220-2944.jpg?semt=ais_hybrid&w=740&q=80'
                          : undefined
                      }
                      className="w-8 h-8"
                    >
                      {user?.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <div className="flex-1">
                      <TextArea
                        value={bugComment}
                        onChange={(e) => setBugComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                        className="rounded-lg resize-none"
                        onPressEnter={(e) => {
                          if (!e.shiftKey) {
                            e.preventDefault();
                            if (bugComment.trim()) {
                              handleBugComment();
                            }
                          }
                        }}
                      />

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              multiple
                              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                              onChange={(e) => setBugCommentFiles(e.target.files)}
                              className="hidden"
                            />
                            <Button
                              size="small"
                              icon={<Paperclip size={14} />}
                              className="text-gray-500"
                            >
                              Attach
                            </Button>
                          </label>
                          {bugCommentFiles && bugCommentFiles.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {bugCommentFiles.length} file(s) selected
                            </span>
                          )}
                        </div>
                        <Button
                          type="primary"
                          size="small"
                          onClick={handleBugComment}
                          loading={submittingComment}
                          disabled={!bugComment.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send size={14} />
                          <span className="ml-1">Send</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment List */}
                <div className="space-y-4">
                  {activeBug.comments && activeBug.comments.length > 0 ? (
                    activeBug.comments.map((comment: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={
                              comment.author?.profilePic
                                ? getFileUrl(comment.author.profilePic)
                                : comment.author?.gender === 'Female'
                                ? 'https://img.magnific.com/free-vector/flat-style-woman-avatar_90220-2944.jpg?semt=ais_hybrid&w=740&q=80'
                                : undefined
                            }
                            className="w-8 h-8"
                          >
                            {comment.author?.name?.[0]?.toUpperCase()}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900">
                                  {comment.author?.name}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {comment.author?.role}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {moment(comment.createdAt).fromNow()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                            {comment.attachments && comment.attachments.length > 0 && (
                              <div className="mt-3 grid grid-cols-3 gap-2">
                                {comment.attachments.map((attachment: string, attIdx: number) => {
                                  const fileUrl = getFileUrl(attachment) || '';
                                  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileUrl);

                                  return (
                                    <a
                                      key={attIdx}
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition"
                                    >
                                      {isImage ? (
                                        <img
                                          src={fileUrl}
                                          alt="Attachment"
                                          className="w-full h-24 object-cover"
                                        />
                                      ) : (
                                        <div className="flex items-center gap-2 p-3 bg-gray-50">
                                          {/* <File size={16} className="text-gray-400"/> */}
                                          <span className="text-xs text-gray-600 truncate">
                                            Attachment {attIdx + 1}
                                          </span>
                                        </div>
                                      )}
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>
              </div>
            </TabPane>

            <TabPane
              tab={
                <span className="flex items-center gap-2">
                  <Activity size={16} /> Activity
                </span>
              }
              key="2"
            >
              <div className="mt-4">
                <Timeline>
                  <Timeline.Item>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">
                        {activeBug.reporter?.name}
                      </span>{' '}
                      created this bug
                      <span className="ml-2">{moment(activeBug.createdAt).fromNow()}</span>
                    </div>
                  </Timeline.Item>
                  {activeBug.comments?.map((comment: any, idx: number) => (
                    <Timeline.Item key={idx}>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{comment.author?.name}</span>
                        {comment.content &&
                          ` commented: "${comment.content.substring(0, 50)}${
                            comment.content.length > 50 ? '...' : ''
                          }"`}
                        <span className="ml-2">{moment(comment.createdAt).fromNow()}</span>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            </TabPane>
          </Tabs>
        </div>

        {/* Sidebar - Right side */}
        <div className="lg:w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Assignees */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Assignees
              </h4>
              <div className="flex items-center gap-2">
                <Avatar
                  src={
                    activeBug.assignee?.profilePic
                      ? getFileUrl(activeBug.assignee.profilePic)
                      : undefined
                  }
                  className="w-8 h-8"
                >
                  {activeBug.assignee?.name?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <span className="text-sm text-gray-700">
                  {activeBug.assignee?.name || 'Unassigned'}
                </span>
                <Button
                  type="text"
                  icon={<UserPlus size={14} />}
                  className="ml-auto text-gray-400"
                  size="small"
                />
              </div>
            </div>

            <Divider className="my-4" />

            {/* Details */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Details
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">Status</span>
                  <Tag color={getStatusConfig(activeBug.status).color} className="text-xs">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${getStatusConfig(activeBug.status).dotColor} inline-block mr-1`}
                    />
                    {activeBug.status}
                  </Tag>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">Priority</span>
                  <Tag color={getPriorityConfig(activeBug.priority).color} className="text-xs">
                    {getPriorityConfig(activeBug.priority).icon}
                    <span className="ml-1">{activeBug.priority}</span>
                  </Tag>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">Project</span>
                  <span className="text-xs text-gray-700">{activeBug.project?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">Created</span>
                  <span className="text-xs text-gray-700">
                    {moment(activeBug.createdAt).format('MMM D, YYYY HH:mm')}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">Updated</span>
                  <span className="text-xs text-gray-700">
                    {moment(activeBug.updatedAt).format('MMM D, YYYY HH:mm')}
                  </span>
                </div>
              </div>
            </div>

            <Divider className="my-4" />

            {/* Attachments */}
            {activeBug.screenshots && activeBug.screenshots.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Attachments ({activeBug.screenshots.length})
                </h4>
                <div className="space-y-2">
                  {activeBug.screenshots.map((shot: string, idx: number) => {
                    const fileUrl = getFileUrl(shot) || '';
                    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileUrl);
                    const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(fileUrl);

                    return (
                      <a
                        key={idx}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition"
                      >
                        {isImage ? (
                          <img
                            src={fileUrl}
                            alt={`Attachment ${idx + 1}`}
                            className="w-full h-24 object-cover"
                          />
                        ) : isVideo ? (
                          <div className="relative w-full h-24 bg-gray-900 flex items-center justify-center">
                            <video src={fileUrl} className="w-full h-full object-cover" muted />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <PlayCircle className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-gray-50">
                            <File size={16} className="text-gray-400" />
                            <span className="text-xs text-gray-600 truncate">
                              Attachment {idx + 1}
                            </span>
                            <Download size={14} className="ml-auto text-gray-400" />
                          </div>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <Divider className="my-4" />
            <div className="space-y-2">
              <Button block className="text-gray-600" icon={<Link2 size={14} />}>
                Copy Link
              </Button>
              <Button block className="text-gray-600" icon={<GitBranch size={14} />}>
                Create Branch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Main ProjectDetails Component
const ProjectDetails: React.FC = () => {
  const { id, token } = useParams<{ id?: string; token?: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [bugs, setBugs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // Modal forms states
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isNewMilestoneOpen, setIsNewMilestoneOpen] = useState(false);
  const [activeBug, setActiveBug] = useState<any>(null);
  const [addingMilestone, setAddingMilestone] = useState(false);

  // New Bug form
  const [bugTitle, setBugTitle] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugPriority, setBugPriority] = useState('Medium');
  const [bugScreenshots, setBugScreenshots] = useState<FileList | null>(null);

  const [togglingMilestone, setTogglingMilestone] = useState<string | null>(null);

  // New Milestone form
  const [msTitle, setMsTitle] = useState('');
  const [msDueDate, setMsDueDate] = useState('');

  // Comment state
  const [bugComment, setBugComment] = useState('');
  const [bugStatusUpdate, setBugStatusUpdate] = useState('');
  const [bugCommentFiles, setBugCommentFiles] = useState<FileList | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  const activeBugCount = bugs.filter(
    (bug) => !['Under Review', 'Fixed', 'Closed'].includes(bug.status)
  ).length;

  // State for client management
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClientEmail, setNewClientEmail] = useState('');
  const [clientEmails, setClientEmails] = useState<string[]>([]);
  const [savingClients, setSavingClients] = useState(false);

  // Initialize client emails when project loads
  useEffect(() => {
    if (project && project.assignedClients) {
      setClientEmails(project.assignedClients.map((c: any) => c.email));
    }
  }, [project]);

  const handleAddClient = () => {
    if (newClientEmail && !clientEmails.includes(newClientEmail)) {
      setClientEmails([...clientEmails, newClientEmail]);
      setNewClientEmail('');
    }
  };

  const handleRemoveClient = (index: number) => {
    setClientEmails(clientEmails.filter((_, i) => i !== index));
  };

  const handleSaveClients = async () => {
    if (!project) return;
    setSavingClients(true);
    try {
      await API.put(`/projects/${project._id}`, { clientEmails });
      message.success('Clients updated successfully');
      loadProject(project._id);
      setIsClientModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update clients');
    } finally {
      setSavingClients(false);
    }
  };

  // Drag & drop file upload
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  // Load project core details
  const loadProject = async (projectId: string) => {
    try {
      const [projRes, filesRes, bugsRes, actRes] = await Promise.all([
        API.get(`/projects/${projectId}`),
        API.get(`/files/project/${projectId}`),
        API.get(`/bugs/project/${projectId}`),
        API.get(`/activity/project/${projectId}`),
      ]);

      setProject(projRes.data.data);
      setMilestones(projRes.data.data.milestones || []);
      setFiles(filesRes.data.data);
      setBugs(bugsRes.data.data);
      setActivities(actRes.data.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Unauthorized or Project not found.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Redeeming client token
  const redeemToken = async (accessKey: string) => {
    try {
      setLoading(true);
      const res = await API.get(`/projects/share/${accessKey}`);
      message.success('Project accessed successfully via secure key!');
      navigate(`/project/${res.data.data._id}`, { replace: true });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Access token is invalid or has expired.');
      navigate('/');
    }
  };

  useEffect(() => {
    if (token) {
      redeemToken(token);
    } else if (id) {
      loadProject(id);

      const socket = getSocket();
      socket.emit('joinProject', id);

      socket.on('projectUpdated', (updatedProj) => {
        if (updatedProj._id === id) {
          setProject(updatedProj);
          setMilestones(updatedProj.milestones || []);
        }
      });

      socket.on('newBug', (newBug) => {
        setBugs((prev) => [newBug, ...prev]);
      });

      socket.on('bugUpdated', (updatedBug) => {
        setBugs((prev) => prev.map((b) => (b._id === updatedBug._id ? updatedBug : b)));
        if (activeBug && activeBug._id === updatedBug._id) {
          setActiveBug(updatedBug);
        }
      });

      socket.on('fileUploaded', (newFile) => {
        setFiles((prev) => [newFile, ...prev]);
      });

      socket.on('fileDeleted', (deletedFileId) => {
        setFiles((prev) => prev.filter((f) => f._id !== deletedFileId));
      });

      socket.on('reloadActivities', () => {
        API.get(`/activity/project/${id}`).then((res) => setActivities(res.data.data));
      });

      return () => {
        socket.emit('leaveProject', id);
        socket.off('projectUpdated');
        socket.off('newBug');
        socket.off('bugUpdated');
        socket.off('fileUploaded');
        socket.off('fileDeleted');
      };
    }
  }, [id, token]);

  const toggleMilestone = async (milestoneId: string, isCompleted: boolean) => {
    if (!project) return;

    if (user?.role !== 'team_member') {
      message.error('Only team members can update project milestones');
      return;
    }

    try {
      setTogglingMilestone(milestoneId);

      const updatedMilestones = milestones.map((m) =>
        m._id === milestoneId ? { ...m, isCompleted } : m
      );

      const completedCount = updatedMilestones.filter((m) => m.isCompleted).length;
      const totalCount = updatedMilestones.length;
      const calculatedProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const res = await API.put(`/projects/${project._id}`, {
        milestones: updatedMilestones,
        progress: calculatedProgress,
      });

      setProject(res.data.data);
      setMilestones(res.data.data.milestones);

      message.success('Milestone updated successfully');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update milestone');
    } finally {
      setTogglingMilestone(null);
    }
  };

  const handleAddMilestone = async () => {
    if (!msTitle || !project) return;

    try {
      setAddingMilestone(true);

      const updatedMilestones = [
        ...milestones,
        {
          title: msTitle,
          isCompleted: false,
          dueDate: msDueDate || undefined,
        },
      ];

      const completedCount = updatedMilestones.filter((m) => m.isCompleted).length;
      const totalCount = updatedMilestones.length;
      const calculatedProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const res = await API.put(`/projects/${project._id}`, {
        milestones: updatedMilestones,
        progress: calculatedProgress,
      });

      setProject(res.data.data);
      setMilestones(res.data.data.milestones);
      setMsTitle('');
      setMsDueDate('');
      setIsNewMilestoneOpen(false);

      message.success('Milestone added successfully');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to add milestone');
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await API.put(`/projects/${project._id}`, { status: newStatus });
      setProject(res.data.data);
      message.success('Project status updated');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleBugStatusChange = async (bugId: string, status: string) => {
    try {
      await API.put(`/bugs/${bugId}`, { status });
      setBugs((prev) => prev.map((b) => (b._id === bugId ? { ...b, status } : b)));
      if (activeBug && activeBug._id === bugId) {
        setActiveBug({ ...activeBug, status });
      }
      message.success('Bug status updated');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update bug status');
    }
  };

  const handleDownloadInvoice = async () => {
    if (!project) return;
    try {
      setDownloadingInvoice(true);
      const token = localStorage.getItem('token');
      const baseUrl = (import.meta.env.VITE_API_URL || 'https://jira-m1jo.onrender.com/api');
      const response = await fetch(`${baseUrl}/projects/${project._id}/invoice`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to generate invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `invoice_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success('Invoice PDF downloaded successfully!');
    } catch (err: any) {
      message.error(err.message || 'Failed to download invoice');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (selectedFile: File) => {
    if (!project) return;
    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      await API.post(`/files/project/${project._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      message.success('File uploaded successfully!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to upload file.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this file?')) return;
      await API.delete(`/files/${fileId}`);
      message.success('File deleted successfully.');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to delete file.');
    }
  };

  const handleReportBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle || !bugDesc || !project) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', bugTitle);
      formData.append('description', bugDesc);
      formData.append('priority', bugPriority);

      if (bugScreenshots && bugScreenshots.length > 0) {
        for (let i = 0; i < bugScreenshots.length; i++) {
          formData.append('screenshots', bugScreenshots[i]);
        }
      }

      await API.post(`/bugs/project/${project._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      message.success('Bug ticket submitted successfully!');
      setIsBugModalOpen(false);
      setBugTitle('');
      setBugDesc('');
      setBugPriority('Medium');
      setBugScreenshots(null);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to submit bug.');
    } finally {
      setLoading(false);
    }
  };

  const handleBugComment = async () => {
    if (!activeBug) return;
    if (!bugComment.trim()) {
      message.error('Please enter a comment.');
      return;
    }

    try {
      setSubmittingComment(true);
      const formData = new FormData();
      formData.append('comment', bugComment.trim());

      if (bugStatusUpdate) {
        formData.append('status', bugStatusUpdate);
      }
      if (bugCommentFiles && bugCommentFiles.length > 0) {
        for (let i = 0; i < bugCommentFiles.length; i++) {
          formData.append('attachments', bugCommentFiles[i]);
        }
      }

      const res = await API.put(`/bugs/${activeBug._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setActiveBug(res.data.data);
      setBugs((prev) => prev.map((b) => (b._id === res.data.data._id ? res.data.data : b)));
      setBugComment('');
      setBugStatusUpdate('');
      setBugCommentFiles(null);

      message.success('Comment added successfully');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'processing';
      case 'On Hold':
        return 'warning';
      case 'Checking':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'red';
      case 'High':
        return 'volcano';
      case 'Medium':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const getBugStatusColor = (status: string) => {
    switch (status) {
      case 'Closed':
        return 'default';
      case 'Fixed':
        return 'success';
      case 'Under Review':
        return 'processing';
      case 'Open':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-screen">
        <div className="flex flex-row gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0055FF] animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-[#0055FF] animate-bounce [animation-delay:-.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-[#0055FF] animate-bounce [animation-delay:-.5s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/30 via-white to-sky-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-8 pb-24 lg:pb-0">
        {/* Back link */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition px-2 py-1 rounded-lg hover:bg-sky-50"
          >
            <ChevronLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Mobile Quick Actions */}
        <div className="lg:hidden flex flex-wrap items-center gap-2">
          <Badge count={activeBugCount} offset={[10, 0]}>
            <button
              onClick={() => setActiveTab('3')}
              className="px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Bug size={14} />
              <span>Bugs</span>
            </button>
          </Badge>
          <button
            onClick={() => setActiveTab('2')}
            className="px-3 py-2 bg-sky-50 text-sky-600 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <FolderArchive size={14} />
            <span>Files</span>
          </button>
          <button
            onClick={() => setActiveTab('4')}
            className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <ActivityIcon size={14} />
            <span>Activity</span>
          </button>
          {user?.role !== 'client' && (
            <button
              onClick={() => setIsNewMilestoneOpen(true)}
              className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <CheckSquare size={14} />
              <span>Milestone</span>
            </button>
          )}
          <button
            onClick={() => setIsBugModalOpen(true)}
            className="px-3 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <AlertCircle size={14} />
            <span>Report</span>
          </button>
        </div>

        {/* Client Management Modal */}
        {user?.role === 'admin' && (
          <Modal
            title="Edit Project Clients"
            open={isClientModalOpen}
            onCancel={() => setIsClientModalOpen(false)}
            footer={null}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="Add client email"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
              />
              <Button type="primary" onClick={handleAddClient} disabled={!newClientEmail}>
                Add Client
              </Button>
              <List
                dataSource={clientEmails}
                renderItem={(email, idx) => (
                  <List.Item
                    actions={[
                      <Button type="link" danger onClick={() => handleRemoveClient(idx)}>
                        Remove
                      </Button>,
                    ]}
                  >
                    {email}
                  </List.Item>
                )}
              />
              <Button type="primary" onClick={handleSaveClients} loading={savingClients}>
                Save Changes
              </Button>
            </Space>
          </Modal>
        )}

        {/* Main Banner Board */}
        <GlassCard className="border border-sky-100/40 overflow-hidden bg-gradient-to-tr from-white via-white to-sky-50/40 p-0">
          {project.bannerImage && (
            <div className="relative h-40 md:h-56 w-full">
              <img
                src={getFileUrl(project.bannerImage)}
                alt={`${project.name} banner`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
            </div>
          )}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-6 p-4 md:p-6">
            <div className="space-y-2 md:space-y-3 flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex-1 min-w-[200px]">
                  {project.name}
                  <Tag color={getStatusColor(project.status)} className="px-2 py-0.5 ml-4 rounded-md text-[10px] md:text-xs font-semibold">
                    {project.status}
                  </Tag>
                </h1>
              </div>
              <p className="text-slate-500 text-xs md:text-sm max-w-3xl leading-relaxed">
                {project.description}
              </p>
              <br />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] md:text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Deadline: {moment(project.deadline).format('MMM DD, YYYY')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  <span>Team: {project.assignedTeam?.length || 0}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Paperclip size={14} className="text-slate-400" />
                  <span>Files: {files.length}</span>
                </span>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="space-y-2 w-full lg:w-auto">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Manage Clients
                </label>
                <Button
                  size="small"
                  type="primary"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setIsClientModalOpen(true)}
                >
                  Edit Clients
                </Button>
              </div>
            )}
            {user?.role !== 'client' && (
              <div className="space-y-1.5 w-full lg:w-auto">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Update Status
                </label>
                <Select
                  value={project.status}
                  onChange={handleStatusChange}
                  className="w-full lg:w-44"
                  size="large"
                >
                  <Option value="Pending">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                      <span>Pending</span>
                    </span>
                  </Option>
                  <Option value="In Progress">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                      <span>In Progress</span>
                    </span>
                  </Option>
                  <Option value="Checking">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                      <span>Checking</span>
                    </span>
                  </Option>
                  <Option value="On Hold">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                      <span>On Hold</span>
                    </span>
                  </Option>
                  <Option value="Completed">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                      <span>Completed</span>
                    </span>
                  </Option>
                </Select>
              </div>
            )}

            {/* Download Invoice PDF */}
            <div className="space-y-1.5 w-full lg:w-auto">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Invoice
              </label>
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#6EE000] hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md transition-all duration-200 hover:shadow-indigo-300/50 hover:scale-105 active:scale-95"
                title="Download Project Invoice as PDF"
              >
                {downloadingInvoice ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileDown size={14} />
                )}
                <span>{downloadingInvoice ? 'Generating...' : 'Download Invoice'}</span>
              </button>
            </div>
          </div>

          {/* Global Progress Bar */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-sky-100/20">
            <div className="flex justify-between items-center text-xs md:text-sm font-semibold text-slate-600 mb-2">
              <span>Overall Progress</span>
              <span className="text-sky-600">{project.progress}%</span>
            </div>
            <Progress percent={project.progress} strokeColor="#0ea5e9" size="small" showInfo={false} strokeWidth={8} />
          </div>
        </GlassCard>

        {/* Workspace Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="bg-white/30 p-1 md:p-2 rounded-2xl overflow-hidden"
          size="small"
          tabBarStyle={{ marginBottom: 0, overflowX: 'auto' }}
        >
          {/* Tab 1: Milestones & Specs */}
          <TabPane
            tab={
              <span className="hidden lg:flex items-center gap-2 font-semibold px-2">
                <CheckSquare size={18} />
                <span>Overview</span>
              </span>
            }
            key="1"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mt-3 md:mt-4">
              {/* Milestones Checklist */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <GlassCard className="border border-sky-100/30 p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm md:text-base">Milestones</h3>
                      <p className="text-[10px] md:text-xs text-slate-400">Track project checkpoints</p>
                    </div>
                    {user?.role !== 'client' && (
                      <button
                        onClick={() => setIsNewMilestoneOpen(true)}
                        className="w-full sm:w-auto px-3 md:px-4 py-1.5 md:py-2 bg-[#0055FF] hover:bg-sky-700 text-white text-[10px] md:text-xs font-semibold rounded-full shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <span>+</span>
                        <span>Add Milestone</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    {milestones.length > 0 ? (
                      milestones.map((m) => (
                        <div
                          key={m._id}
                          className={`p-3 md:p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition duration-200 ${
                            m.isCompleted ? 'bg-emerald-50/20 border-green-600/50' : 'bg-white border-sky-100/30'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => toggleMilestone(m._id, !m.isCompleted)}
                              className="mt-0.5 text-green-500 hover:text-indigo-600 shrink-0 rounded-full"
                            >
                              {togglingMilestone === m._id ? (
                                <div className="h-[18px] w-[18px] rounded-full border-sky-300 flex items-center justify-center">
                                  <Loader2 className="h-3 w-3 animate-spin text-green-500" />
                                </div>
                              ) : m.isCompleted ? (
                                <CheckCircle2 size={18} className="text-white bg-[#00F700] rounded-full" />
                              ) : (
                                <div className="h-[18px] w-[18px] rounded-full border-2 border-sky-200 hover:border-sky-500 transition-colors" />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <span
                                className={`text-xs md:text-sm font-semibold ${
                                  m.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'
                                }`}
                              >
                                {m.title}
                              </span>
                              {m.dueDate && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Due: {moment(m.dueDate).format('MMM DD, YYYY')}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">
                            <Tag color={m.isCompleted ? 'success' : 'error'} className="text-[10px]">
                              {m.isCompleted ? 'Done' : 'Pending'}
                            </Tag>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 md:py-8 text-slate-400 text-xs md:text-sm">
                        No milestones set yet.
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>

              {/* Side specifications bar */}
              <div className="space-y-4 md:space-y-6">
                {/* Requirements list */}
                <GlassCard className="border border-sky-100/30 p-4 md:p-6">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base mb-3 md:mb-4">Requirements</h3>
                  {project.requirements && project.requirements.length > 0 ? (
                    <ul className="space-y-2">
                      {project.requirements.map((req: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                          <span className="h-1.5 w-1.5 bg-sky-500 rounded-full mt-1.5 shrink-0" />
                          <span className="break-words">{req}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">No specifications defined.</p>
                  )}
                </GlassCard>

                {/* Clients list */}
                <GlassCard className="border border-sky-100/30 p-4 md:p-6">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base mb-3 md:mb-4">Clients</h3>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                    {project.assignedClients && project.assignedClients.length > 0 ? (
                      project.assignedClients.map((client: any) => (
                        <div key={client._id} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/50">
                          <Avatar src={getFileUrl(client.profilePic)} className="h-8 w-8 md:h-10 md:w-10">
                            {client.name?.[0]?.toUpperCase()}
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-xs md:text-sm font-semibold text-slate-700 truncate">
                              {client.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{client.email}</div>
                          </div>
                        </div>
                      ))
                    ) : project.client ? (
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/50">
                        <Avatar src={getFileUrl(project.client.profilePic)} className="h-8 w-8 md:h-10 md:w-10">
                          {project.client.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-xs md:text-sm font-semibold text-slate-700 truncate">
                            {project.client.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{project.client.email}</div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">No clients assigned.</p>
                    )}
                  </div>
                </GlassCard>

                {/* Team list */}
                <GlassCard className="border border-sky-100/30 p-4 md:p-6">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base mb-3 md:mb-4">Team Members</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {project.assignedTeam && project.assignedTeam.length > 0 ? (
                      project.assignedTeam.map((member: any) => (
                        <div
                          key={member._id}
                          className="flex items-center gap-2.5 cursor-pointer hover:bg-sky-50 rounded-xl p-2 transition"
                          onClick={() => navigate(`/team-member/${member._id}`)}
                        >
                          <Avatar src={getFileUrl(member.profilePic)} className="h-8 w-8 md:h-10 md:w-10">
                            {member.name?.[0]?.toUpperCase()}
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-xs md:text-sm font-semibold text-slate-700 truncate">
                              {member.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{member.email}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">No team assigned.</p>
                    )}
                  </div>
                  <br />
                  <div className="flex justify-center border-t border-sky-100 pt-4">
                    <a href="/team" className="text-[#0ea5e9] cursor-pointer hover:text-blue-800">
                      View all members
                    </a>
                  </div>
                </GlassCard>
              </div>
            </div>
          </TabPane>

          {/* Tab 2: File Sharing Module */}
          <TabPane
            tab={
              <span className="hidden lg:flex items-center gap-2 font-semibold px-2">
                <FolderArchive size={18} />
                <span>Files</span>
                <Badge count={files.length} />
              </span>
            }
            key="2"
          >
            <div className="space-y-4 md:space-y-6 mt-3 md:mt-4">
              {/* Upload Zone */}
              {user?.role !== 'client' && (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition ${
                    isDragging ? 'border-sky-500 bg-sky-50/40' : 'border-sky-200 bg-white/50 hover:bg-white'
                  }`}
                >
                  {uploadingFile ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Loader2 className="animate-spin text-sky-500" size={32} />
                      <span className="text-sm font-semibold text-slate-600">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <UploadCloud size={32} className="md:w-10 md:h-10 text-sky-400 mb-2 md:mb-3" />
                      <h3 className="text-xs md:text-sm font-bold text-slate-700 mb-1">Drag & Drop files here</h3>
                      <p className="text-[10px] md:text-xs text-slate-400 mb-3 md:mb-4 max-w-xs">
                        Upload specs, designs, code, or documents
                      </p>
                      <label className="px-4 py-2 bg-[#0055FF] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition">
                        Browse Files
                        <input type="file" onChange={handleFileSelect} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Files List */}
              <GlassCard className="border border-sky-100/30 p-4 md:p-6">
                <h3 className="font-bold text-slate-800 text-sm md:text-base mb-4 md:mb-6">Shared Files</h3>
                <div className="space-y-3">
                  {files.length > 0 ? (
                    files.map((file) => (
                      <div
                        key={file._id}
                        className="p-3 border border-sky-100/30 bg-white/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-8 w-8 md:h-10 md:w-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                            <FileText size={16} className="md:w-5 md:h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs md:text-sm font-semibold text-slate-700 truncate">
                              {file.name}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap gap-x-2">
                              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                              <span className="hidden xs:inline">•</span>
                              <span className="truncate max-w-[120px]">By: {file.uploader.name}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">{moment(file.createdAt).fromNow()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={getFileUrl(file.url)}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 md:p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-600 rounded-lg border border-sky-100/20 transition"
                            title="Download"
                          >
                            <ExternalLink size={14} className="md:w-4 md:h-4" />
                          </a>
                          {(user?.role === 'admin' || (user?.role === 'team_member' && file.uploader._id === user._id)) && (
                            <button
                              onClick={() => handleDeleteFile(file._id)}
                              className="p-1.5 md:p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-sky-100/20 transition"
                              title="Delete"
                            >
                              <Trash2 size={14} className="md:w-4 md:h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 md:py-8 text-slate-400 text-xs md:text-sm">
                      No files shared yet.
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </TabPane>

          {/* Tab 3: Bug Reporting System */}
          <TabPane
            tab={
              <span className="hidden lg:flex items-center gap-2 font-semibold px-2">
                <BugIcon size={18} />
                <span>Bugs</span>
                {activeBugCount > 0 ? <Badge count={activeBugCount} /> : <Badge dot />}
              </span>
            }
            key="3"
          >
            <div className="space-y-4 md:space-y-6 mt-3 md:mt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm md:text-base">Bug Reports</h3>
                  <p className="text-[10px] md:text-xs text-slate-400">Click on a bug to view details</p>
                </div>
                <button
                  onClick={() => setIsBugModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FF2C2C] hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  <AlertCircle size={14} />
                  <span>Report Issue</span>
                </button>
              </div>

              {/* Bugs List */}
              <div className="space-y-3">
                {bugs.length > 0 ? (
                  bugs.map((bug) => (
                    <div
                      key={bug._id}
                      onClick={() => setActiveBug(bug)}
                      className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-sky-100/30 hover:border-sky-300 hover:shadow-md transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Bug className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="font-medium text-sm text-slate-700 truncate">{bug.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Tag color={getBugStatusColor(bug.status)} className="text-[10px] m-0">
                          {bug.status}
                        </Tag>
                        <ChevronLeft className="w-4 h-4 text-slate-400 rotate-180 group-hover:text-sky-500 transition" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 md:py-12 text-slate-400 text-xs md:text-sm">
                    No bugs reported. All clear! ✨
                  </div>
                )}
              </div>
            </div>
          </TabPane>

          {/* Tab 4: Activity Feed */}
          <TabPane
            tab={
              <span className="hidden lg:flex items-center gap-2 font-semibold px-2">
                <ActivityIcon size={18} />
                <span>Activity</span>
              </span>
            }
            key="4"
          >
            <div className="mt-3 md:mt-4">
              <GlassCard className="border border-sky-100/30 p-4 md:p-6">
                <h3 className="font-bold text-slate-800 text-sm md:text-base mb-4 md:mb-6">Activity Timeline</h3>
                <div className="relative pl-5 md:pl-6 border-l-2 border-sky-100 space-y-4 md:space-y-6">
                  {activities.length > 0 ? (
                    activities.map((act) => (
                      <div key={act._id} className="relative">
                        <span className="absolute -left-[27px] md:-left-[31px] top-0.5 bg-white border-2 border-sky-400 h-3.5 w-3.5 md:h-4 md:w-4 rounded-full flex items-center justify-center shadow-sm" />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs md:text-sm font-bold text-slate-700">{act.action}</span>
                            <span className="text-[10px] text-slate-400">{moment(act.createdAt).fromNow()}</span>
                          </div>
                          <p className="text-[10px] md:text-xs text-slate-500 mt-1 break-words">{act.details}</p>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            By: {act.user.name} ({act.user.role})
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 md:py-8 text-slate-400 text-xs md:text-sm relative -left-2 md:-left-6">
                      No activity logs yet.
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </TabPane>
        </Tabs>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-sky-100/30 shadow-lg z-50 px-2 py-1.5">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {[
              { key: '1', icon: CheckSquare, label: 'Overview' },
              { key: '2', icon: FolderArchive, label: 'Files' },
              {
                key: '3',
                icon: BugIcon,
                label: 'Bugs',
                badge: activeBugCount > 0 ? activeBugCount : undefined,
              },
              { key: '4', icon: ActivityIcon, label: 'Activity' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition relative ${
                  activeTab === tab.key ? 'text-sky-600 bg-sky-50' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={18} />
                <span className="text-[8px] font-medium">{tab.label}</span>
                {tab.badge && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Issue report Modal */}
        <Modal
          title={<span className="text-base md:text-lg font-bold text-slate-800">Report Issue</span>}
          open={isBugModalOpen}
          onCancel={() => setIsBugModalOpen(false)}
          footer={null}
          className="rounded-2xl"
          width="90%"
          style={{ maxWidth: 500 }}
          bodyStyle={{ padding: '16px 20px' }}
        >
          <form onSubmit={handleReportBug} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Title
              </label>
              <Input
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
                placeholder="Short title"
                className="rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Description
              </label>
              <TextArea
                value={bugDesc}
                onChange={(e) => setBugDesc(e.target.value)}
                rows={3}
                placeholder="Describe the issue..."
                className="rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Priority
              </label>
              <Select value={bugPriority} onChange={setBugPriority} className="w-full rounded-xl">
                <Option value="Low">Low</Option>
                <Option value="Medium">Medium</Option>
                <Option value="High">High</Option>
                <Option value="Critical">Critical</Option>
              </Select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Screenshots / Files
              </label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                onChange={(e) => setBugScreenshots(e.target.files)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              />
              <p className="text-[10px] text-slate-400 mt-1">Attach screenshots or files right away when reporting an issue.</p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBugModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition"
              >
                Submit
              </button>
            </div>
          </form>
        </Modal>

        {/* Jira-style Bug Details Modal */}
        <JiraBugDetailsModal
          activeBug={activeBug}
          setActiveBug={setActiveBug}
          user={user}
          handleBugComment={handleBugComment}
          bugComment={bugComment}
          setBugComment={setBugComment}
          bugStatusUpdate={bugStatusUpdate}
          setBugStatusUpdate={setBugStatusUpdate}
          bugCommentFiles={bugCommentFiles}
          setBugCommentFiles={setBugCommentFiles}
          submittingComment={submittingComment}
          handleStatusChange={handleBugStatusChange}
        />

        {/* Create Milestone Modal */}
        <Modal
          title={<span className="text-base md:text-lg font-bold text-slate-800">Add Milestone</span>}
          open={isNewMilestoneOpen}
          onCancel={() => setIsNewMilestoneOpen(false)}
          footer={null}
          className="rounded-2xl"
          width="90%"
          style={{ maxWidth: 450 }}
          bodyStyle={{ padding: '16px 20px' }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Milestone Name
              </label>
              <Input
                value={msTitle}
                onChange={(e) => setMsTitle(e.target.value)}
                placeholder="E.g. Database Setup"
                className="rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Due Date
              </label>
              <Input
                type="date"
                value={msDueDate}
                onChange={(e) => setMsDueDate(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewMilestoneOpen(false)}
                className="px-5 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMilestone}
                disabled={!msTitle || !msDueDate || addingMilestone}
                className="px-5 py-2.5 bg-[#4C87FE] hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                {addingMilestone ? (
                  <>
                    <Loader2 className="w-2 h-2 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  'Add Milestone'
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Global CSS for Jira modal */}
   
    </div>
  );
};

export default ProjectDetails;
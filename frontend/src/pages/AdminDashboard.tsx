import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import API, { getFileUrl } from '../utils/api';
import GlassCard from '../components/GlassCard';
import {
  FolderKanban,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Users2,
  Copy,
  Plus,
  Trash2,
  Loader2,
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
} from 'lucide-react';
import {
  Modal,
  Tag,
  Progress,
  Select,
  Input,
  Button,
  message,
  Popconfirm,
  Spin,
  // Tabs,
} from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const AdminDashboard: React.FC = () => {
  // Stats state
  const [stats, setStats] = useState<any>({
    cards: {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      pendingBugs: 0,
      totalClients: 0,
      totalTeam: 0,
    },
    chartData: [],
    latestProjects: [],
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');

  // Multi-select state for new project
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [requirementsList, setRequirementsList] = useState<string[]>([]);
  const [reqInput, setReqInput] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Load stats, projects, and users
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, projectsRes, clientsRes, teamRes] = await Promise.all([
        API.get('/stats'),
        API.get('/projects'),
        API.get('/users/clients'),
        API.get('/users/team'),
      ]);

      setStats(statsRes.data.data);
      setProjects(projectsRes.data.data);
      setClients(clientsRes.data.data);
      setTeamMembers(teamRes.data.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to retrieve admin details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddRequirement = () => {
    if (reqInput.trim()) {
      setRequirementsList([...requirementsList, reqInput.trim()]);
      setReqInput('');
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirementsList(requirementsList.filter((_, i) => i !== idx));
  };

  const handleCreateProject = async (data: any) => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('deadline', data.deadline);
      formData.append('requirements', JSON.stringify(requirementsList));
      formData.append('clientEmails', JSON.stringify(selectedClients));
      formData.append('assignedTeam', JSON.stringify(selectedTeam));
      if (bannerImageFile) {
        formData.append('bannerImage', bannerImageFile);
      }

      await API.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      message.success('Project created successfully!');
      setIsModalOpen(false);
      reset();
      setRequirementsList([]);
      setSelectedClients([]);
      setSelectedTeam([]);
      setBannerImageFile(null);
      loadData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await API.delete(`/projects/${projectId}`);
      message.success('Project deleted successfully.');
      loadData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  const copyToClipboard = (token: string) => {
    const shareUrl = `${window.location.origin}/projects/share/${token}`;
    navigator.clipboard.writeText(shareUrl);
    message.success('Project access link copied to clipboard!');
  };

  // Filters projects
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'deadline-asc') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'deadline-desc') {
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
      if (sortBy === 'progress-desc') {
        return (b.progress || 0) - (a.progress || 0);
      }
      if (sortBy === 'progress-asc') {
        return (a.progress || 0) - (b.progress || 0);
      }
      if (sortBy === 'created-desc') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'created-asc') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      return 0;
    });

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

  const getBoardColumnKey = (status?: string) => {
    switch (status) {
      case 'Pending':
      case 'On Hold':
        return 'backlog';
      case 'In Progress':
        return 'progress';
      case 'Checking':
        return 'review';
      case 'Completed':
        return 'done';
      default:
        return 'selected';
    }
  };

  const kanbanColumns = [
    {
      key: 'backlog',
      title: 'Backlog',
      subtitle: 'Planned work',
      accent: 'border-slate-200 bg-slate-50/80',
      badge: 'bg-slate-100 text-slate-700',
    },
    {
      key: 'selected',
      title: 'Selected for Dev',
      subtitle: 'Ready to start',
      accent: 'border-sky-200 bg-sky-50/70',
      badge: 'bg-sky-100 text-sky-700',
    },
    {
      key: 'progress',
      title: 'In Progress',
      subtitle: 'Currently building',
      accent: 'border-amber-200 bg-amber-50/70',
      badge: 'bg-amber-100 text-amber-700',
    },
    {
      key: 'review',
      title: 'Review',
      subtitle: 'Needs approval',
      accent: 'border-violet-200 bg-violet-50/70',
      badge: 'bg-violet-100 text-violet-700',
    },
    {
      key: 'done',
      title: 'Done',
      subtitle: 'Completed work',
      accent: 'border-emerald-200 bg-emerald-50/70',
      badge: 'bg-emerald-100 text-emerald-700',
    },
  ];

  // Render Stats Grid
  const renderStatsGrid = () => {
    const cards = [
      {
        title: 'Total Projects',
        value: stats.cards.totalProjects,
        icon: <FolderKanban className="text-sky-600" size={24} />,
        bg: 'from-sky-50 to-white border-sky-100',
      },
      {
        title: 'Team Size',
        value: stats.cards.totalTeam,
        icon: <Users2 className="text-purple-600" size={24} />,
        bg: 'from-purple-50 to-white border-purple-100',
      },
      {
        title: 'Active Projects',
        value: stats.cards.activeProjects,
        icon: <PlayCircle className="text-indigo-600" size={24} />,
        bg: 'from-indigo-50 to-white border-indigo-100',
      },
      {
        title: 'Completed Projects',
        value: stats.cards.completedProjects,
        icon: <CheckCircle2 className="text-emerald-600" size={24} />,
        bg: 'from-emerald-50 to-white border-emerald-100',
      },
      {
        title: 'Pending Bugs',
        value: stats.cards.pendingBugs,
        icon: <AlertTriangle className="text-rose-600" size={24} />,
        bg: 'from-rose-50 to-white border-rose-100',
      },
      {
        title: 'Assigned Clients',
        value: stats.cards.totalClients,
        icon: <UserCheck className="text-teal-600" size={24} />,
        bg: 'from-teal-50 to-white border-teal-100',
      },
  
    ];

   return (
  <>
    {/* Mobile View */}
    <GlassCard className="md:hidden p-5 mb-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        Workspace Overview
      </h3>

      <div className="space-y-3">
        {cards.map((card, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0"
          >
            <div className="flex items-center gap-2">
              {card.icon}
              <span className="font-medium text-slate-600">
                {card.title} :
              </span>
            </div>

            <span className="font-bold text-slate-800">
              {card.value}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>

    {/* Desktop View */}
    <div className="hidden md:grid grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {cards.map((card, idx) => (
        <GlassCard
          key={idx}
          className={`bg-gradient-to-tr ${card.bg} border p-5 flex flex-col justify-between`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {card.title}
            </span>
            {card.icon}
          </div>

          <div className="mt-4 text-3xl font-extrabold text-slate-800">
            {card.value}
          </div>
        </GlassCard>
      ))}
    </div>
  </>
);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafc] dark:bg-slate-950 transition-colors duration-300">
        <Spin size="large" />
      </div>
    );
  }

  const CHART_COLORS = ['#bae6fd', '#38bdf8', '#0284c7', '#10b981', '#fbbf24'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Workspace Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Create projects, assign teams, share secure client keys and view real-time bug alerts.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 rounded-full py-3 !bg-sky-700 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold shadow-md shadow-sky-200 hover:shadow-lg transition-all"
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {/* Analytics stats */}
      {renderStatsGrid()}

      {/* Analytics chart and Latest Access links */}
      <div className="grid grid-cols-1 gap-8">
        <GlassCard className="border border-sky-100/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Team Members</h3>
              <p className="text-xs text-slate-400">Review the active team and open profiles from here.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <div key={member._id} className="border border-slate-200 rounded-none  p-4 bg-white shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-sky-100 flex items-center justify-center">
  {member.profilePic ? (
    <img
      src={getFileUrl(member.profilePic)}
      alt={member.name}
      className="h-full w-full object-cover"
    />
  ) : (
    <span className="font-bold text-lg text-sky-700">
      {member.name[0]?.toUpperCase()}
    </span>
  )}
</div>
                    <div>
                      <div className="font-semibold text-slate-800">{member.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{member.email}</div>
                      {/* <div className="text-[10px] text-slate-400 font-bold">{member.email}</div> */}
  
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 space-y-2 mb-4">
                    <div>{member.position || 'Not set'}</div>
                    <div>{member.phone}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open(`/team-member/${member._id}`, '_self')}
                    className="w-full h-10 py-2 rounded-full !bg-sky-700 text-white text-xs font-semibold hover:bg-sky-600 transition"
                  >
                    View Profile
                  </button>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">No team members found.</div>
            )}
          </div>
        </GlassCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Breakdown Chart */}
        {/* <GlassCard className="lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 mb-6">Projects Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} barSize={40}>
                <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(224, 242, 254, 0.2)' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {stats.chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard> */}

        {/* Latest Project Links */}
        <GlassCard className="flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-2">Latest Project Links</h3>
          <p className="text-xs text-slate-400 mb-6">
            Quickly copy links to share with clients for direct portal onboarding.
          </p>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-64 pr-1">
            {stats.latestProjects && stats.latestProjects.length > 0 ? (
              stats.latestProjects.map((p: any) => (
                <div
                  key={p._id}
                  className="p-3 bg-sky-50/40 border border-sky-100/50 rounded-xl flex items-center justify-between gap-3 hover:bg-sky-50 transition duration-200"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-700 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {p.assignedClients && p.assignedClients.length > 0
                        ? `Clients: ${p.assignedClients.map((c: any) => c.name).join(', ')}`
                        : (p.client ? `Client: ${p.client.name}` : 'Unassigned Client')}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(p.secureToken)}
                    className="p-2 bg-white hover:bg-sky-100 text-sky-600 rounded-lg shadow-sm border border-sky-100 transition"
                    title="Copy Link"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-slate-400">
                <FolderKanban size={24} className="text-slate-300 mb-2" />
                <span className="text-xs">No project links generated yet</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Jira-style Project Kanban */}
      <GlassCard>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Jira Project Board</h3>
            <p className="text-xs text-slate-400 mt-1">
              Track delivery stages with a board that feels like Jira for every project.
            </p>
          </div>
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-60 rounded-xl"
              allowClear
            />
            <Select
              defaultValue="All"
              onChange={(value) => setStatusFilter(value)}
              className="w-full sm:w-40"
              dropdownClassName="rounded-xl"
            >
              <Option value="All">All Statuses</Option>
              <Option value="Pending">Pending</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Checking">Checking</Option>
              <Option value="Completed">Completed</Option>
              <Option value="On Hold">On Hold</Option>
            </Select>
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              className="w-full sm:w-48"
              dropdownClassName="rounded-xl"
            >
              <Option value="name-asc">Name (A-Z)</Option>
              <Option value="name-desc">Name (Z-A)</Option>
              <Option value="deadline-asc">Deadline (Soonest)</Option>
              <Option value="deadline-desc">Deadline (Latest)</Option>
              <Option value="progress-desc">Progress (Highest)</Option>
              <Option value="progress-asc">Progress (Lowest)</Option>
              <Option value="created-desc">Newest Created</Option>
              <Option value="created-asc">Oldest Created</Option>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-5">
          {kanbanColumns.map((column) => {
            const columnProjects = filteredProjects.filter(
              (project) => getBoardColumnKey(project.status) === column.key
            );

            return (
              <div key={column.key} className={`rounded-2xl border p-3 min-h-[420px] ${column.accent}`}>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{column.title}</h4>
                    <p className="text-[11px] text-slate-500">{column.subtitle}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${column.badge}`}>
                    {columnProjects.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnProjects.length > 0 ? (
                    columnProjects.map((project) => {
                      const clientsList = project.assignedClients && project.assignedClients.length > 0
                        ? project.assignedClients
                        : (project.client ? [project.client] : []);

                      return (
                        <div
                          key={project._id}
                          onClick={() => window.open(`/project/${project._id}`, '_self')}
                          className="cursor-pointer rounded-2xl border border-white/70 bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-slate-800 line-clamp-2">
                                {project.name}
                              </div>
                              <div className="mt-1 text-[11px] text-slate-400">
                                {moment(project.deadline).format('MMM DD, YYYY')}
                              </div>
                            </div>
                            <Tag color={getStatusColor(project.status)}>{project.status}</Tag>
                          </div>

                          <p className="mb-3 text-xs leading-5 text-slate-500 line-clamp-3">
                            {project.description || 'No description provided yet.'}
                          </p>

                          <div className="mb-3">
                            <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                              <span>Progress</span>
                              <span>{project.progress || 0}%</span>
                            </div>
                            <Progress percent={project.progress || 0} size="small" strokeColor="#0ea5e9" />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[11px] text-slate-500">
                              {clientsList.length > 0 ? `${clientsList.length} client${clientsList.length > 1 ? 's' : ''}` : 'Unassigned'}
                            </div>
                            <div className="flex gap-1.5">
                              <Button
                                type="text"
                                size="small"
                                icon={<Copy size={14} className="text-sky-600" />}
                                title="Copy Access Link"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  copyToClipboard(project.secureToken);
                                }}
                              />
                              <Popconfirm
                                title="Are you sure you want to delete this project?"
                                onConfirm={(event) => {
                                  event?.stopPropagation();
                                  handleDeleteProject(project._id);
                                }}
                                okText="Yes"
                                cancelText="No"
                                okButtonProps={{ danger: true }}
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  danger
                                  icon={<Trash2 size={14} />}
                                  title="Delete Project"
                                  onClick={(event) => event.stopPropagation()}
                                />
                              </Popconfirm>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-4 text-center text-xs text-slate-400">
                      No projects in this lane.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Create Project Modal */}
      <Modal
        title={
          <span className="text-lg font-bold text-slate-800">Create New Project Workspace</span>
        }
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
        className="rounded-2xl"
      >
        <form onSubmit={handleSubmit(handleCreateProject)} className="space-y-5 mt-4">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
              Project Name
            </label>
            
            <input
              type="text"
              {...register('name', { required: 'Project name is required' })}
              className="w-full px-4 py-2.5 rounded-xl border border-sky-100 bg-slate-50 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition"
              placeholder="E.g. Mobile App Dev"
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name.message as string}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-sky-100 bg-slate-50 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition"
              placeholder="Outline the goals and deliverables..."
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.description.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
              Banner Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBannerImageFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {bannerImageFile && (
              <p className="text-[10px] text-slate-400 mt-1">Selected: {bannerImageFile.name}</p>
            )}
          </div>

            {/* <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
              Project Live link
            </label>
            
            <input
              type="text"
              {...register('liveLink', { required: 'Project live link is required' })}
              className="w-full px-4 py-2.5 rounded-xl border border-sky-100 bg-slate-50 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition"
              placeholder="E.g. https://abcdwebsite.com"
            />
            {errors.liveLink && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.liveLink.message as string}</p>
            )}
          </div> */}

          {/* Client & Team Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Assign Clients
              </label>
              <Select
                mode="multiple"
                maxTagCount={Infinity}
                showSearch
                style={{ width: '100%' }}
                placeholder="Select clients"
                optionFilterProp="children"
                onChange={(value) => setSelectedClients(value)}
                value={selectedClients}
              >
                {clients.map((c) => (
                  <Option key={c.email} value={c.email}>
                    {c.name} ({c.email})
                  </Option>
                ))}
              </Select>
            </div>

            {/* Team Members */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Assign Team Members
              </label>
              <Select
                mode="multiple"
                maxTagCount={Infinity}
                style={{ width: '100%' }}
                placeholder="Select members"
                onChange={(value) => setSelectedTeam(value)}
                value={selectedTeam}
              >
                {teamMembers.map((t) => (
                  <Option key={t._id} value={t._id}>
                    {t.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
              Project Deadline
            </label>
            <input
              type="date"
              {...register('deadline', { required: 'Deadline is required' })}
              className="w-full px-4 py-2.5 rounded-xl border border-sky-100 bg-slate-50 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition"
            />
            {errors.deadline && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.deadline.message as string}</p>
            )}
          </div>

          {/* Requirements Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
              Project Requirements
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-sky-100 bg-slate-50 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition"
                placeholder="E.g. OAuth Support"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-4 py-2 !bg-sky-700 text-white rounded-full font-semibold transition"
              >
                Add
              </button>
            </div>
            {requirementsList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {requirementsList.map((req, idx) => (
                  <Tag
                    key={idx}
                    closable
                    onClose={() => handleRemoveRequirement(idx)}
                    color="blue"
                    className="px-2.5 py-1 rounded-lg text-xs font-medium"
                  >
                    {req}
                  </Tag>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-full !bg-sky-700 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold  disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

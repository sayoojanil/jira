import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import API from '../utils/api';
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
  Table,
  Tag,
  Progress,
  Select,
  Input,
  DatePicker,
  Button,
  message,
  Popconfirm,
  Spin
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

  // Multi-select state for new project
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [requirementsList, setRequirementsList] = useState<string[]>([]);
  const [reqInput, setReqInput] = useState('');

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
      const response = await API.post('/projects', {
        name: data.name,
        // liveLink: data.liveLink,
        description: data.description,
        deadline: data.deadline,
        requirements: requirementsList,
        clientEmails: selectedClients,
        assignedTeam: selectedTeam,
      });

      message.success('Project created successfully!');
      setIsModalOpen(false);
      reset();
      setRequirementsList([]);
      setSelectedClients([]);
      setSelectedTeam([]);
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
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  const tableColumns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <span
          className="font-semibold text-slate-800 hover:text-sky-600 cursor-pointer flex items-center gap-1.5"
          onClick={() => window.open(`/project/${record._id}`, '_self')}
        >
          {text}
          <ExternalLink size={12} className="text-slate-400" />
        </span>
      ),
    },
    {
      title: 'Clients',
      key: 'clients',
      render: (_: any, record: any) => {
        const clientsList = record.assignedClients && record.assignedClients.length > 0
          ? record.assignedClients
          : (record.client ? [record.client] : []);

        if (clientsList.length === 0) {
          return <span className="text-xs text-rose-500 font-medium">Unassigned</span>;
        }

        return (
          <div className="flex flex-col gap-1.5">
            {clientsList.map((client: any, idx: number) => (
              <div key={client._id || idx} className="border-b border-slate-50 last:border-0 pb-0.5 last:pb-0">
                <div className="text-xs font-semibold text-slate-700">{client.name}</div>
                <div className="text-[10px] text-slate-400">{client.email}</div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date: string) => (
        <span className="text-xs font-medium text-slate-600">
          {moment(date).format('MMM DD, YYYY')}
        </span>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <div className="w-28">
          <Progress percent={progress} size="small" strokeColor="#0ea5e9" />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => (
        <div className="flex gap-2">
          <Button
            type="text"
            icon={<Copy size={16} className="text-sky-600" />}
            title="Copy Access Link"
            onClick={() => copyToClipboard(record.secureToken)}
          />
          <Popconfirm
            title="Are you sure you want to delete this project?"
            onConfirm={() => handleDeleteProject(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              title="Delete Project"
            />
          </Popconfirm>
        </div>
      ),
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
      {
        title: 'Team Size',
        value: stats.cards.totalTeam,
        icon: <Users2 className="text-purple-600" size={24} />,
        bg: 'from-purple-50 to-white border-purple-100',
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {cards.map((card, idx) => (
          <GlassCard key={idx} className={`bg-gradient-to-tr ${card.bg} border p-5 flex flex-col justify-between`}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {card.title}
              </span>
              {card.icon}
            </div>
            <div className="mt-4 text-3xl font-extrabold text-slate-800">{card.value}</div>
          </GlassCard>
        ))}
      </div>
    );
  };

 if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafc]">
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
      src={member.profilePic || 'No'}
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
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 space-y-2 mb-4">
                    <div>{member.position || 'No title set'}</div>
                    <div>{member.profilePic ? 'Photo available' : 'No profile photo'}</div>
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

      {/* Projects List Table */}
      <GlassCard>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-base font-bold text-slate-800">All Portfolio Projects</h3>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-60 rounded-xl"
              allowClear
            />
            {/* Filter */}
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
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <Table
            dataSource={filteredProjects}
            columns={tableColumns}
            rowKey="_id"
            pagination={{ pageSize: 8, className: 'mt-6' }}
            size="middle"
          />
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

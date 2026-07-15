import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';

import API, { getFileUrl } from '../utils/api';
import GlassCard from '../components/GlassCard';
import { FolderKanban, PlayCircle, Clock, CheckCircle2, ChevronRight, HelpCircle, Calendar, Loader2, Search } from 'lucide-react';
import { Progress, Tag, Alert, Spin, Avatar, Input, Select } from 'antd';
import moment from 'moment';

const { Option } = Select;

const TeamDashboard: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await API.get('/projects');
      setProjects(response.data.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 size={18} className="text-emerald-500" />;
      case 'In Progress':
        return <PlayCircle size={18} className="text-sky-500" />;
      default:
        return <Clock size={18} className="text-slate-400" />;
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

if (loading) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen">
      <div className="flex flex-row gap-2 ">
        <div className="w-4 h-4 rounded-full bg-[#0055FF] animate-bounce"></div>
        <div className="w-4 h-4 rounded-full bg-[#0055FF] animate-bounce [animation-delay:-.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-[#0055FF] animate-bounce [animation-delay:-.5s]"></div>
      </div>
    </div>
  );
}

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Team Workspace</h1>
        
        <h1 className="text-lg mb-3 mt-1 font-bold text-slate-500">Welcome back, { user?.name  || 'Team Member'}</h1>

        <p className="text-slate-500 text-sm mt-1">
          Track project milestones, coordinate file deliveries and resolve client bug logs.
        </p>
      </div>

      {projects.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-sky-100/30">
          <Input
            placeholder="Search projects..."
            prefix={<Search size={18} className="text-slate-400 mr-1" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-xl h-11 bg-white/70 dark:bg-slate-950/70 border-slate-200/50 shadow-sm"
            allowClear
          />
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            className="w-full sm:w-56 h-11"
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
      )}

      {projects.length > 0 ? (
        filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((p) => (
              <GlassCard
                key={p._id}
                onClick={() => navigate(`/project/${p._id}`)}
                className="border border-sky-100/40 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-lg text-slate-800 truncate">{p.name}</h3>
                    <Tag
                      color={getStatusColor(p.status)}
                      className="flex items-center gap-1 border-0"
                    >
                      {getStatusIcon(p.status)}
                      <span>{p.status}</span>
                    </Tag>
                  </div>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-2">{p.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-sky-100/20 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Task Progress</span>
                      <span className="font-semibold text-slate-600">{p.progress}%</span>
                    </div>
                    <Progress percent={p.progress} showInfo={false} strokeColor="#0ea5e9" size="small" />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-slate-700" />
                      <span className='text-slate-600 font-semibold'>Deadline: {moment(p.deadline).format('MMMM DD, YYYY')}</span>
                    </span>
                    <div className="flex -space-x-2 mt-2">
                      {p.assignedTeam?.length > 0 && p.assignedTeam.map((member: any) => (
                        <Avatar
                          key={member._id}
                          src={member.profilePic ? getFileUrl(member.profilePic) : undefined}
                          className="border-2 border-white"
                        >
                          {member.name?.[0]?.toUpperCase()}
                        </Avatar>
                      ))}
                    </div>
                    <span className="flex items-center gap-0.5 text-sky-600 text-sm font-semibold">
                      <span>View Workspace</span>
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto py-12 text-center">
            <GlassCard className="p-8 border border-sky-100/60">
              <Search size={48} className="text-sky-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No Matching Projects</h3>
              <p className="text-sm text-slate-500 mt-2">
                Try adjusting your search query or clear the filter.
              </p>
            </GlassCard>
          </div>
        )
      ) : (
        <div className="max-w-md mx-auto py-12 text-center">
          <GlassCard className="p-8 border border-sky-100/60">
            <HelpCircle size={48} className="text-sky-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No Assigned Workspaces</h3>
            <p className="text-sm text-slate-500 mt-2">
              You are currently not assigned to any projects. Please contact your project administrator to be added.
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;

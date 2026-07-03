import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import { FolderKanban, PlayCircle, Clock, CheckCircle2, ChevronRight, HelpCircle, Loader2 } from 'lucide-react';
import { Progress, Tag, Alert,Spin } from 'antd';
import moment from 'moment';

const TeamDashboard: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      <div className="min-h-screen flex items-center justify-center bg-[#fafafc]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Team Workspace</h1>
        <p className="text-slate-500 text-sm mt-1">
          Track project milestones, coordinate file deliveries and resolve client bug logs.
        </p>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <GlassCard
              key={p._id}
              onClick={() => navigate(`/project/${p._id}`)}
              className="border border-sky-100/40 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-lg text-slate-800 truncate">{p.name}</h3>
                  <Tag color={getStatusColor(p.status)} className="flex items-center gap-1">
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
                  <span>Deadline: {moment(p.deadline).format('MMM DD, YYYY')}</span>
                  <span className="flex items-center gap-0.5 text-sky-600 font-semibold">
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

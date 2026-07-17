import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import { Copy, Link as LinkIcon, Folder, Users, Calendar, Clock, Loader2 } from 'lucide-react';
import { Table, Button, message, Tag, Input } from 'antd';
import moment from 'moment';

const LatestLinks: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get('/projects');
      setProjects(res.data.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to retrieve projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const copyToClipboard = (token: string) => {
    const shareUrl = `${window.location.origin}/projects/share/${token}`;
    navigator.clipboard.writeText(shareUrl);
    message.success('Secure project access link copied!');
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

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-semibold text-slate-800">{text}</span>,
    },
    {
      title: 'Assigned Client',
      dataIndex: 'client',
      key: 'client',
      render: (client: any) =>
        client ? (
          <div>
            <div className="text-xs font-semibold text-slate-700">{client.name}</div>
            <div className="text-[10px] text-slate-400">{client.email}</div>
          </div>
        ) : (
          <span className="text-xs text-rose-500 font-medium">Unassigned</span>
        ),
    },
    {
      title: 'Onboarding Access Token',
      dataIndex: 'secureToken',
      key: 'secureToken',
      render: (token: string) => (
        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-sky-600 font-mono select-all">
          {token?.slice(0, 10)}...
        </code>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Copy Portal Link',
      key: 'copy',
      render: (text: any, record: any) => (
        <Button
          type="primary"
          icon={<Copy size={14} />}
          onClick={() => copyToClipboard(record.secureToken)}
          className="bg-sky-500 hover:bg-sky-600 rounded-lg text-xs"
        >
          Copy Share Link
        </Button>
      ),
    },
  ];

if (loading) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen">
      <div className="flex flex-row gap-2 ">
        <div className="w-2 h-2 rounded-full bg-[#0055FF] animate-bounce"></div>
        <div className="w-2 h-2 rounded-full bg-[#0055FF] animate-bounce [animation-delay:-.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-[#0055FF] animate-bounce [animation-delay:-.5s]"></div>
      </div>
    </div>
  );
}


  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Latest Project Access Links</h1>
        <p className="text-slate-500 text-sm mt-1">
          Share these unique tokens directly with clients. Once they sign up or log in, visiting the URL binds them to the project workspace.
        </p>
      </div>

      <GlassCard className="border border-sky-100/30">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 text-base">Key Sharing List</h3>
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-60 rounded-xl"
            allowClear
          />
        </div>

        <Table dataSource={filtered} columns={columns} rowKey="_id" pagination={{ pageSize: 10 }} />
      </GlassCard>
    </div>
  );
};

export default LatestLinks;

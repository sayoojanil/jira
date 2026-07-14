import React from 'react';
import GlassCard from '../components/GlassCard';
import { Input, Select } from 'antd';
import { Search } from 'lucide-react';

const { Option } = Select;

interface SearchSortBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortKey: string;
  onSortChange: (value: string) => void;
}

const SearchSortBar: React.FC<SearchSortBarProps> = ({ searchTerm, onSearchChange, sortKey, onSortChange }) => {
  return (
    <GlassCard className="flex flex-col sm:flex-row items-center gap-4 p-4 mb-6 bg-white/70 backdrop-blur-lg border border-slate-200">
      <Input
        placeholder="Search projects..."
        prefix={<Search size={16} className="text-slate-400" />}
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        allowClear
        className="flex-1 min-w-[200px]"
      />
      <Select
        value={sortKey}
        onChange={onSortChange}
        className="min-w-[150px]"
        dropdownClassName="rounded-xl"
      >
        <Option value="Name">Name</Option>
        <Option value="Deadline">Deadline</Option>
        <Option value="Status">Status</Option>
      </Select>
    </GlassCard>
  );
};

export default SearchSortBar;

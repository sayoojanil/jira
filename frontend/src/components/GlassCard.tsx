import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-7 sm:p-8 rounded-[28px] transition-all duration-500 ease-out ${
        onClick ? 'cursor-pointer hover:-translate-y-2' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;

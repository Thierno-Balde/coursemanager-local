import React from 'react';
import { Resource } from '../types';
import { FileText, MonitorPlay, Presentation, Link as LinkIcon, FileArchive, Image as ImageIcon, File, X } from 'lucide-react';

interface ResourceBadgeProps {
  resource: Resource;
  compact?: boolean;
  onOpen?: () => void;
  onDelete?: () => void;
}

export const ResourceBadge: React.FC<ResourceBadgeProps> = ({ resource, compact = false, onOpen, onDelete }) => {
  const format = resource.format || 'other';

  const getIcon = () => {
    switch (format) {
      case 'pdf': return <FileText size={16} />;
      case 'video': return <MonitorPlay size={16} />;
      case 'ppt': return <Presentation size={16} />;
      case 'link': return <LinkIcon size={16} />;
      case 'zip': return <FileArchive size={16} />;
      case 'image': return <ImageIcon size={16} />;
      default: return <File size={16} />;
    }
  };

  const getColors = () => {
    switch (format) {
      case 'pdf': return 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200';
      case 'video': return 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200';
      case 'ppt': return 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200';
      case 'link': return 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onOpen) {
      e.preventDefault();
      onOpen();
      return;
    }
    const target = resource.path || resource.url;
    if (resource.kind === 'file' && target && window.electronAPI?.openPath) {
      e.preventDefault();
      window.electronAPI.openPath(target);
    }
  };

  const href = resource.url || resource.path || '#';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`
        flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-brand-300 hover:shadow-sm transition-all group
        ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}
        ${getColors()}
      `}
    >
      <span className="shrink-0">{getIcon()}</span>
      <span className="font-medium truncate">{resource.label}</span>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="ml-auto text-slate-400 hover:text-red-600 transition-colors"
          title="Supprimer cette ressource"
        >
          <X size={14} />
        </button>
      )}
    </a>
  );
};

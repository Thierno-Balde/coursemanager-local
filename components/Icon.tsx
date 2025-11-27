import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, ...props }) => {
  const LucideIcon = (LucideIcons as any)[name];

  if (!LucideIcon) {
    // Fallback icon if name not found
    return <LucideIcons.HelpCircle size={size} {...props} />;
  }

  return <LucideIcon size={size} {...props} />;
};

// Also export specific icons used frequently to allow direct import if needed, 
// though the dynamic component above handles string-based names from JSON.
export const { FileText, MonitorPlay, Presentation, Link: LinkIcon, Download, FolderOpen, Video, Image, FileArchive } = LucideIcons;
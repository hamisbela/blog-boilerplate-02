import React from 'react';
import { Facebook, Linkedin, Mail, Twitter } from 'lucide-react';
import { getSiteUrl } from '../config/site';
import blogConfig from '../config/blog.config';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ 
  url, 
  title, 
  description = '', 
  className = '' 
}) => {
  // Ensure URL is absolute
  const fullUrl = url.startsWith('http') ? url : `${getSiteUrl()}${url.startsWith('/') ? '' : '/'}${url}`;
  
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  
  // Map icon names to icon components
  const iconComponents: Record<string, React.ReactNode> = {
    'Facebook': <Facebook size={20} />,
    'Twitter': <Twitter size={20} />,
    'Linkedin': <Linkedin size={20} />,
    'Mail': <Mail size={20} />,
  };
  
  // Use the sharing platforms config from blog.config.ts
  const shareLinks = blogConfig.sharing.platforms.map(platform => {
    let shareUrl = platform.urlTemplate
      .replace('{url}', encodedUrl)
      .replace('{title}', encodedTitle)
      .replace('{description}', encodedDescription);
    
    return {
      name: platform.name,
      url: shareUrl,
      icon: iconComponents[platform.icon] || <Mail size={20} />,
      color: platform.color,
    };
  });
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${link.color} text-white p-2 rounded-full flex items-center justify-center transition-colors duration-300`}
          aria-label={`Share on ${link.name}`}
          title={`Share on ${link.name}`}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
};

export default ShareButtons;
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import siteConfig from '../config/site';

interface CTABlockProps {
  variant?: 'sidebar' | 'footer';
  className?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  icon?: React.ReactNode;
}

const CTABlock: React.FC<CTABlockProps> = ({ 
  variant = 'footer', 
  className = '',
  title,
  description,
  buttonText = 'Visit Homepage',
  secondaryButtonText,
  icon
}) => {
  // Default content that can be customized in each project
  const defaultTitle = variant === 'sidebar' ? 'About This Blog' : 'Enjoyed this article?';
  const defaultDescription = variant === 'sidebar' 
    ? 'Welcome to our blog where we share valuable content and insights. Explore more articles or visit our main site.'
    : 'Explore more of our content or check out our main site for more resources.';
  
  return (
    <div className={`bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="flex-grow">
          <h3 className={`font-bold text-gray-900 mb-2 ${variant === 'sidebar' ? 'text-lg' : 'text-xl'}`}>
            {title || defaultTitle}
          </h3>
          <p className={`text-gray-600 mb-4 ${variant === 'sidebar' ? 'text-sm' : 'text-base'}`}>
            {description || defaultDescription}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/" 
              className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${variant === 'sidebar' ? 'w-full justify-center' : ''}`}
            >
              {buttonText} {!variant || variant === 'footer' ? <ArrowRight size={16} className="ml-2" /> : null}
            </Link>
            {secondaryButtonText && (
              <Link 
                to="/blog/" 
                className={`inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors ${variant === 'sidebar' ? 'w-full justify-center' : ''}`}
              >
                {secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTABlock;
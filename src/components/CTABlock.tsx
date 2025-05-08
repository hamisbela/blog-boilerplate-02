import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import blogConfig from '../config/blog.config';
import themeConfig from '../config/theme.config';

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
  buttonText,
  secondaryButtonText,
  icon
}) => {
  // Get configuration based on variant
  const ctaConfig = variant === 'sidebar' 
    ? blogConfig.ui.cta.sidebar 
    : blogConfig.ui.cta.mainPage;
  
  // Use provided values or defaults from config
  const displayTitle = title || ctaConfig.title;
  const displayDescription = description || ctaConfig.description;
  const displayButtonText = buttonText || ctaConfig.primaryButton.text;
  const buttonUrl = ctaConfig.primaryButton.url;
  
  const showSecondaryButton = secondaryButtonText || ctaConfig.secondaryButton;
  const displaySecondaryButtonText = secondaryButtonText || 
    (ctaConfig.secondaryButton ? ctaConfig.secondaryButton.text : '');
  const secondaryButtonUrl = ctaConfig.secondaryButton ? ctaConfig.secondaryButton.url : '/blog/';
  
  return (
    <div className={`bg-gradient-to-r ${themeConfig.colors.primary.gradient} rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="flex-grow">
          <h3 className={`font-bold ${themeConfig.colors.secondary.textDark} mb-2 ${variant === 'sidebar' ? 'text-lg' : 'text-xl'}`}>
            {displayTitle}
          </h3>
          <p className={`${themeConfig.colors.secondary.text} mb-4 ${variant === 'sidebar' ? 'text-sm' : 'text-base'}`}>
            {displayDescription}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link 
              to={buttonUrl} 
              className={`${themeConfig.components.button.primary} ${variant === 'sidebar' ? 'w-full justify-center' : ''} inline-flex items-center`}
            >
              {displayButtonText} {!variant || variant === 'footer' ? <ArrowRight size={16} className="ml-2" /> : null}
            </Link>
            {showSecondaryButton && (
              <Link 
                to={secondaryButtonUrl} 
                className={`${themeConfig.components.button.secondary} ${variant === 'sidebar' ? 'w-full justify-center' : ''} inline-flex items-center`}
              >
                {displaySecondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTABlock;
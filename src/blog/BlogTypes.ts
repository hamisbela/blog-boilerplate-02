/**
 * Blog Post Interface
 * Represents the structure of a blog post
 */
export interface BlogPost {
  /**
   * The title of the blog post
   */
  title: string;
  
  /**
   * The URL slug for the blog post
   */
  slug: string;
  
  /**
   * The publication date of the blog post
   */
  date: string;
  
  /**
   * The full content of the blog post in Markdown format
   */
  content: string;
  
  /**
   * Optional short excerpt/summary of the blog post
   */
  excerpt?: string;
  
  /**
   * Optional author of the blog post
   */
  author?: string;
  
  /**
   * Optional URL for the featured image of the post
   */
  featuredImage?: string | null;
  
  /**
   * Optional list of tags/categories for the post
   */
  tags?: string[];
  
  /**
   * Optional metadata for the post
   */
  meta?: Record<string, any>;
}

/**
 * Sitemap URL Interface
 * Represents a URL entry in the sitemap
 */
export interface SitemapUrl {
  /**
   * The full URL for the sitemap entry
   */
  url: string;
  
  /**
   * Optional last modification date
   */
  lastmod?: string;
  
  /**
   * Optional change frequency
   */
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  
  /**
   * Optional priority (between 0.0 and 1.0)
   */
  priority?: number;
}

/**
 * Blog Theme Configuration
 * Configuration options for the blog theme
 */
export interface BlogThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  
  layout: {
    containerMaxWidth: string;
    sidebarWidth: string;
  };
}
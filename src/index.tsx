// Export main blog components
export {
  BlogList,
  BlogPost,
  BlogPreview,
  Sitemap,
  SearchBar,
  ShareButtons,
  RelatedBlogPosts,
  ScrollToTop,
  Pagination,
  CTABlock
} from './blog/BlogCore';

// Export types
export type { BlogPost, SitemapUrl, BlogThemeConfig } from './blog/BlogTypes';

// Export utility functions
export { 
  createSlug,
  extractFirstImage,
  getAllPosts,
  getPostBySlug,
  getAllUrls
} from './blog/BlogUtils';

// Export configuration
export { default as siteConfig, getSiteUrl } from './config/site';
export { default as blogConfig, getDefaultFeaturedImage, generateMetaDescription } from './config/blog.config';
export { default as themeConfig, getButtonClass, getContainerClass } from './config/theme.config';
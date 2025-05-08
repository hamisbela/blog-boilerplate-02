import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, ArrowRight, Calendar, User, Search, 
  List, Filter, PenLine, MapPin, Facebook, Twitter, 
  Linkedin, Mail, BookOpen, ChevronLeft, ChevronRight
} from 'lucide-react';

import { BlogPost } from './BlogTypes';
import { createSlug, extractFirstImage, getAllPosts, getAllUrls, getPostBySlug } from './BlogUtils';
import siteConfig, { getSiteUrl } from '../config/site';
import blogConfig, { generateMetaDescription, getDefaultFeaturedImage } from '../config/blog.config';
import themeConfig from '../config/theme.config';

// YouTube URL patterns
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

/**
 * Interface for table of contents items
 */
interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * ScrollToTop component
 * Scrolls the page to the top when the route changes
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/**
 * SearchBar Component
 * Allows users to search for blog posts
 */
export const SearchBar: React.FC<{
  containerClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  placeholder?: string;
  compact?: boolean;
}> = ({
  containerClassName = '',
  inputClassName = '',
  buttonClassName = '',
  placeholder = 'Search blog posts...',
  compact = false,
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(!compact);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // When expanded and in compact mode, focus the input
    if (isExpanded && compact && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded, compact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`${blogConfig.routes.blog}?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const toggleExpand = () => {
    if (compact) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${containerClassName} flex items-center ${compact && !isExpanded ? 'w-auto' : 'w-full'}`}
    >
      {(isExpanded || !compact) && (
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`${inputClassName} border border-gray-300 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow`}
          aria-label="Search"
        />
      )}
      <button
        type={isExpanded || !compact ? 'submit' : 'button'}
        onClick={isExpanded || !compact ? undefined : toggleExpand}
        className={`${buttonClassName} ${
          isExpanded || !compact
            ? 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-md'
        } flex items-center justify-center transition-colors duration-300`}
        aria-label="Search"
      >
        <Search size={20} />
        {!compact && <span className="ml-2">Search</span>}
      </button>
    </form>
  );
};

/**
 * ShareButtons Component
 * Social media sharing buttons for blog posts
 */
export const ShareButtons: React.FC<{
  url: string;
  title: string;
  description?: string;
  className?: string;
}> = ({ 
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

/**
 * Pagination Component
 * Provides pagination for blog lists
 */
export const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  baseUrl: string;
  searchParams?: string;
}> = ({
  currentPage,
  totalPages,
  onPageChange,
  baseUrl,
  searchParams = '',
}) => {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const queryChar = baseUrl.includes('?') ? '&' : '?';
    const pageParam = `page=${page}`;
    const fullUrl = `${baseUrl}${queryChar}${pageParam}${searchParams ? `&${searchParams}` : ''}`;
    return fullUrl;
  };

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // Always include first page
    pages.push(1);
    
    // Calculate start and end of page range around current page
    let rangeStart = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    let rangeEnd = Math.min(totalPages - 1, rangeStart + maxPagesToShow - 2);
    
    // Adjust range if we're near the end
    if (rangeEnd - rangeStart < maxPagesToShow - 2) {
      rangeStart = Math.max(2, rangeEnd - (maxPagesToShow - 2));
    }
    
    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push(-2); // -2 represents ellipsis (using different value for React key)
    }
    
    // Always include last page if there are more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center mt-8" aria-label="Pagination">
      <ul className="flex items-center space-x-1">
        {/* Previous Page */}
        <li>
          {currentPage > 1 ? (
            <Link
              to={getPageUrl(currentPage - 1)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-md hover:bg-gray-50"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(currentPage - 1);
              }}
              aria-label="Previous page"
              rel="prev"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline-block ml-1">Previous</span>
            </Link>
          ) : (
            <span className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-white rounded-md cursor-not-allowed">
              <ChevronLeft size={16} />
              <span className="hidden sm:inline-block ml-1">Previous</span>
            </span>
          )}
        </li>

        {/* Page Numbers */}
        {pageNumbers.map((page) => {
          // Render ellipsis
          if (page < 0) {
            return (
              <li key={page}>
                <span className="px-3 py-2 text-sm text-gray-500">...</span>
              </li>
            );
          }

          // Render page number
          return (
            <li key={page}>
              {page === currentPage ? (
                <span className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
                  {page}
                </span>
              ) : (
                <Link
                  to={getPageUrl(page)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white rounded-md hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}

        {/* Next Page */}
        <li>
          {currentPage < totalPages ? (
            <Link
              to={getPageUrl(currentPage + 1)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-md hover:bg-gray-50"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(currentPage + 1);
              }}
              aria-label="Next page"
              rel="next"
            >
              <span className="hidden sm:inline-block mr-1">Next</span>
              <ChevronRight size={16} />
            </Link>
          ) : (
            <span className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-white rounded-md cursor-not-allowed">
              <span className="hidden sm:inline-block mr-1">Next</span>
              <ChevronRight size={16} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
};

/**
 * CTABlock Component
 * Call-to-action block for blog posts and sidebars
 */
export const CTABlock: React.FC<{
  variant?: 'sidebar' | 'footer';
  className?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  icon?: React.ReactNode;
}> = ({ 
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
  const secondaryButtonUrl = ctaConfig.secondaryButton ? ctaConfig.secondaryButton.url : blogConfig.routes.blog;
  
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

/**
 * RelatedBlogPosts Component
 * Displays related blog posts
 */
export const RelatedBlogPosts: React.FC<{
  currentPostSlug: string;
}> = ({ currentPostSlug }) => {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts().then((posts) => {
      // Filter out the current post
      const otherPosts = posts.filter(post => post.slug !== currentPostSlug);
      
      // Get 3 random posts (or fewer if there aren't 3 other posts)
      const randomPosts = getRandomPosts(otherPosts, 3);
      setRelatedPosts(randomPosts);
      setLoading(false);
    });
  }, [currentPostSlug]);

  // Function to get random posts
  const getRandomPosts = (posts: BlogPost[], count: number): BlogPost[] => {
    const shuffled = [...posts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, posts.length));
  };

  if (loading) {
    return (
      <div className="mt-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm">
                <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className={`${themeConfig.typography.headings.h2} ${themeConfig.colors.secondary.textDark} mb-6`}>Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => {
          // Determine if the featured image is from YouTube
          const isYoutubeThumb = post.featuredImage?.includes('img.youtube.com');
          
          return (
            <article key={post.slug} className={`${themeConfig.components.card} overflow-hidden`}>
              <Link to={`/${post.slug}/`} className="block hover:no-underline">
                <div 
                  className={`${isYoutubeThumb ? 'youtube-thumbnail' : blogConfig.ui.featuredImage.height.relatedPosts} bg-cover bg-center relative`}
                  style={{ 
                    backgroundImage: post.featuredImage 
                      ? `url(${post.featuredImage})` 
                      : `url(${blogConfig.ui.featuredImage.defaults[2]})`
                  }}
                >
                  {/* Only add overlay and title for non-featured images */}
                  {!post.featuredImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                  )}
                  {!post.featuredImage && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <h3 className="text-lg font-semibold text-white text-center">
                        {post.title}
                      </h3>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {(post.featuredImage || isYoutubeThumb) && (
                    <h3 className={`text-lg font-semibold ${themeConfig.colors.secondary.textDark} mb-2 ${themeConfig.colors.primary.textHover} line-clamp-2`}>
                      {post.title}
                    </h3>
                  )}
                  <div className="flex flex-wrap gap-2 text-gray-500 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', blogConfig.posts.dateFormat.short)}
                      </time>
                    </div>
                    {post.author && (
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{post.author}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
};

/**
 * BlogList Component
 * Displays a list of blog posts with pagination and search
 */
export const BlogList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get search query and page from URL parameters
  const searchQuery = searchParams.get('search') || '';
  const pageParam = searchParams.get('page');
  
  // Initialize page from URL or default to 1
  useEffect(() => {
    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10);
      if (!isNaN(pageNumber) && pageNumber > 0) {
        setCurrentPage(pageNumber);
      } else {
        setCurrentPage(1);
      }
    } else {
      setCurrentPage(1);
    }
  }, [pageParam]);

  // Fetch all posts
  useEffect(() => {
    getAllPosts()
      .then((fetchedPosts) => {
        setPosts(fetchedPosts);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching posts:', err);
        setError('Unable to load blog posts');
        setLoading(false);
      });
  }, []);

  // Filter posts based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
        (post.author && post.author.toLowerCase().includes(query))
      );
      setFilteredPosts(filtered);
    }
  }, [posts, searchQuery]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // Update URL with new page
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    
    // Scroll to top
    window.scrollTo(0, 0);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / blogConfig.posts.postsPerPage);
  const startIndex = (currentPage - 1) * blogConfig.posts.postsPerPage;
  const endIndex = startIndex + blogConfig.posts.postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Create the base URL for pagination with search parameters
  const getPaginationBaseUrl = () => {
    let baseUrl = blogConfig.routes.blog;
    if (searchQuery) {
      baseUrl += `?search=${encodeURIComponent(searchQuery)}`;
    }
    return baseUrl;
  };

  // SEO meta tags
  const getPageTitle = () => {
    if (searchQuery) {
      return `Search results for "${searchQuery}" - ${siteConfig.title}`;
    }
    return currentPage > 1 
      ? `Blog - Page ${currentPage} - ${siteConfig.title}` 
      : `Blog - ${siteConfig.title}`;
  };

  if (loading) {
    return (
      <div className={`${themeConfig.layout.container.wide} mx-auto ${themeConfig.layout.spacing.section}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={themeConfig.components.card}>
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${themeConfig.layout.container.wide} mx-auto ${themeConfig.layout.spacing.section}`}>
        <Helmet>
          <title>Error - {siteConfig.title}</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className={`${themeConfig.layout.container.wide} mx-auto ${themeConfig.layout.spacing.section}`}>
        <Helmet>
          <title>{getPageTitle()}</title>
          <meta name="robots" content={searchQuery ? 'noindex, follow' : 'index, follow'} />
        </Helmet>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className={`${themeConfig.typography.headings.h1} ${themeConfig.colors.secondary.textDark} mb-4 md:mb-0`}>
            Blog Posts
          </h1>
          <SearchBar containerClassName="max-w-md w-full" />
        </div>
        
        {searchQuery ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center mb-8">
            <Filter className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className={`${themeConfig.colors.secondary.textDark} font-medium`}>
              No posts found for "{searchQuery}"
            </p>
            <p className={`${themeConfig.colors.secondary.text} mt-2`}>
              Try a different search term or browse all posts
            </p>
            <Link 
              to={blogConfig.routes.blog} 
              className={themeConfig.components.button.primary + " inline-block mt-4"}
            >
              View All Posts
            </Link>
          </div>
        ) : (
          <div className={`${themeConfig.colors.secondary.light} border ${themeConfig.colors.secondary.borderLight} rounded-lg p-8 text-center`}>
            <PenLine className={`h-12 w-12 ${themeConfig.colors.secondary.textLight} mx-auto mb-4`} />
            <p className={themeConfig.colors.secondary.text}>No blog posts available yet.</p>
            <p className={`${themeConfig.colors.secondary.textLight} text-sm mt-2`}>
              Check back soon for new content!
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${themeConfig.layout.container.wide} mx-auto ${themeConfig.layout.spacing.section}`}>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="robots" content={searchQuery ? 'noindex, follow' : 'index, follow'} />
      </Helmet>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className={`${themeConfig.typography.headings.h1} ${themeConfig.colors.secondary.textDark} mb-4 md:mb-0`}>
          {searchQuery ? `Search: ${searchQuery}` : 'Blog Posts'}
        </h1>
        <SearchBar containerClassName="max-w-md w-full" />
      </div>
      
      {searchQuery && (
        <div className="mb-6 flex items-center justify-between">
          <p className={themeConfig.colors.secondary.text}>
            Found <span className="font-medium">{filteredPosts.length}</span> posts matching your search
          </p>
          <Link 
            to={blogConfig.routes.blog} 
            className={`${themeConfig.colors.primary.text} ${themeConfig.colors.primary.textHover} font-medium`}
          >
            Clear filters
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPosts.map((post) => {
          // Determine if the featured image is from YouTube
          const isYoutubeThumb = post.featuredImage?.includes('img.youtube.com');
          
          return (
            <article key={post.slug} className={`${themeConfig.components.card} overflow-hidden`}>
              <Link to={`/${post.slug}/`} className="block hover:no-underline">
                <div 
                  className={`${isYoutubeThumb ? 'youtube-thumbnail' : blogConfig.ui.featuredImage.height.blogList} bg-cover bg-center relative`}
                  style={{ 
                    backgroundImage: post.featuredImage 
                      ? `url(${post.featuredImage})` 
                      : `url(${blogConfig.ui.featuredImage.defaults[0]})`
                  }}
                >
                  {/* Only add overlay and title for non-featured images */}
                  {!post.featuredImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                  )}
                  {!post.featuredImage && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <h2 className={`text-xl font-semibold text-white text-center`}>
                        {post.title}
                      </h2>
                    </div>
                  )}
                </div>
                <div className={themeConfig.layout.spacing.card}>
                  {(post.featuredImage || isYoutubeThumb) && (
                    <h2 className={`text-xl font-semibold ${themeConfig.colors.secondary.textDark} mb-2 ${themeConfig.colors.primary.textHover}`}>
                      {post.title}
                    </h2>
                  )}
                  <div className="flex flex-wrap gap-4 text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', blogConfig.posts.dateFormat.long)}
                      </time>
                    </div>
                    {post.author && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{post.author}</span>
                      </div>
                    )}
                  </div>
                  {post.excerpt && (
                    <div className={themeConfig.colors.secondary.text}>
                      <ReactMarkdown>
                        {post.excerpt.length > blogConfig.ui.preview.excerptLength
                          ? post.excerpt.substring(0, blogConfig.ui.preview.excerptLength) + '...' 
                          : post.excerpt}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </Link>
            </article>
          );
        })}
      </div>
      
      {/* Pagination */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        baseUrl={getPaginationBaseUrl()}
      />
      
      {/* Show post count information */}
      <div className="mt-8 text-center text-gray-500">
        Showing {Math.min(startIndex + 1, filteredPosts.length)} - {Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} posts
      </div>
    </div>
  );
};

/**
 * BlogPreview Component
 * Shows a preview of recent blog posts on the homepage
 */
export const BlogPreview: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllPosts()
      .then((fetchedPosts) => {
        setPosts(fetchedPosts.slice(0, blogConfig.ui.preview.count)); // Show latest posts based on config
        setLoading(false);
      })
      .catch((err) => {
        setError('Unable to load blog posts');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className={themeConfig.components.card}>
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`${themeConfig.typography.headings.h2} ${themeConfig.colors.secondary.textDark}`}>Latest from our Blog</h2>
          <Link 
            to={blogConfig.routes.blog}
            className={`${themeConfig.colors.primary.text} ${themeConfig.colors.primary.textHover} font-medium`}
          >
            View all posts →
          </Link>
        </div>
        <div className={`${themeConfig.colors.secondary.light} border ${themeConfig.colors.secondary.borderLight} rounded-lg p-8 text-center`}>
          <PenLine className={`h-12 w-12 ${themeConfig.colors.secondary.textLight} mx-auto mb-4`} />
          <p className={themeConfig.colors.secondary.text}>No blog posts available yet.</p>
          <p className={`${themeConfig.colors.secondary.textLight} text-sm mt-2`}>Check back soon for new content!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`${themeConfig.typography.headings.h2} ${themeConfig.colors.secondary.textDark}`}>Latest from our Blog</h2>
        <div className="flex items-center space-x-2">
          <SearchBar 
            compact={true} 
            containerClassName="hidden md:flex" 
            buttonClassName="text-gray-700"
          />
          <Link 
            to={blogConfig.routes.blog}
            className={`${themeConfig.colors.primary.text} ${themeConfig.colors.primary.textHover} font-medium`}
          >
            View all posts →
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => {
          // Determine if the featured image is from YouTube
          const isYoutubeThumb = post.featuredImage?.includes('img.youtube.com');
          
          return (
            <article key={post.slug} className={`${themeConfig.components.card} overflow-hidden`}>
              <Link to={`/${post.slug}/`} className="block hover:no-underline">
                <div 
                  className={`${isYoutubeThumb ? 'youtube-thumbnail' : blogConfig.ui.featuredImage.height.blogList} bg-cover bg-center relative`}
                  style={{ 
                    backgroundImage: post.featuredImage 
                      ? `url(${post.featuredImage})` 
                      : `url(${blogConfig.ui.featuredImage.defaults[0]})`
                  }}
                >
                  {/* Only add overlay and title for non-featured images */}
                  {!post.featuredImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                  )}
                  {!post.featuredImage && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <h3 className="text-xl font-semibold text-white text-center">
                        {post.title}
                      </h3>
                    </div>
                  )}
                </div>
                <div className={themeConfig.layout.spacing.card}>
                  {(post.featuredImage || isYoutubeThumb) && (
                    <h3 className={`text-xl font-semibold ${themeConfig.colors.secondary.textDark} mb-2 ${themeConfig.colors.primary.textHover}`}>
                      {post.title}
                    </h3>
                  )}
                  <div className="flex flex-wrap gap-4 text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', blogConfig.posts.dateFormat.long)}
                      </time>
                    </div>
                    {post.author && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{post.author}</span>
                      </div>
                    )}
                  </div>
                  {post.excerpt && (
                    <div className={themeConfig.colors.secondary.text}>
                      <ReactMarkdown>
                        {post.excerpt.length > blogConfig.ui.preview.excerptLength
                          ? post.excerpt.substring(0, blogConfig.ui.preview.excerptLength) + '...' 
                          : post.excerpt}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Sitemap Component
 * Displays a human-readable sitemap of the website
 */
export const Sitemap: React.FC<{
  compact?: boolean;
}> = ({ compact = false }) => {
  const [baseUrls, setBaseUrls] = useState<Array<{ path: string; name: string }>>([]);
  const [blogUrls, setBlogUrls] = useState<Array<{ path: string; name: string; date?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUrls().then(({ baseUrls, blogUrls }) => {
      setBaseUrls(baseUrls);
      setBlogUrls(blogUrls);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className={compact ? '' : `${themeConfig.layout.container.regular} mx-auto ${themeConfig.layout.spacing.section}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-gray-200 rounded w-1/3"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-3">Main Pages</h3>
        <ul className="space-y-2">
          {baseUrls.map((url) => (
            <li key={url.path}>
              <Link to={url.path} className={themeConfig.components.link}>
                {url.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Get meta description for the sitemap page
  const metaDescription = `Sitemap for ${siteConfig.title} website. Browse all pages and blog posts on our site.`;

  return (
    <div className={`${themeConfig.layout.container.regular} mx-auto ${themeConfig.layout.spacing.section}`}>
      <Helmet>
        <title>Sitemap - {siteConfig.title}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>
      <div className="flex items-center mb-8">
        <MapPin className={`h-6 w-6 ${themeConfig.colors.primary.text} mr-2`} />
        <h1 className={`${themeConfig.typography.headings.h1} ${themeConfig.colors.secondary.textDark}`}>Site Map</h1>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className={`${themeConfig.typography.headings.h2} ${themeConfig.colors.secondary.textDark} mb-4 border-b pb-2`}>Main Pages</h2>
          <ul className="space-y-2">
            {baseUrls.map((url) => (
              <li key={url.path}>
                <Link to={url.path} className={`${themeConfig.components.link} text-lg`}>
                  {url.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className={`${themeConfig.typography.headings.h2} ${themeConfig.colors.secondary.textDark} mb-4 border-b pb-2`}>Blog Posts</h2>
          <ul className="space-y-2">
            {blogUrls.map((url) => (
              <li key={url.path} className="flex flex-wrap justify-between">
                <Link to={url.path} className={themeConfig.components.link}>
                  {url.name}
                </Link>
                {url.date && (
                  <span className={themeConfig.colors.secondary.textLight + " text-sm"}>
                    {new Date(url.date).toLocaleDateString('en-US', blogConfig.posts.dateFormat.short)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
      
      {/* Note about sitemap XML */}
      <div className={`mt-12 p-4 ${themeConfig.colors.secondary.light} rounded-lg border ${themeConfig.colors.secondary.borderLight}`}>
        <p className={themeConfig.colors.secondary.text}>
          The full XML sitemap is available at{' '}
          <a 
            href={`${getSiteUrl()}/sitemap.xml`} 
            target="_blank" 
            rel="noopener noreferrer"
            className={themeConfig.components.link}
          >
            {getSiteUrl()}/sitemap.xml
          </a>
        </p>
      </div>
    </div>
  );
};

// Import React hooks to avoid undefined errors
import { useRef } from 'react';
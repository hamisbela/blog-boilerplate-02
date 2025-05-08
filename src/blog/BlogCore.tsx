import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, ArrowRight, Calendar, User, Search, 
  List, Filter, PenLine, MapPin, Facebook, Twitter, 
  Linkedin, Mail, BookOpen
} from 'lucide-react';

import { BlogPost, SitemapUrl } from './BlogTypes';
import { createSlug, extractFirstImage, getAllPosts, getAllUrls, getPostBySlug } from './BlogUtils';
import siteConfig, { getSiteUrl } from '../config/site';
import blogConfig, { generateMetaDescription, getDefaultFeaturedImage } from '../config/blog.config';
import themeConfig from '../config/theme.config';

// YouTube URL patterns
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

// Use configured posts per page
const POSTS_PER_PAGE = blogConfig.posts.postsPerPage;

/**
 * Interface for table of contents items
 */
interface TocItem {
  id: string;
  text: string;
  level: number;
}

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
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
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
 * BlogPost Component
 * Displays a single blog post
 */
export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState<number>(0);
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);

  useEffect(() => {
    if (!slug) return;
    
    getAllPosts().then((posts) => {
      const foundPost = posts.find(p => p.slug === slug);
      setPost(foundPost || null);
      
      if (foundPost) {
        // Set featured image directly from the post object
        setFeaturedImage(foundPost.featuredImage || null);
        
        // Calculate reading time
        const wordsPerMinute = blogConfig.posts.readingTime.wordsPerMinute;
        const textLength = foundPost.content.split(/\s+/).length;
        const time = Math.ceil(textLength / wordsPerMinute);
        setReadingTime(time < 1 ? 1 : time);
        
        // Extract headings for table of contents
        const headings = extractHeadings(foundPost.content);
        setTableOfContents(headings);
      }
      
      setLoading(false);
      
      if (!foundPost) {
        navigate(blogConfig.routes.blog, { replace: true });
      }
    }).catch((err) => {
      console.error('Error loading blog post:', err);
      setError('Unable to load blog post');
      setLoading(false);
    });
  }, [slug, navigate]);

  // Extract headings from markdown content for table of contents
  const extractHeadings = (content: string): TocItem[] => {
    const headingRegex = /^(#{2,4})\s+(.+)$/gm;
    const headings: TocItem[] = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length; // Number of # symbols
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
        
      headings.push({ id, text, level });
    }
    
    return headings;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
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

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <Helmet>
          <title>Post Not Found - {siteConfig.title}</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          Blog post not found. <Link to="/blog" className="underline">Return to blog list</Link>
        </div>
      </div>
    );
  }

  // Check if this is a YouTube thumbnail
  const isYoutubeThumb = post.featuredImage?.includes('img.youtube.com');

  // Remove the title from the content to avoid duplication
  const contentWithoutTitle = post.content.replace(/^#\s+.*$/m, '').trim();

  // Get meta description for the post - use excerpt or generate from content
  const metaDescription = post.excerpt || generateMetaDescription(contentWithoutTitle);
  
  // For sharing
  const shareUrl = `${getSiteUrl()}/${post.slug}/`;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <Helmet>
        <title>{post.title} - {siteConfig.title}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={post.title} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        {featuredImage && <meta property="og:image" content={featuredImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={metaDescription} />
        {featuredImage && <meta name="twitter:image" content={featuredImage} />}
        {post.author && <meta name="author" content={post.author} />}
        <meta property="article:published_time" content={post.date} />
      </Helmet>
      
      <div className="flex justify-between items-center mb-8">
        <Link 
          to="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>
        
        <SearchBar compact={true} />
      </div>
      
      {/* Featured Image */}
      <div 
        className={`w-full ${isYoutubeThumb ? 'youtube-featured' : blogConfig.ui.featuredImage.height.blogPost} bg-cover bg-center rounded-lg mb-8 relative`}
        style={{ 
          backgroundImage: featuredImage 
            ? `url(${featuredImage})` 
            : `url(${blogConfig.ui.featuredImage.defaults[0]})`
        }}
      >
        {/* Only add overlay for non-YouTube, non-featured images */}
        {!featuredImage && !isYoutubeThumb && (
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Only show title overlay for non-featured images that aren't YouTube thumbnails */}
          {!featuredImage && !isYoutubeThumb && (
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4">
              {post.title}
            </h1>
          )}
        </div>
      </div>
      
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <article className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8">
          {/* If we have a featured image or YouTube thumbnail, show the title in the content */}
          {(featuredImage || isYoutubeThumb) && (
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
          )}
          
          <header className="mb-8 flex flex-wrap justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', blogConfig.posts.dateFormat.long)}
                </time>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600">{readingTime} min read</span>
              </div>
              {post.author && (
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>{post.author}</span>
                </div>
              )}
            </div>
            
            {/* Social sharing buttons */}
            <ShareButtons 
              url={shareUrl}
              title={post.title}
              description={metaDescription}
              className="mb-4 md:mb-0"
            />
          </header>
          
          <div className="prose prose-lg prose-slate max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ node, ...props }) => {
                  const id = props.children
                    ? props.children.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
                    : '';
                  return <h2 id={id} {...props} className="text-3xl font-semibold mt-12 mb-6 scroll-mt-24" />;
                },
                h3: ({ node, ...props }) => {
                  const id = props.children
                    ? props.children.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
                    : '';
                  return <h3 id={id} {...props} className="text-2xl font-semibold mt-8 mb-4 scroll-mt-24" />;
                },
                h4: ({ node, ...props }) => {
                  const id = props.children
                    ? props.children.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
                    : '';
                  return <h4 id={id} {...props} className="text-xl font-semibold mt-6 mb-4 scroll-mt-24" />;
                },
                img: ({ node, ...props }) => {
                  if (!props.src) return null;
                  
                  // Handle image links - ensure they use the original URL
                  const imgSrc = props.src;
                  
                  return (
                    <div className="my-8">
                      <img
                        {...props}
                        src={imgSrc}
                        className="rounded-lg shadow-md w-full h-auto"
                        alt={props.alt || 'Blog post image'}
                        loading="lazy"
                        onError={(e) => {
                          console.error('Image failed to load:', imgSrc);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  );
                },
                a: ({ node, children, ...props }) => {
                  // Check if this is a YouTube link
                  const youtubeMatch = props.href ? props.href.match(YOUTUBE_REGEX) : null;
                  
                  if (youtubeMatch && youtubeMatch[1]) {
                    const videoId = youtubeMatch[1];
                    return (
                      <div className="my-8 aspect-w-16 aspect-h-9">
                        <iframe
                          width="100%"
                          height="400"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg shadow-md"
                        ></iframe>
                      </div>
                    );
                  }
                  
                  // Check if this is an image URL that should be rendered as an image
                  if (props.href && /\.(jpg|jpeg|png|gif|webp)$/i.test(props.href)) {
                    const content = children?.toString() || '';
                    // If the link text is the same as the URL or seems to be a description rather than a link text
                    if (content === props.href || content === 'Image' || content === 'image' || content.length < 10) {
                      return (
                        <div className="my-8">
                          <img
                            src={props.href}
                            className="rounded-lg shadow-md w-full h-auto"
                            alt={content !== props.href ? content : 'Blog post image'}
                            loading="lazy"
                            onError={(e) => {
                              console.error('Image failed to load:', props.href);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      );
                    }
                  }
                  
                  // Regular link
                  return (
                    <a 
                      {...props} 
                      className="text-blue-600 hover:text-blue-800 underline"
                      target={props.href?.startsWith('http') ? '_blank' : undefined}
                      rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                    </a>
                  );
                },
                p: ({ node, children, ...props }) => {
                  // Special handling for paragraphs containing potential YouTube embeds
                  if (
                    React.Children.count(children) === 1 &&
                    typeof children === 'string'
                  ) {
                    const text = children.toString();
                    
                    // Check if it's an image URL
                    if (/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(text)) {
                      return (
                        <div className="my-8">
                          <img
                            src={text}
                            className="rounded-lg shadow-md w-full h-auto"
                            alt="Blog post image"
                            loading="lazy"
                            onError={(e) => {
                              console.error('Image failed to load:', text);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      );
                    }
                    
                    // Check for youtube: embeds - this is our custom format
                    if (text.trim().startsWith('youtube:')) {
                      const videoId = text.trim().replace(/^youtube:/, '');
                      
                      return (
                        <div className="my-8 aspect-w-16 aspect-h-9">
                          <iframe
                            width="100%"
                            height="400"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg shadow-md"
                          ></iframe>
                        </div>
                      );
                    }
                  }
                  
                  return <p {...props} className="text-gray-700 leading-relaxed mb-6">{children}</p>;
                },
                ul: ({ node, ...props }) => (
                  <ul {...props} className="list-disc pl-6 mb-6" />
                ),
                ol: ({ node, ...props }) => (
                  <ol {...props} className="list-decimal pl-6 mb-6" />
                ),
                li: ({ node, ...props }) => (
                  <li {...props} className="mb-2" />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote {...props} className="border-l-4 border-gray-200 pl-4 italic my-6" />
                ),
                code: ({ node, inline, ...props }) => (
                  inline 
                    ? <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" />
                    : <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
                        <code {...props} className="font-mono text-sm" />
                      </pre>
                ),
              }}
            >
              {contentWithoutTitle}
            </ReactMarkdown>
          </div>
          
          {/* Call-to-Action Block at the end of the blog post */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <CTABlock variant="footer" />
          </div>
          
          {/* Table of Contents */}
          {tableOfContents.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <List className="h-5 w-5 mr-2 text-blue-600" />
                  Table of Contents
                </h3>
                <nav>
                  <ul className="space-y-2">
                    {tableOfContents.map((item) => (
                      <li 
                        key={item.id} 
                        className={`${
                          item.level === 2 
                            ? 'font-medium' 
                            : item.level === 3 
                              ? 'pl-4 text-sm' 
                              : 'pl-8 text-sm text-gray-600'
                        }`}
                      >
                        <a 
                          href={`#${item.id}`} 
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(item.id);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          )}
          
          {/* Social sharing at the end of the article */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <p className="text-gray-700 font-medium mb-4 sm:mb-0">Share this article:</p>
              <ShareButtons 
                url={shareUrl}
                title={post.title}
                description={metaDescription}
              />
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          {/* Sidebar CTA Block */}
          <div className="sticky top-4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <CTABlock variant="sidebar" />
            </div>
            
            {/* Table of Contents for mobile (only shows on smaller screens) */}
            {tableOfContents.length > 0 && (
              <div className="lg:hidden bg-white rounded-lg shadow-sm p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <List className="h-4 w-4 mr-2 text-blue-600" />
                  Table of Contents
                </h3>
                <nav>
                  <ul className="space-y-1 text-sm">
                    {tableOfContents.map((item) => (
                      <li 
                        key={item.id} 
                        className={`${
                          item.level === 2 
                            ? 'font-medium' 
                            : item.level === 3 
                              ? 'pl-2' 
                              : 'pl-4 text-xs text-gray-600'
                        }`}
                      >
                        <a 
                          href={`#${item.id}`} 
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(item.id);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Related Posts Section */}
      <RelatedBlogPosts currentPostSlug={post.slug} />
    </div>
  );
};

/**
 * BlogPreview Component
 * Shows a preview of the latest blog posts
 */
export const BlogPreview: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllPosts()
      .then((fetchedPosts) => {
        setPosts(fetchedPosts.slice(0, blogConfig.ui.preview.count)); // Show latest posts
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
            <div key={i} className="bg-white rounded-lg shadow-sm">
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
          <h2 className="text-2xl font-bold text-gray-900">Latest from our Blog</h2>
          <Link 
            to="/blog/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View all posts →
          </Link>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <PenLine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No blog posts available yet.</p>
          <p className="text-gray-500 text-sm mt-2">Check back soon for new content!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Latest from our Blog</h2>
        <div className="flex items-center space-x-2">
          <SearchBar 
            compact={true} 
            containerClassName="hidden md:flex" 
            buttonClassName="text-gray-700"
          />
          <Link 
            to="/blog/"
            className="text-blue-600 hover:text-blue-800 font-medium"
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
            <article key={post.slug} className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                <div className="p-6">
                  {(post.featuredImage || isYoutubeThumb) && (
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
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
                    <div className="text-gray-600 prose-sm">
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
 * RelatedBlogPosts Component
 * Displays a list of related blog posts
 */
export const RelatedBlogPosts: React.FC<{ currentPostSlug: string }> = ({ currentPostSlug }) => {
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => {
          // Determine if the featured image is from YouTube
          const isYoutubeThumb = post.featuredImage?.includes('img.youtube.com');
          
          return (
            <article key={post.slug} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Link to={`/${post.slug}/`} className="block hover:no-underline">
                <div 
                  className={`${isYoutubeThumb ? 'youtube-thumbnail' : blogConfig.ui.featuredImage.height.relatedPosts} bg-cover bg-center relative`}
                  style={{ 
                    backgroundImage: post.featuredImage 
                      ? `url(${post.featuredImage})` 
                      : `url(${blogConfig.ui.featuredImage.defaults[1]})`
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 line-clamp-2">
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
 * CTABlock Component
 * Call-to-action block for various sections
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

/**
 * Sitemap Component
 * Displays a sitemap of all pages and posts
 */
export const Sitemap: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
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
              <Link to={url.path} className="text-blue-600 hover:text-blue-800">
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
        <h1 className={themeConfig.typography.headings.h1}>Site Map</h1>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className={`${themeConfig.typography.headings.h2} mb-4 border-b pb-2`}>Main Pages</h2>
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
          <h2 className={`${themeConfig.typography.headings.h2} mb-4 border-b pb-2`}>Blog Posts</h2>
          <ul className="space-y-2">
            {blogUrls.map((url) => (
              <li key={url.path} className="flex flex-wrap justify-between">
                <Link to={url.path} className={themeConfig.components.link}>
                  {url.name}
                </Link>
                {url.date && (
                  <span className="text-gray-500 text-sm">
                    {new Date(url.date).toLocaleDateString('en-US', blogConfig.posts.dateFormat.short)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
      
      {/* Note about sitemap XML */}
      <div className="mt-12 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">
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

/**
 * Pagination Component
 * Reusable pagination component for blog lists
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
                <span className={`px-4 py-2 text-sm font-medium text-white ${themeConfig.colors.primary.main} rounded-md`}>
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
 * SearchBar Component
 * Reusable search component
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
          className={`${inputClassName} ${themeConfig.components.input} rounded-l-md flex-grow`}
          aria-label="Search"
        />
      )}
      <button
        type={isExpanded || !compact ? 'submit' : 'button'}
        onClick={isExpanded || !compact ? undefined : toggleExpand}
        className={`${buttonClassName} ${
          isExpanded || !compact
            ? `${themeConfig.colors.primary.main} hover:${themeConfig.colors.primary.dark} text-white px-4 py-2 rounded-r-md`
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
 * Social media sharing buttons
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
 * ScrollToTop Component
 * Scrolls to the top of the page on route change
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
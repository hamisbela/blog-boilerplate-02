import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getAllPosts } from '../data/posts';
import { BlogPost } from '../types/blog';
import { PenLine, Calendar, User, Filter } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import siteConfig, { getSiteUrl } from '../config/site';
import blogConfig from '../config/blog.config';
import themeConfig from '../config/theme.config';
import SearchBar from './SearchBar';
import Pagination from './Pagination';

// Use configured posts per page
const POSTS_PER_PAGE = blogConfig.posts.postsPerPage;

const BlogList: React.FC = () => {
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

export default BlogList;
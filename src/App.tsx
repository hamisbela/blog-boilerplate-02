import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { BookOpen, Search } from 'lucide-react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BlogList, BlogPostComponent, BlogPreview, Sitemap, SearchBar, ScrollToTop } from './blog/BlogCore';
import siteConfig, { getSiteUrl } from './config/site';
import blogConfig from './config/blog.config';
import themeConfig from './config/theme.config';

function App() {
  return (
    <Router>
      <HelmetProvider>
        <ScrollToTop />
        <div className={`min-h-screen ${themeConfig.colors.secondary.light} flex flex-col`}>
          <Helmet>
            <title>{siteConfig.title} - {siteConfig.description}</title>
            <meta name="description" content={siteConfig.description} />
            <meta property="og:title" content={siteConfig.title} />
            <meta property="og:description" content={siteConfig.description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={getSiteUrl()} />
          </Helmet>

          <nav className="bg-white shadow-sm">
            <div className={`${themeConfig.layout.container.wide} mx-auto px-4 sm:px-6 lg:px-8`}>
              <div className="flex justify-between h-16">
                <div className="flex">
                  <Link to="/" className="flex items-center">
                    <BookOpen className={`h-8 w-8 ${themeConfig.colors.primary.text} mr-2`} />
                    <span className="font-bold text-xl">{siteConfig.title}</span>
                  </Link>
                </div>
                <div className="flex items-center">
                  <div className="hidden md:block mr-4">
                    <SearchBar compact={true} />
                  </div>
                  {siteConfig.navigation.main.map((item, index) => (
                    <Link 
                      key={index}
                      to={item.path} 
                      className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-grow">
            <Routes>
              <Route path={blogConfig.routes.blog} element={<BlogList />} />
              <Route path={blogConfig.routes.sitemap} element={<Sitemap />} />
              <Route path="/" element={
                <div className={themeConfig.layout.spacing.section}>
                  <div className={`${themeConfig.layout.container.regular} mx-auto`}>
                    {/* 
                      Home page is empty by default - customize this in your specific project 
                      You can add your own components and content here.
                    */}
                    <div className="mb-12 text-center">
                      <h1 className={`${themeConfig.typography.headings.h1} ${themeConfig.colors.secondary.textDark} mb-4`}>
                        Welcome to {siteConfig.title}
                      </h1>
                      <p className={`text-xl ${themeConfig.colors.secondary.text}`}>
                        {siteConfig.description}
                      </p>
                    </div>
                    
                    {/* Blog Preview - shows latest posts */}
                    <div className="mt-16">
                      <h2 className={`${themeConfig.typography.headings.h2} ${themeConfig.colors.secondary.textDark} mb-6`}>
                        Latest Blog Posts
                      </h2>
                      <BlogPreview />
                    </div>
                  </div>
                </div>
              } />
              {/* This should be the last route for catching blog posts */}
              <Route path="/:slug/" element={<BlogPostWrapper />} />
            </Routes>
          </main>
          
          <div className={`${themeConfig.colors.secondary.main} py-6 border-t ${themeConfig.colors.secondary.borderLight}`}>
            <div className={`${themeConfig.layout.container.wide} mx-auto px-4 sm:px-6`}>
              <p className={`text-center ${themeConfig.colors.secondary.textLight} text-sm`}>
                {siteConfig.legal.copyright}
              </p>
            </div>
          </div>
        </div>
      </HelmetProvider>
    </Router>
  );
}

// Wrapper for blog posts to handle proper routing
function BlogPostWrapper() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const path = location.pathname;
  
  // Exclude specific paths that have their own routes
  if (path === blogConfig.routes.blog || path === blogConfig.routes.sitemap || path === '/sitemap.xml/') {
    return <Navigate to={path} replace />;
  }
  
  // If there's a page parameter, likely it's a request for a paginated blog route
  if (searchParams.has('page') && path === '/') {
    return <Navigate to={`${blogConfig.routes.blog}?${searchParams.toString()}`} replace />;
  }
  
  return <BlogPostComponent />;
}

export default App;
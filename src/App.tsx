import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { BookOpen, Search } from 'lucide-react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import BlogPreview from './components/BlogPreview';
import ScrollToTop from './components/ScrollToTop';
import Sitemap from './components/Sitemap';
import SearchBar from './components/SearchBar';
import siteConfig, { getSiteUrl } from './config/site';

function App() {
  return (
    <Router>
      <HelmetProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Helmet>
            <title>{siteConfig.title} - {siteConfig.description}</title>
            <meta name="description" content={siteConfig.description} />
            <meta property="og:title" content={siteConfig.title} />
            <meta property="og:description" content={siteConfig.description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={getSiteUrl()} />
          </Helmet>

          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <Link to="/" className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
                    <span className="font-bold text-xl">{siteConfig.title}</span>
                  </Link>
                </div>
                <div className="flex items-center">
                  <div className="hidden md:block mr-4">
                    <SearchBar compact={true} />
                  </div>
                  <Link 
                    to="/blog/" 
                    className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Blog
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-grow">
            <Routes>
              <Route path="/blog/" element={<BlogList />} />
              <Route path="/sitemap/" element={<Sitemap />} />
              <Route path="/" element={
                <div className="py-12 px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto">
                    {/* 
                      Home page is empty by default - customize this in your specific project 
                      You can add your own components and content here.
                    */}
                    <div className="mb-12 text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to {siteConfig.title}</h1>
                      <p className="text-xl text-gray-600">
                        {siteConfig.description}
                      </p>
                    </div>
                    
                    {/* Blog Preview - shows latest posts */}
                    <div className="mt-16">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Blog Posts</h2>
                      <BlogPreview />
                    </div>
                  </div>
                </div>
              } />
              {/* This should be the last route for catching blog posts */}
              <Route path="/:slug/" element={<BlogPostWrapper />} />
            </Routes>
          </main>
          
          {/* Footer removed as requested */}
          <div className="bg-gray-100 py-6 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <p className="text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} {siteConfig.title}. All rights reserved.
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
  if (path === '/blog/' || path === '/sitemap/' || path === '/sitemap.xml/') {
    return <Navigate to={path} replace />;
  }
  
  // If there's a page parameter, likely it's a request for a paginated blog route
  if (searchParams.has('page') && path === '/') {
    return <Navigate to={`/blog/?${searchParams.toString()}`} replace />;
  }
  
  return <BlogPost />;
}

export default App;
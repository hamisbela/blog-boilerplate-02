import siteConfig, { getSiteUrl } from './site';

/**
 * Blog Configuration
 * This is the main configuration file for blog functionality.
 * Customize this file to change how your blog behaves.
 */
const blogConfig = {
  /**
   * Posts Configuration
   */
  posts: {
    // Number of posts to show per page in blog list
    postsPerPage: 30,
    
    // Default author when not specified in post frontmatter
    defaultAuthor: siteConfig.defaultAuthor,
    
    // Paths for content
    contentDirs: {
      blog: 'blog-content',
      zips: 'blog-zips',
    },
    
    // Date formatting options for blog posts
    dateFormat: {
      long: { year: 'numeric', month: 'long', day: 'numeric' } as const,
      short: { year: 'numeric', month: 'short', day: 'numeric' } as const,
    },
    
    // Reading time calculation
    readingTime: {
      wordsPerMinute: 225,
      enabled: true,
    },
  },
  
  /**
   * UI Configuration
   */
  ui: {
    // Featured image settings
    featuredImage: {
      // Default images to use when no featured image is found (selected randomly)
      defaults: [
        'https://images.unsplash.com/photo-1487611459768-bd414656ea10?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=1920&auto=format&fit=crop'
      ],
      // Height for featured images in different contexts (using Tailwind classes)
      height: {
        blogList: 'h-48',
        blogPost: 'h-64 md:h-96',
        relatedPosts: 'h-40',
      }
    },
    
    // Blog preview settings
    preview: {
      // Number of posts to show in preview sections
      count: 3,
      // Maximum excerpt length in blog previews
      excerptLength: 120,
    },
    
    // Call-to-action block settings
    cta: {
      mainPage: {
        title: "Enjoyed this article?",
        description: "Explore more of our content or check out our main site for more resources.",
        primaryButton: { text: "Visit Homepage", url: "/" },
        secondaryButton: { text: "More Articles", url: "/blog/" },
      },
      sidebar: {
        title: "About This Blog",
        description: "Welcome to our blog where we share valuable content and insights. Explore more articles or visit our main site.",
        primaryButton: { text: "Visit Homepage", url: "/" },
        secondaryButton: { text: "Browse All Articles", url: "/blog/" },
      }
    }
  },
  
  /**
   * SEO Configuration
   */
  seo: {
    // Meta description fallback when not provided in post
    defaultMetaDescription: siteConfig.description,
    
    // Open Graph settings
    openGraph: {
      type: "website",
      siteName: siteConfig.title,
    },
    
    // Twitter card settings
    twitter: {
      cardType: "summary_large_image",
    },
    
    // Structured data (JSON-LD) settings
    structuredData: {
      enabled: true,
    }
  },
  
  /**
   * Routes Configuration
   */
  routes: {
    home: "/",
    blog: "/blog/",
    about: "/about/",
    contact: "/contact/",
    sitemap: "/sitemap/",
  },
  
  /**
   * Social Sharing Configuration
   */
  sharing: {
    platforms: [
      {
        name: 'Facebook',
        urlTemplate: "https://www.facebook.com/sharer/sharer.php?u={url}",
        color: 'bg-blue-600 hover:bg-blue-700',
        icon: 'Facebook'
      },
      {
        name: 'Twitter',
        urlTemplate: "https://twitter.com/intent/tweet?url={url}&text={title}",
        color: 'bg-sky-500 hover:bg-sky-600',
        icon: 'Twitter'
      },
      {
        name: 'LinkedIn',
        urlTemplate: "https://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}&summary={description}",
        color: 'bg-blue-700 hover:bg-blue-800',
        icon: 'Linkedin'
      },
      {
        name: 'Email',
        urlTemplate: "mailto:?subject={title}&body={description}%0A%0A{url}",
        color: 'bg-gray-600 hover:bg-gray-700',
        icon: 'Mail'
      }
    ]
  }
};

export default blogConfig;

/**
 * Get a random default featured image URL
 */
export function getDefaultFeaturedImage(): string {
  const defaultImages = blogConfig.ui.featuredImage.defaults;
  return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}

/**
 * Generate a meta description from content if not provided
 */
export function generateMetaDescription(content: string): string {
  // Remove markdown formatting and strip HTML tags
  const plainText = content
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[.*?\]\(.*?\)/g, '$1') // Replace links with just the text
    .replace(/[#*_~`]/g, '') // Remove markdown formatting characters
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  // Get first 160 characters, cut at last space to avoid word breaks
  const truncated = plainText.substring(0, 160);
  return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
}
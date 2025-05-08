# React Blog Boilerplate

A modern, customizable React blog with Markdown support, built with Vite, React, TypeScript, and Tailwind CSS.

## Features

- **Markdown Blog**: Write your blog posts in Markdown with frontmatter support
- **Search Functionality**: Built-in search for blog posts
- **SEO Optimized**: Meta tags, canonical URLs, and auto-generated sitemap
- **Responsive Design**: Looks great on all devices with Tailwind CSS
- **Fast Performance**: Built with Vite for optimal development and production performance
- **Image Handling**: Automatic featured image extraction from blog posts
- **YouTube Embed Support**: Easily embed YouTube videos in your blog posts
- **Zip File Support**: Upload multiple blog posts at once via zip files
- **Highly Customizable**: All customization options in centralized config files

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Easy Customization

The blog is designed for easy customization and reuse in other projects. Everything is organized into three main directories:

1. **`src/config/`**: All customizable settings
2. **`src/blog/`**: All blog-related components and functionality (easily portable)
3. **`blog-content/`**: Where your Markdown blog posts go

## Customization

### Centralized Configuration

All customization happens in just a few files in the `src/config` directory:

1. **`site.ts`** - Site-wide settings like title, description, social links, etc.
2. **`blog.config.ts`** - Blog-specific settings (posts per page, UI settings, etc.)
3. **`theme.config.ts`** - Theme configuration (colors, typography, layout, components)

### Site Configuration

Edit `src/config/site.ts` to customize site-wide settings:

```typescript
const siteConfig = {
  title: "Your Site Name",
  description: "Your site description",
  defaultAuthor: "Default Author Name",
  domain: "yoursitename.com",
  // Add more site-wide configuration as needed
};
```

### Blog Configuration

Edit `src/config/blog.config.ts` to customize how the blog works:

```typescript
const blogConfig = {
  posts: {
    postsPerPage: 30,
    // Other post settings
  },
  ui: {
    featuredImage: {
      // Image settings
    },
    preview: {
      // Preview settings
    },
    cta: {
      // Call-to-action blocks
    }
  },
  // Other blog settings
};
```

### Theme Configuration

Edit `src/config/theme.config.ts` to customize styles and theme:

```typescript
const themeConfig = {
  colors: {
    primary: {
      main: 'bg-blue-600',
      // Other color variants
    },
    // Other color settings
  },
  typography: {
    // Typography settings
  },
  layout: {
    // Layout settings
  },
  components: {
    // Component styles
  },
};
```

## Blog Content Structure

Blog content can be added in two ways:

1. **Individual markdown files** in the `blog-content` directory
2. **Zip files** containing markdown files in the `blog-zips` directory

### Creating Blog Posts

Create a new Markdown file in the `blog-content` directory. Your blog post should include frontmatter at the beginning:

```md
---
title: Your Blog Post Title
date: 2025-04-01
author: Your Name
excerpt: A brief summary of the blog post that will appear in listings
---

# Your Blog Post Title

Your content goes here...
```

## Reusing Components in Other Projects

To reuse these components in other projects, you can:

1. Copy these directories to your new project:
   - `/src/blog` (all core blog functionality)
   - `/src/config` (all configuration files)

2. In your main file, import the components you need:

```typescript
import { 
  BlogList, 
  BlogPost, 
  BlogPreview 
} from './blog/BlogCore';
```

3. Use the components in your application:

```tsx
<Routes>
  <Route path="/blog" element={<BlogList />} />
  <Route path="/post/:slug" element={<BlogPost />} />
  <Route path="/" element={
    <div>
      <h2>Latest Posts</h2>
      <BlogPreview />
    </div>
  } />
</Routes>
```

This modular approach lets you quickly set up advanced blog functionality in any React project.

## License

This project is MIT licensed.
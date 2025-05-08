/**
 * Site Configuration
 * This is the central configuration file for site-wide settings.
 * Customize this file for your specific project needs.
 */
const siteConfig = {
  // Site details
  title: "React Blog Boilerplate",
  description: "A modern, customizable React blog with Markdown support",
  defaultAuthor: "Blog Author",
  
  // Domain configuration - single source of truth
  domain: import.meta.env.VITE_SITE_DOMAIN || "example.com",
  
  // Contact information
  contact: {
    email: "contact@yourdomain.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, City, State 12345",
  },
  
  // Social media profiles
  social: {
    twitter: "https://twitter.com/yourusername",
    facebook: "https://facebook.com/yourpage",
    instagram: "https://instagram.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
    github: "https://github.com/yourusername",
  },
  
  // Navigation - main menu items
  navigation: {
    main: [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog/" },
      { name: "About", path: "/about/" },
      { name: "Contact", path: "/contact/" },
    ],
    footer: [
      { name: "Privacy Policy", path: "/privacy/" },
      { name: "Terms of Service", path: "/terms/" },
      { name: "Sitemap", path: "/sitemap/" },
    ],
  },
  
  // Copyright and legal
  legal: {
    copyright: `© ${new Date().getFullYear()} React Blog Boilerplate. All rights reserved.`,
    company: "Your Company Name",
  },
  
  // Additional customization options
  features: {
    darkMode: false,
    comments: false,
    newsletter: false,
    search: true,
  },
};

// Derive the full URL from the domain
export function getSiteUrl(): string {
  return `https://${siteConfig.domain}`;
}

export default siteConfig;
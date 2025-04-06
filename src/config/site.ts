const siteConfig = {
  title: "React Blog Boilerplate",
  description: "A modern, customizable React blog with Markdown support",
  defaultAuthor: "Blog Author",
  // Domain configuration - single source of truth
  domain: import.meta.env.VITE_SITE_DOMAIN || "aiimagecenter.com",
  // Add more site-wide configuration as needed
};

// Derive the full URL from the domain
export function getSiteUrl(): string {
  return `https://${siteConfig.domain}`;
}

export default siteConfig;
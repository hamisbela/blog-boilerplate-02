import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import our utilities (dynamically)
let createSlug;
try {
  const slugUtilsModule = await import('../src/utils/slugUtils.js');
  createSlug = slugUtilsModule.createSlug;
} catch (error) {
  // Fallback if import fails
  createSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
}

// Max URLs per sitemap file
const MAX_URLS_PER_SITEMAP = 200;

// Load site config or use defaults
let siteConfig;
try {
  const configModule = await import('../src/config/site.js');
  siteConfig = configModule.default;
  
  // Get the site URL from the domain
  if (configModule.getSiteUrl && typeof configModule.getSiteUrl === 'function') {
    siteConfig.siteUrl = configModule.getSiteUrl();
  } else {
    // Fallback to constructing URL from domain
    siteConfig.siteUrl = `https://${siteConfig.domain}`;
  }
} catch (error) {
  // Try to get the site domain from environment variable
  let siteDomain = process.env.VITE_SITE_DOMAIN || "toolcrunch.org";
  
  // Fallback in case the environment variable contains placeholder
  if (siteDomain.includes('${URL}')) {
    console.warn('Warning: VITE_SITE_DOMAIN contains a placeholder ${URL}. Using hardcoded domain.');
    siteDomain = "toolcrunch.org";
  }
  
  siteConfig = {
    domain: siteDomain,
    siteUrl: `https://${siteDomain}`,
  };
}

// Constants
const BLOG_CONTENT_DIR = path.join(__dirname, '../blog-content');
const PUBLIC_DIR = path.join(__dirname, '../public');
const SITEMAP_DIR = path.join(PUBLIC_DIR, 'sitemaps');
const SITEMAP_INDEX_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const ROBOTS_FILE = path.join(PUBLIC_DIR, 'robots.txt');

// Ensure output directories exist
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

if (!fs.existsSync(SITEMAP_DIR)) {
  fs.mkdirSync(SITEMAP_DIR, { recursive: true });
}

// Function to extract title from markdown content
function extractTitleFromMarkdown(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : 'Untitled Post';
}

// Function to extract meta description from markdown content
function extractMetaDescriptionFromMarkdown(content) {
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

// Function to extract front matter from markdown
function extractFrontMatter(content) {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return { frontMatter: {}, content };
  }

  const frontMatterStr = match[1];
  const contentStr = match[2];

  // Parse YAML-style front matter
  const frontMatter = {};
  frontMatterStr.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      frontMatter[key.trim()] = valueParts.join(':').trim();
    }
  });

  return { frontMatter, content: contentStr };
}

// Function to find all markdown files recursively
function findMarkdownFiles(dir, fileList = []) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to create a single sitemap file
function createSitemapFile(urls, fileName) {
  console.log(`🔄 Generating sitemap file: ${fileName}...`);
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';
  
  urls.forEach(item => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${item.loc}</loc>\n`;
    if (item.lastmod) {
      sitemap += `    <lastmod>${item.lastmod}</lastmod>\n`;
    }
    if (item.changefreq) {
      sitemap += `    <changefreq>${item.changefreq}</changefreq>\n`;
    }
    if (item.priority) {
      sitemap += `    <priority>${item.priority}</priority>\n`;
    }
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>';
  
  fs.writeFileSync(fileName, sitemap, 'utf8');
  console.log(`✅ Sitemap file generated with ${urls.length} URLs at: ${fileName}`);
  
  return path.basename(fileName);
}

// Function to create sitemap index
function createSitemapIndex(sitemapFiles) {
  console.log('🔄 Generating sitemap index...');
  
  const today = new Date().toISOString().split('T')[0];
  
  let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapIndex += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  sitemapFiles.forEach(file => {
    sitemapIndex += '  <sitemap>\n';
    sitemapIndex += `    <loc>${siteConfig.siteUrl}/sitemaps/${file}</loc>\n`;
    sitemapIndex += `    <lastmod>${today}</lastmod>\n`;
    sitemapIndex += '  </sitemap>\n';
  });
  
  sitemapIndex += '</sitemapindex>';
  
  fs.writeFileSync(SITEMAP_INDEX_FILE, sitemapIndex, 'utf8');
  console.log(`✅ Sitemap index generated with ${sitemapFiles.length} sitemaps at: ${SITEMAP_INDEX_FILE}`);
}

// Generate the sitemap XML
async function generateSitemap() {
  try {
    console.log('🔄 Generating sitemaps...');
    
    // Validate domain
    if (siteConfig.domain.includes('${URL}')) {
      console.warn('Warning: domain contains a placeholder ${URL}. Using hardcoded domain.');
      siteConfig.domain = "toolcrunch.org";
      siteConfig.siteUrl = "https://toolcrunch.org";
    }
    
    console.log(`Using site URL: ${siteConfig.siteUrl}`);
    
    // Base URLs
    const baseUrls = [
      { 
        loc: `${siteConfig.siteUrl}/`, 
        lastmod: new Date().toISOString().split('T')[0], 
        priority: 1.0 
      },
      { 
        loc: `${siteConfig.siteUrl}/blog`, 
        lastmod: new Date().toISOString().split('T')[0], 
        priority: 0.8 
      },
      { 
        loc: `${siteConfig.siteUrl}/about`, 
        lastmod: new Date().toISOString().split('T')[0], 
        priority: 0.7 
      },
      { 
        loc: `${siteConfig.siteUrl}/contact`, 
        lastmod: new Date().toISOString().split('T')[0], 
        priority: 0.7 
      },
      { 
        loc: `${siteConfig.siteUrl}/sitemap`, 
        lastmod: new Date().toISOString().split('T')[0], 
        priority: 0.5 
      }
    ];
    
    // Get all markdown files
    const markdownFiles = findMarkdownFiles(BLOG_CONTENT_DIR);
    const blogUrls = [];
    
    // Process each markdown file
    for (const file of markdownFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const { frontMatter, content: markdownContent } = extractFrontMatter(content);
        
        // Get the title from front matter or extract it from content
        const title = frontMatter.title || extractTitleFromMarkdown(markdownContent);
        
        // Generate a slug from the title if not present in front matter
        const slug = frontMatter.slug 
          ? createSlug(frontMatter.slug) 
          : createSlug(title);
        
        // Get the last modification date
        const lastmod = frontMatter.date || new Date().toISOString().split('T')[0];
        
        // Extract meta description
        const metaDescription = frontMatter.excerpt || extractMetaDescriptionFromMarkdown(markdownContent);
        
        blogUrls.push({
          loc: `${siteConfig.siteUrl}/${slug}`,
          lastmod,
          priority: 0.7,
          metaDescription // Store meta description for potential future use
        });
      } catch (err) {
        console.warn(`⚠️ Error processing file ${file}:`, err.message);
      }
    }
    
    // Combine all URLs
    const allUrls = [...baseUrls, ...blogUrls];
    
    // Check if we need to split sitemaps
    if (allUrls.length > MAX_URLS_PER_SITEMAP) {
      console.log(`🔄 Found ${allUrls.length} URLs. Splitting into multiple sitemap files...`);
      
      // Clean existing sitemap files in the directory
      if (fs.existsSync(SITEMAP_DIR)) {
        fs.readdirSync(SITEMAP_DIR)
          .filter(file => file.startsWith('sitemap') && file.endsWith('.xml'))
          .forEach(file => fs.unlinkSync(path.join(SITEMAP_DIR, file)));
      }
      
      // Create chunks of URLs
      const chunks = [];
      for (let i = 0; i < allUrls.length; i += MAX_URLS_PER_SITEMAP) {
        chunks.push(allUrls.slice(i, i + MAX_URLS_PER_SITEMAP));
      }
      
      // Create individual sitemap files
      const sitemapFiles = [];
      let counter = 1;
      
      for (const chunk of chunks) {
        const fileName = path.join(SITEMAP_DIR, `sitemap-${counter}.xml`);
        const generatedFile = createSitemapFile(chunk, fileName);
        sitemapFiles.push(generatedFile);
        counter++;
      }
      
      // Create sitemap index
      createSitemapIndex(sitemapFiles);
    } else {
      // Single sitemap file
      createSitemapFile(allUrls, SITEMAP_INDEX_FILE);
    }
    
    // Generate robots.txt file
    generateRobotsTxt();
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
}

// Generate robots.txt file
function generateRobotsTxt() {
  try {
    console.log('🔄 Generating robots.txt...');
    
    // Clean siteUrl if it contains a placeholder
    if (siteConfig.siteUrl.includes('${URL}')) {
      console.warn('Warning: siteUrl contains a placeholder ${URL} in robots.txt. Using hardcoded URL.');
      siteConfig.siteUrl = "https://toolcrunch.org";
    }
    
    const content = `# robots.txt for ${siteConfig.siteUrl}
User-agent: *
Allow: /

# Sitemap location
Sitemap: ${siteConfig.siteUrl}/sitemap.xml

# Block specific directories or files if needed
# Disallow: /private/
# Disallow: /admin/

# Crawl delay for bots (optional)
Crawl-delay: 10
`;
    
    fs.writeFileSync(ROBOTS_FILE, content, 'utf8');
    console.log(`✅ robots.txt generated at: ${ROBOTS_FILE}`);
  } catch (error) {
    console.error('❌ Error generating robots.txt:', error);
  }
}

// Run the sitemap generator
generateSitemap();
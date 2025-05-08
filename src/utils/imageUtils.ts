/**
 * Extracts the first image URL from the content of a blog post
 * @param content The markdown content to extract an image from
 * @returns The URL of the first image found, or null if no image is found
 */
export function extractFirstImage(content: string): string | null {
  // Look for image markdown format: ![alt](url)
  const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
  const mdMatch = content.match(markdownImageRegex);
  
  if (mdMatch && mdMatch[1]) {
    return mdMatch[1];
  }
  
  // Look for direct image URLs in the content
  const directImageUrlRegex = /(https?:\/\/.*?\.(jpg|jpeg|png|gif|webp))/i;
  const directMatch = content.match(directImageUrlRegex);
  
  if (directMatch && directMatch[1]) {
    return directMatch[1];
  }
  
  // Look for HTML image tags: <img src="url" />
  const htmlImageRegex = /<img.*?src=["'](.*?)["']/;
  const htmlMatch = content.match(htmlImageRegex);
  
  if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1];
  }
  
  // No image found
  return null;
}
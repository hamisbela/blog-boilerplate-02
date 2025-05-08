/**
 * Theme Configuration
 * This file contains all the theme-related settings for customizing the look and feel.
 * Modify these values to quickly change the appearance of your blog.
 */
const themeConfig = {
  /**
   * Colors
   * These color classes are used throughout the application.
   * Change them to match your brand colors.
   */
  colors: {
    primary: {
      light: 'bg-blue-50',
      main: 'bg-blue-600',
      dark: 'bg-blue-700',
      text: 'text-blue-600',
      textHover: 'hover:text-blue-800',
      borderLight: 'border-blue-200',
      border: 'border-blue-600',
      gradient: 'from-blue-50 to-blue-100',
    },
    secondary: {
      light: 'bg-gray-50',
      main: 'bg-gray-100',
      dark: 'bg-gray-200',
      text: 'text-gray-600',
      textLight: 'text-gray-500',
      textDark: 'text-gray-900',
    },
    accent: {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-sky-500',
    },
  },
  
  /**
   * Typography
   * Font settings for different elements.
   * Using Tailwind's built-in font classes.
   */
  typography: {
    headings: {
      h1: 'text-3xl md:text-4xl lg:text-5xl font-bold',
      h2: 'text-2xl md:text-3xl font-bold',
      h3: 'text-xl md:text-2xl font-semibold',
      h4: 'text-lg md:text-xl font-semibold',
    },
    body: {
      regular: 'text-base',
      small: 'text-sm',
      large: 'text-lg',
    },
  },
  
  /**
   * Layout
   * Spacing, container sizes, and other layout options.
   */
  layout: {
    container: {
      regular: 'max-w-4xl',
      wide: 'max-w-7xl',
    },
    spacing: {
      section: 'py-12 px-4 sm:px-6',
      card: 'p-6',
      small: 'p-4',
    },
  },
  
  /**
   * Components
   * Styling for specific components.
   */
  components: {
    card: 'bg-white rounded-lg shadow-sm',
    button: {
      primary: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
      secondary: 'px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors',
    },
    tag: 'px-2 py-1 bg-gray-100 rounded-md text-xs font-medium',
    input: 'border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    link: 'text-blue-600 hover:text-blue-800 hover:underline',
    avatar: 'h-10 w-10 rounded-full object-cover',
  },
  
  /**
   * Animation
   * Common animation classes.
   */
  animation: {
    transition: 'transition-all duration-300 ease-in-out',
    hover: 'hover:scale-105',
  }
};

export default themeConfig;

/**
 * Utility function to get a button style variant
 */
export function getButtonClass(variant: 'primary' | 'secondary' = 'primary', className: string = ''): string {
  return `${themeConfig.components.button[variant]} ${className}`;
}

/**
 * Utility function to get a container class
 */
export function getContainerClass(size: 'regular' | 'wide' = 'regular', className: string = ''): string {
  return `${themeConfig.layout.container[size]} mx-auto ${className}`;
}
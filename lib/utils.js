import { config } from "./config";

// Error handling utilities
export const handleError = (error, context = "") => {
  if (config.isDevelopment) {
    console.error(`Error in ${context}:`, error);
  }

  // In production, you might want to send errors to a logging service
  if (config.isProduction) {
    // Example: Send to logging service
    // logToService(error, context);
  }

  return {
    message: config.isDevelopment ? error.message : "An error occurred",
    code: error.code || "UNKNOWN_ERROR",
  };
};

// Logging utilities
export const logger = {
  info: (message, data = {}) => {
    if (config.isDevelopment) {
      console.log(`[INFO] ${message}`, data);
    }
  },

  warn: (message, data = {}) => {
    if (config.isDevelopment) {
      console.warn(`[WARN] ${message}`, data);
    }
  },

  error: (message, error = {}) => {
    if (config.isDevelopment) {
      console.error(`[ERROR] ${message}`, error);
    }
    // In production, send to logging service
  },
};

// Date formatting utilities
export const formatDate = (date, locale = "en-US") => {
  if (!date) return "";

  const dateObj = date.toDate ? date.toDate() : new Date(date);

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
};

export const formatRelativeTime = (date) => {
  if (!date) return "";

  const dateObj = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(dateObj);
};

// Text utilities
export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Performance utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// SEO utilities
export const generateMetaTags = (title, description, image, url) => {
  const siteUrl = config.seo.siteUrl;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image
    ? `${siteUrl}${image}`
    : `${siteUrl}${config.seo.defaultImage}`;

  return {
    title: title ? `${title} | ${config.app.name}` : config.seo.defaultTitle,
    description: description || config.seo.defaultDescription,
    openGraph: {
      title: title || config.seo.defaultTitle,
      description: description || config.seo.defaultDescription,
      url: fullUrl,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title || config.seo.defaultTitle,
        },
      ],
      site_name: config.app.name,
    },
    twitter: {
      card: "summary_large_image",
      title: title || config.seo.defaultTitle,
      description: description || config.seo.defaultDescription,
      image: fullImage,
      creator: config.seo.twitterHandle,
    },
  };
};

// Firebase utilities
export const convertFirestoreTimestamp = (timestamp) => {
  if (!timestamp) return null;
  return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
};

// Local storage utilities (with error handling)
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      if (typeof window === "undefined") return defaultValue;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      logger.error("Error reading from localStorage", { key, error });
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      if (typeof window === "undefined") return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error("Error writing to localStorage", { key, error });
      return false;
    }
  },

  remove: (key) => {
    try {
      if (typeof window === "undefined") return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.error("Error removing from localStorage", { key, error });
      return false;
    }
  },
};

export default {
  handleError,
  logger,
  formatDate,
  formatRelativeTime,
  truncateText,
  slugify,
  isValidEmail,
  isValidUrl,
  debounce,
  throttle,
  generateMetaTags,
  convertFirestoreTimestamp,
  storage,
};

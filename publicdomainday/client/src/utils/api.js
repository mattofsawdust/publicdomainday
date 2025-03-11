/**
 * API configuration and utility functions for PublicDomainDay app
 * This file centralize all API calls to ensure consistent communication with the backend
 */
import axios from 'axios';

// Configure API URL based on environment
// In production, we use relative URLs that will be handled by the proxy
// In development, we explicitly target the backend server port
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

console.log('API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const registerUser = (userData) => {
  return api.post('/auth/register', userData);
};

export const loginUser = (credentials) => {
  return api.post('/auth/login', credentials);
};

export const getCurrentUser = () => {
  return api.get('/auth/me');
};

// User API calls
export const getUserProfile = (userId) => {
  return api.get(`/users/${userId}`);
};

export const updateUserProfile = (userId, profileData) => {
  return api.put(`/users/${userId}`, profileData);
};

export const uploadProfileImage = (userId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  return api.post(`/users/${userId}/profile-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Image API calls
export const getAllImages = (params) => {
  return api.get('/images', { params });
};

export const getImageById = (imageId) => {
  return api.get(`/images/${imageId}`);
};

export const uploadImage = async (imageData) => {
  const formData = new FormData();
  
  // Append image file
  formData.append('image', imageData.file);
  
  // Append other data
  formData.append('title', imageData.title || '');
  formData.append('description', imageData.description || '');
  formData.append('author', imageData.author || '');
  formData.append('year', imageData.year || '');
  formData.append('publicDomain', imageData.publicDomain || false);
  if (imageData.tags) {
    formData.append('tags', imageData.tags);
  }
  
  console.log('Uploading image with formData:', {
    file: imageData.file.name,
    title: imageData.title,
    size: imageData.file.size
  });
  
  // Use a direct fetch approach as a fallback
  try {
    // First try to use a very simple fetch to test connectivity
    console.log('Testing server connectivity...');
    const testConn = await fetch('http://localhost:5001/health');
    console.log('Server connectivity test:', testConn.status, await testConn.text());
    
    console.log('Attempting direct upload using fetch...');
    const response = await fetch('http://localhost:5001/api/images', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type - fetch will set it automatically with boundary
      // when given a FormData object
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Failed to parse error response'
      }));
      
      console.error('Upload failed with status:', response.status, errorData);
      throw new Error(`Upload failed: ${response.status} ${errorData.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('Upload successful using fetch:', data);
    return { data };
  } catch (error) {
    console.error('Upload failed completely:', error.message);
    console.error('Error details:', error);
    throw error;
  }
};

export const updateImage = (imageId, imageData) => {
  return api.put(`/images/${imageId}`, imageData);
};

export const deleteImage = (imageId) => {
  return api.delete(`/images/${imageId}`);
};

export const toggleLikeImage = (imageId) => {
  return api.post(`/images/${imageId}/like`);
};

export const downloadImage = (imageId) => {
  // We can return the URL directly for browser to handle
  return `${API_URL}/images/${imageId}/download`;
};

// Utility function to get absolute URL for image paths
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If already an absolute URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // For relative URLs, prepend the server base URL
  // Remove /api from the URL since image paths don't include it
  const BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' // In production, image URLs are relative to the domain
    : 'http://localhost:5001'; // In development, prepend server domain
    
  return `${BASE_URL}${imageUrl}`;
};

export const getTrendingImages = (params) => {
  return api.get('/images/trending', { params });
};

export const getCategories = (params) => {
  return api.get('/images/categories', { params });
};

export const getRelatedImages = (imageId, params) => {
  return api.get(`/images/${imageId}/related`, { params });
};

export const aiConciergeSearch = (query, params = {}) => {
  return api.get('/images/ai-search', { 
    params: { 
      query,
      ...params
    }
  });
};

// Blog API calls
export const getAllBlogPosts = () => {
  return api.get('/blog');
};

export const getBlogPostById = (postId) => {
  return api.get(`/blog/${postId}`);
};

export const createBlogPost = (postData) => {
  return api.post('/blog', postData);
};

export const updateBlogPost = (postId, postData) => {
  return api.put(`/blog/${postId}`, postData);
};

export const deleteBlogPost = (postId) => {
  return api.delete(`/blog/${postId}`);
};

export default api;
export const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800";

// SECURITY FIX: Centralized API URL for deployment using Environment Variables
// It checks for a live URL, and falls back to localhost if you are coding locally
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const getAuthHeaders = () => {
  const token = localStorage.getItem('prinz_token');
  return {
    'Authorization': `Bearer ${token}`
  };
};
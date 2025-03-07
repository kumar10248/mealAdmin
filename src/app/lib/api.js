// services/routes.js
const API_URL = process.env.API_URL || 'https://cumeal.vercel.app/api';


// Helper function for handling JWT tokens
const getAuthHeaders = () => {
  let headers = {
    'Content-Type': 'application/json',
  };

  // For client-side only
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  return headers;
};

// Error handling helper
const handleResponse = async (response) => {
  // Check if the response is 401 Unauthorized
  if (response.status === 401) {
    // Try to refresh the token
    const refreshed = await refreshToken();
    if (!refreshed) {
      // If refresh failed, redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        window.location.href = '/';
      }
      throw new Error('Session expired. Please login again.');
    }
    
    // Retry the original request with new token
    // This would need to be implemented based on your specific needs
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
  }
  
  return response.json();
};

// -------------------- Auth Services --------------------

// Register a new user


// Get all menus
export async function getAllMenus() {
  const response = await fetch(`${API_URL}/menu`, { 
    cache: 'no-store' 
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch menus');
  }
  
  return response.json();
}

// Get menu for specific date
export async function getMenuByDate(date) {
  const response = await fetch(`${API_URL}/menu/date/${date}`, { 
    cache: 'no-store' 
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch menu');
  }
  
  return response.json();
}

// Get menu for current week
export async function getCurrentWeekMenu() {
  const response = await fetch(`${API_URL}/menu/week`, { 
    cache: 'no-store' 
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch weekly menu');
  }
  
  return response.json();
}

// Create a new menu
export async function createMenu(menuData) {
  const response = await fetch(`${API_URL}/menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(menuData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create menu');
  }
  
  return response.json();
}

// Update an existing menu
export async function updateMenu(id, menuData) {
  const response = await fetch(`${API_URL}/menu/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(menuData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update menu');
  }
  
  return response.json();
}

// Delete a menu
export async function deleteMenu(id) {
  const response = await fetch(`${API_URL}/menu/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete menu');
  }
  
  return response.json();
}
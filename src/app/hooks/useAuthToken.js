// hooks/useAuthToken.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthToken() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Function to refresh the access token
  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };
  
  // Function to log out the user
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user data with current token
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          // Try to refresh the token if unauthorized
          const refreshed = await refreshToken();
          setIsAuthenticated(refreshed);
          
          if (!refreshed) {
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  return { isLoading, isAuthenticated, logout };
}
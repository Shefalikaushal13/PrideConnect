import { useState, useEffect } from 'react';
import { authService, connectWebSocket, disconnectWebSocket } from '../services/api';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await authService.getCurrentUser();
      setUser(userData.user);
      setProfile(userData.profile);
      setIsAuthenticated(true);
      
      // Connect WebSocket
      connectWebSocket(userData.user.id);
      
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      setUser(response.user);
      setProfile(response.profile);
      setIsAuthenticated(true);
      
      // Connect WebSocket
      connectWebSocket(response.user.id);
      
      toast.success('Login successful!');
      return response;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      toast.success('Registration successful! Please check your email to verify your account.');
      return response;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      
      disconnectWebSocket();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state anyway
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      disconnectWebSocket();
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const updatedProfile = await authService.updateProfile(updates);
      setProfile(updatedProfile);
      toast.success('Profile updated successfully!');
      return updatedProfile;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refetch: checkAuthStatus
  };
};
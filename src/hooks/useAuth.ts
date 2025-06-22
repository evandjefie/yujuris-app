import { useState, useEffect } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Simulate auth check
    const checkAuth = async () => {
      setIsLoading(true);
      // In a real app, this would check with Supabase
      const savedUser = localStorage.getItem('yujuris_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate login
    const newUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      plan: 'free',
      remainingQueries: 5
    };
    
    setUser(newUser);
    localStorage.setItem('yujuris_user', JSON.stringify(newUser));
    setIsModalOpen(false);
    return newUser;
  };

  const register = async (email: string, password: string, name: string) => {
    // Simulate registration
    const newUser: User = {
      id: '1',
      email,
      name,
      plan: 'free',
      remainingQueries: 5
    };
    
    setUser(newUser);
    localStorage.setItem('yujuris_user', JSON.stringify(newUser));
    setIsModalOpen(false);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('yujuris_user');
  };

  const upgradeToPremium = () => {
    if (user) {
      const updatedUser = { ...user, plan: 'premium' as const };
      setUser(updatedUser);
      localStorage.setItem('yujuris_user', JSON.stringify(updatedUser));
    }
  };

  const openAuthModal = () => setIsModalOpen(true);
  const closeAuthModal = () => setIsModalOpen(false);

  return {
    user,
    isLoading,
    isModalOpen,
    login,
    register,
    logout,
    upgradeToPremium,
    openAuthModal,
    closeAuthModal
  };
};
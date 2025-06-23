import { useState, useEffect } from 'react';
import { User as SupabaseUser, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
        } else if (session?.user) {
          await handleUserSession(session.user);
        }
      } catch (error) {
        console.error('Erreur inattendue:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          await handleUserSession(session.user);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUserSession = async (supabaseUser: SupabaseUser) => {
    try {
      // Get or create user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération du profil:', error);
      }

      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Utilisateur',
        plan: profile?.plan || 'free',
        remainingQueries: profile?.remaining_queries || 5,
        avatar_url: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
        email_verified: supabaseUser.email_confirmed_at ? true : false,
        created_at: supabaseUser.created_at
      };

      setUser(userData);

      // Create profile if it doesn't exist
      if (!profile) {
        await createUserProfile(userData);
      }

    } catch (error) {
      console.error('Erreur lors du traitement de la session utilisateur:', error);
    }
  };

  const createUserProfile = async (userData: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          plan: userData.plan,
          remaining_queries: userData.remainingQueries,
          avatar_url: userData.avatar_url
        });

      if (error) {
        console.error('Erreur lors de la création du profil:', error);
      }
    } catch (error) {
      console.error('Erreur inattendue lors de la création du profil:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        return {
          user: null,
          error: {
            message: getErrorMessage(error),
            status: error.status
          }
        };
      }

      setIsModalOpen(false);
      return { user: user, error: null };

    } catch (error) {
      return {
        user: null,
        error: {
          message: 'Une erreur inattendue s\'est produite'
        }
      };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ user: User | null; error: AuthError | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim()
          }
        }
      });

      if (error) {
        return {
          user: null,
          error: {
            message: getErrorMessage(error),
            status: error.status
          }
        };
      }

      // If email confirmation is disabled, close modal
      if (data.user && !data.user.email_confirmed_at) {
        // Email confirmation required
        return {
          user: null,
          error: null // No error, just need confirmation
        };
      }

      setIsModalOpen(false);
      return { user: user, error: null };

    } catch (error) {
      return {
        user: null,
        error: {
          message: 'Une erreur inattendue s\'est produite'
        }
      };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
      setUser(null);
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return {
          error: {
            message: getErrorMessage(error),
            status: error.status
          }
        };
      }

      return { error: null };

    } catch (error) {
      return {
        error: {
          message: 'Une erreur inattendue s\'est produite'
        }
      };
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ error: AuthError | null }> => {
    if (!user) return { error: { message: 'Utilisateur non connecté' } };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          avatar_url: updates.avatar_url
        })
        .eq('id', user.id);

      if (error) {
        return {
          error: {
            message: 'Erreur lors de la mise à jour du profil'
          }
        };
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };

    } catch (error) {
      return {
        error: {
          message: 'Une erreur inattendue s\'est produite'
        }
      };
    }
  };

  const upgradeToPremium = async (): Promise<{ error: AuthError | null }> => {
    if (!user) return { error: { message: 'Utilisateur non connecté' } };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          plan: 'premium',
          remaining_queries: null // Unlimited for premium
        })
        .eq('id', user.id);

      if (error) {
        return {
          error: {
            message: 'Erreur lors de la mise à niveau'
          }
        };
      }

      setUser(prev => prev ? { ...prev, plan: 'premium', remainingQueries: undefined } : null);
      return { error: null };

    } catch (error) {
      return {
        error: {
          message: 'Une erreur inattendue s\'est produite'
        }
      };
    }
  };

  const decrementQueries = async (): Promise<void> => {
    if (!user || user.plan === 'premium') return;

    const newCount = Math.max(0, (user.remainingQueries || 0) - 1);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ remaining_queries: newCount })
        .eq('id', user.id);

      if (!error) {
        setUser(prev => prev ? { ...prev, remainingQueries: newCount } : null);
      }
    } catch (error) {
      console.error('Erreur lors de la décrémentation des requêtes:', error);
    }
  };

  const openAuthModal = () => {
    console.log('Opening auth modal...');
    setIsModalOpen(true);
  };
  
  const closeAuthModal = () => {
    console.log('Closing auth modal...');
    setIsModalOpen(false);
  };

  return {
    user,
    isLoading,
    isModalOpen,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    upgradeToPremium,
    decrementQueries,
    openAuthModal,
    closeAuthModal
  };
};

function getErrorMessage(error: SupabaseAuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Email ou mot de passe incorrect';
    case 'Email not confirmed':
      return 'Veuillez confirmer votre email avant de vous connecter';
    case 'User already registered':
      return 'Un compte existe déjà avec cet email';
    case 'Password should be at least 6 characters':
      return 'Le mot de passe doit contenir au moins 6 caractères';
    case 'Unable to validate email address: invalid format':
      return 'Format d\'email invalide';
    case 'Signup is disabled':
      return 'Les inscriptions sont temporairement désactivées';
    case 'Email rate limit exceeded':
      return 'Trop de tentatives. Veuillez réessayer plus tard';
    default:
      return error.message || 'Une erreur s\'est produite';
  }
}
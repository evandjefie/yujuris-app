import { useState, useEffect } from 'react';
import { User as SupabaseUser, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      // Attendre un peu pour que le trigger ait le temps de s'exécuter
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get or create user profile
      let { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .limit(1);

      let profile = profiles && profiles.length > 0 ? profiles[0] : null;

      // Si le profil n'existe pas, essayer de le créer
      if (!profile) {
        console.log('Profil non trouvé, création en cours...');
        
        const { error: createError } = await supabase.rpc('create_user_profile', {
          user_id: supabaseUser.id,
          user_name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Utilisateur',
          user_email: supabaseUser.email || ''
        });

        if (createError) {
          console.error('Erreur lors de la création du profil:', createError);
        } else {
          // Récupérer le profil créé
          const { data: newProfiles } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .limit(1);
          profile = newProfiles && newProfiles.length > 0 ? newProfiles[0] : null;
        }
      } else if (error) {
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

    } catch (error) {
      console.error('Erreur lors du traitement de la session utilisateur:', error);
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

      // Si l'utilisateur est créé avec succès
      if (data.user) {
        // Attendre que le profil soit créé
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Si email confirmation est désactivée, l'utilisateur sera connecté automatiquement
        if (!data.user.email_confirmed_at) {
          // Email confirmation required
          return {
            user: null,
            error: null // No error, just need confirmation
          };
        }
      }

      return { user: user, error: null };

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return {
        user: null,
        error: {
          message: 'Une erreur inattendue s\'est produite lors de l\'inscription'
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

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    upgradeToPremium,
    decrementQueries
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
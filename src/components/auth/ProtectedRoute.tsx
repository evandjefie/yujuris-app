import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { COLORS } from '../../constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requirePremium?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requirePremium = false
}) => {
  const { user, isLoading, openAuthModal } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Loader2 size={32} className="animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Chargement...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Vérification de votre session
          </p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg"
            style={{ backgroundColor: COLORS.primary }}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connexion requise
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous devez être connecté pour accéder à cette fonctionnalité.
          </p>
          <button
            onClick={openAuthModal}
            className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: COLORS.primary }}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (requirePremium && user?.plan !== 'premium') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg"
            style={{ backgroundColor: COLORS.primary }}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Premium requis
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Cette fonctionnalité est réservée aux utilisateurs Premium.
          </p>
          <button
            className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: COLORS.primary }}
          >
            Passer au Premium
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
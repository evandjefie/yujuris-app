import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Scale, Shield, Zap, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, PLANS } from '../../constants';

type AuthView = 'login' | 'register' | 'forgot-password' | 'check-email';

export const AuthModal: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { isModalOpen, closeAuthModal, login, register, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (currentView === 'login') {
        const { error } = await login(formData.email, formData.password);
        if (error) {
          setError(error.message);
        }
      } else if (currentView === 'register') {
        if (!formData.acceptTerms) {
          setError('Vous devez accepter les conditions d\'utilisation');
          return;
        }
        
        const { error } = await register(formData.email, formData.password, formData.name);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
          setCurrentView('check-email');
        }
      } else if (currentView === 'forgot-password') {
        const { error } = await resetPassword(formData.email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Instructions de réinitialisation envoyées par email');
          setCurrentView('check-email');
        }
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', acceptTerms: false });
    setError('');
    setSuccess('');
  };

  const switchView = (view: AuthView) => {
    setCurrentView(view);
    resetForm();
  };

  const renderLoginForm = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Adresse email *
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            style={{ focusRingColor: COLORS.primary }}
            placeholder="votre@email.com"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mot de passe *
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            style={{ focusRingColor: COLORS.primary }}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 focus:ring-2"
            style={{ accentColor: COLORS.primary }}
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Se souvenir de moi
          </label>
        </div>

        <button
          type="button"
          onClick={() => switchView('forgot-password')}
          className="text-sm hover:underline transition-colors"
          style={{ color: COLORS.primary }}
        >
          Mot de passe oublié ?
        </button>
      </div>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nom complet *
        </label>
        <div className="relative">
          <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            style={{ focusRingColor: COLORS.primary }}
            placeholder="Votre nom complet"
            required
            autoComplete="name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Adresse email *
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            style={{ focusRingColor: COLORS.primary }}
            placeholder="votre@email.com"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mot de passe *
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            style={{ focusRingColor: COLORS.primary }}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Minimum 6 caractères
        </p>
      </div>

      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="acceptTerms"
          checked={formData.acceptTerms}
          onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 focus:ring-2"
          style={{ accentColor: COLORS.primary }}
          required
        />
        <label htmlFor="acceptTerms" className="text-sm text-gray-600 dark:text-gray-400">
          J'accepte les{' '}
          <button type="button" className="underline hover:no-underline" style={{ color: COLORS.primary }}>
            conditions d'utilisation
          </button>
          {' '}et la{' '}
          <button type="button" className="underline hover:no-underline" style={{ color: COLORS.primary }}>
            politique de confidentialité
          </button>
        </label>
      </div>
    </>
  );

  const renderForgotPasswordForm = () => (
    <>
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Adresse email *
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            style={{ focusRingColor: COLORS.primary }}
            placeholder="votre@email.com"
            required
            autoComplete="email"
          />
        </div>
      </div>
    </>
  );

  const renderCheckEmailView = () => (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Vérifiez votre email
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {success || 'Nous avons envoyé un email à votre adresse. Cliquez sur le lien pour continuer.'}
      </p>
      <div className="space-y-3">
        <Button
          onClick={() => switchView('login')}
          variant="outline"
          fullWidth
        >
          Retour à la connexion
        </Button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Vous n'avez pas reçu l'email ? Vérifiez vos spams ou{' '}
          <button
            onClick={() => switchView(currentView === 'check-email' && success.includes('réinitialisation') ? 'forgot-password' : 'register')}
            className="underline hover:no-underline"
            style={{ color: COLORS.primary }}
          >
            réessayez
          </button>
        </p>
      </div>
    </div>
  );

  const getTitle = () => {
    switch (currentView) {
      case 'login': return 'Bienvenue sur Yujuris';
      case 'register': return 'Rejoignez Yujuris';
      case 'forgot-password': return 'Réinitialiser le mot de passe';
      case 'check-email': return '';
      default: return 'Yujuris';
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case 'login': return 'Connectez-vous à votre assistant juridique OHADA';
      case 'register': return 'Créez votre compte et accédez au droit OHADA simplifié';
      case 'forgot-password': return 'Récupérez l\'accès à votre compte';
      case 'check-email': return '';
      default: return '';
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Chargement...</span>
        </div>
      );
    }

    switch (currentView) {
      case 'login': return 'Se connecter';
      case 'register': return 'Créer mon compte';
      case 'forgot-password': return 'Envoyer le lien';
      default: return 'Continuer';
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeAuthModal}
      title=""
      maxWidth="lg"
      showCloseButton={false}
    >
      <div className="space-y-8">
        {/* Header with Logo */}
        {currentView !== 'check-email' && (
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Scale size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {getTitle()}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {getSubtitle()}
            </p>
          </div>
        )}

        {/* Benefits Section for Registration */}
        {currentView === 'register' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="text-center">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                <Zap size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Réponses instantanées</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">IA spécialisée OHADA</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                <Shield size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Données sécurisées</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Conformité RGPD</p>
            </div>
            <div className="text-center">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 text-white"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Scale size={20} />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">17 pays couverts</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Espace OHADA complet</p>
            </div>
          </div>
        )}

        {/* Navigation for forgot password */}
        {currentView === 'forgot-password' && (
          <button
            onClick={() => switchView('login')}
            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Retour à la connexion</span>
          </button>
        )}

        {/* Form Content */}
        {currentView === 'check-email' ? (
          renderCheckEmailView()
        ) : (
          <>
            {/* Toggle Buttons for login/register */}
            {(currentView === 'login' || currentView === 'register') && (
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => switchView('login')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === 'login'
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  style={currentView === 'login' ? { backgroundColor: COLORS.primary } : undefined}
                >
                  Connexion
                </button>
                <button
                  onClick={() => switchView('register')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === 'register'
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  style={currentView === 'register' ? { backgroundColor: COLORS.primary } : undefined}
                >
                  Inscription
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {currentView === 'login' && renderLoginForm()}
              {currentView === 'register' && renderRegisterForm()}
              {currentView === 'forgot-password' && renderForgotPasswordForm()}

              {/* Error/Success Messages */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && currentView !== 'check-email' && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                fullWidth
                className="py-3"
              >
                {getButtonText()}
              </Button>
            </form>

            {/* Plan Information for Registration */}
            {currentView === 'register' && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  🎉 Commencez gratuitement
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {PLANS.FREE.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            {(currentView === 'login' || currentView === 'register') && (
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentView === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
                </p>
                <button
                  onClick={() => switchView(currentView === 'login' ? 'register' : 'login')}
                  className="mt-1 font-medium hover:underline transition-colors"
                  style={{ color: COLORS.primary }}
                >
                  {currentView === 'login' ? 'Créez votre compte gratuitement' : 'Connectez-vous'}
                </button>
              </div>
            )}

            {/* Close Button */}
            <div className="text-center">
              <button
                onClick={closeAuthModal}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Continuer sans compte (limité)
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
// Header.tsx - VERSION AMÉLIORÉE
import React, { useState, useRef, useEffect } from 'react';
import { Scale, Menu, User, Moon, Sun, Globe, Crown, Settings, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, LANGUAGES, PLANS } from '../../constants';

interface HeaderProps {
  onMenuToggle: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  currentLanguage: keyof typeof LANGUAGES;
  onLanguageChange: (lang: keyof typeof LANGUAGES) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  isDarkMode,
  onThemeToggle,
  currentLanguage,
  onLanguageChange
}) => {
  const { user, openAuthModal, logout, isModalOpen } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setShowUserMenu(false);
      setShowLangMenu(false);
    }
  }, [isModalOpen]);

  const handleAuthClick = () => {
    openAuthModal();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLanguageSelect = (lang: keyof typeof LANGUAGES) => {
    onLanguageChange(lang);
    setShowLangMenu(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlanBadge = (plan: string) => {
    const planInfo = PLANS[plan.toUpperCase() as keyof typeof PLANS];
    
    if (plan === 'premium') {
      return (
        <span 
          className="text-xs text-white px-2 py-0.5 rounded-full flex items-center space-x-1 font-medium"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Crown size={10} />
          <span>{planInfo.name}</span>
        </span>
      );
    }
    
    return (
      <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">
        {planInfo.name}
      </span>
    );
  };

  const getQueryCounter = () => {
    if (user?.plan === 'free') {
      const remaining = user.remainingQueries || 0;
      const total = 5;
      const percentage = (remaining / total) * 100;
      
      return (
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Requêtes restantes
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {remaining}/{total}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300 rounded-full"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: percentage > 40 ? COLORS.primary : percentage > 20 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm dark:shadow-gray-900/20 relative z-40">
      <div className="flex items-center justify-between">
        {/* Left Section - Logo & Menu */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Scale size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Yujuris
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Assistant juridique OHADA
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Changer de langue"
            >
              <Globe size={16} className="text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {LANGUAGES[currentLanguage].flag}
              </span>
            </button>
            
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                {Object.entries(LANGUAGES).map(([key, lang]) => (
                  <button
                    key={key}
                    onClick={() => handleLanguageSelect(key as keyof typeof LANGUAGES)}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 ${
                      key === currentLanguage ? 'bg-gray-50 dark:bg-gray-700' : ''
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {lang.name}
                    </span>
                    {key === currentLanguage && (
                      <span className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isDarkMode ? 'Passer en mode jour' : 'Passer en mode nuit'}
            aria-label={isDarkMode ? 'Mode jour' : 'Mode nuit'}
          >
            {isDarkMode ? (
              <Sun size={18} className="text-yellow-500" />
            ) : (
              <Moon size={18} className="text-gray-600" />
            )}
          </button>

          {/* User Section */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Menu utilisateur"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                  {getUserInitials(user.name)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-32">
                    {user.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    {getPlanBadge(user.plan)}
                  </div>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  {/* User Info Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-sm">
                        {getUserInitials(user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getPlanBadge(user.plan)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Query Counter for Free Users */}
                    {user.plan === 'free' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        {getQueryCounter()}
                      </div>
                    )}
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-2">
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-3">
                      <Settings size={16} />
                      <span>Paramètres du compte</span>
                    </button>
                    
                    {user.plan === 'free' && (
                      <button 
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-3 font-medium"
                        style={{ color: COLORS.primary }}
                      >
                        <Crown size={16} />
                        <span>Passer au Premium</span>
                        <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">
                          Populaire
                        </span>
                      </button>
                    )}
                    
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center space-x-3 disabled:opacity-50"
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          <span>Déconnexion...</span>
                        </>
                      ) : (
                        <>
                          <LogOut size={16} />
                          <span>Se déconnecter</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button 
              onClick={handleAuthClick} 
              size="sm"
              className="relative shadow-sm hover:shadow-md transition-shadow"
            >
              <User size={16} className="mr-2" />
              <span className="hidden sm:inline">Connexion</span>
              <span className="sm:hidden">Se connecter</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
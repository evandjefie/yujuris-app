// Header.tsx - VERSION AMELIOREE
import React, { useState, useRef, useEffect } from 'react';
import { Scale, Menu, User, Moon, Sun, Globe, Crown, Settings } from 'lucide-react';
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

  // Close user menu when user state changes (login/logout)
  useEffect(() => {
    setShowUserMenu(false);
  }, [user]);

  const handleAuthClick = () => {
    // Close any open menus first
    setShowUserMenu(false);
    setShowLangMenu(false);
    
    // Open the authentication modal
    openAuthModal();
  };

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
    // Close language menu if open
    if (showLangMenu) {
      setShowLangMenu(false);
    }
  };

  const handleLanguageMenuToggle = () => {
    setShowLangMenu(!showLangMenu);
    // Close user menu if open
    if (showUserMenu) {
      setShowUserMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleLanguageChange = (lang: keyof typeof LANGUAGES) => {
    onLanguageChange(lang);
    setShowLangMenu(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm dark:shadow-gray-900/20 relative z-40">
      <div className="flex items-center justify-between">
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
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
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

        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={handleLanguageMenuToggle}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Sélectionner la langue"
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
                    onClick={() => handleLanguageChange(key as keyof typeof LANGUAGES)}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 ${
                      key === currentLanguage ? 'bg-gray-50 dark:bg-gray-700' : ''
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-gray-700 dark:text-gray-300">{lang.name}</span>
                    {key === currentLanguage && (
                      <span className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.primary }}></span>
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
            title={isDarkMode ? 'Passer au mode jour' : 'Passer au mode nuit'}
            aria-label={isDarkMode ? 'Passer au mode jour' : 'Passer au mode nuit'}
          >
            {isDarkMode ? (
              <Sun size={18} className="text-yellow-500" />
            ) : (
              <Moon size={18} className="text-gray-600" />
            )}
          </button>

          {/* User Menu or Login Button */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={handleUserMenuToggle}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Menu utilisateur"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    {user.plan === 'free' && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        {user.remainingQueries}/5 requêtes
                      </span>
                    )}
                    {user.plan === 'premium' && (
                      <span 
                        className="text-xs text-white px-2 py-0.5 rounded-full flex items-center space-x-1"
                        style={{ backgroundColor: COLORS.primary }}
                      >
                        <Crown size={10} />
                        <span>Premium</span>
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ 
                              backgroundColor: user.plan === 'premium' ? COLORS.primary : '#e5e7eb',
                              color: user.plan === 'premium' ? 'white' : '#374151'
                            }}
                          >
                            {PLANS[user.plan.toUpperCase() as keyof typeof PLANS].name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2">
                      <Settings size={16} />
                      <span>Paramètres du compte</span>
                    </button>
                    
                    {user.plan === 'free' && (
                      <button 
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2"
                        style={{ color: COLORS.primary }}
                      >
                        <Crown size={16} />
                        <span>Passer au Premium</span>
                      </button>
                    )}
                    
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button 
              onClick={handleAuthClick} 
              size="sm"
              className="relative font-medium"
              disabled={isModalOpen}
            >
              {isModalOpen ? 'Ouverture...' : 'Connexion'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
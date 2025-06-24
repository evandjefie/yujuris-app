import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ChatInterface } from './components/chat/ChatInterface';
import { DocumentAnalysis } from './components/documents/DocumentAnalysis';
import { TemplateGenerator } from './components/templates/TemplateGenerator';
import { LegalLibrary } from './components/library/LegalLibrary';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './hooks/useAuth';
import { COLORS, LANGUAGES } from './constants';

function App() {
  const [activeView, setActiveView] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof LANGUAGES>('FR');
  const { user, isLoading, isModalOpen, closeAuthModal } = useAuth();

  console.log('App render, modal open =', isModalOpen);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('yujuris_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
    
    // Apply theme to body for better dark mode coverage
    document.body.className = shouldUseDark 
      ? 'bg-gray-900 text-white' 
      : 'bg-gray-50 text-gray-900';
  }, []);

  // Initialize language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('yujuris_language') as keyof typeof LANGUAGES;
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    document.body.className = newTheme 
      ? 'bg-gray-900 text-white' 
      : 'bg-gray-50 text-gray-900';
    localStorage.setItem('yujuris_theme', newTheme ? 'dark' : 'light');
  };

  const handleLanguageChange = (lang: keyof typeof LANGUAGES) => {
    setCurrentLanguage(lang);
    localStorage.setItem('yujuris_language', lang);
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'chat':
        return <ChatInterface />;
      case 'documents':
        return <DocumentAnalysis />;
      case 'templates':
        return <TemplateGenerator />;
      case 'library':
        return <LegalLibrary />;
      case 'history':
        return (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-md mx-auto p-8">
              <div 
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white"
                style={{ backgroundColor: COLORS.primary }}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Historique Premium
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Accédez à l'historique complet de vos consultations juridiques, 
                exportez vos conversations et retrouvez facilement vos recherches passées.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Historique illimité des conversations
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Export PDF des consultations
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Recherche avancée dans l'historique
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <ChatInterface />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg"
            style={{ backgroundColor: COLORS.primary }}
          >
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Chargement de Yujuris
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Initialisation de votre assistant juridique OHADA...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
            setIsSidebarOpen(false); // Close sidebar on mobile after selection
          }}
          onClose={() => setIsSidebarOpen(false)}
          isPremiumUser={user?.plan === 'premium'}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {renderMainContent()}
        </main>
      </div>

      {isModalOpen && <AuthModal />}
    </div>
  );
}

export default App;
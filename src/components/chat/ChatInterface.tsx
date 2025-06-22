import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Zap, Crown } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { Button } from '../ui/Button';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, OHADA_COUNTRIES } from '../../constants';

export const ChatInterface: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { messages, isTyping, canSendMessage, sendMessage } = useChat();
  const { user, openAuthModal } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      openAuthModal();
      return;
    }

    if (!inputValue.trim() || !canSendMessage) return;

    const success = await sendMessage(inputValue.trim());
    if (success) {
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getPlaceholder = () => {
    if (!user) return 'Connectez-vous pour poser une question juridique...';
    if (!canSendMessage) return 'Limite de requêtes atteinte - Passez au Premium pour continuer';
    return 'Posez votre question juridique OHADA (ex: "Comment créer une SARL au Sénégal ?")';
  };

  const suggestedQuestions = [
    "Comment créer une société au Cameroun ?",
    "Quelles sont les obligations d'un commerçant OHADA ?",
    "Comment rédiger un contrat de bail commercial ?",
    "Procédure de recouvrement de créances au Mali"
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Assistant Juridique OHADA
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Spécialisé dans les 17 pays de l'espace OHADA • IA avancée
                </p>
              </div>
            </div>
            
            {/* OHADA Countries Indicator */}
            <div className="flex items-center space-x-2 mt-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Couverture:</span>
              <div className="flex space-x-1">
                {OHADA_COUNTRIES.slice(0, 8).map((country) => (
                  <span key={country.code} className="text-sm" title={country.name}>
                    {country.flag}
                  </span>
                ))}
                <span className="text-xs text-gray-400 ml-1">+9 autres</span>
              </div>
            </div>
          </div>
          
          {user?.plan === 'premium' && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Crown size={16} className="text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Premium</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 1 && (
          <div className="max-w-4xl mx-auto">
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Bienvenue sur Yujuris ! 👋
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Votre assistant juridique intelligent spécialisé en droit OHADA. 
                Posez vos questions en français ou en anglais, je vous fournirai des réponses 
                précises avec les références légales appropriées.
              </p>
            </div>

            {/* Suggested Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(question)}
                  className="p-4 text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md group"
                >
                  <div className="flex items-start space-x-3">
                    <Zap size={16} className="text-blue-500 mt-1 group-hover:scale-110 transition-transform" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {question}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Features Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">IA Spécialisée</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Entraînée sur l'ensemble du corpus juridique OHADA
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                  <Zap size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Réponses Instantanées</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Obtenez des réponses précises en quelques secondes
                </p>
              </div>
              
              <div className="text-center p-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-white"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <Crown size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sources Vérifiées</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chaque réponse inclut les références légales exactes
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && (
          <div className="flex items-center space-x-3 max-w-4xl mx-auto">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Sparkles size={16} />
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <Loader2 size={16} className="animate-spin text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">L'assistant analyse votre question...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
        {!canSendMessage && user && user.plan === 'free' && (
          <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <Crown size={20} className="text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Limite quotidienne atteinte
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Passez au Premium pour un accès illimité et débloquez toutes les fonctionnalités avancées.
                </p>
              </div>
              <button 
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Upgrade
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getPlaceholder()}
                disabled={!user || !canSendMessage}
                className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl 
                  focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 
                  text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-sm
                  transition-all duration-200"
                style={{ 
                  focusRingColor: COLORS.primary,
                }}
              />
            </div>
            
            <Button
              type="submit"
              disabled={!inputValue.trim() || isTyping || !user || !canSendMessage}
              className="px-6 py-4 rounded-2xl flex items-center space-x-2 shadow-sm"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Envoyer</span>
            </Button>
          </div>

          {user && user.plan === 'free' && (
            <div className="flex items-center justify-center mt-3 space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span>
                {user.remainingQueries} requête{user.remainingQueries !== 1 ? 's' : ''} restante{user.remainingQueries !== 1 ? 's' : ''} aujourd'hui
              </span>
              <span>•</span>
              <button 
                className="hover:underline"
                style={{ color: COLORS.primary }}
              >
                Passer au Premium pour un accès illimité
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
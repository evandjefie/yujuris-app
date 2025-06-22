import React from 'react';
import { User, Scale, ExternalLink, BookOpen, Copy, Check } from 'lucide-react';
import { ChatMessage } from '../../types';
import { COLORS } from '../../constants';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} max-w-4xl mx-auto`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} space-x-4`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-4' : 'mr-4'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
              : 'text-white'
          }`}
          style={!isUser ? { backgroundColor: COLORS.primary } : undefined}
          >
            {isUser ? <User size={18} /> : <Scale size={18} />}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-6 py-4 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
          }`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
            
            {/* Copy button for assistant messages */}
            {!isUser && (
              <button
                onClick={handleCopy}
                className="mt-3 flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            )}
          </div>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 max-w-full">
              <div className="flex items-center space-x-2 mb-3">
                <BookOpen size={16} className="text-gray-500 dark:text-gray-400" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sources juridiques OHADA
                </p>
              </div>
              <div className="space-y-3">
                {message.sources.map((source, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border-l-4 shadow-sm"
                    style={{ borderLeftColor: COLORS.primary }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {source.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full font-medium">
                            {source.article}
                          </span>
                          <span>•</span>
                          <span>{source.code}</span>
                        </div>
                      </div>
                      {source.url && (
                        <button className="ml-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <ExternalLink size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 px-2">
            {message.timestamp.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
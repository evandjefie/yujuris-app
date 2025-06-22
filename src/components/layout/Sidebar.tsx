import React from 'react';
import { MessageCircle, FileText, BookOpen, BookTemplate as FileTemplate, Crown, Plus, History, Sparkles } from 'lucide-react';
import { COLORS } from '../../constants';

interface SidebarProps {
  isOpen: boolean;
  activeView: string;
  onViewChange: (view: string) => void;
  onClose: () => void;
  isPremiumUser: boolean;
}

const menuItems = [
  { 
    id: 'chat', 
    label: 'Assistant IA', 
    icon: MessageCircle, 
    description: 'Consultations juridiques instantanées'
  },
  { 
    id: 'documents', 
    label: 'Analyse Documents', 
    icon: FileText, 
    description: 'Analyse et résumé automatique'
  },
  { 
    id: 'templates', 
    label: 'Modèles Juridiques', 
    icon: FileTemplate, 
    description: 'Contrats et documents types'
  },
  { 
    id: 'library', 
    label: 'Bibliothèque OHADA', 
    icon: BookOpen, 
    description: 'Textes et jurisprudences'
  },
  { 
    id: 'history', 
    label: 'Historique', 
    icon: History, 
    premium: true,
    description: 'Vos consultations passées'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeView,
  onViewChange,
  onClose,
  isPremiumUser
}) => {
  const handleItemClick = (itemId: string, isPremium?: boolean) => {
    if (isPremium && !isPremiumUser) {
      // Show premium upgrade modal
      return;
    }
    onViewChange(itemId);
    onClose(); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-20 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out shadow-xl dark:shadow-gray-900/50
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full pt-16">
          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={() => handleItemClick('chat')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Plus size={18} />
              <span>Nouvelle conversation</span>
              <Sparkles size={16} className="ml-auto opacity-80" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 pb-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const isLocked = item.premium && !isPremiumUser;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleItemClick(item.id, item.premium)}
                      className={`
                        w-full flex items-start space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'text-white shadow-md' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                        ${isLocked ? 'opacity-60' : ''}
                        ${!isActive ? 'hover:shadow-sm' : ''}
                      `}
                      style={isActive ? { backgroundColor: COLORS.primary } : undefined}
                    >
                      <Icon size={20} className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span>{item.label}</span>
                          {isLocked && <Crown size={14} className="text-yellow-500" />}
                        </div>
                        <p className={`text-xs mt-0.5 ${
                          isActive 
                            ? 'text-white/80' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Premium Upgrade CTA */}
          {!isPremiumUser && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div 
                className="p-4 rounded-xl text-white text-center relative overflow-hidden"
                style={{ backgroundColor: COLORS.primary }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative">
                  <Crown size={24} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold mb-1">Passez au Premium</p>
                  <p className="text-xs opacity-90 mb-3">
                    Accès illimité + Audio IA + Tous les modèles
                  </p>
                  <button className="w-full px-3 py-2 bg-white bg-opacity-20 rounded-lg text-xs font-medium hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm">
                    Découvrir Premium - 5000 FCFA/mois
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
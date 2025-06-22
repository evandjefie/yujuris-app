import React, { useState } from 'react';
import { Search, BookOpen, Download, ExternalLink, Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { LegalArticle } from '../../types';
import { COLORS, LEGAL_CATEGORIES } from '../../constants';

const mockArticles: LegalArticle[] = [
  {
    id: '1',
    title: 'Constitution et fonctionnement des sociétés commerciales',
    code: 'Acte uniforme relatif au droit des sociétés commerciales',
    article: 'Article 15',
    content: 'Les sociétés commerciales jouissent de la personnalité morale à compter de leur immatriculation au registre du commerce et du crédit mobilier...',
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Obligations du commerçant',
    code: 'Acte uniforme relatif au droit commercial général',
    article: 'Article 23',
    content: 'Tout commerçant doit tenir une comptabilité selon les normes comptables en vigueur dans l\'État partie...',
    lastUpdated: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'Procédures collectives d\'apurement du passif',
    code: 'Acte uniforme portant organisation des procédures collectives',
    article: 'Article 1',
    content: 'Lorsqu\'un débiteur éprouve une difficulté à faire face à son passif exigible avec son actif disponible...',
    lastUpdated: new Date('2024-01-08')
  }
];

export const LegalLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [selectedArticle, setSelectedArticle] = useState<LegalArticle | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Tous' || 
                           article.code.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bibliothèque Juridique OHADA
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Recherchez dans le corpus juridique des 17 États membres
        </p>
      </div>

      {/* Search and Filters */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les textes OHADA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter size={16} />
            <span>Filtres</span>
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('Tous')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === 'Tous'
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={selectedCategory === 'Tous' ? { backgroundColor: COLORS.primary } : undefined}
            >
              Tous
            </button>
            
            {LEGAL_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={selectedCategory === category ? { backgroundColor: COLORS.primary } : undefined}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex">
        {/* Articles List */}
        <div className={`${selectedArticle ? 'w-1/3' : 'w-full'} border-r border-gray-200 dark:border-gray-700 overflow-y-auto`}>
          <div className="p-4">
            <div className="space-y-3">
              {filteredArticles.map(article => (
                <div
                  key={article.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedArticle?.id === article.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  style={selectedArticle?.id === article.id ? {
                    borderColor: COLORS.primary,
                    backgroundColor: `${COLORS.primary}08`
                  } : undefined}
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <BookOpen size={18} className="text-gray-400 mt-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {article.lastUpdated.toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {article.code} - {article.article}
                  </p>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {article.content.substring(0, 150)}...
                  </p>
                </div>
              ))}
              
              {filteredArticles.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun article trouvé pour votre recherche
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Article Details */}
        {selectedArticle && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedArticle.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{selectedArticle.code}</span>
                    <span>•</span>
                    <span>{selectedArticle.article}</span>
                    <span>•</span>
                    <span>Mis à jour le {selectedArticle.lastUpdated.toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download size={16} />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink size={16} />
                    Source
                  </Button>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Texte intégral
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedArticle.content}
                  </p>
                </div>

                {/* Additional content sections would go here */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Articles connexes
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <button 
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          style={{ color: COLORS.primary }}
                        >
                          Article 14 - Conditions de formation
                        </button>
                      </li>
                      <li>
                        <button 
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          style={{ color: COLORS.primary }}
                        >
                          Article 16 - Effets de l'immatriculation
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Jurisprudence
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <button 
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          style={{ color: COLORS.primary }}
                        >
                          CCJA, Arrêt n°001/2023
                        </button>
                      </li>
                      <li>
                        <button 
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          style={{ color: COLORS.primary }}
                        >
                          CCJA, Arrêt n°025/2022
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};